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

  // Simple monochrome glyphs (currentColor) for the social links; unknown ids get a text link.
  var SOCIAL_ICONS = {
    instagram: [
      ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "5", fill: "none", stroke: "currentColor", "stroke-width": "2" }],
      ["circle", { cx: "12", cy: "12", r: "4.2", fill: "none", stroke: "currentColor", "stroke-width": "2" }],
      ["circle", { cx: "17.4", cy: "6.6", r: "1.3", fill: "currentColor" }]
    ],
    tiktok: [
      ["path", { fill: "currentColor", d: "M16.5 3c.4 2.3 1.9 3.9 4.3 4.1v3.1c-1.6 0-3-.5-4.3-1.3v6.3c0 3.3-2.6 5.8-5.8 5.8s-5.8-2.6-5.8-5.8 2.6-5.8 5.8-5.8c.3 0 .6 0 .9.1v3.2c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V3h3.1z" }]
    ],
    youtube: [
      ["path", { fill: "currentColor", "fill-rule": "evenodd", d: "M22 8.2c-.2-1.6-1.4-2.8-3-3C16.6 5 12 5 12 5s-4.6 0-7 .2c-1.6.2-2.8 1.4-3 3C2 9.8 2 12 2 12s0 2.2.2 3.8c.2 1.6 1.4 2.8 3 3C7.4 19 12 19 12 19s4.6 0 7-.2c1.6-.2 2.8-1.4 3-3 .2-1.6.2-3.8.2-3.8s0-2.2-.2-3.8zM10 15V9l5.2 3L10 15z" }]
    ]
  };

  function socialIcon(id) {
    var parts = SOCIAL_ICONS[id];
    if (!parts) return null;
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    parts.forEach(function (p) {
      var node = document.createElementNS(NS, p[0]);
      Object.keys(p[1]).forEach(function (k) { node.setAttribute(k, p[1][k]); });
      svg.appendChild(node);
    });
    return svg;
  }

  function renderSocials(list, socials) {
    list.textContent = "";
    (socials || []).forEach(function (s) {
      if (!s || !s.url) return;
      var li = document.createElement("li"), a = document.createElement("a");
      a.className = "social social--" + s.id;
      a.setAttribute("href", s.url);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
      a.setAttribute("aria-label", s.label);
      a.setAttribute("title", s.label);
      var icon = socialIcon(s.id);
      if (icon) a.appendChild(icon);
      else a.textContent = s.label;
      li.appendChild(a);
      list.appendChild(li);
    });
    list.hidden = !list.children.length;
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
    document.querySelectorAll("[data-socials]").forEach(function (list) {
      renderSocials(list, content.contact && content.contact.socials);
    });
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
    renderPrivacyLinks: renderPrivacyLinks, renderSocials: renderSocials, showFallback: showFallback, init: init
  };

  if (!window.BVM_NO_AUTO_INIT) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();
