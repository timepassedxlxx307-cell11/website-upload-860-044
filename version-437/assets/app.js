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
        var index = 0;
        var timer = null;

        var show = function (target) {
            if (!slides.length) {
                return;
            }

            index = (target + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        var start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        show(0);
        start();
    }

    var search = document.querySelector('[data-card-search]');
    var list = document.querySelector('[data-card-list]');

    if (search && list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));

        search.addEventListener('input', function () {
            var keyword = search.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
                card.classList.toggle('is-hidden-card', keyword && text.indexOf(keyword) === -1);
            });
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        }, { once: true });
    });
}());
