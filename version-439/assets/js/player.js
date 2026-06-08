(function () {
  function initPlayer(shell) {
    var video = shell.querySelector("video");
    var startButton = shell.querySelector("[data-player-start]");
    var message = shell.querySelector("[data-player-message]");
    var source = shell.getAttribute("data-video") || "";
    var hls = null;
    var loaded = false;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function attachSource() {
      if (loaded || !video || !source) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showMessage("视频加载失败，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        showMessage("浏览器暂不支持该播放格式");
      }
    }

    function startPlayback() {
      attachSource();
      shell.classList.add("is-started");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showMessage("请再次点击播放按钮开始观看");
        });
      }
    }

    if (startButton) {
      startButton.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  var players = document.querySelectorAll("[data-player]");
  Array.prototype.forEach.call(players, initPlayer);
})();
