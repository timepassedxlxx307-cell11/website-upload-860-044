(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-index]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === activeIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 6200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var searchScope = document.querySelector('[data-search-scope]') || document.body;

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(searchInput && searchInput.value);
        var region = normalize(regionFilter && regionFilter.value);
        var year = normalize(yearFilter && yearFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category')
            ].join(' '));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var matched = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                matched = false;
            }
            if (region && cardRegion !== region) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }

            card.classList.toggle('hidden-card', !matched);
            if (matched) {
                visible += 1;
            }
        });

        searchScope.classList.toggle('has-no-results', visible === 0);
    }

    [searchInput, regionFilter, yearFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });
})();
