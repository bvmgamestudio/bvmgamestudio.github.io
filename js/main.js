// DOM wiring shared by every page: language, translations, game cards, countdown.
(function () {
  var BvM = (window.BvM = window.BvM || {});
  var STORE_KEY = "bvm-lang";
  var content = window.SITE_CONTENT;
  var currentLang = "en";

  function safeStorage() {
    try { return window.localStorage; } catch (e) { return null; }
  }

  function readStoredLang(storage) {
    try { return storage ? storage.getItem(STORE_KEY) : null; } catch (e) { return null; }
  }

  function writeStoredLang(lang) {
    try { var s = safeStorage(); if (s) s.setItem(STORE_KEY, lang); } catch (e) { /* private mode */ }
  }

  function applyTranslations(root, c, lang) {
    var t = BvM.i18n.t;
    root.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(c.strings, lang, node.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-content]").forEach(function (node) {
      node.setAttribute("content", t(c.strings, lang, node.getAttribute("data-i18n-content")));
    });
    root.querySelectorAll("[data-lang]").forEach(function (node) {
      node.hidden = node.getAttribute("data-lang") !== lang;
    });
    root.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === lang ? "true" : "false");
    });
    document.documentElement.lang = lang;
  }

  function renderGames(lang) {
    var grid = document.querySelector("[data-games]");
    if (!grid) return;
    var now = Date.now();
    grid.textContent = "";
    content.games.forEach(function (g) {
      grid.appendChild(BvM.games.renderGameCard(g, lang, content.strings, now));
    });
  }

  function tickCountdowns() {
    var now = Date.now();
    document.querySelectorAll("[data-countdown]").forEach(function (box) {
      var parts = BvM.games.countdownParts(Number(box.getAttribute("data-release")), now);
      box.querySelectorAll("[data-unit]").forEach(function (num) {
        num.textContent = BvM.games.pad(parts[num.getAttribute("data-unit")]);
      });
    });
  }

  function fillContact() {
    document.querySelectorAll("[data-contact-email]").forEach(function (a) {
      a.setAttribute("href", "mailto:" + content.contact.email);
      a.textContent = content.contact.email;
    });
    document.querySelectorAll("[data-year]").forEach(function (n) {
      n.textContent = String(new Date().getFullYear());
    });
  }

  // Footer privacy links come from content.games[].privacy, so a new game gets one automatically.
  function renderPrivacyLinks(list, c, lang) {
    var base = list.getAttribute("data-base") || "";
    list.textContent = "";
    c.games.forEach(function (g) {
      if (!g.privacy) return;
      var li = document.createElement("li"), a = document.createElement("a");
      a.setAttribute("href", base + g.privacy);
      a.textContent = g.name.split(":")[0] + " · " + BvM.i18n.t(c.strings, lang, "footer.privacy");
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function setLang(lang) {
    currentLang = lang;
    applyTranslations(document, content, lang);
    renderGames(lang);
    document.querySelectorAll("[data-privacy-links]").forEach(function (list) {
      renderPrivacyLinks(list, content, lang);
    });
  }

  // When content.js is missing or broken, show the static list kept in <noscript>
  // (with scripting on, its contents are plain text, written by us, not user data).
  function showFallback(grid) {
    var ns = grid.querySelector("noscript");
    if (ns) grid.innerHTML = ns.textContent;
  }

  function hashId(hash) {
    if (!hash || hash.length < 2) return null;
    try { return decodeURIComponent(hash.slice(1)); } catch (e) { return null; }
  }

  // A link like "#kvkk" may point into the language block that is hidden right now.
  function langForHash(root, hash) {
    var id = hashId(hash);
    if (!id) return null;
    var target = root.querySelector("#" + CSS.escape(id));
    var block = target && target.closest("[data-lang]");
    return block && block.hidden ? block.getAttribute("data-lang") : null;
  }

  function followHash() {
    var lang = langForHash(document, window.location.hash);
    if (!lang) return;
    setLang(lang);
    var target = document.getElementById(hashId(window.location.hash));
    if (target) target.scrollIntoView();
  }

  function init() {
    if (!content || !content.games || !content.strings) {
      document.querySelectorAll("[data-games]").forEach(showFallback);
      return;
    }
    var lang = BvM.i18n.pickLang({
      search: window.location.search,
      stored: readStoredLang(safeStorage()),
      languages: navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]
    });
    fillContact();
    setLang(lang);
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = btn.getAttribute("data-set-lang");
        writeStoredLang(next);
        if (/[?&]lang=/.test(window.location.search) && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname + window.location.hash);
        }
        if (next !== currentLang) setLang(next);
      });
    });
    followHash();
    window.addEventListener("hashchange", followHash);
    window.setInterval(tickCountdowns, 30000);
  }

  BvM.main = {
    applyTranslations: applyTranslations, readStoredLang: readStoredLang, langForHash: langForHash,
    renderPrivacyLinks: renderPrivacyLinks, showFallback: showFallback, init: init
  };

  if (!window.BVM_NO_AUTO_INIT) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();
