(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function activate(index) {
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

            function move(step) {
                activate(current + step);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    move(1);
                }, 5600);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    activate(index);
                    restart();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    move(-1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    move(1);
                    restart();
                });
            }
            restart();
        }

        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        inputs.forEach(function (input) {
            var scope = input.closest("main") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            input.addEventListener("input", function () {
                var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var matched = words.every(function (word) {
                        return haystack.indexOf(word) !== -1;
                    });
                    card.classList.toggle("is-hidden", !matched);
                });
            });
        });
    });
})();
