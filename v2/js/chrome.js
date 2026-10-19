(function () {
  var root = document.documentElement;
  var key = "cm-hub-theme";
  var saved = "";
  try { saved = localStorage.getItem(key) || ""; } catch (error) { saved = ""; }
  if (saved === "dawn" || saved === "void") root.dataset.theme = saved;
  else if (!root.dataset.theme) root.dataset.theme = "void";

  var button = document.getElementById("theme-btn");

  function paint() {
    var dawn = root.dataset.theme === "dawn";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dawn ? "#f6f3ff" : "#07060f");
    if (!button) return;
    button.setAttribute("aria-pressed", dawn ? "true" : "false");
    button.setAttribute("aria-label", dawn ? "Switch to void theme" : "Switch to dawn theme");
    button.textContent = dawn ? "Void theme" : "Dawn theme";
  }

  paint();
  if (!button) return;
  button.addEventListener("click", function () {
    root.dataset.theme = root.dataset.theme === "dawn" ? "void" : "dawn";
    try { localStorage.setItem(key, root.dataset.theme); } catch (error) { /* storage may be blocked */ }
    paint();
  });
})();
