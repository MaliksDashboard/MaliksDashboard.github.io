  document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("section");
    let currentSectionIndex = 0;

    const sectionDurations = [15,5,20,5,15,15,5,20,5,5,5,5,5,15,20,5,15,5]; // Example durations for each section

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
    number: { value: 160, density: { enable: true, value_area: 800 } },
    color: { value: "#ffffff" },
    shape: {
      type: "circle",
      stroke: { width: 0, color: "#000000" },
      polygon: { nb_sides: 5 },
      image: { src: "img/github.svg", width: 100, height: 100 },
    },
    opacity: {
      value: 1,
      random: true,
      anim: { enable: true, speed: 1, opacity_min: 0, sync: false },
    },
    size: {
      value: 3,
      random: true,
      anim: { enable: false, speed: 4, size_min: 0.3, sync: false },
    },
    line_linked: {
      enable: false,
      distance: 150,
      color: "#ffffff",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: { enable: false, rotateX: 600, rotateY: 600 },
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
      grab: { distance: 400, line_linked: { opacity: 1 } },
      bubble: { distance: 250, size: 0, duration: 2, opacity: 0, speed: 3 },
      repulse: { distance: 400, duration: 0.4 },
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


let slideIndex = 0;
showSlides();

function showSlides() {
  let slides = document.getElementsByClassName("slide");

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none"; // Hide all slides
  }

  slideIndex++;
  if (slideIndex > slides.length) { 
    slideIndex = 1;
  }

  slides[slideIndex - 1].style.display = "block"; // Show the current slide
  setTimeout(showSlides, 10000); // Change image every 5 seconds
}


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
  setInterval(showNextSlide, 5000);
});
