document.addEventListener("DOMContentLoaded", () => {
  // Safety check to prevent multiple initializations
  if (window.slideShowInitialized) {
    return;
  }
  window.slideShowInitialized = true;
  // DOM Elements
  const mainContainer = document.querySelector("main.horizontal-scroll");
  const mainSlides = document.querySelectorAll(".slide");
  const videos = document.querySelectorAll(".video");
  const innerSlideshows = document.querySelectorAll(
    ".slideshow-wrapper, .feedback-carousel"
  );
  const progressBar = document.getElementById("progressBar");
  const navDots = document.getElementById("navDots");
  const clockDisplay = document.getElementById("clockDisplay");
  const devControls = document.getElementById("devControls");
  const devControlsToggle = document.getElementById("devControlsToggle");
  const pauseBtn = document.getElementById("pauseBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const slideIndicator = document.getElementById("slideIndicator");
  const slideSelect = document.getElementById("slideSelect");
  const loopSlidesCheckbox = document.getElementById("loopSlides");
  const showAnimationsCheckbox = document.getElementById("showAnimations");
  
  // Mobile Navigation Elements
  const mobileNav = document.getElementById("mobileNav");
  const mobileNavTrigger = document.getElementById("mobileNavTrigger");
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const mobileNavContent = document.getElementById("mobileNavContent");
  const mobileNavSlides = document.getElementById("mobileNavSlides");
  const mobilePlayPause = document.getElementById("mobilePlayPause");
  const mobilePrev = document.getElementById("mobilePrev");
  const mobileNext = document.getElementById("mobileNext");

  // State Variables
  let currentMainIndex = 0;
  let mainSlideTimeout;
  const innerIntervals = new Map();
  let isPaused = false;
  let totalDuration = 0;
  let elapsedTime = 0;
  let animationFrameId = null;
  
  // Mobile detection - use simple and reliable method
  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;

  // Initialize the Clock
  updateClock();
  setInterval(updateClock, 1000);

  function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateString = now.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    clockDisplay.textContent = `${timeString} | ${dateString}`;
  }

  // Create Navigation Dots
  function createNavDots() {
    mainSlides.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.classList.add("nav-dot");
      if (index === 0) dot.classList.add("active");
      dot.addEventListener("click", () => scrollToSlide(index));
      navDots.appendChild(dot);
    });
  }

  // Populate Slide Select Dropdown
  function populateSlideSelect() {
    mainSlides.forEach((slide, index) => {
      const option = document.createElement("option");
      option.value = index;

      // Get slide title or generate a default one
      let title = "Slide " + (index + 1);
      const heading = slide.querySelector("h1, h2");
      if (heading) {
        title = heading.textContent.substring(0, 30);
        if (heading.textContent.length > 30) title += "...";
      }

      option.textContent = title;
      slideSelect.appendChild(option);
    });

    slideSelect.addEventListener("change", (e) => {
      scrollToSlide(parseInt(e.target.value));
    });
  }

  // Dev Controls Toggle
  devControlsToggle.addEventListener("click", (e) => {
    e.preventDefault();
    devControls.classList.toggle("active");
  });

  // Control Buttons
  pauseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    togglePause();
  });
  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    scrollToSlide(currentMainIndex - 1);
  });
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    scrollToSlide(currentMainIndex + 1);
  });

  // Mobile Navigation Functions
  function createMobileNavOverlay() {
    const overlay = document.createElement("div");
    overlay.classList.add("mobile-nav-overlay");
    overlay.id = "mobileNavOverlay";
    overlay.addEventListener("click", closeMobileNav);
    document.body.appendChild(overlay);
    return overlay;
  }

  function populateMobileNavSlides() {
    mobileNavSlides.innerHTML = "";
    mainSlides.forEach((slide, index) => {
      const slideItem = document.createElement("div");
      slideItem.classList.add("mobile-slide-item");
      if (index === currentMainIndex) slideItem.classList.add("active");
      
      const heading = slide.querySelector("h1, h2, .section-heading, .section-title");
      const title = heading ? heading.textContent.substring(0, 25) + (heading.textContent.length > 25 ? "..." : "") : `Slide ${index + 1}`;
      
      slideItem.innerHTML = `
        <h3>${title}</h3>
        <p>Slide ${index + 1} of ${mainSlides.length}</p>
      `;
      
      slideItem.addEventListener("click", () => {
        scrollToSlide(index);
        closeMobileNav();
      });
      
      mobileNavSlides.appendChild(slideItem);
    });
  }

  function openMobileNav() {
    mobileNav.classList.add("open");
    mobileNavToggle.classList.add("active");
    const overlay = document.getElementById("mobileNavOverlay") || createMobileNavOverlay();
    overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function closeMobileNav() {
    mobileNav.classList.remove("open");
    mobileNavToggle.classList.remove("active");
    const overlay = document.getElementById("mobileNavOverlay");
    if (overlay) overlay.classList.remove("visible");
    document.body.style.overflow = "";
  }

  function updateMobileNavState() {
    document.querySelectorAll(".mobile-slide-item").forEach((item, index) => {
      item.classList.toggle("active", index === currentMainIndex);
    });
    
    // Update play/pause button SVG
    const playIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,3 19,12 5,21" fill="currentColor"/>
    </svg>`;
    
    const pauseIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
      <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
    </svg>`;
    
    mobilePlayPause.innerHTML = isPaused ? playIcon : pauseIcon;
  }

  // Mobile Navigation Event Listeners
  mobileNavTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openMobileNav();
  });
  
  mobileNavToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (mobileNav.classList.contains("open")) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  mobilePlayPause.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePause();
    updateMobileNavState();
  });

  mobilePrev.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToSlide(currentMainIndex - 1);
    updateMobileNavState();
  });

  mobileNext.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToSlide(currentMainIndex + 1);
    updateMobileNavState();
  });

  // Ocean Theme Effects (minimal for performance)
  function createOceanParticles() {
    if (!showAnimationsCheckbox.checked) return;

    const particles = ["ocean-bubble", "ocean-wave"];
    const particleCount = 1; // Reduced from 3 to 1

    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const particle = document.createElement("div");
        const particleType =
          particles[Math.floor(Math.random() * particles.length)];
        particle.classList.add("ocean-particle", particleType);

        // Random position
        const xPos = Math.random() * window.innerWidth;
        particle.style.left = `${xPos}px`;
        particle.style.top = "-30px";

        // Random size
        const size = 10 + Math.random() * 10; // Smaller size
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random duration
        const duration = 6 + Math.random() * 4; // Shorter duration
        particle.style.animationDuration = `${duration}s, ${duration}s`;

        document.body.appendChild(particle);

        // Remove particle after animation ends
        setTimeout(() => {
          particle.remove();
        }, duration * 1000);
      }, i * 1000);
    }
  }

  // Create ocean particles less frequently
  setInterval(createOceanParticles, 10000); // Increased from 6s to 10s

  // Pause/Resume Logic
  function togglePause() {
    isPaused = !isPaused;
    if (pauseBtn) {
      pauseBtn.textContent = isPaused ? "Resume" : "Pause";
      pauseBtn.classList.toggle("active", isPaused);
    }

    if (isPaused) {
      if (mainSlideTimeout) {
        clearTimeout(mainSlideTimeout);
        mainSlideTimeout = null;
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    } else {
      // Auto-advance on PC/TV when resumed
      if (!isMobile) {
        const currentSlide = mainSlides[currentMainIndex];
        const duration =
          parseInt(currentSlide.getAttribute("data-duration")) || 10000;
        const remainingTime = Math.max(duration - elapsedTime, 2000); // At least 2 seconds

        if (mainSlideTimeout === null) {
          mainSlideTimeout = setTimeout(
            () => {
              if (!isPaused && !isMobile) {
                mainSlideTimeout = null;
                scrollToSlide(currentMainIndex + 1);
              }
            },
            remainingTime
          );
          updateProgressBar();
        }
      }
    }
  }

  // Slide Transition Logic
  function scrollToSlide(index) {
    // CRITICAL: Prevent infinite loops and rapid calls
    if (index === currentMainIndex) {
      return;
    }

    // Rate limiting: prevent calls faster than 500ms
    const now = Date.now();
    if (window.lastSlideChange && (now - window.lastSlideChange) < 500) {
      return;
    }
    window.lastSlideChange = now;

    // Handle boundary conditions safely
    if (index < 0) {
      if (loopSlidesCheckbox && loopSlidesCheckbox.checked) {
        index = mainSlides.length - 1;
      } else {
        return; // Don't go below 0 if not looping
      }
    }
    if (index >= mainSlides.length) {
      if (loopSlidesCheckbox && loopSlidesCheckbox.checked) {
        index = 0;
      } else {
        return; // Don't go above max if not looping
      }
    }

    const slide = mainSlides[index];

    // Reset progress
    elapsedTime = 0;
    progressBar.style.width = "0%";

    // Update navigation dots
    document.querySelectorAll(".nav-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    // Update slide dropdown
    slideSelect.value = index;

    // Always scroll directly without transition animations
    slide.scrollIntoView({ behavior: "smooth", inline: "start" });

    // Removed entering/leaving animations for better performance
    // mainSlides[currentMainIndex].classList.add("leaving");
    // slide.classList.add("entering");

    // setTimeout(() => {
    //   mainSlides[currentMainIndex].classList.remove("leaving");
    //   slide.classList.remove("entering");
    // }, 800);

    updateVideos(index);
    updateInnerSlideshows(index);

    // Update slide indicator
    slideIndicator.textContent = `${index + 1} / ${mainSlides.length}`;

    // Clear existing timeout and reset reference
    if (mainSlideTimeout) {
      clearTimeout(mainSlideTimeout);
      mainSlideTimeout = null;
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Set new timeout for auto-advance on PC/TV
    if (!isPaused && !isMobile) {
      const duration = parseInt(slide.getAttribute("data-duration")) || 10000;
      totalDuration = duration;
      
      // Safety check with reasonable minimum duration
      if (duration >= 2000 && mainSlideTimeout === null) { // Minimum 2 seconds
        mainSlideTimeout = setTimeout(() => {
          // Check conditions before advancing
          if (!isPaused && !isMobile) {
            mainSlideTimeout = null; // Clear timeout reference
            scrollToSlide(index + 1);
          }
        }, duration);
        updateProgressBar();
      }
    } 
    
    // Clear progress on mobile
    if (isMobile && progressBar) {
      progressBar.style.width = "0%";
    }

    currentMainIndex = index;
    
    // Update mobile navigation state
    updateMobileNavState();
  }

  // Removed slide transition animation for better performance
  // function applySlideTransition(callback) {
  //   callback();
  // }

  // Progress Bar Update
  function updateProgressBar() {
    if (isPaused || isMobile || !progressBar) return;

    const start = performance.now();
    const duration =
      parseInt(mainSlides[currentMainIndex].getAttribute("data-duration")) ||
      10000;

    function animate(time) {
      if (isPaused || isMobile || !progressBar) return;

      const elapsed = time - start;
      elapsedTime = elapsed;
      const progress = (elapsed / duration) * 100;

      progressBar.style.width = `${Math.min(progress, 100)}%`;

      if (elapsed < duration && !isPaused && !isMobile) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // Video Logic
  function updateVideos(activeIndex) {
    videos.forEach((video) => {
      const parentSlide = video.closest(".slide");
      if (mainSlides[activeIndex] === parentSlide) {
        video.play().catch((err) => console.warn("Autoplay issue:", err));
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }

  // Inner Slideshows Logic
  function startInnerSlideshow(container) {
    const slides = container.querySelectorAll(
      ".slideshow-slide, .feedback-card"
    );
    if (slides.length === 0) return;

    let innerIndex = 0;
    slides.forEach((slide, i) =>
      slide.classList.toggle("active", i === innerIndex)
    );

    // Get duration from data attribute or default to 7000ms
    const slideDuration =
      parseInt(slides[innerIndex].getAttribute("data-duration")) || 7000;

    const interval = setInterval(() => {
      // Exit current slide
      slides[innerIndex].classList.remove("active");

      // Move to next slide
      innerIndex = (innerIndex + 1) % slides.length;
      slides[innerIndex].classList.add("active");

      // Update feedback counter if present
      const counter = container
        .closest(".slide")
        .querySelector(".feedback-counter");
      if (counter) counter.textContent = `${innerIndex + 1} / ${slides.length}`;
    }, slideDuration);

    innerIntervals.set(container, interval);
  }

  function stopInnerSlideshow(container) {
    const interval = innerIntervals.get(container);
    if (interval) {
      clearInterval(interval);
      innerIntervals.delete(container);
    }
  }

  function updateInnerSlideshows(activeIndex) {
    innerSlideshows.forEach((slideshow) => {
      const parentSlide = slideshow.closest(".slide");
      if (mainSlides[activeIndex] === parentSlide) {
        if (!innerIntervals.has(slideshow)) {
          startInnerSlideshow(slideshow);
        }
      } else {
        stopInnerSlideshow(slideshow);
      }
    });
  }

  // Touch/Swipe Support for Mobile
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;

  mainContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  mainContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left - go to next slide
        scrollToSlide(currentMainIndex + 1);
      } else {
        // Swiped right - go to previous slide
        scrollToSlide(currentMainIndex - 1);
      }
    }
  }

  // Keyboard Controls (disabled on mobile)
  document.addEventListener("keydown", (e) => {
    if (isMobile) return; // Disable keyboard controls on mobile
    
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        scrollToSlide(currentMainIndex - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        scrollToSlide(currentMainIndex + 1);
        break;
      case " ":
        e.preventDefault();
        togglePause();
        break;
    }
  });

  // Image optimization for faster loading
  function optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add lazy loading if not already present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      // Add decoding optimization
      img.setAttribute('decoding', 'async');
      // Preload first few images
      const slideIndex = Array.from(mainSlides).findIndex(slide => slide.contains(img));
      if (slideIndex < 3) {
        img.setAttribute('loading', 'eager');
      }
    });
  }

  // Initialize UI Components
  createNavDots();
  populateSlideSelect();
  populateMobileNavSlides();
  optimizeImages();

  // Ocean Canvas Animation
  const canvas = document.getElementById("ocean-canvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class OceanElement {
    constructor(type) {
      this.type = type;
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height * -0.5 - 50;
      this.size =
        this.type === "bubble" ? 12 + Math.random() * 8 : 6 + Math.random() * 4;
      this.speedY = 0.2 + Math.random() * 0.6;
      this.speedX = Math.random() * 0.6 - 0.3;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 0.8 - 0.4;
      this.wobble = Math.random() * 2;
      this.wobbleSpeed = 0.005 + Math.random() * 0.02;
      this.wobblePos = Math.random() * Math.PI * 2;
      this.opacity = 0.4 + Math.random() * 0.4;

      if (this.type === "bubble") {
        // Ocean cool colors for bubbles
        const colors = [
          "#1E90FF", // Dodger blue
          "#0066CC", // Blue
          "#003D7A", // Dark blue
          "#87CEEB", // Sky blue
          "#4682B4", // Steel blue
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      } else {
        // Colors for ocean waves
        const colors = [
          "#0066CC", // Blue
          "#FFFFFF", // White foam
          "#87CEEB", // Sky blue
          "#1E90FF", // Dodger blue
          "#B0E0E6", // Powder blue
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
    }

    update() {
      if (!showAnimationsCheckbox.checked) return;

      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.wobblePos) * this.wobble;
      this.wobblePos += this.wobbleSpeed;
      this.rotation += this.rotationSpeed;

      if (this.y > canvas.height + this.size) {
        this.reset();
      }
    }

    draw() {
      if (!showAnimationsCheckbox.checked) return;

      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);

      if (this.type === "bubble") {
        // Draw bubble
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Draw ocean wave
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Create a wave shape
        const width = this.size * 2;
        const height = this.size;
        
        ctx.moveTo(-width/2, 0);
        ctx.quadraticCurveTo(-width/4, -height/2, 0, 0);
        ctx.quadraticCurveTo(width/4, height/2, width/2, 0);
        ctx.quadraticCurveTo(width/4, -height/4, 0, 0);
        ctx.quadraticCurveTo(-width/4, height/4, -width/2, 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Create ocean elements (minimal count for best performance)
  const oceanElements = [
    ...Array.from({ length: 8 }, () => new OceanElement("bubble")),
    ...Array.from({ length: 12 }, () => new OceanElement("wave")),
  ];

  // Performance-optimized animation with frame limiting
  let lastTime = 0;
  const targetFPS = 20; // Further reduced for lighter performance
  const frameDelay = 1000 / targetFPS;

  function animate(currentTime) {
    try {
      // Only animate if animations are enabled for better performance
      if (!showAnimationsCheckbox || !showAnimationsCheckbox.checked) {
        requestAnimationFrame(animate);
        return;
      }

      if (!ctx || !canvas) {
        requestAnimationFrame(animate);
        return;
      }

      if (currentTime - lastTime >= frameDelay) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        oceanElements.forEach((element) => {
          element.update();
          element.draw();
        });

        lastTime = currentTime;
      }

      requestAnimationFrame(animate);
    } catch (error) {
      console.warn('Animation error:', error);
      // Try again after a delay
      setTimeout(() => requestAnimationFrame(animate), 1000);
    }
  }

  // Start animation
  animate();

  // Initialize settings based on device
  if (isMobile) {
    isPaused = true; // Mobile: manual control only
    // Hide development controls on mobile
    if (devControls) {
      devControls.style.display = 'none';
    }
  } else {
    isPaused = false; // PC/TV: auto-play enabled
    // Show development controls on desktop
    if (devControls) {
      devControls.style.display = 'block';
    }
    // Enable loop by default on PC/TV
    if (loopSlidesCheckbox) {
      loopSlidesCheckbox.checked = true;
    }
  }

  // Initialize current slide to 0 and start slideshow
  currentMainIndex = 0;
  
  // Update initial UI state
  document.querySelectorAll(".nav-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === 0);
  });
  if (slideSelect) slideSelect.value = 0;
  if (slideIndicator) slideIndicator.textContent = `1 / ${mainSlides.length}`;
  updateMobileNavState();

  // Auto-start slideshow on PC/TV with safety delay
  if (!isMobile && !isPaused) {
    setTimeout(() => {
      if (!isPaused && !isMobile && mainSlides.length > 1) {
        const firstSlide = mainSlides[0];
        const duration = parseInt(firstSlide.getAttribute("data-duration")) || 10000;
        if (duration >= 2000) {
          mainSlideTimeout = setTimeout(() => {
            if (!isPaused && !isMobile) {
              scrollToSlide(1);
            }
          }, duration);
          updateProgressBar();
        }
      }
    }, 1000); // 1 second delay for safety
  }

  // Create ocean filter overlay
  const oceanFilter = document.createElement("div");
  oceanFilter.classList.add("ocean-filter");
  document.body.appendChild(oceanFilter);

  // Save/Restore Current Slide
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("currentSlideIndex", currentMainIndex);
  });

  // Always start from first slide (removed auto-restore)
  // const savedIndex = localStorage.getItem("currentSlideIndex");
  // if (savedIndex) {
  //   scrollToSlide(parseInt(savedIndex));
  // }

  const mondayMessage = document.getElementById("mondayMessage");
  if (mondayMessage) {
    // Ocean message - show for 5 seconds then fade out
    const forceOceanMessage = true; // Set to false in production
    
    if (forceOceanMessage) {
      // Show ocean welcome for 5 seconds then fade out
      setTimeout(() => {
        mondayMessage.classList.add("hiding");
      }, 5000);
    } else {
      // Hide the message immediately if not needed
      mondayMessage.style.display = "none";
    }
  }
});
