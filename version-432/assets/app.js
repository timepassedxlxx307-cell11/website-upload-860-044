(function () {
    var hlsPromise = null;

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
        var previous = slider.querySelector('[data-slide-prev]');
        var next = slider.querySelector('[data-slide-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide-dot')) || 0);
                start();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
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

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function text(value) {
        return String(value || '').toLowerCase();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var category = scope.querySelector('[data-category-filter]');
            var type = scope.querySelector('[data-type-filter]');
            var year = scope.querySelector('[data-year-filter]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var empty = scope.querySelector('[data-empty-state]');
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var query = input ? text(input.value).trim() : '';
                var categoryValue = category ? category.value : '';
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre')
                    ].map(text).join(' ');

                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
                    var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
                    var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var matched = matchesQuery && matchesCategory && matchesType && matchesYear;

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, category, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function initVideoPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
        if (!players.length) {
            return;
        }
        loadHlsLibrary().catch(function () {});

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var videoUrl = player.getAttribute('data-video-src');
            var hlsInstance = null;
            var prepared = false;

            function playVideo() {
                if (!video || !videoUrl) {
                    return;
                }

                if (prepared) {
                    if (video.paused) {
                        video.play().catch(function () {});
                    } else {
                        video.pause();
                    }
                    return;
                }

                prepared = true;
                player.classList.add('is-playing');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = videoUrl;
                    video.play().catch(function () {});
                    return;
                }

                loadHlsLibrary().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(videoUrl);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.src = videoUrl;
                        video.play().catch(function () {});
                    }
                }).catch(function () {
                    video.src = videoUrl;
                    video.play().catch(function () {});
                });
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (prepared) {
                    player.classList.remove('is-playing');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });

        Array.prototype.slice.call(document.querySelectorAll('[data-detail-play]')).forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                var player = document.querySelector('[data-video-player]');
                var playButton = player ? player.querySelector('[data-play-button]') : null;
                if (playButton) {
                    playButton.click();
                    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initFilters();
        initVideoPlayers();
    });
})();
