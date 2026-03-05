(function () {
  var STORAGE_KEY = "preferred-language";
  var SUPPORTED = ["zh", "en"];
  var tocObserver = null;

  var UI_TEXT = {
    zh: {
      toc: "目录",
      nav: {
        "/": "首页",
        "/archives/": "归档",
        "/categories/": "分类",
        "/tags/": "标签",
        "/about/": "关于"
      }
    },
    en: {
      toc: "Table of Contents",
      nav: {
        "/": "Home",
        "/archives/": "Archives",
        "/categories/": "Categories",
        "/tags/": "Tags",
        "/about/": "About"
      }
    }
  };

  function detectDefaultLanguage() {
    var pageLang = (document.documentElement.lang || "").toLowerCase();
    if (pageLang.indexOf("zh") === 0) {
      return "zh";
    }
    return "en";
  }

  function getStoredLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function setStoredLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      // Ignore storage failures in private mode or restricted contexts.
    }
  }

  function normalizeLanguage(lang) {
    return SUPPORTED.indexOf(lang) !== -1 ? lang : detectDefaultLanguage();
  }

  function normalizePath(path) {
    if (!path) {
      return "/";
    }
    return path.endsWith("/") ? path : path + "/";
  }

  function syncNavLanguage(current) {
    var navLinks = document.querySelectorAll("#navbarSupportedContent .nav-link[href]");
    var navMap = UI_TEXT[current].nav;
    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var href = link.getAttribute("href") || "";
      if (!href || href.indexOf("javascript:") === 0 || href.indexOf("#") === 0) {
        continue;
      }

      var pathname = "";
      try {
        pathname = new URL(link.href, window.location.origin).pathname;
      } catch (error) {
        continue;
      }
      pathname = normalizePath(pathname);

      var translated = navMap[pathname];
      if (!translated) {
        continue;
      }

      var textNode = link.querySelector("span");
      if (textNode) {
        textNode.textContent = translated;
      }
    }
  }

  function syncTocHeaderLanguage(current) {
    var tocHeader = document.querySelector("#toc .toc-header span");
    if (tocHeader) {
      tocHeader.textContent = UI_TEXT[current].toc;
    }
  }

  function syncTocWithLanguage(current) {
    var tocLinks = document.querySelectorAll("#toc-body a[href^='#']");
    if (!tocLinks.length) {
      return;
    }

    for (var i = 0; i < tocLinks.length; i++) {
      var link = tocLinks[i];
      var targetId = decodeURIComponent((link.getAttribute("href") || "").slice(1));
      var heading = targetId ? document.getElementById(targetId) : null;
      var item = link.closest(".toc-list-item") || link.parentElement;
      if (!item) {
        continue;
      }

      var block = heading ? heading.closest("[data-lang]") : null;
      if (!block) {
        item.style.display = "";
        continue;
      }

      var blockLang = block.getAttribute("data-lang");
      item.style.display = blockLang === current ? "" : "none";
    }

    var topList = document.querySelectorAll("#toc-body > .toc-list > .toc-list-item");
    for (var j = 0; j < topList.length; j++) {
      var topItem = topList[j];
      var visibleChildren = topItem.querySelectorAll('.toc-list-item[style*="display: none"]');
      var allChildren = topItem.querySelectorAll('.toc-list-item');
      if (allChildren.length > 0 && visibleChildren.length === allChildren.length) {
        topItem.style.display = "none";
      }
    }
  }

  function scheduleTocSync(current) {
    syncTocWithLanguage(current);
    setTimeout(function () {
      syncTocWithLanguage(current);
    }, 120);
    setTimeout(function () {
      syncTocWithLanguage(current);
    }, 400);
  }

  function bindTocObserver() {
    var tocBody = document.getElementById("toc-body");
    if (!tocBody || tocObserver) {
      return;
    }
    tocObserver = new MutationObserver(function () {
      var current = normalizeLanguage(document.documentElement.getAttribute("data-site-lang"));
      syncTocWithLanguage(current);
    });
    tocObserver.observe(tocBody, { childList: true, subtree: true });
  }

  function applyLanguage(lang) {
    var current = normalizeLanguage(lang);
    document.documentElement.setAttribute("data-site-lang", current);
    document.documentElement.lang = current === "zh" ? "zh-CN" : "en";

    var label = document.getElementById("language-toggle-label");
    if (label) {
      label.textContent = current === "zh" ? "中文" : "EN";
    }

    var toggle = document.querySelector("[data-language-toggle]");
    if (toggle) {
      var nextLabel = current === "zh" ? "Switch to English" : "切换到中文";
      toggle.setAttribute("aria-label", nextLabel);
      toggle.setAttribute("title", nextLabel);
    }

    setStoredLanguage(current);

    syncNavLanguage(current);
    syncTocHeaderLanguage(current);
    scheduleTocSync(current);
  }

  function toggleLanguage() {
    var current = normalizeLanguage(document.documentElement.getAttribute("data-site-lang"));
    applyLanguage(current === "zh" ? "en" : "zh");
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindTocObserver();
    applyLanguage(normalizeLanguage(getStoredLanguage()));

    var toggle = document.querySelector("[data-language-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        toggleLanguage();
      });
    }
  });
})();
