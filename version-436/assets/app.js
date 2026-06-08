(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startAuto() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startAuto();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startAuto();
            });
        });

        showSlide(0);
        startAuto();
    }

    var input = document.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-field]'));
    var activeFilters = {};

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var field = chip.getAttribute('data-filter-field');
            var value = chip.getAttribute('data-filter-value');
            activeFilters[field] = value;

            chips.filter(function (item) {
                return item.getAttribute('data-filter-field') === field;
            }).forEach(function (item) {
                item.classList.toggle('active', item === chip);
            });

            applyFilters();
        });
    });

    if (input) {
        input.addEventListener('input', applyFilters);
    }

    function applyFilters() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-card-scope]'));

        scopes.forEach(function (scope) {
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();

                var searchMatch = !query || haystack.indexOf(query) !== -1;
                var filterMatch = true;

                Object.keys(activeFilters).forEach(function (field) {
                    var value = activeFilters[field];

                    if (value && value !== 'all') {
                        var attr = (card.getAttribute('data-' + field) || '').toLowerCase();
                        filterMatch = filterMatch && attr.indexOf(value.toLowerCase()) !== -1;
                    }
                });

                var matched = searchMatch && filterMatch;
                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            var empty = document.querySelector('[data-empty-state]');

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        });
    }
})();
