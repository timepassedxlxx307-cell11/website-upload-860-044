(function () {
    var mobileButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll(".site-search-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var query = input.value.trim();
            if (!query) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    }

    if (slides.length > 1) {
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                if (heroTimer) {
                    window.clearInterval(heroTimer);
                }
                heroTimer = window.setInterval(function () {
                    showSlide(currentSlide + 1);
                }, 5200);
            });
        });
        heroTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var pageFilterInput = document.querySelector(".page-filter-input");
    var pageFilterSelect = document.querySelector(".page-filter-select");
    var pageCards = Array.prototype.slice.call(document.querySelectorAll(".category-video-list .video-card"));

    function applyPageFilter() {
        if (!pageCards.length) {
            return;
        }
        var keyword = pageFilterInput ? pageFilterInput.value.trim().toLowerCase() : "";
        var typeValue = pageFilterSelect ? pageFilterSelect.value.trim().toLowerCase() : "";
        pageCards.forEach(function (card) {
            var text = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre
            ].join(" ").toLowerCase();
            var typeText = (card.dataset.type || "").toLowerCase();
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedType = !typeValue || typeText.indexOf(typeValue) !== -1;
            card.classList.toggle("is-filtered-out", !(matchedKeyword && matchedType));
        });
    }

    if (pageFilterInput) {
        pageFilterInput.addEventListener("input", applyPageFilter);
    }
    if (pageFilterSelect) {
        pageFilterSelect.addEventListener("change", applyPageFilter);
    }

    var searchInput = document.getElementById("searchInput");
    var categoryFilter = document.getElementById("categoryFilter");
    var typeFilter = document.getElementById("typeFilter");
    var clearSearch = document.getElementById("clearSearch");
    var searchResults = document.getElementById("searchResults");
    var searchCards = searchResults ? Array.prototype.slice.call(searchResults.querySelectorAll(".video-card")) : [];
    var emptyResult = null;

    function ensureEmptyResult() {
        if (!searchResults) {
            return null;
        }
        if (!emptyResult) {
            emptyResult = document.createElement("p");
            emptyResult.className = "empty-result";
            emptyResult.textContent = "没有找到匹配内容";
            searchResults.appendChild(emptyResult);
        }
        return emptyResult;
    }

    function applySearchFilter() {
        if (!searchCards.length) {
            return;
        }
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var categoryValue = categoryFilter ? categoryFilter.value.trim().toLowerCase() : "";
        var typeValue = typeFilter ? typeFilter.value.trim().toLowerCase() : "";
        var visible = 0;
        searchCards.forEach(function (card) {
            var text = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre
            ].join(" ").toLowerCase();
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedCategory = !categoryValue || (card.dataset.category || "").toLowerCase() === categoryValue;
            var matchedType = !typeValue || (card.dataset.type || "").toLowerCase().indexOf(typeValue) !== -1;
            var shouldShow = matchedKeyword && matchedCategory && matchedType;
            card.classList.toggle("is-filtered-out", !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });
        var empty = ensureEmptyResult();
        if (empty) {
            empty.style.display = visible ? "none" : "block";
        }
    }

    if (searchInput && searchCards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var category = params.get("category") || "";
        var type = params.get("type") || "";
        searchInput.value = query;
        if (categoryFilter) {
            categoryFilter.value = category;
        }
        if (typeFilter) {
            typeFilter.value = type;
        }
        searchInput.addEventListener("input", applySearchFilter);
        if (categoryFilter) {
            categoryFilter.addEventListener("change", applySearchFilter);
        }
        if (typeFilter) {
            typeFilter.addEventListener("change", applySearchFilter);
        }
        if (clearSearch) {
            clearSearch.addEventListener("click", function () {
                searchInput.value = "";
                if (categoryFilter) {
                    categoryFilter.value = "";
                }
                if (typeFilter) {
                    typeFilter.value = "";
                }
                applySearchFilter();
            });
        }
        applySearchFilter();
    }
})();

(function () {
    var hlsPromise = null;

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "./assets/hls.js";
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error("HLS unavailable"));
                }
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function attachStream(video, streamUrl) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return Promise.resolve();
        }
        return loadHlsLibrary().then(function (Hls) {
            if (Hls && Hls.isSupported && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video._hlsInstance = hls;
                return;
            }
            video.src = streamUrl;
        }).catch(function () {
            video.src = streamUrl;
        });
    }

    window.initMoviePlayer = function (playerId, streamUrl) {
        var player = document.getElementById(playerId);
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        if (!video || !cover) {
            return;
        }
        var streamReady = false;
        var starting = false;

        function startPlayback() {
            if (starting) {
                return;
            }
            starting = true;
            var readyPromise = streamReady ? Promise.resolve() : attachStream(video, streamUrl);
            readyPromise.then(function () {
                streamReady = true;
                cover.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            }).finally(function () {
                starting = false;
            });
        }

        cover.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
    };
})();
