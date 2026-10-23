// SDA Kigalama Church - shared JavaScript

document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu
  var menuButton = document.getElementById("menuButton");
  var nav = document.getElementById("navigation");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("show");
      menuButton.setAttribute("aria-expanded", nav.classList.contains("show"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("show");
      });
    });
  }

  // Footer year
  var year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Back-to-top button
  var backToTop = document.querySelector(".back-to-top");
  window.addEventListener("scroll", function () {
    if (backToTop) {
      backToTop.classList.toggle("visible", window.scrollY > 400);
    }
  });

  // Highlight the nav link of the section being viewed (home page only)
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav a[href^='#']");

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + entry.target.id
              );
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  // Fade-in on scroll
  var fadeItems = document.querySelectorAll(".fade-in");
  if ("IntersectionObserver" in window) {
    var fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    fadeItems.forEach(function (item) {
      fadeObserver.observe(item);
    });
  } else {
    fadeItems.forEach(function (item) {
      item.classList.add("show");
    });
  }

  // Hide broken images gracefully (the gradient background shows instead)
  document.querySelectorAll(".gallery-item img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.style.display = "none";
    });
  });

  // Contact form
  var form = document.getElementById("contactForm");
  var response = document.getElementById("response");

  if (form && response) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = document.getElementById("email").value.trim();
      var message = document.getElementById("message").value.trim();

      if (!email || !message) {
        response.textContent = "Please fill in your email and message.";
        return;
      }

      // To receive real messages, connect this form to a service
      // such as Formspree or EmailJS. For now it shows a confirmation.
      response.textContent = "Thank you! Your message has been received. God bless you.";
      form.reset();
    });
  }
});
