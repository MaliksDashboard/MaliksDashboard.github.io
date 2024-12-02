  document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("section");
    let currentSectionIndex = 0;

    const sectionDurations = [15,5,20,5,15,5,15,5,15,15,5,20,5,10,5,15,5,20,5,15,15]; // Example durations for each section

    function scrollToNextSection() {
      currentSectionIndex = (currentSectionIndex + 1) % sections.length;
      sections[currentSectionIndex].scrollIntoView({ behavior: "smooth" });

      setTimeout(
        scrollToNextSection,
        sectionDurations[currentSectionIndex] * 1000
      );
    }

    setTimeout(scrollToNextSection, sectionDurations[currentSectionIndex] * 1000);
  });

  document.addEventListener("DOMContentLoaded", function () {
    const videos = document.querySelectorAll(".video");  // Select all videos
    const videoSections = document.querySelectorAll(".video-section");  // Select all sections with video
  
    // Set all videos to start muted initially
    videos.forEach(video => video.muted = true);
  
    // Initialize IntersectionObserver
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const video = entry.target.querySelector(".video"); // Get video inside each section
  
            if (entry.isIntersecting) {
                video.play().catch(error => console.log(error));  // Catch autoplay errors
            } else {
                video.pause();  // Pause the video when out of view
            }
        });
    }, {
        threshold: 0.5  // Trigger when 50% of the section is in view
    });
  
    // Observe each video section
    videoSections.forEach(section => observer.observe(section));
  
    // Unmute videos after the first user interaction
    document.addEventListener("click", () => {
      videos.forEach(video => video.muted = false);
    }, { once: true });  // Runs only once on the first click
  });

  particlesJS("particles-js", {
    particles: {
      number: { value: 400, density: { enable: true, value_area: 800 } },
      color: { value: ["#ffffff", "#ff0000", "#00ff00"] }, // White for snow, red & green for Christmas
      shape: {
        type: "image",
        image: {
          src: "IMGS/snowflake.png", // Add your snowflake image URL
          width: 100,
          height: 100,
        },
      },
      opacity: {
        value: 0.7,
        random: true,
        anim: { enable: true, speed: 1, opacity_min: 0.2, sync: false },
      },
      size: {
        value: 10,
        random: true,
        anim: { enable: true, speed: 2, size_min: 0.5, sync: false },
      },
      line_linked: {
        enable: false, // No connecting lines for a cleaner look
      },
      move: {
        enable: true,
        speed: 2, // Slow drifting like falling snow
        direction: "bottom", // Particles fall down like snow
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "bubble" },
        onclick: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        bubble: { distance: 200, size: 6, duration: 2, opacity: 0.8, speed: 3 },
        repulse: { distance: 300, duration: 0.4 },
        push: { particles_nb: 4 },
        remove: { particles_nb: 2 },
      },
    },
    retina_detect: true,
  });
  

// var count_particles, stats, update;
// stats = new Stats();
// stats.setMode(0);
// stats.domElement.style.position = "absolute";
// stats.domElement.style.left = "0px";
// stats.domElement.style.top = "0px";
// document.body.appendChild(stats.domElement);
// count_particles = document.querySelector(".js-count-particles");
// update = function () {
//   stats.begin();
//   stats.end();
//   if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) {
//     count_particles.innerText = window.pJSDom[0].pJS.particles.array.length;
//   }
//   requestAnimationFrame(update);
// };
// requestAnimationFrame(update);

document.addEventListener("DOMContentLoaded", function () {
  let slideIndex = 0;
  const container = document.querySelector("#marketing-hr .slideshow-container");
  const slides = container.querySelectorAll(".slide");

  if (slides.length === 0) {
      console.error("No slides found in #marketing-hr");
      return;
  }

  function showSlides() {
      slides.forEach((slide, index) => {
          slide.style.display = index === slideIndex ? "block" : "none";
      });
      slideIndex = (slideIndex + 1) % slides.length;
  }

  showSlides(); // Show the first slide
  setInterval(showSlides, 10000); // Change slide every 5 seconds
});


//slide show marketing
document.addEventListener("DOMContentLoaded", function () {
  let currentSlideIndex = 0;
  const slides = document.querySelectorAll(".custom-slider-item");
  const totalSlides = slides.length;

  function showNextSlide() {
      // Remove active class from the current slide
      slides[currentSlideIndex].classList.remove("custom-active");

      // Update the index to the next slide
      currentSlideIndex = (currentSlideIndex + 1) % totalSlides;

      // Add active class to the new slide
      slides[currentSlideIndex].classList.add("custom-active");
  }

  // Show the first slide initially
  slides[currentSlideIndex].classList.add("custom-active");

  // Set interval for slideshow transition every 5 seconds
  setInterval(showNextSlide, 10000);
});

document.addEventListener("DOMContentLoaded", function () {
  let slideIndex = 0;
  const slides = document.querySelectorAll(".cashier-slide");

  function showSlides() {
      slides.forEach((slide, index) => {
          slide.style.display = (index === slideIndex) ? "block" : "none";
      });
      slideIndex = (slideIndex + 1) % slides.length;
  }

  showSlides(); // Show the first slide
  setInterval(showSlides, 10000); // Change image every 5 seconds
});

document.addEventListener("DOMContentLoaded", function () {
  let currentSlideIndex = 0; // Start with the first slide
  const slides = document.querySelectorAll("#cashier-excellence .unique-slide");

  if (slides.length === 0) {
      console.error("No slides found in #cashier-excellence.");
      return;
  }

  function showSlides() {
      slides.forEach((slide, index) => {
          slide.style.display = index === currentSlideIndex ? "block" : "none";
      });
      currentSlideIndex = (currentSlideIndex + 1) % slides.length; // Loop back to the first slide
  }

  // Initialize the slideshow
  showSlides();
  setInterval(showSlides, 10000); // Change slides every 5 seconds
});


document.addEventListener("DOMContentLoaded", function () {
  function initSlideshow(containerId) {
      let slideIndex = 0;
      const container = document.querySelector(`#${containerId}`);
      const slides = container.querySelectorAll(".unique-slide");

      if (slides.length === 0) {
          console.error(`No slides found in #${containerId}`);
          return;
      }

      function showSlides() {
          slides.forEach((slide, index) => {
              slide.style.display = index === slideIndex ? "block" : "none";
          });
          slideIndex = (slideIndex + 1) % slides.length;
      }

      showSlides(); // Show the first slide
      setInterval(showSlides, 10000); // Change image every 5 seconds
  }

  // Initialize your slideshow
  initSlideshow("slideshow-new");
});


document.addEventListener("DOMContentLoaded", function () {
  function initSlideshow(containerId) {
      let slideIndex = 0;
      const container = document.querySelector(`#${containerId}`);
      const slides = container.querySelectorAll(".slide");

      if (slides.length === 0) {
          console.error(`No slides found in #${containerId}`);
          return;
      }

      function showSlides() {
          slides.forEach((slide, index) => {
              slide.style.display = index === slideIndex ? "block" : "none";
          });
          slideIndex = (slideIndex + 1) % slides.length;
      }

      showSlides(); // Show the first slide
      setInterval(showSlides, 10000); // Change slide every 5 seconds
  }

  // Initialize the new slideshow
  initSlideshow("slideshow-products");
});
