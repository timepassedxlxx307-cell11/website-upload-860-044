(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 0) {
      var activeIndex = 0;
      var showSlide = function (index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
      };
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });
      showSlide(0);
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 6500);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterCount = document.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    if (filterInput && cards.length > 0) {
      var filterCards = function () {
        var keyword = filterInput.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = keyword === "" || text.indexOf(keyword) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (filterCount) {
          filterCount.textContent = String(visible);
        }
      };
      filterInput.addEventListener("input", filterCards);
      filterCards();
    }
  });
})();
