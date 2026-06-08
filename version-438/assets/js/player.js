(function () {
    var box = document.querySelector('[data-player]');
    if (!box) {
        return;
    }

    var video = box.querySelector('video');
    var cover = box.querySelector('[data-cover]');
    var playButton = box.querySelector('[data-play]');
    var source = video ? video.getAttribute('data-src') : '';
    var loaded = false;
    var hlsInstance = null;

    function loadSource() {
        if (!video || !source || loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        loadSource();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        if (video) {
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
    }

    if (playButton) {
        playButton.addEventListener('click', startPlayback);
    }
    if (cover) {
        cover.addEventListener('click', startPlayback);
    }
    if (video) {
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();
