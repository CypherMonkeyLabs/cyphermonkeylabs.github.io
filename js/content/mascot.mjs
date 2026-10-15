import { guardsClear, pick } from "./schedule.mjs";

const cache = new Map();

async function loadSvg(id) {
  if (cache.has(id)) return cache.get(id);
  const response = await fetch(`/assets/mascot/${id}.svg`);
  if (!response.ok) throw new Error(`mascot ${id}`);
  const text = await response.text();
  cache.set(id, text);
  return text;
}

function motionReduced() {
  const html = document.documentElement;
  return html.dataset.motion === "reduce" || html.dataset.mascot === "still";
}

function readHiddenFlag() {
  try {
    return sessionStorage.getItem("cm.mascotHidden") === "1";
  } catch {
    return false;
  }
}

function formFocused() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function mountMascot(root, config) {
  const stage = root.querySelector("[data-mascot-stage]");
  const tip = root.querySelector("[data-mascot-tip]");
  const hideBtn = root.querySelector("[data-mascot-hide]");
  const core = config.core;
  const contextMap = config.context || {};
  let current = "";
  let eventName = "";
  let eventUntil = 0;
  let lastInput = performance.now();
  let pointerOver = false;
  let tipTimer = 0;
  let swapCount = 0;
  let context = "";
  let contextSince = 0;
  let holdUntil = 0;
  let blinkTimer = 0;
  let stopped = false;
  let awake = true;
  const sectionSince = new Map();

  function mode() {
    return document.documentElement.dataset.mascot || "animated";
  }

  function hiddenTab() {
    return document.hidden;
  }

  function clearTip() {
    window.clearTimeout(tipTimer);
    if (tip) tip.hidden = true;
  }

  function showTip(id) {
    if (!tip || mode() === "hidden") return;
    const lines = config.tips?.en?.[id];
    if (!lines?.length) return;
    if (swapCount % 2 !== 0) return;
    tip.textContent = lines[0];
    tip.hidden = false;
    window.clearTimeout(tipTimer);
    tipTimer = window.setTimeout(() => {
      tip.hidden = true;
    }, 6000);
  }

  function applyPose(id) {
    stage.classList.toggle("is-sleep", id === "dreamer");
    if (!motionReduced() && mode() === "animated" && id !== "dreamer") {
      stage.classList.add("is-idle");
    } else {
      stage.classList.remove("is-idle");
    }
  }

  async function swap(next, reason) {
    if (stopped || next === current) return;
    if (!guardsClear({
      pointerOver,
      tipOpen: tip ? !tip.hidden : false,
      formFocus: formFocused(),
      hidden: hiddenTab(),
    })) {
      return;
    }
    let markup;
    try {
      markup = await loadSvg(next);
    } catch {
      return;
    }
    if (stopped) return;
    const reduce = motionReduced();
    if (!reduce && current) {
      stage.animate(
        [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(.9)", opacity: 0 }],
        { duration: 240, easing: "cubic-bezier(.3,0,.8,.15)", fill: "forwards" },
      );
      await wait(240);
    }
    stage.innerHTML = markup;
    current = next;
    stage.dataset.variant = next;
    applyPose(next);
    swapCount += 1;
    if (!reduce) {
      stage.animate(
        [
          { transform: "scale(.9)", opacity: 0 },
          { transform: "scale(1.04)", opacity: 1, offset: 0.7 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: reason === "enter" ? 420 : 420, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "forwards" },
      );
      if (reason === "enter") wave();
    } else {
      stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" });
    }
    showTip(next);
    if (next !== clockOrContext()) holdUntil = performance.now() + 8000;
  }

  function clockOrContext() {
    return pick(state(), core);
  }

  function state() {
    const now = new Date();
    const idleMs = performance.now() - lastInput;
    const activeEvent = eventName && performance.now() < eventUntil ? eventName : "";
    if (!activeEvent) eventName = "";
    return { event: activeEvent, idleMs, context, now };
  }

  function wave() {
    const arm = stage.querySelector("#arm-r");
    if (!arm || motionReduced()) return;
    arm.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-22deg)" },
        { transform: "rotate(22deg)" },
        { transform: "rotate(0deg)" },
      ],
      { duration: 400, iterations: 3, easing: "ease-in-out" },
    );
  }

  function blink() {
    if (stopped || mode() !== "animated" || stage.classList.contains("is-sleep")) return;
    const lids = stage.querySelectorAll("#lid-l, #lid-r");
    lids.forEach((lid) => {
      lid.animate(
        [{ transform: "scaleY(.12)" }, { transform: "scaleY(1)" }, { transform: "scaleY(.12)" }],
        { duration: 140, easing: "linear" },
      );
    });
    const waitFor = 2500 + Math.random() * 3500;
    blinkTimer = window.setTimeout(blink, waitFor);
  }

  function onPointer(event) {
    if (mode() !== "animated" || motionReduced()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const head = stage.querySelector("#head");
    const left = stage.querySelector("#pupil-l");
    const right = stage.querySelector("#pupil-r");
    if (!head || !left || !right) return;
    const rect = stage.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-1, Math.min(1, (event.clientX - cx) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (event.clientY - cy) / (rect.height / 2)));
    head.style.transform = `rotate(${dx * 4}deg)`;
    const shift = `translate(${dx * 3}px, ${dy * 3}px)`;
    left.style.transform = shift;
    right.style.transform = shift;
  }

  function noteInput() {
    const wasDreaming = performance.now() - lastInput >= 90000;
    lastInput = performance.now();
    if (wasDreaming && current === "dreamer") {
      awake = true;
      context = "";
    }
  }

  function desired() {
    if (mode() === "hidden" || readHiddenFlag()) return "";
    const next = pick(state(), core);
    return next === "oops" ? current : next;
  }

  function playOops() {
    const head = stage.querySelector("#head");
    if (!head || stage.dataset.oops === "1") return;
    stage.dataset.oops = "1";
    if (!motionReduced()) {
      head.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(8deg)" }, { transform: "rotate(0deg)" }],
        { duration: 900, easing: "ease-in-out" },
      );
    }
    window.setTimeout(() => {
      stage.dataset.oops = "";
    }, 900);
  }

  async function tick() {
    if (stopped) return;
    if (mode() === "hidden" || readHiddenFlag()) {
      root.hidden = true;
      return;
    }
    root.hidden = false;
    if (state().event === "oops") {
      playOops();
      return;
    }
    const next = desired();
    if (next && next !== current) await swap(next, current ? "swap" : "enter");
  }

  function setEvent(name, ms) {
    eventName = name;
    eventUntil = performance.now() + ms;
    tick();
  }

  const observer = new IntersectionObserver((entries) => {
    const stamp = performance.now();
    entries.forEach((entry) => {
      const id = entry.target.id;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
        if (!sectionSince.has(id)) sectionSince.set(id, stamp);
      } else {
        sectionSince.delete(id);
      }
    });
  }, { threshold: [0.35] });

  document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));

  function refreshContext() {
    const now = performance.now();
    if (now < holdUntil && context) return;
    let next = "";
    for (const [id, since] of sectionSince) {
      if (now - since >= 2000 && contextMap[`section:${id}`]) next = contextMap[`section:${id}`];
    }
    context = next;
  }

  let hoverTimer = 0;
  document.addEventListener("pointerover", (event) => {
    const card = event.target.closest?.("[data-category]");
    if (!card) return;
    window.clearTimeout(hoverTimer);
    const category = card.dataset.category;
    hoverTimer = window.setTimeout(() => {
      const mapped = contextMap[`category:${category}`];
      if (!mapped) return;
      context = mapped;
      holdUntil = performance.now() + 8000;
      tick();
    }, 600);
  });

  hideBtn?.addEventListener("click", () => {
    const hidden = readHiddenFlag();
    try {
      sessionStorage.setItem("cm.mascotHidden", hidden ? "0" : "1");
    } catch {
      /* private mode */
    }
    hideBtn.textContent = hidden ? "Hide buddy" : "Show buddy";
    tick();
  });

  window.addEventListener("pointermove", (event) => {
    noteInput();
    onPointer(event);
  }, { passive: true });
  window.addEventListener("scroll", noteInput, { passive: true });
  window.addEventListener("keydown", noteInput);
  window.addEventListener("pointerdown", noteInput);
  stage.addEventListener("pointerenter", () => {
    pointerOver = true;
  });
  stage.addEventListener("pointerleave", () => {
    pointerOver = false;
  });

  document.addEventListener("cm:celebrate", () => setEvent("party", 4000));
  document.addEventListener("cm:oops", () => setEvent("oops", 2500));

  document.addEventListener("focusin", () => {
    const active = document.activeElement;
    if (!active || active === document.body) return;
    const mascotRect = root.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    const overlap = !(rect.right < mascotRect.left || rect.left > mascotRect.right || rect.bottom < mascotRect.top || rect.top > mascotRect.bottom);
    root.classList.toggle("is-aside", overlap);
  });

  const launchpad = document.querySelector("#launchpad");
  const buddyWatch = new IntersectionObserver((entries) => {
    const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.4);
    root.classList.toggle("is-buddy", !visible);
    if (hideBtn) hideBtn.hidden = visible;
  }, { threshold: [0.4] });
  if (launchpad) buddyWatch.observe(launchpad);

  if (stage.querySelector("svg")) {
    current = stage.dataset.variant || "stargazer";
    applyPose(current);
  }

  const interval = window.setInterval(() => {
    refreshContext();
    tick();
  }, 5000);
  blinkTimer = window.setTimeout(blink, 1800);
  tick();

  return {
    destroy() {
      stopped = true;
      observer.disconnect();
      buddyWatch.disconnect();
      window.clearInterval(interval);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(tipTimer);
    },
    celebrate() {
      setEvent("party", 4000);
    },
  };
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
