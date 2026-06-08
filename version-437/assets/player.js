var config = window.moviePlayerConfig || {};
var video = document.querySelector('[data-player-video]');
var overlay = document.querySelector('[data-player-overlay]');
var activeHls = null;
var isReady = false;

async function getHls() {
    if (window.Hls) {
        return window.Hls;
    }

    try {
        var module = await import('./hls-vendor-dru42stk.js');
        return module.H || module.default || window.Hls;
    } catch (error) {
        return window.Hls;
    }
}

async function prepareVideo() {
    if (!video || !config.videoUrl || isReady) {
        return;
    }

    isReady = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.videoUrl;
        return;
    }

    var Hls = await getHls();

    if (Hls && Hls.isSupported && Hls.isSupported()) {
        activeHls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        activeHls.loadSource(config.videoUrl);
        activeHls.attachMedia(video);
        return;
    }

    video.src = config.videoUrl;
}

async function startVideo() {
    if (!video || !config.videoUrl) {
        return;
    }

    await prepareVideo();
    video.controls = true;

    if (overlay) {
        overlay.classList.add('is-hidden');
    }

    try {
        await video.play();
    } catch (error) {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    }
}

if (overlay) {
    overlay.addEventListener('click', startVideo);
}

if (video) {
    video.addEventListener('click', function () {
        if (video.paused) {
            startVideo();
        }
    });

    video.addEventListener('ended', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });
}

window.addEventListener('pagehide', function () {
    if (activeHls && activeHls.destroy) {
        activeHls.destroy();
    }
});
