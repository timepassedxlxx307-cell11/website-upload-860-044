(function () {
  var input = document.querySelector("[data-global-search]");
  var resultList = document.querySelector("[data-search-results]");
  var countNode = document.querySelector("[data-search-total]");
  var items = window.SITE_SEARCH_ITEMS || [];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function render(itemsToShow) {
    if (!resultList) {
      return;
    }
    resultList.innerHTML = itemsToShow.slice(0, 80).map(function (item) {
      return [
        "<a class=\"group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all site-card\" href=\"" + escapeHtml(item.url) + "\">",
        "  <div class=\"relative aspect-[3/4] overflow-hidden\">",
        "    <img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" class=\"w-full h-full object-cover group-hover:scale-110 transition-transform duration-300\">",
        "    <div class=\"absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent\"></div>",
        "    <div class=\"absolute bottom-3 left-3 right-3\"><h2 class=\"text-white text-sm font-semibold line-clamp-2\">" + escapeHtml(item.title) + "</h2></div>",
        "  </div>",
        "  <div class=\"p-4\">",
        "    <p class=\"text-xs text-stone-500 mb-2\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + "</p>",
        "    <p class=\"text-sm text-stone-700 line-clamp-2\">" + escapeHtml(item.genre) + "</p>",
        "  </div>",
        "</a>"
      ].join("");
    }).join("");
    if (countNode) {
      countNode.textContent = String(itemsToShow.length);
    }
  }

  function search() {
    var keyword = input ? input.value.trim().toLowerCase() : "";
    if (!keyword) {
      render([]);
      return;
    }
    var matched = items.filter(function (item) {
      return item.search.indexOf(keyword) !== -1;
    });
    render(matched);
  }

  if (input) {
    input.addEventListener("input", search);
    search();
  }
})();
