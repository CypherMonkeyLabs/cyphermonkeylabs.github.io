/* Pre-paint settings. Keep the rules in sync with js/settings/store.js.
   Load this classic script in <head> before CSS. Storage failures leave Dawn. */
(() => {
  try {
    var params = new URLSearchParams(location.search);
    try {
      var legacy = localStorage.getItem("cml:settings:v1");
      if (legacy && !localStorage.getItem("cm.settings")) localStorage.setItem("cm.settings", legacy);
      if (legacy) localStorage.removeItem("cml:settings:v1");
    } catch (err) {
      /* Private mode can block storage. Dawn, set on the document, stays. */
    }
    var raw = null;
    try {
      raw = JSON.parse(localStorage.getItem("cm.settings") || "null");
    } catch (err) {
      raw = null;
    }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) raw = {};

    var themes = { dawn: 1, starlight: 1, contrast: 1, system: 1 };
    var motions = { system: 1, reduce: 1, full: 1 };
    var qualities = { auto: 1, high: 1, medium: 1, low: 1, static: 1 };
    var mascots = { animated: 1, still: 1, hidden: 1 };
    var m = function (q) { return matchMedia(q).matches; };
    var qTheme = params.get("theme");
    var qMotion = params.get("motion");
    var qQuality = params.get("quality");
    var themePref = themes[qTheme] ? qTheme : (themes[raw.theme] ? raw.theme : "system");
    var t = themePref === "system" ? (m("(prefers-color-scheme: dark)") ? "starlight" : "dawn") : themePref;
    if (m("(prefers-contrast: more)") && !raw.theme && !themes[qTheme]) t = "contrast";
    var motionPref = motions[qMotion] ? qMotion : (motions[raw.motion] ? raw.motion : "system");
    var mo = motionPref === "system" ? (m("(prefers-reduced-motion: reduce)") ? "reduce" : "full") : motionPref;
    var d = document.documentElement;
    d.dataset.theme = t;
    d.dataset.motion = mo;
    var quality = qualities[qQuality] ? qQuality : (qualities[raw.quality] ? raw.quality : "auto");
    if (quality === "auto") {
      var conn = navigator.connection;
      var saveData = conn && conn.saveData;
      var mem = navigator.deviceMemory;
      var cores = navigator.hardwareConcurrency;
      if (saveData || (typeof mem === "number" && mem <= 4) || (typeof cores === "number" && cores <= 4)) quality = "low";
    }
    d.dataset.quality = quality;
    d.dataset.mascot = mascots[raw.mascot] ? raw.mascot : "animated";
    var scales = [1, 1.12, 1.25, 1.5];
    var scale = Number(raw.textScale);
    for (var i = 0; i < scales.length; i += 1) {
      if (Math.abs(scales[i] - scale) < 0.001) d.style.setProperty("--text-scale", String(scales[i]));
    }
    var path = location.pathname || "/";
    var lang = raw.lang === "es" || raw.lang === "en"
      ? raw.lang
      : (path === "/es" || path.indexOf("/es/") === 0 ? "es" : "en");
    d.lang = lang;
    var colors = { dawn: "#FBF7FF", starlight: "#0F1030", contrast: "#FFFFFF" };
    if (colors[t]) {
      var metas = document.querySelectorAll('meta[name="theme-color"]');
      for (var mIndex = 0; mIndex < metas.length; mIndex += 1) {
        metas[mIndex].setAttribute("content", colors[t]);
        if (themePref !== "system") metas[mIndex].removeAttribute("media");
      }
    }
    var wide = m("(min-width: 1500px)");
    var w = "0px";
    if (wide) {
      w = raw.authorRail === "collapsed" ? "72px" : "300px";
    }
    d.dataset.rail = wide ? "panel" : "button";
    d.style.setProperty("--cm-rail", w);
  } catch (err) {
    /* Private-mode storage can throw. Dawn, set on the document, stays. */
  }
})();
