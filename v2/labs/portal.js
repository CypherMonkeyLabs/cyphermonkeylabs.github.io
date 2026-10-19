(function () {
  var root = document.documentElement;
  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  function globeNodes() {
    return Array.prototype.map.call(document.querySelectorAll("[data-globe-node]"), function (el) {
      return {
        id: el.getAttribute("data-globe-node"),
        label: el.getAttribute("data-globe-label") || "",
        url: el.href || ""
      };
    });
  }

  function mountGlobe(slot, fx) {
    var result = fx.globe3d(slot, { nodes: globeNodes() });
    if (result && typeof result.then === "function") {
      return result;
    }
    return Promise.resolve();
  }

  function fxReady() {
    var fx = window.CMFX;
    return fx && typeof fx.globe3d === "function" ? fx : null;
  }

  async function maybeGlobe() {
    var slot = document.getElementById("globe-slot");
    if (!slot || reduceQuery.matches || document.hidden || root.dataset.webgl !== "on") return;
    var fx = fxReady();
    if (!fx) return;
    if (fx.ready && typeof fx.ready.then === "function") {
      try {
        await Promise.race([
          fx.ready,
          new Promise(function (resolve) { setTimeout(resolve, 1500); })
        ]);
      } catch (err) {
        return;
      }
    }
    if (reduceQuery.matches || document.hidden) return;
    try {
      await mountGlobe(slot, fx);
      slot.hidden = false;
      root.dataset.globe = "on";
    } catch (err) {
      slot.hidden = true;
      root.dataset.globe = "off";
    }
  }

  maybeGlobe();
})();
