// Language selection and string lookup. Pure functions, no DOM access.
(function () {
  var BvM = (window.BvM = window.BvM || {});
  var LANGS = ["en", "tr"];

  function valid(lang) {
    return typeof lang === "string" && LANGS.indexOf(lang) !== -1 ? lang : null;
  }

  // Order: valid ?lang= → valid stored choice → primary browser language → en.
  function pickLang(opts) {
    var param = /[?&]lang=([^&#]*)/.exec(opts.search || "");
    var fromUrl = valid(param && decodeURIComponent(param[1]).toLowerCase());
    if (fromUrl) return fromUrl;
    var fromStore = valid(opts.stored);
    if (fromStore) return fromStore;
    var primary = (opts.languages && opts.languages[0]) || "";
    return primary.toLowerCase().indexOf("tr") === 0 ? "tr" : "en";
  }

  function t(strings, lang, key) {
    var table = strings[lang] || {};
    if (Object.prototype.hasOwnProperty.call(table, key)) return table[key];
    if (strings.en && Object.prototype.hasOwnProperty.call(strings.en, key)) return strings.en[key];
    return key;
  }

  BvM.i18n = { LANGS: LANGS, pickLang: pickLang, t: t };
})();
