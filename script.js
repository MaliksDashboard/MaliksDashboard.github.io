document.addEventListener("DOMContentLoaded", () => {
  const mainContainer = document.querySelector("main.horizontal-scroll");
  const mainSlides = document.querySelectorAll(".slide");
  const videos = document.querySelectorAll(".video");
  const innerSlideshows = document.querySelectorAll(
    ".image-slideshow, .slideshow-wrapper, .feedback-carousel"
  );
  let currentMainIndex = 0;
  let mainSlideTimeout;
  const innerIntervals = new Map();

  // Main Slide Logic
  function scrollToSlide(index) {
    if (index >= mainSlides.length) index = 0;
    const slide = mainSlides[index];
    slide.scrollIntoView({ behavior: "smooth", inline: "start" });

    updateVideos(index);
    updateInnerSlideshows(index);

    const duration = parseInt(slide.getAttribute("data-duration")) || 10000;
    clearTimeout(mainSlideTimeout);
    mainSlideTimeout = setTimeout(() => scrollToSlide(index + 1), duration);
    currentMainIndex = index;
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
      ".image-slide, .slideshow-slide, .feedback-card"
    );
    if (slides.length === 0) return;
    let innerIndex = 0;
    slides.forEach((slide, i) =>
      slide.classList.toggle("active", i === innerIndex)
    );

    const duration = parseInt(container.getAttribute("data-duration")) || 7000;
    const interval = setInterval(() => {
      slides[innerIndex].classList.remove("active");
      innerIndex = (innerIndex + 1) % slides.length;
      slides[innerIndex].classList.add("active");

      // Update feedback counter if present
      const counter = container.querySelector(".feedback-counter");
      if (counter) counter.textContent = `${innerIndex + 1}/${slides.length}`;
    }, duration);

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

  // Save/Restore Scroll Position
  const savedScroll = localStorage.getItem("slideScrollX");
  if (savedScroll) mainContainer.scrollLeft = parseInt(savedScroll, 10);

  mainContainer.addEventListener("scroll", () => {
    localStorage.setItem("slideScrollX", mainContainer.scrollLeft);
  });

  scrollToSlide(0);
});

// ✅ KEEP YOUR FLOWER ANIMATION EXACTLY AS IT IS
const canvas = document.getElementById("spring-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Petal {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.size = 15 + Math.random() * 10;
    this.speedY = 1 + Math.random() * 1.5;
    this.speedX = Math.random() * 1 - 0.5;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 2 - 1;

    const pastelColors = [
      "#E69599",
      "#E6B1C0",
      "#C5C5D2",
      "#EFE8A5",
      "#B5A7B5",
      "#E6B8C1",
      "#B0E4E4",
      "#D1C270",
    ];
    this.color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;
    if (this.y > canvas.height + this.size) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);

    ctx.fillStyle = this.color;
    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
      ctx.beginPath();
      ctx.rotate((Math.PI * 2) / petalCount);
      ctx.ellipse(
        0,
        this.size / 2.5,
        this.size * 0.3,
        this.size * 0.8,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(0, 0, this.size * 0.4, 0, 4 * Math.PI);
    ctx.fill();

    ctx.restore();
  }
}

const petals = Array.from({ length: 100 }, () => new Petal());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petals.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}

animate();
