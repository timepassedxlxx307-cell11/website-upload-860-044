(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function getQuery(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function imageSafe() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      }, { once: true });
    });
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-nav-links]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var minis = qsa('[data-hero-mini]', hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    minis.forEach(function (mini) {
      mini.addEventListener('mouseenter', function () {
        show(Number(mini.getAttribute('data-hero-mini')) || 0);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function initLocalFilter() {
    qsa('[data-filter-input]').forEach(function (input) {
      var section = input.closest('.content-section') || document;
      var cards = qsa('.movie-card', section);
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase() + ' ' + (card.getAttribute('data-title') || '').toLowerCase() + ' ' + (card.getAttribute('data-genre') || '').toLowerCase() + ' ' + (card.getAttribute('data-region') || '').toLowerCase();
          card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
        });
      });
    });
  }

  function initSearchPage() {
    var results = qs('#search-results');
    if (!results || typeof siteMovieIndex === 'undefined') {
      return;
    }
    var query = getQuery('q').trim();
    var input = qs('[data-search-input]');
    var title = qs('[data-search-title]');
    var subtitle = qs('[data-search-subtitle]');
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var matches = siteMovieIndex.filter(function (item) {
      return [item.title, item.meta, item.tags, item.oneLine].join(' ').toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = '搜索结果';
    }
    if (subtitle) {
      subtitle.textContent = '关键词：' + query;
    }
    if (!matches.length) {
      results.innerHTML = '<div class="no-results">没有找到匹配影片，请尝试其他关键词。</div>';
      return;
    }
    results.innerHTML = matches.map(function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="card-poster" href="' + item.url + '">',
        '    <img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="card-year">' + escapeHtml(item.year) + '</span>',
        '    <span class="card-play">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-meta">' + escapeHtml(item.meta) + '</div>',
        '    <h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="tag-row">' + item.tags.split(',').slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
    imageSafe();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char];
    });
  }

  var hlsPromise;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('load failed'));
      };
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function initPlayers() {
    qsa('.player').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);
      var message = qs('[data-player-message]', player);
      var source = player.getAttribute('data-video-source');
      var ready = false;
      var hlsInstance = null;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add('show');
      }

      function attachSource() {
        if (ready) {
          return Promise.resolve();
        }
        if (!video || !source) {
          showMessage('播放地址加载失败，请刷新后重试。');
          return Promise.reject(new Error('no source'));
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          ready = true;
          return Promise.resolve();
        }
        return loadHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                showMessage('播放加载失败，请稍后重试。');
              }
            });
            ready = true;
            return;
          }
          video.src = source;
          ready = true;
        });
      }

      function play() {
        attachSource().then(function () {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              showMessage('点击视频控件即可开始播放。');
            });
          }
        }).catch(function () {
          showMessage('播放加载失败，请稍后重试。');
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('playing');
          player.classList.add('started');
        });
        video.addEventListener('pause', function () {
          player.classList.remove('playing');
        });
        video.addEventListener('error', function () {
          showMessage('播放加载失败，请稍后重试。');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    imageSafe();
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayers();
  });
})();
