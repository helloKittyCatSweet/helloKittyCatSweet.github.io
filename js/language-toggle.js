(function () {
  var STORAGE_KEY = "preferred-language";
  var SUPPORTED = ["zh", "en"];

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
  }

  function applyLanguage(lang) {
    var current = normalizeLanguage(lang);
    document.documentElement.setAttribute("data-site-lang", current);
    document.documentElement.lang = current === "zh" ? "zh-CN" : "en";

    var label = document.getElementById("language-toggle-label");
    if (label) {
      label.textContent = current === "zh" ? "中" : "EN";
    }

    var toggle = document.querySelector("[data-language-toggle]");
    if (toggle) {
      var nextLabel = current === "zh" ? "Switch to English" : "切换到中文";
      toggle.setAttribute("aria-label", nextLabel);
      toggle.setAttribute("title", nextLabel);
    }

    setStoredLanguage(current);

    // tocbot renders both language headings; hide the inactive language entries.
    setTimeout(function () {
      syncTocWithLanguage(current);
    }, 0);
  }

  function toggleLanguage() {
    var current = normalizeLanguage(document.documentElement.getAttribute("data-site-lang"));
    applyLanguage(current === "zh" ? "en" : "zh");
  }

  document.addEventListener("DOMContentLoaded", function () {
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
