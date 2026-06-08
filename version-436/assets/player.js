(function () {
    var video = document.querySelector('.js-player-video');
    var overlay = document.querySelector('.js-player-overlay');
    var configNode = document.getElementById('player-config');

    if (!video || !configNode) {
        return;
    }

    var config = {};

    try {
        config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
        config = {};
    }

    var source = config.source || '';
    var prepared = false;
    var hls = null;

    function prepare() {
        if (prepared || !source) {
            return;
        }

        prepared = true;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    video.src = source;
                }
            });
        } else {
            video.src = source;
        }
    }

    function play() {
        prepare();

        var result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {});
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        prepare();
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
            overlay.classList.remove('is-hidden');
        }
    });
})();
