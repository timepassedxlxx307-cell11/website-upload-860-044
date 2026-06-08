(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-dot]"));
      var prev = carousel.querySelector("[data-prev]");
      var next = carousel.querySelector("[data-next]");
      var current = slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      });

      if (current < 0) {
        current = 0;
      }

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });

      show(current);

      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var scope = panel.closest("main") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var search = panel.querySelector("[data-filter-search]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var category = panel.querySelector("[data-filter-category]");
      var empty = scope.querySelector("[data-empty-state]");

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function apply() {
        var term = valueOf(search);
        var selectedRegion = valueOf(region);
        var selectedType = valueOf(type);
        var selectedYear = valueOf(year);
        var selectedCategory = valueOf(category);
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
          ].join(" ").toLowerCase();

          var ok = true;

          if (term && text.indexOf(term) === -1) {
            ok = false;
          }

          if (selectedRegion && valueOf({ value: card.getAttribute("data-region") || "" }) !== selectedRegion) {
            ok = false;
          }

          if (selectedType && valueOf({ value: card.getAttribute("data-type") || "" }) !== selectedType) {
            ok = false;
          }

          if (selectedYear && valueOf({ value: card.getAttribute("data-year") || "" }) !== selectedYear) {
            ok = false;
          }

          if (selectedCategory && valueOf({ value: card.getAttribute("data-category") || "" }) !== selectedCategory) {
            ok = false;
          }

          card.classList.toggle("is-hidden", !ok);

          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, region, type, year, category].forEach(function (element) {
        if (!element) {
          return;
        }

        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      });

      apply();
    });
  });

  window.initializePlayer = function (videoId, videoUrl, buttonId, overlayId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function start() {
      loadVideo();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        start();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });

    loadVideo();
  };
})();
