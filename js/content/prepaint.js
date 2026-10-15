/* Applies theme and motion before CSS paints. Reads cm.settings, then the pack-2 key. */
(function () {
  try {
    var params = new URLSearchParams(location.search);
    var raw = localStorage.getItem("cm.settings") || localStorage.getItem("cml:settings:v1") || "{}";
    var stored = JSON.parse(raw);
    var root = document.documentElement;
    var media = function (query) { return matchMedia(query).matches; };
    var theme = params.get("theme") || stored.theme || "dawn";
    if (theme === "system") theme = media("(prefers-color-scheme: dark)") ? "starlight" : "dawn";
    if (media("(prefers-contrast: more)") && !stored.theme && !params.get("theme")) theme = "contrast";
    var motion = params.get("motion") || stored.motion || "system";
    if (motion === "system") motion = media("(prefers-reduced-motion: reduce)") ? "reduce" : "full";
    root.dataset.theme = theme;
    root.dataset.motion = motion;
    root.dataset.mascot = stored.mascot || "animated";
    root.dataset.quality = params.get("quality") || stored.quality || "auto";
    if (stored.textScale) root.style.setProperty("--text-scale", String(stored.textScale));
  } catch (error) {
    document.documentElement.dataset.theme = "dawn";
    document.documentElement.dataset.motion = "full";
  }
})();
