// Game card state, countdown math and card rendering.
// Builds DOM with createElement/textContent only (no innerHTML with content).
(function () {
  var BvM = (window.BvM = window.BvM || {});

  var STORE_BADGES = {
    appStore: { file: "app-store", ext: "svg", alt: { en: "Download on the App Store", tr: "App Store'dan indirin" } },
    googlePlay: { file: "google-play", ext: "png", alt: { en: "Get it on Google Play", tr: "Google Play'den alın" } }
  };

  function parseDate(value) {
    if (!value) return null;
    var ms = Date.parse(value);
    return isNaN(ms) ? null : ms;
  }

  function gameState(game, nowMs) {
    var releaseMs = parseDate(game.releaseDate);
    var status = game.status === "live" ? "live" : "soon";
    return {
      status: status,
      showCountdown: status === "soon" && releaseMs !== null && releaseMs > nowMs,
      releaseMs: releaseMs
    };
  }

  function countdownParts(targetMs, nowMs) {
    var mins = Math.max(0, Math.floor((targetMs - nowMs) / 60000));
    return { days: Math.floor(mins / 1440), hours: Math.floor((mins % 1440) / 60), minutes: mins % 60 };
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function renderCountdown(releaseMs, nowMs, lang, strings) {
    var t = BvM.i18n.t, parts = countdownParts(releaseMs, nowMs);
    var box = el("div", "countdown");
    box.setAttribute("data-countdown", "");
    box.setAttribute("data-release", String(releaseMs));
    [["days", "countdown.days"], ["hours", "countdown.hours"], ["minutes", "countdown.minutes"]].forEach(function (u) {
      var cell = el("div", "countdown__cell");
      var num = el("b", "countdown__num", pad(parts[u[0]]));
      num.setAttribute("data-unit", u[0]);
      cell.appendChild(num);
      cell.appendChild(el("small", "countdown__label", t(strings, lang, u[1])));
      box.appendChild(cell);
    });
    return box;
  }

  function renderStores(game, lang) {
    var wrap = el("div", "stores");
    ["appStore", "googlePlay"].forEach(function (key) {
      var url = game.links && game.links[key];
      if (!url) return;
      var b = STORE_BADGES[key];
      var a = el("a", "store store--" + b.file);
      a.setAttribute("href", url);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
      var img = el("img");
      img.setAttribute("src", "assets/badges/" + b.file + "-" + lang + "." + b.ext);
      img.setAttribute("alt", b.alt[lang] || b.alt.en);
      a.appendChild(img);
      wrap.appendChild(a);
    });
    return wrap;
  }

  function renderPreregister(game, lang, strings) {
    var t = BvM.i18n.t, url = game.links && game.links.preregister, node;
    if (url) {
      node = el("a", "btn-pre", t(strings, lang, "cta.preregister"));
      node.setAttribute("href", url);
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener");
    } else {
      node = el("span", "btn-pre is-disabled", t(strings, lang, "cta.coming_soon"));
      node.setAttribute("aria-disabled", "true");
    }
    return node;
  }

  function renderGameCard(game, lang, strings, nowMs) {
    var t = BvM.i18n.t, state = gameState(game, nowMs);
    var card = el("article", "card card--" + game.theme);
    card.id = "game-" + game.id;

    var icon = el("img", "icon");
    icon.setAttribute("src", game.icon);
    icon.setAttribute("alt", game.name);
    icon.setAttribute("width", "512");
    icon.setAttribute("height", "512");
    card.appendChild(icon);

    card.appendChild(el("span", "badge badge--" + state.status, t(strings, lang, "badge." + state.status)));
    card.appendChild(el("h3", "card__title", game.name));
    card.appendChild(el("p", "card__desc", (game.description && (game.description[lang] || game.description.en)) || ""));

    if (state.status === "live") {
      card.appendChild(renderStores(game, lang));
    } else {
      if (state.showCountdown) card.appendChild(renderCountdown(state.releaseMs, nowMs, lang, strings));
      card.appendChild(renderPreregister(game, lang, strings));
    }
    return card;
  }

  BvM.games = { gameState: gameState, countdownParts: countdownParts, renderGameCard: renderGameCard, pad: pad };
})();
