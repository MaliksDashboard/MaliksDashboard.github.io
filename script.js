document.addEventListener("DOMContentLoaded", () => {
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

  // State Variables
  let currentMainIndex = 0;
  let mainSlideTimeout;
  const innerIntervals = new Map();
  let isPaused = false;
  let totalDuration = 0;
  let elapsedTime = 0;
  let animationFrameId = null;

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
  devControlsToggle.addEventListener("click", () => {
    devControls.classList.toggle("active");
  });

  // Control Buttons
  pauseBtn.addEventListener("click", togglePause);
  prevBtn.addEventListener("click", () => scrollToSlide(currentMainIndex - 1));
  nextBtn.addEventListener("click", () => scrollToSlide(currentMainIndex + 1));

  // Spring Theme Effects
  function createSpringParticles() {
    if (!showAnimationsCheckbox.checked) return;

    const particles = ["spring-leaf", "spring-flower"];
    const particleCount = 3;

    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const particle = document.createElement("div");
        const particleType =
          particles[Math.floor(Math.random() * particles.length)];
        particle.classList.add("spring-particle", particleType);

        // Random position
        const xPos = Math.random() * window.innerWidth;
        particle.style.left = `${xPos}px`;
        particle.style.top = "-30px";

        // Random size
        const size = 15 + Math.random() * 15;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random duration
        const duration = 8 + Math.random() * 7;
        particle.style.animationDuration = `${duration}s, ${duration}s`;

        document.body.appendChild(particle);

        // Remove particle after animation ends
        setTimeout(() => {
          particle.remove();
        }, duration * 1000);
      }, i * 2000);
    }
  }

  // Create spring particles periodically
  setInterval(createSpringParticles, 6000);

  // Pause/Resume Logic
  function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Resume" : "Pause";
    pauseBtn.classList.toggle("active", isPaused);

    if (isPaused) {
      clearTimeout(mainSlideTimeout);
      cancelAnimationFrame(animationFrameId);
    } else {
      const currentSlide = mainSlides[currentMainIndex];
      const duration =
        parseInt(currentSlide.getAttribute("data-duration")) || 10000;
      const remainingTime = duration - elapsedTime;

      mainSlideTimeout = setTimeout(
        () => scrollToSlide(currentMainIndex + 1),
        remainingTime
      );
      updateProgressBar();
    }
  }

  // Slide Transition Logic
  function scrollToSlide(index) {
    // Handle boundary conditions
    if (index < 0) {
      index = loopSlidesCheckbox.checked ? mainSlides.length - 1 : 0;
    }
    if (index >= mainSlides.length) {
      index = loopSlidesCheckbox.checked ? 0 : mainSlides.length - 1;
    }

    // Exit early if trying to navigate beyond bounds when not looping
    if (
      !loopSlidesCheckbox.checked &&
      ((index === 0 && currentMainIndex === 0) ||
        (index === mainSlides.length - 1 &&
          currentMainIndex === mainSlides.length - 1))
    ) {
      return;
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

    // Apply transition animation if enabled
    if (
      showAnimationsCheckbox.checked &&
      Math.abs(currentMainIndex - index) === 1
    ) {
      applySlideTransition(() => {
        // Scroll to the slide after transition starts
        slide.scrollIntoView({ behavior: "smooth", inline: "start" });
      });
    } else {
      // Scroll directly without transition
      slide.scrollIntoView({ behavior: "smooth", inline: "start" });
    }

    // Add entering/leaving classes for animations
    mainSlides[currentMainIndex].classList.add("leaving");
    slide.classList.add("entering");

    setTimeout(() => {
      mainSlides[currentMainIndex].classList.remove("leaving");
      slide.classList.remove("entering");
    }, 800);

    updateVideos(index);
    updateInnerSlideshows(index);

    // Update slide indicator
    slideIndicator.textContent = `${index + 1} / ${mainSlides.length}`;

    // Clear existing timeout
    clearTimeout(mainSlideTimeout);
    cancelAnimationFrame(animationFrameId);

    // Set new timeout if not paused
    if (!isPaused) {
      const duration = parseInt(slide.getAttribute("data-duration")) || 10000;
      totalDuration = duration;
      mainSlideTimeout = setTimeout(() => scrollToSlide(index + 1), duration);
      updateProgressBar();
    }

    currentMainIndex = index;
  }

  // Slide Transition Animation
  function applySlideTransition(callback) {
    if (!showAnimationsCheckbox.checked) {
      callback();
      return;
    }

    const transition = document.createElement("div");
    transition.classList.add("slide-transition");
    document.body.appendChild(transition);

    // Force reflow
    void transition.offsetWidth;

    // Add active class to start animation
    transition.classList.add("active");

    // Execute callback half-way through the animation
    setTimeout(callback, 300);

    // Remove transition element after animation completes
    setTimeout(() => {
      transition.remove();
    }, 600);
  }

  // Progress Bar Update
  function updateProgressBar() {
    if (isPaused) return;

    const start = performance.now();
    const duration =
      parseInt(mainSlides[currentMainIndex].getAttribute("data-duration")) ||
      10000;

    function animate(time) {
      if (isPaused) return;

      const elapsed = time - start;
      elapsedTime = elapsed;
      const progress = (elapsed / duration) * 100;

      progressBar.style.width = `${Math.min(progress, 100)}%`;

      if (elapsed < duration) {
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

  // Keyboard Controls
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        scrollToSlide(currentMainIndex - 1);
        break;
      case "ArrowRight":
        scrollToSlide(currentMainIndex + 1);
        break;
      case " ":
        togglePause();
        break;
    }
  });

  // Initialize UI Components
  createNavDots();
  populateSlideSelect();

  // Spring Canvas Animation
  const canvas = document.getElementById("spring-canvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class SpringElement {
    constructor(type) {
      this.type = type;
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height * -0.5 - 50;
      this.size =
        this.type === "petal" ? 15 + Math.random() * 10 : 8 + Math.random() * 5;
      this.speedY = 0.3 + Math.random() * 0.8;
      this.speedX = Math.random() * 0.8 - 0.4;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 1 - 0.5;
      this.wobble = Math.random() * 3;
      this.wobbleSpeed = 0.01 + Math.random() * 0.03;
      this.wobblePos = Math.random() * Math.PI * 2;
      this.opacity = 0.6 + Math.random() * 0.4;

      if (this.type === "petal") {
        // Pastel colors for petals
        const colors = [
          "#ffccd1", // Light pink
          "#d1f0ff", // Light blue
          "#c9ffcc", // Light green
          "#ffeacc", // Light orange
          "#e6d7ff", // Light purple
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      } else {
        // Colors for pollen/tiny flowers
        const colors = [
          "#ffee99", // Yellow
          "#ffffff", // White
          "#ffcc88", // Orange
          "#a6ffa3", // Light green
          "#ffb6c1", // Pink
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

      if (this.type === "petal") {
        // Draw petal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.3, this.size * 0.8, 0, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Draw pollen/tiny flower
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Create spring elements
  const springElements = [
    ...Array.from({ length: 30 }, () => new SpringElement("petal")),
    ...Array.from({ length: 50 }, () => new SpringElement("pollen")),
  ];

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    springElements.forEach((element) => {
      element.update();
      element.draw();
    });

    requestAnimationFrame(animate);
  }

  // Start animation
  animate();

  // Start the slideshow from the first slide
  scrollToSlide(0);

  // Create spring filter overlay
  const springFilter = document.createElement("div");
  springFilter.classList.add("spring-filter");
  document.body.appendChild(springFilter);

  // Save/Restore Current Slide
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("currentSlideIndex", currentMainIndex);
  });

  // Check for saved slide position
  const savedIndex = localStorage.getItem("currentSlideIndex");
  if (savedIndex) {
    scrollToSlide(parseInt(savedIndex));
  }

  const mondayMessage = document.getElementById("mondayMessage");
  if (mondayMessage) {
    // Check if it's Monday
    const forceMondayMessage = true; // Set to false in production
    const isMonday = forceMondayMessage || today.getDay() === 1;

    if (!isMonday) {
      // If it's not Monday, hide the message immediately
      mondayMessage.style.display = "none";
    } else {
      // If it is Monday, show for 5 seconds then fade out
      setTimeout(() => {
        mondayMessage.classList.add("hiding");
      }, 5000);
    }
  }
});
