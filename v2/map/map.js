(function () {
  var root = document.documentElement;
  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var board = document.getElementById("board");
  var search = document.getElementById("map-search");
  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-show]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var lines = Array.prototype.slice.call(document.querySelectorAll(".map-svg line"));
  var nodes = Array.prototype.slice.call(document.querySelectorAll(".map-svg a"));

  function syncMotion() {
    root.dataset.motion = reduceQuery.matches ? "reduce" : "full";
    var canvas = document.createElement("canvas");
    var gl = null;
    try {
      gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (err) {
      gl = null;
    }
    root.dataset.webgl = gl ? "on" : "off";
  }

  syncMotion();
  if (typeof reduceQuery.addEventListener === "function") {
    reduceQuery.addEventListener("change", syncMotion);
  }

  function currentShow() {
    var pressed = document.querySelector("[data-show][aria-pressed='true']");
    return pressed ? pressed.getAttribute("data-show") : "all";
  }

  function matchesShow(kind, show) {
    switch (show) {
      case "all":
        return true;
      case "labs":
        return kind === "lab" || kind === "hub";
      case "sisters":
        return kind === "sister" || kind === "hub";
      case "bridges":
        return kind === "lab" || kind === "hub";
      default: {
        var unknown = show;
        throw new Error("Unknown map filter: " + unknown);
      }
    }
  }

  function lineVisible(line, show) {
    var kind = line.getAttribute("data-kind");
    switch (show) {
      case "all":
        return true;
      case "labs":
        return false;
      case "sisters":
        return kind === "sister";
      case "bridges":
        return kind === "bridge";
      default: {
        var unknown = show;
        throw new Error("Unknown map filter: " + unknown);
      }
    }
  }

  function apply() {
    var show = currentShow();
    var query = search ? search.value.trim().toLowerCase() : "";
    cards.forEach(function (card) {
      var kind = card.getAttribute("data-kind");
      var text = card.textContent.toLowerCase();
      var visible = matchesShow(kind, show) && (query === "" || text.indexOf(query) !== -1);
      card.hidden = !visible;
    });
    lines.forEach(function (line) {
      line.hidden = !lineVisible(line, show);
    });
    nodes.forEach(function (node) {
      var kind = node.getAttribute("data-kind");
      var label = (node.getAttribute("data-label") || "").toLowerCase();
      var visible = matchesShow(kind, show) && (query === "" || label.indexOf(query) !== -1);
      node.hidden = !visible;
    });
    if (board) board.dataset.show = show;
  }

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      filters.forEach(function (other) {
        other.setAttribute("aria-pressed", other === button ? "true" : "false");
      });
      apply();
    });
  });
  if (search) search.addEventListener("input", apply);

  var tryButton = document.getElementById("globe-try");
  var mount = document.getElementById("globe-mount");
  var note = document.getElementById("fx-note");

  function globeNodes() {
    return cards.filter(function (card) {
      return card.getAttribute("data-kind") === "lab";
    }).map(function (card) {
      var link = card.querySelector("a[data-globe-node]");
      return {
        id: card.getAttribute("data-id"),
        label: card.getAttribute("data-label") || "",
        url: link ? link.href : card.id
      };
    });
  }

  function prepareGlobe() {
    if (!tryButton || reduceQuery.matches || root.dataset.webgl !== "on") return;
    if (!window.CMFX || typeof window.CMFX.globe3d !== "function") return;
    tryButton.hidden = false;
    tryButton.addEventListener("click", async function () {
      if (!mount) return;
      mount.hidden = false;
      try {
        var fx = window.CMFX;
        if (fx.ready && typeof fx.ready.then === "function") {
          await Promise.race([
            fx.ready,
            new Promise(function (resolve) { setTimeout(resolve, 1500); })
          ]);
        }
        var result = fx.globe3d(mount, { nodes: globeNodes() });
        if (result && typeof result.then === "function") await result;
        root.dataset.globe = "on";
      } catch (err) {
        mount.hidden = true;
        root.dataset.globe = "off";
        if (note) note.hidden = false;
      }
    });
  }

  prepareGlobe();
})();
