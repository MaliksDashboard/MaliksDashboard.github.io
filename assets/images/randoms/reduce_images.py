#!/usr/bin/env python3
"""
Image Size Reducer
Double-click this script to reduce all images in the folder to 2MB or below.
Supports: JPG, JPEG, PNG
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageOps
import time

# Configuration
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB in bytes
SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png'}
BACKUP_SUFFIX = '_original'

class ImageReducer:
    def __init__(self):
        # Get the directory where this script is located
        self.script_dir = Path(__file__).parent
        self.processed_count = 0
        self.skipped_count = 0
        self.error_count = 0
        
    def format_bytes(self, bytes_size):
        """Convert bytes to human readable format"""
        if bytes_size == 0:
            return "0 B"
        
        sizes = ["B", "KB", "MB", "GB"]
        i = 0
        while bytes_size >= 1024 and i < len(sizes) - 1:
            bytes_size /= 1024
            i += 1
        return f"{bytes_size:.2f} {sizes[i]}"
    
    def get_file_size(self, file_path):
        """Get file size in bytes"""
        return os.path.getsize(file_path)
    
    def get_image_files(self):
        """Find all supported image files in the script directory"""
        image_files = []
        
        for file_path in self.script_dir.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in SUPPORTED_FORMATS:
                # Skip backup files
                if BACKUP_SUFFIX not in file_path.stem:
                    image_files.append(file_path)
        
        return sorted(image_files)
    
    def create_backup(self, file_path):
        """Create a backup of the original file"""
        backup_path = file_path.with_stem(f"{file_path.stem}{BACKUP_SUFFIX}")
        
        # Don't overwrite existing backup
        counter = 1
        while backup_path.exists():
            backup_path = file_path.with_stem(f"{file_path.stem}{BACKUP_SUFFIX}_{counter}")
            counter += 1
            
        # Copy file
        import shutil
        shutil.copy2(file_path, backup_path)
        return backup_path
    
    def reduce_image_size(self, file_path):
        """Reduce image size using progressive quality reduction and resizing"""
        current_size = self.get_file_size(file_path)
        print(f"  Current size: {self.format_bytes(current_size)}")
        
        if current_size <= MAX_FILE_SIZE:
            return {"success": True, "already_optimized": True, "final_size": current_size}
        
        is_png = file_path.suffix.lower() == '.png'
        quality = 95 if not is_png else 100  # PNG doesn't use quality the same way
        attempts = 0
        max_attempts = 20
        resize_factor = 1.0
        
        try:
            # Open and prepare image
            with Image.open(file_path) as img:
                # Preserve transparency for PNG, convert others to RGB
                if is_png:
                    # Keep PNG as is, but convert palette to RGBA if needed
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                else:
                    # For JPEG, convert to RGB
                    if img.mode in ('RGBA', 'P'):
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                        img = background
                    elif img.mode != 'RGB':
                        img = img.convert('RGB')
                
                # Apply auto-orientation
                img = ImageOps.exif_transpose(img)
                
                original_width, original_height = img.size
                print(f"  Original dimensions: {original_width}x{original_height}")
                
                # Pre-resize very large images immediately to speed up processing
                max_pixels = 4000000  # 4 megapixels (e.g., 2000x2000)
                current_pixels = original_width * original_height
                
                if current_pixels > max_pixels:
                    # Calculate resize factor to get under 4MP
                    scale_factor = (max_pixels / current_pixels) ** 0.5
                    new_width = int(original_width * scale_factor)
                    new_height = int(original_height * scale_factor)
                    
                    print(f"  Large image detected! Pre-resizing to {new_width}x{new_height}")
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Save the pre-resized version and check size
                    temp_path = file_path.with_suffix('.temp' + file_path.suffix)
                    if is_png:
                        img.save(temp_path, 'PNG', optimize=True)
                    else:
                        img.save(temp_path, 'JPEG', quality=85, optimize=True, progressive=True)
                    
                    current_size = self.get_file_size(temp_path)
                    print(f"  After pre-resize: {self.format_bytes(current_size)}")
                    
                    if current_size <= MAX_FILE_SIZE:
                        # Success with just pre-resize!
                        temp_path.replace(file_path)
                        return {
                            "success": True, 
                            "final_size": current_size, 
                            "attempts": 1,
                            "final_quality": "Pre-resize only",
                            "resize_factor": scale_factor
                        }
                    
                    # Continue with further optimization if still too large
                    temp_path.unlink()
                
                while current_size > MAX_FILE_SIZE and attempts < max_attempts:
                    attempts += 1
                    temp_path = file_path.with_suffix('.temp' + file_path.suffix)
                    
                    try:
                        current_img = img.copy()
                        
                        # Progressive resizing strategy
                        if attempts <= 5:
                            # First 5 attempts: reduce quality only (for JPEG)
                            if not is_png:
                                quality = max(95 - (attempts - 1) * 15, 20)
                        else:
                            # After attempt 5: start resizing
                            resize_step = (attempts - 5) * 0.1
                            resize_factor = max(1.0 - resize_step, 0.3)  # Don't go below 30% of original
                            
                            new_width = int(original_width * resize_factor)
                            new_height = int(original_height * resize_factor)
                            current_img = current_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                            
                            # Also reduce quality for non-PNG
                            if not is_png:
                                quality = max(85 - int(resize_step * 50), 20)
                        
                        # Save based on format
                        print(f"    Saving attempt {attempts}...", end=" ", flush=True)
                        
                        if is_png:
                            # For PNG: focus on optimization and resizing
                            current_img.save(temp_path, 'PNG', optimize=True)
                            strategy = f"Resize: {resize_factor:.1%}" if resize_factor < 1.0 else "PNG optimize"
                        else:
                            # For JPEG: use quality + resizing
                            current_img.save(temp_path, 'JPEG', 
                                           quality=quality, 
                                           optimize=True, 
                                           progressive=True)
                            strategy = f"Quality: {quality}%"
                            if resize_factor < 1.0:
                                strategy += f", Resize: {resize_factor:.1%}"
                        
                        current_size = self.get_file_size(temp_path)
                        print(f"{strategy}, Size: {self.format_bytes(current_size)}")
                        
                        if current_size <= MAX_FILE_SIZE:
                            # Success! Replace original
                            temp_path.replace(file_path)
                            return {
                                "success": True, 
                                "final_size": current_size, 
                                "attempts": attempts,
                                "final_quality": quality if not is_png else "N/A (PNG)",
                                "resize_factor": resize_factor
                            }
                        
                        # Remove temp file and continue
                        temp_path.unlink()
                        
                    except Exception as e:
                        # Clean up temp file
                        if temp_path.exists():
                            temp_path.unlink()
                        raise e
                
                return {
                    "success": False,
                    "final_size": current_size,
                    "attempts": attempts,
                    "reason": "Could not reduce below 2MB even with maximum compression"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "final_size": current_size
            }
    
    def process_image(self, file_path):
        """Process a single image file"""
        print(f"\nProcessing: {file_path.name}")
        
        try:
            original_size = self.get_file_size(file_path)
            
            if original_size <= MAX_FILE_SIZE:
                print(f"  ✓ Already under 2MB ({self.format_bytes(original_size)})")
                self.skipped_count += 1
                return
            
            # Create backup
            backup_path = self.create_backup(file_path)
            print(f"  Backup created: {backup_path.name}")
            
            # Reduce image size
            result = self.reduce_image_size(file_path)
            
            if result["success"]:
                if result.get("already_optimized"):
                    print(f"  ✓ Already optimized!")
                    # Remove unnecessary backup
                    backup_path.unlink()
                    self.skipped_count += 1
                else:
                    saved_bytes = original_size - result["final_size"]
                    saved_percent = (saved_bytes / original_size) * 100
                    
                    print(f"  ✓ Successfully reduced!")
                    print(f"  Final size: {self.format_bytes(result['final_size'])}")
                    print(f"  Saved: {self.format_bytes(saved_bytes)} ({saved_percent:.1f}%)")
                    print(f"  Quality used: {result.get('final_quality', 'N/A')}")
                    if result.get('resize_factor', 1.0) < 1.0:
                        print(f"  Image resized to: {result['resize_factor']:.1%} of original")
                    
                    self.processed_count += 1
            else:
                print(f"  ✗ Failed to reduce: {result.get('reason', result.get('error', 'Unknown error'))}")
                
                # Restore original from backup
                backup_path.replace(file_path)
                print(f"  Original file restored")
                
                self.error_count += 1
                
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            self.error_count += 1
    
    def run(self):
        """Main execution function"""
        print("🖼️  Image Size Reducer")
        print("=" * 50)
        print(f"Processing folder: {self.script_dir}")
        print(f"Target size: {self.format_bytes(MAX_FILE_SIZE)}")
        print(f"Supported formats: {', '.join(SUPPORTED_FORMATS)}")
        print("-" * 50)
        
        try:
            image_files = self.get_image_files()
            
            if not image_files:
                print("❌ No supported image files found in this folder!")
                print(f"Looking for files with extensions: {', '.join(SUPPORTED_FORMATS)}")
                input("\nPress Enter to exit...")
                return
            
            print(f"Found {len(image_files)} image file(s):")
            for file_path in image_files:
                size = self.format_bytes(self.get_file_size(file_path))
                print(f"  📷 {file_path.name} ({size})")
            
            print(f"\n🚀 Starting processing...")
            
            # Process each image
            for file_path in image_files:
                self.process_image(file_path)
            
            # Final summary
            print("\n" + "=" * 50)
            print("📊 SUMMARY:")
            print(f"  ✅ Successfully processed: {self.processed_count} files")
            print(f"  ⏭️  Skipped (already under 2MB): {self.skipped_count} files") 
            print(f"  ❌ Errors: {self.error_count} files")
            print(f"  📁 Total files checked: {len(image_files)}")
            
            if self.processed_count > 0:
                print(f"\n💾 Original files backed up with '{BACKUP_SUFFIX}' suffix")
                print("You can delete backup files if you're satisfied with the results.")
            
        except Exception as e:
            print(f"❌ Fatal error: {str(e)}")
        
        print("\n🎉 Processing complete!")
        input("Press Enter to exit...")

def main():
    """Entry point"""
    try:
        reducer = ImageReducer()
        reducer.run()
    except KeyboardInterrupt:
        print("\n\n❌ Process interrupted by user.")
        input("Press Enter to exit...")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()