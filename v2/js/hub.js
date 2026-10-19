(function () {
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 700px)");
  let userMotion = null;
  let fallbackStop = function () {};

  function motionReduced() {
    if (userMotion === "reduce") return true;
    if (userMotion === "full") return false;
    if (window.CMFX && window.CMFX.reducedMotion) return true;
    return reducedQuery.matches;
  }

  function paintMotion() {
    const reduced = motionReduced();
    document.documentElement.dataset.motion = reduced ? "reduce" : "full";
    const button = document.getElementById("motion-btn");
    if (!button) return;
    button.setAttribute("aria-pressed", reduced ? "true" : "false");
    button.setAttribute("aria-label", reduced ? "Motion is paused" : "Pause motion");
    const label = button.querySelector(".tool-label");
    if (label) label.textContent = reduced ? "Motion off" : "Pause motion";
  }

  function whenFx(done) {
    function run() {
      const fx = window.CMFX;
      if (!fx) return;
      const ready = fx.ready;
      if (ready && typeof ready.then === "function") {
        ready.then(function () { done(window.CMFX || fx); }).catch(function () { done(null); });
      } else {
        done(fx);
      }
    }
    if (window.CMFX) run();
    else window.addEventListener("load", run, { once: true });
  }

  function initTheme() {
    const button = document.getElementById("theme-btn");
    let saved = "";
    try { saved = localStorage.getItem("cm-hub-theme") || ""; } catch (error) { saved = ""; }
    if (saved === "dawn" || saved === "void") {
      document.documentElement.dataset.theme = saved;
    }
    function paint() {
      const dawn = document.documentElement.dataset.theme === "dawn";
      if (!button) return;
      button.setAttribute("aria-pressed", dawn ? "true" : "false");
      button.setAttribute("aria-label", dawn ? "Switch to void theme" : "Switch to dawn theme");
      const label = button.querySelector(".tool-label");
      if (label) label.textContent = dawn ? "Void theme" : "Dawn theme";
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", dawn ? "#f6f3ff" : "#07060f");
    }
    paint();
    if (!button) return;
    button.addEventListener("click", function () {
      const next = document.documentElement.dataset.theme === "dawn" ? "void" : "dawn";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("cm-hub-theme", next); } catch (error) { /* storage may be blocked */ }
      paint();
    });
  }

  function initMotion() {
    paintMotion();
    const button = document.getElementById("motion-btn");
    if (button) {
      button.addEventListener("click", function () {
        userMotion = motionReduced() ? "full" : "reduce";
        paintMotion();
        if (motionReduced()) fallbackStop();
        else bootVisuals(window.CMFX || null);
      });
    }
    if (typeof reducedQuery.addEventListener === "function") {
      reducedQuery.addEventListener("change", function () {
        if (userMotion === null) paintMotion();
      });
    }
  }

  function initMenu() {
    const menu = document.getElementById("menu");
    const openBtn = document.getElementById("menu-btn");
    const closeBtn = document.getElementById("menu-close");
    if (!menu || !openBtn || !closeBtn) return;

    function focusables() {
      return Array.from(menu.querySelectorAll("a, button")).filter(function (el) {
        return !el.hasAttribute("disabled");
      });
    }

    function close() {
      menu.hidden = true;
      openBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      openBtn.focus();
    }

    function open() {
      menu.hidden = false;
      openBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      closeBtn.focus();
    }

    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    menu.addEventListener("click", function (event) {
      const link = event.target.closest("a");
      if (link) close();
    });
    document.addEventListener("keydown", function (event) {
      if (menu.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function paintSound(on) {
    const button = document.getElementById("sound-btn");
    if (!button) return;
    button.setAttribute("aria-pressed", on ? "true" : "false");
    const label = button.querySelector(".tool-label");
    if (label) label.textContent = on ? "Sound on" : "Sound off";
    button.setAttribute("aria-label", on ? "Sound is on. Turn sound off." : "Sound is off. Turn sound on.");
  }

  function initSound() {
    const button = document.getElementById("sound-btn");
    const note = document.getElementById("sound-note");
    if (!button) return;
    paintSound(false);
    button.addEventListener("click", function () {
      const sound = window.CMFX && window.CMFX.sound;
      if (!sound || typeof sound.toggle !== "function") {
        if (note) note.textContent = "Sound stays off. The effects library is not on this page yet.";
        paintSound(false);
        return;
      }
      Promise.resolve(sound.toggle())
        .then(function () {
          const on = typeof sound.isOn === "function" ? !!sound.isOn() : false;
          paintSound(on);
          if (on && typeof sound.ping === "function") sound.ping("ok");
          if (note) note.textContent = on ? "Sound is on." : "Sound is off.";
        })
        .catch(function () {
          paintSound(false);
          if (note) note.textContent = "Sound stayed off.";
        });
    });
  }

  function labNodes() {
    return Array.from(document.querySelectorAll("[data-globe]")).map(function (el) {
      return {
        id: el.getAttribute("data-lab") || "",
        label: el.getAttribute("data-label") || "",
        url: el.getAttribute("data-portal") || "",
      };
    });
  }

  function startFallback(canvas) {
    fallbackStop();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.hidden = true;
      return;
    }
    const parent = canvas.parentElement;
    let raf = 0;
    let running = true;
    const particles = [];

    function resize() {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const count = mobileQuery.matches ? 36 : 80;
      while (particles.length < count) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: (Math.random() * 1.6 + 0.4) * dpr,
          v: (Math.random() * 0.35 + 0.08) * dpr,
          a: Math.random() * 0.45 + 0.15,
          ph: Math.random() * Math.PI * 2,
          color: ["#7dd3fc", "#c4b5fd", "#ffc65c", "#f0abfc"][particles.length % 4],
        });
      }
      if (particles.length > count) particles.length = count;
    }

    function draw(time) {
      const w = canvas.width;
      const h = canvas.height;
      const dawn = document.documentElement.dataset.theme === "dawn";
      ctx.clearRect(0, 0, w, h);
      const blooms = dawn
        ? [
            { x: 0.74, y: 0.42, r: 0.42, color: "rgba(124, 92, 255, 0.28)" },
            { x: 0.62, y: 0.58, r: 0.3, color: "rgba(14, 116, 144, 0.22)" },
            { x: 0.84, y: 0.28, r: 0.24, color: "rgba(190, 24, 93, 0.16)" },
          ]
        : [
            { x: 0.72, y: 0.4, r: 0.46, color: "rgba(124, 92, 255, 0.55)" },
            { x: 0.58, y: 0.62, r: 0.34, color: "rgba(56, 189, 214, 0.4)" },
            { x: 0.86, y: 0.26, r: 0.28, color: "rgba(244, 114, 182, 0.32)" },
            { x: 0.4, y: 0.2, r: 0.22, color: "rgba(255, 198, 92, 0.16)" },
          ];
      blooms.forEach(function (bloom) {
        const radius = Math.max(w, h) * bloom.r;
        const gradient = ctx.createRadialGradient(w * bloom.x, h * bloom.y, 0, w * bloom.x, h * bloom.y, radius);
        gradient.addColorStop(0, bloom.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });
      const ribbons = dawn
        ? [
            { color: "rgba(83, 54, 196, 0.35)", y: 0.34, amp: 0.08, freq: 2.1, speed: 0.00022 },
            { color: "rgba(11, 86, 120, 0.28)", y: 0.48, amp: 0.07, freq: 1.4, speed: 0.00016 },
            { color: "rgba(141, 34, 96, 0.22)", y: 0.6, amp: 0.05, freq: 2.6, speed: 0.00028 },
          ]
        : [
            { color: "rgba(125, 211, 252, 0.55)", y: 0.32, amp: 0.08, freq: 2.2, speed: 0.00022 },
            { color: "rgba(196, 181, 253, 0.5)", y: 0.46, amp: 0.1, freq: 1.5, speed: 0.00016 },
            { color: "rgba(240, 171, 252, 0.36)", y: 0.58, amp: 0.06, freq: 2.8, speed: 0.00028 },
          ];
      ribbons.forEach(function (ribbon) {
        ctx.beginPath();
        const step = mobileQuery.matches ? 16 : 8;
        for (let x = 0; x <= w; x += step) {
          const nx = x / w;
          const y = h * ribbon.y
            + Math.sin(nx * Math.PI * ribbon.freq + time * ribbon.speed) * h * ribbon.amp
            + Math.sin(nx * 9 + time * ribbon.speed * 1.7) * h * 0.02;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = ribbon.color;
        ctx.lineWidth = Math.max(18, h * 0.07);
        ctx.stroke();
      });
      particles.forEach(function (particle) {
        particle.y -= particle.v;
        particle.x += Math.sin(time * 0.001 + particle.ph) * 0.25;
        if (particle.y < -4) {
          particle.y = h + 4;
          particle.x = Math.random() * w;
        }
        ctx.globalAlpha = particle.a;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    let last = 0;
    function frame(time) {
      if (!running) return;
      raf = window.requestAnimationFrame(frame);
      if (document.hidden || motionReduced()) return;
      if (time - last < 16) return;
      last = time;
      draw(time);
    }

    resize();
    draw(0);
    canvas.classList.add("is-on");
    if (!motionReduced()) raf = window.requestAnimationFrame(frame);
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && running && !motionReduced() && !raf) {
        raf = window.requestAnimationFrame(frame);
      }
    });

    fallbackStop = function () {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
    };
  }

  function bootVisuals(fx) {
    const canvas = document.getElementById("hero-canvas");
    const dust = document.getElementById("hero-dust");
    const reduced = motionReduced();
    let used = false;
    if (fx && !reduced) {
      try {
        if (typeof fx.aurora === "function" && canvas) {
          fx.aurora(canvas, {
            palette: ["#7dd3fc", "#c4b5fd", "#f0abfc", "#ffc65c"],
            intensity: mobileQuery.matches ? 0.55 : 0.85,
          });
          canvas.classList.add("is-on");
          used = true;
        }
        if (typeof fx.particles === "function" && dust) {
          fx.particles(dust, { count: mobileQuery.matches ? 36 : 80, mouse: true });
          dust.classList.add("is-on");
          used = true;
        }
        if (typeof fx.cursorTrail === "function") fx.cursorTrail();
      } catch (error) {
        used = false;
      }
    }
    if (!used) startFallback(canvas);
    else fallbackStop();

    if (fx && typeof fx.tiltCards === "function" && !reduced && document.documentElement.dataset.tilt !== "cmfx") {
      try {
        fx.tiltCards(".card");
        document.documentElement.dataset.tilt = "cmfx";
      } catch (error) {
        document.documentElement.dataset.tilt = "";
        bindTilt();
      }
    } else if (!reduced) {
      bindTilt();
    }
  }

  function bindTilt() {
    document.documentElement.dataset.tilt = "css";
  }

  function bootGlobe(fx) {
    const mount = document.getElementById("eco-globe");
    const section = document.getElementById("map");
    if (!mount || !section || !fx || typeof fx.globe3d !== "function" || motionReduced()) return;
    const observer = new IntersectionObserver(function (entries) {
      if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
      observer.disconnect();
      try {
        mount.classList.add("is-live");
        fx.globe3d(mount, { nodes: labNodes() });
      } catch (error) {
        mount.classList.remove("is-live");
      }
    }, { rootMargin: "240px" });
    observer.observe(section);
  }

  function initFilters() {
    const search = document.getElementById("lab-search");
    const empty = document.getElementById("labs-empty");
    const catButtons = Array.from(document.querySelectorAll("[data-filter-cat]"));
    const levelButtons = Array.from(document.querySelectorAll("[data-filter-level]"));
    let cat = "";
    let level = "";

    function apply() {
      const query = (search && search.value || "").trim().toLowerCase();
      const cards = Array.from(document.querySelectorAll(".card"));
      cards.forEach(function (card) {
        const cats = ((card.getAttribute("data-cat") || "") + " " + (card.getAttribute("data-secondary") || "")).split(/\s+/);
        const cardLevel = card.getAttribute("data-level") || "";
        const blob = (card.getAttribute("data-blob") || "").toLowerCase();
        const catOk = !cat || cats.indexOf(cat) !== -1;
        const levelOk = !level || cardLevel === level;
        const textOk = !query || blob.indexOf(query) !== -1;
        card.hidden = !(catOk && levelOk && textOk);
      });
      Array.from(document.querySelectorAll(".group")).forEach(function (group) {
        const visible = Array.from(group.querySelectorAll(".card")).some(function (card) { return !card.hidden; });
        group.hidden = !visible;
      });
      const any = cards.some(function (card) { return !card.hidden; });
      if (empty) empty.hidden = any;
    }

    function press(buttons, value, attr) {
      buttons.forEach(function (button) {
        button.setAttribute("aria-pressed", button.getAttribute(attr) === value ? "true" : "false");
      });
    }

    catButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        cat = button.getAttribute("data-filter-cat") || "";
        press(catButtons, cat, "data-filter-cat");
        apply();
      });
    });
    levelButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        level = button.getAttribute("data-filter-level") || "";
        press(levelButtons, level, "data-filter-level");
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);
  }

  function initContact() {
    const form = document.getElementById("issue-form");
    const error = document.getElementById("issue-error");
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic");
    if (topic && form.elements.topic) {
      const known = Array.from(form.elements.topic.options).some(function (option) {
        return option.value === topic;
      });
      if (known) form.elements.topic.value = topic;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (error) error.textContent = "";
      if (form.elements.company && form.elements.company.value) return;
      const name = String(form.elements.name.value || "").replace(/[\r\n]+/g, " ").trim();
      const topicValue = String(form.elements.topic.value || "general");
      const lab = String(form.elements.lab.value || "");
      const message = String(form.elements.message.value || "").trim();
      if (name.length < 2 || name.length > 80) {
        if (error) error.textContent = "Add a name, between 2 and 80 characters.";
        return;
      }
      if (message.length < 20 || message.length > 4000) {
        if (error) error.textContent = "Write a message of at least 20 characters.";
        return;
      }
      const title = ("[CML] " + topicValue + (lab ? " · " + lab : "") + " from " + name).slice(0, 180);
      const body = [
        message,
        "",
        "— " + name,
        "Topic: " + topicValue,
        "Lab: " + (lab || "n/a"),
        "",
        "Started from the v2 preview. No email address is included, because GitHub issues are public.",
      ].join("\n");
      let url = "https://github.com/CypherMonkeyLabs/cyphermonkeylabs.github.io/issues/new?title="
        + encodeURIComponent(title) + "&body=" + encodeURIComponent(body);
      if (url.length > 7000) {
        url = "https://github.com/CypherMonkeyLabs/cyphermonkeylabs.github.io/issues/new";
      }
      window.open(url, "_blank", "noopener");
      if (error) error.textContent = "A GitHub tab should open with your note. Your email was not asked for, because issues are public.";
    });
  }

  function initPings() {
    document.addEventListener("pointerover", function (event) {
      const card = event.target.closest && event.target.closest(".card");
      if (!card) return;
      if (event.relatedTarget && card.contains(event.relatedTarget)) return;
      const sound = window.CMFX && window.CMFX.sound;
      if (sound && typeof sound.ping === "function") sound.ping("hover");
    });
    document.addEventListener("click", function (event) {
      const link = event.target.closest && event.target.closest("a");
      if (!link) return;
      const sound = window.CMFX && window.CMFX.sound;
      if (!sound || typeof sound.ping !== "function") return;
      if (link.closest(".card")) sound.ping("tap");
      else if (link.closest("nav, .menu, .eco-jumps, .cta-row, .foot")) sound.ping("nav");
    });
  }

  function initReveal() {
    const sections = Array.from(document.querySelectorAll("main .band"));
    if (!sections.length || motionReduced()) return;
    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) section.classList.add("is-in");
    });
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    sections.forEach(function (section) {
      if (!section.classList.contains("is-in")) observer.observe(section);
    });
    document.documentElement.classList.add("reveal-ready");
  }

  function boot() {
    function apply(fx) {
      bootVisuals(fx);
      if (fx) bootGlobe(fx);
      paintMotion();
    }
    if (window.CMFX) {
      whenFx(apply);
      return;
    }
    bootVisuals(null);
    window.addEventListener("load", function () {
      if (window.CMFX) whenFx(apply);
    }, { once: true });
  }

  paintMotion();
  initTheme();
  initMotion();
  initMenu();
  initSound();
  initPings();
  initReveal();
  initFilters();
  initContact();
  boot();
})();
