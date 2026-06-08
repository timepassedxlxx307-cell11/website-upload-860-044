(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            var expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            mobileNav.hidden = expanded;
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var startTimer = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var localInputs = Array.prototype.slice.call(document.querySelectorAll('.js-local-search'));

    localInputs.forEach(function (input) {
        var root = input.closest('main') || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-search-card]'));

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
            });
        });
    });

    var searchInput = document.querySelector('.js-search-input');
    var searchCards = Array.prototype.slice.call(document.querySelectorAll('#search-results [data-search-card]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-search-filter]'));
    var activeFilter = 'all';

    var queryFromUrl = function () {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    };

    var applySearch = function () {
        if (!searchInput || !searchCards.length) {
            return;
        }
        var keyword = searchInput.value.trim().toLowerCase();
        searchCards.forEach(function (card) {
            var text = card.textContent.toLowerCase();
            var pool = [
                card.getAttribute('data-type') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ');
            var keywordMatched = !keyword || text.indexOf(keyword) !== -1 || pool.toLowerCase().indexOf(keyword) !== -1;
            var filterMatched = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1 || pool.indexOf(activeFilter) !== -1;
            card.classList.toggle('is-hidden', !(keywordMatched && filterMatched));
        });
    };

    if (searchInput) {
        searchInput.value = queryFromUrl();
        searchInput.addEventListener('input', applySearch);
        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-search-filter') || 'all';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applySearch();
            });
        });
        if (filterButtons[0]) {
            filterButtons[0].classList.add('is-active');
        }
        applySearch();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));

    players.forEach(function (video) {
        var shell = video.closest('.player-card');
        var start = shell ? shell.querySelector('.player-start') : null;
        var url = video.getAttribute('data-video-url');
        var started = false;

        var attachSource = function () {
            if (started || !url) {
                return;
            }
            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = url;
            }
        };

        var startPlayback = function () {
            attachSource();
            if (shell) {
                shell.classList.add('is-playing');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (shell) {
                        shell.classList.remove('is-playing');
                    }
                });
            }
        };

        if (start) {
            start.addEventListener('click', startPlayback);
        }

        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });
    });
})();
