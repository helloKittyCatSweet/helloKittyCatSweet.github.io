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

  function applyLanguage(lang) {
    var current = normalizeLanguage(lang);
    document.documentElement.setAttribute("data-site-lang", current);
    document.documentElement.lang = current === "zh" ? "zh-CN" : "en";

    var label = document.getElementById("language-toggle-label");
    if (label) {
      label.textContent = current === "zh" ? "EN" : "中";
    }

    var toggle = document.querySelector("[data-language-toggle]");
    if (toggle) {
      var nextLabel = current === "zh" ? "Switch to English" : "切换到中文";
      toggle.setAttribute("aria-label", nextLabel);
      toggle.setAttribute("title", nextLabel);
    }

    setStoredLanguage(current);
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
