/**
 * mountUniverse(canvas, labs, opts) → { setQuality, setTheme, focusLab, destroy }
 * Dispatches CustomEvent "universe:select" { detail: { id } } on the canvas.
 *
 * Labs can be a Pack 3 array or { labs: [...] }. The host (or /data/labs.json)
 * owns the manifest; this module only renders it.
 */

import {
  WebGLRenderer,
  PerspectiveCamera,
  SRGBColorSpace,
  NoToneMapping,
  Vector2,
  Vector3,
} from '../../vendor/three/three.module.js';
import { normalizeLabs } from './normalize.js';
import { layoutLabs } from './layout.js';
import { accentHex, themeByName } from './palette.js';
import {
  canonicalQuality,
  createGovernor,
  initialTier,
  stepTier,
  tierConfig,
} from './quality.js';
import { createUniverseScene } from './scene.js';
import { createComposer, createWormhole } from './post.js';
import { applyFallbackTheme, mountFallback } from './fallback.js';
import { clamp, damp, easeAccel, smoothstep } from './math.js';

const WAYPOINTS = [
  { id: 'launchpad', pos: [0, 6, 70], look: [0, 0, 0], fov: 45 },
  { id: 'labs', pos: [0, 22, 48], look: [0, 0, 0], fov: 45 },
  { id: 'timeline', pos: [-30, 4, 30], look: [-60, 0, -20], fov: 50 },
  { id: 'gems', pos: [40, 10, 22], look: [62, 0, -10], fov: 45 },
  { id: 'about', pos: [0, -10, 42], look: [0, 0, 0], fov: 45 },
  { id: 'contact', pos: [0, 2, 18], look: [0, 0, 0], fov: 40 },
];

const THEME_ALIAS = {
  dawn: 'dawn',
  'pastel-dawn': 'dawn',
  paper: 'dawn',
  amber: 'dawn',
  starlight: 'starlight',
  canopy: 'starlight',
  market: 'starlight',
  ice: 'starlight',
  night: 'starlight',
  contrast: 'contrast',
  system: 'system',
};

function yieldThread() {
  return new Promise((resolve) => {
    const sched = globalThis.scheduler;
    if (sched && typeof sched.yield === 'function') sched.yield().then(resolve);
    else setTimeout(resolve, 0);
  });
}

function readStored() {
  const keys = ['cm.settings', 'cml:settings:v1'];
  for (let i = 0; i < keys.length; i += 1) {
    try {
      const raw = localStorage.getItem(keys[i]);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed.settings || parsed;
    } catch (error) {
      /* ignore broken storage */
    }
  }
  return {};
}

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function prefersReduce() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function resolveThemeName(name) {
  const key = THEME_ALIAS[String(name || 'dawn').toLowerCase()] || 'dawn';
  if (key === 'system') return prefersDark() ? 'starlight' : 'dawn';
  return key;
}

function resolveMotion(value) {
  if (value === 'reduce') return true;
  if (value === 'full') return false;
  return prefersReduce();
}

export function mountUniverse(canvas, labsInput, opts = {}) {
  if (!canvas) throw new Error('mountUniverse: canvas element is required');
  const params = new URLSearchParams(window.location.search);
  const stored = readStored();
  const labs = normalizeLabs(labsInput, { now: opts.now });
  let themeName = resolveThemeName(opts.theme || params.get('theme') || canvas.ownerDocument.documentElement.dataset.theme || stored.theme || 'dawn');
  let theme = themeByName(themeName);
  let reduce = resolveMotion(opts.motion || params.get('motion') || canvas.ownerDocument.documentElement.dataset.motion || stored.motion || 'system');
  let shortcuts = stored.shortcuts !== false;
  let governOn = params.get('govern') !== '0' && canonicalQuality(opts.quality || params.get('quality') || stored.quality) === 'auto';
  let tierName = initialTier(opts.quality || params.get('quality') || stored.quality);
  try {
    if (governOn && sessionStorage.getItem('cm.universe.tier') === 'static') tierName = 'static';
  } catch (error) {
    /* session storage can be blocked */
  }

  const parent = canvas.parentElement || document.body;
  canvas.classList.add('cml-universe-canvas', 'fade-ok');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.tabIndex = -1;

  const fallback = document.createElement('div');
  fallback.className = 'cml-universe-fallback fade-ok';
  parent.insertBefore(fallback, canvas.nextSibling);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  let layout = layoutLabs(labs, { coarse, width: window.innerWidth });
  mountFallback(fallback, labs, layout, theme);

  const labels = document.createElement('div');
  labels.className = 'cml-universe-labels';
  labels.dataset.theme = themeName;
  parent.appendChild(labels);

  const radial = document.createElement('nav');
  radial.className = 'cml-radial-list';
  radial.setAttribute('aria-label', 'Labs');
  radial.hidden = true;
  parent.appendChild(radial);
  let radialKey = '';

  const controls = document.createElement('div');
  controls.className = 'cml-explore-controls';
  controls.innerHTML = [
    '<button type="button" data-act="in" aria-label="Zoom in">+</button>',
    '<button type="button" data-act="out" aria-label="Zoom out">−</button>',
    '<button type="button" data-act="reset" aria-label="Reset view">⟲</button>',
    '<button type="button" data-act="full" aria-label="Full screen">⤢</button>',
    '<button type="button" data-act="explore" aria-pressed="false">Explore</button>',
    '<button type="button" data-act="back" hidden>All systems</button>',
  ].join('');
  parent.appendChild(controls);

  const toast = document.createElement('div');
  toast.className = 'cml-universe-toast';
  toast.setAttribute('role', 'status');
  toast.hidden = true;
  parent.appendChild(toast);

  const still = document.createElement('canvas');
  still.className = 'cml-still-overlay fade-ok';
  still.hidden = true;
  parent.appendChild(still);

  const ring = document.createElement('div');
  ring.className = 'cml-telescope-ring';
  ring.setAttribute('aria-hidden', 'true');
  if (window.matchMedia('(pointer: fine)').matches) parent.appendChild(ring);

  const debugOn = params.get('debug') === 'perf' || params.has('bench');
  const hud = document.createElement('pre');
  hud.className = 'cml-universe-hud';
  hud.hidden = !debugOn;
  if (debugOn) parent.appendChild(hud);

  const cleanups = [];
  const on = (target, type, fn, options) => {
    target.addEventListener(type, fn, options);
    cleanups.push(() => target.removeEventListener(type, fn, options));
  };

  let renderer = null;
  let composer = null;
  let wormhole = null;
  let world = null;
  let camera = null;
  let loopOn = false;
  let destroyed = false;
  let losses = 0;
  let explore = false;
  let highlight = null;
  let lastInput = performance.now();
  let frameSamples = [];
  let frames = 0;
  let fpsStamp = performance.now();
  let fps = 0;
  let ready = false;
  let staticMode = tierName === 'static';
  let resizeTimer = 0;
  let visible = true;
  let fly = null;
  let worm = null;
  let sectionId = '';
  const ndc = new Vector2();
  const camPos = new Vector3(0, 6, 70);
  const camLook = new Vector3();
  const desiredPos = new Vector3(0, 6, 70);
  const desiredLook = new Vector3();
  const parallax = new Vector2();
  let desiredFov = 45;
  let yaw = 0.2;
  let pitch = 1.15;
  let radius = 48;
  let yawT = yaw;
  let pitchT = pitch;
  let radiusT = radius;
  let pointerId = null;
  let pointerX = 0;
  let pointerY = 0;
  let pointerMoved = 0;
  let downMods = { meta: false, ctrl: false, shift: false, alt: false, button: 0 };
  const pointers = new Map();

  function showToast(text) {
    toast.hidden = false;
    toast.textContent = text;
    window.setTimeout(() => {
      toast.hidden = true;
    }, 4200);
  }

  function select(id) {
    canvas.dispatchEvent(new CustomEvent('universe:select', { bubbles: true, detail: { id } }));
  }

  function applyStatic(reason) {
    staticMode = true;
    ready = false;
    tierName = 'static';
    stopLoop();
    canvas.classList.remove('is-ready');
    fallback.classList.remove('is-hidden');
    labels.hidden = true;
    paintRadial(labItems());
    if (composer) {
      composer.dispose();
      composer = null;
    }
    if (wormhole) {
      wormhole.dispose();
      wormhole = null;
    }
    if (world) {
      world.dispose();
      world = null;
    }
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
    if (reason === 'governor') showToast('Switched to battery-friendly visuals');
    try {
      if (governOn) sessionStorage.setItem('cm.universe.tier', 'static');
    } catch (error) {
      /* ignore */
    }
  }

  function poke() {
    lastInput = performance.now();
    if (reduce && world) renderFrame();
  }

  function currentWaypoints() {
    return WAYPOINTS
      .map((point) => ({ ...point, el: document.getElementById(point.id) }))
      .filter((point) => point.el);
  }

  function readScrollTarget() {
    const nodes = currentWaypoints();
    if (!nodes.length) {
      desiredPos.set(0, 6, 70);
      desiredLook.set(0, 0, 0);
      desiredFov = window.innerWidth / Math.max(1, window.innerHeight) < 0.8 ? 55 : 45;
      sectionId = 'launchpad';
      return;
    }
    const mid = window.innerHeight * 0.45;
    let index = 0;
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].el.getBoundingClientRect().top <= mid) index = i;
    }
    const rect = nodes[index].el.getBoundingClientRect();
    const traveled = (mid - rect.top) / Math.max(1, rect.height);
    const t = smoothstep(clamp((traveled - 0.72) / 0.28, 0, 1));
    const a = nodes[index];
    const b = nodes[Math.min(nodes.length - 1, index + 1)];
    desiredPos.set(
      a.pos[0] + (b.pos[0] - a.pos[0]) * t,
      a.pos[1] + (b.pos[1] - a.pos[1]) * t,
      a.pos[2] + (b.pos[2] - a.pos[2]) * t,
    );
    desiredLook.set(
      a.look[0] + (b.look[0] - a.look[0]) * t,
      a.look[1] + (b.look[1] - a.look[1]) * t,
      a.look[2] + (b.look[2] - a.look[2]) * t,
    );
    const portrait = window.innerWidth / Math.max(1, window.innerHeight) < 0.8;
    desiredFov = a.fov + (b.fov - a.fov) * t + (portrait ? 10 : 0);
    sectionId = a.id;
  }

  function startFly(target) {
    fly = {
      t0: performance.now(),
      fromP: camPos.clone(),
      fromL: camLook.clone(),
      toL: new Vector3(target.look[0], target.look[1], target.look[2]),
      toP: new Vector3(
        target.look[0],
        target.look[1] + target.distance * 0.38,
        target.look[2] + target.distance,
      ),
    };
    const back = controls.querySelector('[data-act="back"]');
    if (back) back.hidden = false;
    poke();
  }

  function systemSpan() {
    let max = 14;
    (layout.planets || []).forEach((place) => {
      if (layout.mode === 'galaxy' && place.systemId) return;
      max = Math.max(max, Math.hypot(place.ox || 0, place.oz || 0) + place.r + place.size * 2);
    });
    if (layout.mode === 'galaxy') {
      (layout.systems || []).forEach((system) => {
        max = Math.max(max, Math.hypot(system.x, system.y, system.z) + (system.localRadius || 12));
      });
    }
    return max;
  }

  function fitSystemInView() {
    if (explore || fly || !camera) return;
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    if (aspect >= 0.95) return;
    const vfov = desiredFov * Math.PI / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const dist = desiredPos.distanceTo(desiredLook);
    const need = (systemSpan() * 1.18) / Math.max(0.2, Math.tan(hfov / 2));
    if (need <= dist) return;
    desiredPos.sub(desiredLook).setLength(need).add(desiredLook);
  }

  function updateCamera(dt) {
    readScrollTarget();
    if (fly) {
      const t = clamp((performance.now() - fly.t0) / 900, 0, 1);
      const e = smoothstep(t);
      desiredPos.lerpVectors(fly.fromP, fly.toP, e);
      desiredLook.lerpVectors(fly.fromL, fly.toL, e);
      if (t >= 1) fly = null;
    }
    if (explore) {
      const idle = performance.now() - lastInput;
      if (idle > 8000 && !reduce) yawT += 0.15 * dt;
      const k = 1 - Math.pow(1 - 0.08, dt * 60);
      yaw += (yawT - yaw) * k;
      pitch += (pitchT - pitch) * k;
      radius += (radiusT - radius) * k;
      pitch = clamp(pitch, 55 * Math.PI / 180, 85 * Math.PI / 180);
      radius = clamp(radius, 14, 110);
      const look = desiredLook;
      desiredPos.set(
        look.x + radius * Math.sin(pitch) * Math.sin(yaw),
        look.y + radius * Math.cos(pitch),
        look.z + radius * Math.sin(pitch) * Math.cos(yaw),
      );
    } else if (!reduce && window.matchMedia('(pointer: fine)').matches) {
      const k = 1 - Math.pow(1 - 0.06, dt * 60);
      parallax.x += (ndc.x * 0.6 - parallax.x) * k;
      parallax.y += (ndc.y * 0.35 - parallax.y) * k;
      desiredPos.x += parallax.x;
      desiredPos.y += parallax.y;
    }
    fitSystemInView();
    const follow = reduce ? 1 : 1 - Math.exp(-dt * 6);
    camPos.lerp(desiredPos, follow);
    camLook.lerp(desiredLook, follow);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    camera.fov = damp(camera.fov, desiredFov, 6, dt);
    camera.updateProjectionMatrix();
  }

  function project(position, width, height) {
    const v = position.clone();
    v.project(camera);
    return {
      x: (v.x * 0.5 + 0.5) * width,
      y: (-v.y * 0.5 + 0.5) * height,
      z: v.z,
      visible: v.z < 1 && v.z > -1,
    };
  }

  function narrowScreen(width) {
    return width < 520;
  }

  function labItems() {
    return labs.map((lab) => ({ id: lab.id, title: lab.shortTitle || lab.title, kind: 'lab' }));
  }

  function heroVisible() {
    const hero = document.getElementById('launchpad');
    if (!hero) return true;
    const rect = hero.getBoundingClientRect();
    const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    return visible > window.innerHeight * 0.55;
  }

  function syncHeroChrome() {
    const onHero = heroVisible();
    document.documentElement.classList.toggle('is-past-hero', !onHero);
    if (!onHero && ring.isConnected) ring.classList.remove('is-on');
  }

  function paintRadial(items) {
    const width = window.innerWidth;
    const show = narrowScreen(width) && heroVisible() && items.length > 0;
    radial.hidden = !show;
    labels.classList.toggle('is-tap', narrowScreen(width) && !staticMode);
    if (!show) return;
    const key = items.map((item) => item.id).join(',');
    if (key !== radialKey) {
      radialKey = key;
      radial.replaceChildren();
      items.forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cml-radial-list__item';
        button.dataset.id = item.id;
        button.textContent = item.title;
        button.addEventListener('click', () => {
          highlight = item.id;
          if (world && item.kind === 'lab') world.setHighlight(item.id);
          select(item.id);
          poke();
          if (!staticMode) layoutLabels();
          else paintRadial(items);
        });
        radial.appendChild(button);
      });
    }
    radial.querySelectorAll('.cml-radial-list__item').forEach((button) => {
      const on = button.dataset.id === highlight;
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function layoutLabels() {
    if (!world || staticMode) return;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    const anchors = world.anchors();
    const seen = new Set();
    const placed = [];
    const cx = width / 2;
    const cy = height / 2;
    const narrow = narrowScreen(width);
    const onHero = explore || heroVisible();
    paintRadial(anchors.filter((anchor) => anchor.kind === 'lab'));
    anchors.forEach((anchor) => {
      seen.add(anchor.id);
      let node = labels.querySelector(`[data-id="${anchor.id}"]`);
      if (!node) {
        node = document.createElement('a');
        node.className = 'cml-lab-label';
        node.dataset.id = anchor.id;
        labels.appendChild(node);
        node.addEventListener('focus', () => {
          highlight = anchor.id;
          world.setHighlight(anchor.kind === 'lab' ? anchor.id : null);
          poke();
        });
        node.addEventListener('pointerenter', () => {
          highlight = anchor.id;
          world.setHighlight(anchor.kind === 'lab' ? anchor.id : null);
          poke();
        });
        node.addEventListener('pointerleave', () => {
          if (highlight === anchor.id) {
            highlight = null;
            world.setHighlight(null);
            poke();
          }
        });
        node.addEventListener('click', onLabelClick);
      }
      node.dataset.kind = anchor.kind;
      node.textContent = anchor.title;
      node.style.setProperty('--hot', accentHex(theme, anchor.accent));
      if (anchor.kind === 'lab' && anchor.href) node.href = anchor.href;
      else node.href = `#${anchor.id}`;
      const point = project(anchor.position, width, height);
      const boxW = Math.max(88, anchor.title.length * 7.4 + 28);
      const boxH = 36;
      let x = point.x - boxW / 2;
      let y = point.y - boxH;
      let fits = false;
      if (point.visible) {
        for (let step = 0; step < 16; step += 1) {
          const hit = placed.some((box) => x < box.x + box.w && x + boxW > box.x && y < box.y + box.h && y + boxH > box.y);
          if (!hit) {
            fits = true;
            break;
          }
          const dx = x + boxW / 2 - cx;
          const dy = y + boxH / 2 - cy;
          const len = Math.hypot(dx, dy) || 1;
          x += (dx / len) * 12;
          y += (dy / len) * 12;
        }
      }
      const onScreen = point.visible && point.x > -48 && point.x < width + 48 && point.y > -48 && point.y < height + 48;
      const revealed = highlight === anchor.id;
      const show = onHero && onScreen && (narrow ? revealed : (fits || anchors.length <= 12));
      node.hidden = !show;
      node.style.visibility = show ? 'visible' : 'hidden';
      node.tabIndex = show ? 0 : -1;
      node.setAttribute('aria-hidden', show ? 'false' : 'true');
      if (show) {
        x = clamp(x, 8, Math.max(8, width - boxW - 8));
        y = clamp(y, 8, Math.max(8, height - boxH - 72));
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        placed.push({ x, y, w: boxW, h: boxH });
      }
      node.dataset.hot = highlight === anchor.id ? 'true' : 'false';
    });
    [...labels.querySelectorAll('[data-id]')].forEach((node) => {
      if (!seen.has(node.dataset.id)) node.remove();
    });
  }

  function shouldSkipWormhole(event) {
    if (!event) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
    if (event.button === 1) return true;
    const target = event.currentTarget;
    if (target && target.target === '_blank') return true;
    return false;
  }

  function startWormhole(href) {
    if (!href || reduce || staticMode || tierName === 'static') {
      if (href) window.location.assign(href);
      return;
    }
    worm = { t0: performance.now(), href };
    if (!loopOn) startLoop();
  }

  function onLabelClick(event) {
    const id = event.currentTarget.dataset.id;
    const kind = event.currentTarget.dataset.kind;
    select(id);
    if (kind === 'system' && world) {
      event.preventDefault();
      const target = world.focusSystem(id);
      if (target) startFly(target);
      poke();
      return;
    }
    const href = event.currentTarget.getAttribute('href') || '';
    if (!href || href.startsWith('#')) {
      event.preventDefault();
      if (world) world.setHighlight(id);
      return;
    }
    if (shouldSkipWormhole(event) || reduce || staticMode) return;
    event.preventDefault();
    startWormhole(href);
  }

  function renderFrame() {
    if (!renderer || !world || !composer || renderer.getContext().isContextLost()) return;
    const dt = 1 / 60;
    updateCamera(reduce ? 1 : dt);
    world.update(dt, performance.now() / 1000, { reduce, highlight });
    composer.render(world.scene, camera);
    if (worm) {
      const t = clamp((performance.now() - worm.t0) / 450, 0, 1);
      wormhole.render(renderer, easeAccel(t), camera.aspect);
      if (t >= 1 && worm.href) {
        const href = worm.href;
        worm = null;
        window.location.assign(href);
      }
    }
    layoutLabels();
  }

  function frame(now) {
    if (destroyed || staticMode || !renderer) return;
    if (document.hidden || !visible) {
      stopLoop();
      return;
    }
    const idle = now - lastInput > 60000;
    if (idle && !debugOn && now - (frame.drawn || 0) < 33) return;
    const rawMs = now - (frame.last || now);
    frame.last = now;
    frame.drawn = now;
    const dtMs = Math.min(100, rawMs);
    frameSamples.push(Math.min(500, rawMs));
    if (frameSamples.length > 480) frameSamples.shift();
    frames += 1;
    if (now - fpsStamp > 500) {
      fps = Math.round((frames * 1000) / (now - fpsStamp));
      frames = 0;
      fpsStamp = now;
      if (debugOn) paintHud();
    }
    if (governOn && !reduce) governor.sample(dtMs);
    if (staticMode || !renderer || !world || !composer) return;
    updateCamera(dtMs / 1000);
    world.update(dtMs / 1000, now / 1000, { reduce, highlight });
    composer.render(world.scene, camera);
    if (worm) {
      const t = clamp((now - worm.t0) / 450, 0, 1);
      wormhole.render(renderer, easeAccel(t), camera.aspect);
      if (t >= 1 && worm.href) {
        const href = worm.href;
        worm = null;
        window.location.assign(href);
      }
    }
    layoutLabels();
    if (!reduce) renderer.setAnimationLoop(frame);
  }

  function paintHud() {
    const info = (composer && composer.sceneInfo) || (renderer ? renderer.info.render : { calls: 0, triangles: 0 });
    const sorted = frameSamples.slice().sort((a, b) => a - b);
    const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0;
    hud.textContent = [
      `tier ${tierName}`,
      `fps ${fps}`,
      `p95 ${p95.toFixed(2)} ms`,
      `draws ${info.calls}`,
      `tris ${info.triangles}`,
      `labs ${labs.length} ${layout.mode}`,
    ].join('\n');
  }

  function startLoop() {
    if (loopOn || destroyed || staticMode || reduce || !renderer) return;
    loopOn = true;
    frame.last = performance.now();
    renderer.setAnimationLoop(frame);
  }

  function stopLoop() {
    loopOn = false;
    if (renderer) renderer.setAnimationLoop(null);
  }

  const governor = createGovernor((direction) => {
    const next = stepTier(tierName, direction);
    if (next === tierName) return;
    if (next === 'static') {
      applyStatic('governor');
      return;
    }
    tierName = next;
    if (world) world.rebuild(tierConfig(tierName));
    resizeNow();
    if (composer) composer.configure(theme, tierConfig(tierName));
  });

  function resizeNow() {
    if (!renderer || !camera || staticMode) return;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, tierConfig(tierName).dprCap);
    renderer.setPixelRatio(1);
    renderer.setSize(Math.max(1, Math.floor(width * dpr)), Math.max(1, Math.floor(height * dpr)), false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    if (composer) {
      composer.resize(
        Math.max(1, Math.floor(width * dpr)),
        Math.max(1, Math.floor(height * dpr)),
        tierConfig(tierName).bloomScale || 0.5,
      );
      composer.configure(theme, tierConfig(tierName));
    }
    if (world) world.resize(width * dpr, height * dpr, dpr);
    if (reduce) renderFrame();
  }

  function boot() {
    if (destroyed || staticMode) return;
    let gl;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        stencil: false,
        depth: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: reduce,
      });
      gl = renderer.getContext();
    } catch (error) {
      applyStatic('no-webgl');
      return;
    }
    if (!gl) {
      applyStatic('no-webgl');
      return;
    }
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NoToneMapping;
    renderer.setClearColor(0x000000, 1);
    camera = new PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.set(0, 6, 70);
    try {
      world = createUniverseScene({ layout, tier: tierConfig(tierName), theme });
      composer = createComposer(renderer);
      wormhole = createWormhole();
    } catch (error) {
      applyStatic('boot');
      return;
    }
    resizeNow();
    readScrollTarget();
    camPos.copy(desiredPos);
    camLook.copy(desiredLook);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    const compile = renderer.compileAsync
      ? renderer.compileAsync(world.scene, camera)
      : Promise.resolve();
    compile.catch(() => {}).then(() => {
      if (destroyed) return;
      renderFrame();
      ready = true;
      canvas.classList.add('is-ready');
      fallback.classList.add('is-hidden');
      if (!reduce) startLoop();
    });
    on(canvas, 'webglcontextlost', (event) => {
      event.preventDefault();
      losses += 1;
      stopLoop();
      fallback.classList.remove('is-hidden');
      canvas.classList.remove('is-ready');
      if (losses >= 2) staticMode = true;
    });
    on(canvas, 'webglcontextrestored', () => {
      if (losses >= 2 || destroyed) return;
      resizeNow();
      renderFrame();
      canvas.classList.add('is-ready');
      fallback.classList.add('is-hidden');
      if (!reduce) startLoop();
    });
  }

  function setTheme(name) {
    themeName = resolveThemeName(name);
    theme = themeByName(themeName);
    labels.dataset.theme = themeName;
    applyFallbackTheme(fallback, theme);
    mountFallback(fallback, labs, layout, theme);
    if (staticMode) return;
    if (world) world.applyTheme(theme);
    if (composer) composer.configure(theme, tierConfig(tierName));
    poke();
  }

  function setQuality(name) {
    const choice = canonicalQuality(name);
    governOn = choice === 'auto';
    const next = choice === 'auto' ? initialTier('auto') : choice;
    if (next === 'static') {
      applyStatic('choice');
      return;
    }
    if (staticMode) {
      staticMode = false;
      tierName = next;
      boot();
      return;
    }
    tierName = next;
    if (world) world.rebuild(tierConfig(tierName));
    resizeNow();
    poke();
  }

  function focusLab(id) {
    highlight = id;
    const lab = labs.find((item) => item.id === id);
    if (world && layout.mode === 'galaxy') {
      const system = (layout.systems || []).find((item) => item.planets.some((planet) => planet.id === id) || item.id === id);
      if (system && world.focusedSystem !== system.id) {
        const target = world.focusSystem(system.id);
        if (target) startFly(target);
      }
    }
    if (world) world.setHighlight(lab ? id : null);
    poke();
  }

  function destroy() {
    destroyed = true;
    stopLoop();
    window.clearTimeout(resizeTimer);
    cleanups.forEach((fn) => fn());
    if (world) world.dispose();
    if (composer) composer.dispose();
    if (wormhole) wormhole.dispose();
    if (renderer) renderer.dispose();
    fallback.remove();
    labels.remove();
    radial.remove();
    controls.remove();
    toast.remove();
    still.remove();
    ring.remove();
    hud.remove();
    canvas.classList.remove('is-ready', 'cml-universe-canvas');
  }

  function relayoutMode() {
    const next = layoutLabs(labs, { coarse: window.matchMedia('(pointer: coarse)').matches, width: window.innerWidth });
    if (next.mode === layout.mode) return;
    layout = next;
    mountFallback(fallback, labs, layout, theme);
    if (world && !staticMode) {
      world.dispose();
      world = createUniverseScene({ layout, tier: tierConfig(tierName), theme });
      resizeNow();
    }
  }

  on(window, 'resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      relayoutMode();
      resizeNow();
      syncHeroChrome();
      if (staticMode) paintRadial(labItems());
    }, 100);
  });
  const onScroll = () => {
    lastInput = performance.now();
    syncHeroChrome();
    if (staticMode) paintRadial(labItems());
  };
  on(window, 'scroll', () => {
    onScroll();
    if (fly && Math.abs(window.scrollY - (fly.scrollY ?? window.scrollY)) > 24) fly = null;
    if (reduce) {
      const nodes = currentWaypoints();
      const mid = window.innerHeight * 0.45;
      let id = sectionId;
      nodes.forEach((node) => {
        if (node.el.getBoundingClientRect().top <= mid) id = node.id;
      });
      if (id !== sectionId) {
        sectionId = id;
        still.hidden = false;
        still.width = canvas.width;
        still.height = canvas.height;
        try {
          still.getContext('2d').drawImage(canvas, 0, 0);
        } catch (error) {
          /* drawing buffer may be clear */
        }
        still.style.opacity = '1';
        renderFrame();
        requestAnimationFrame(() => {
          still.style.opacity = '0';
        });
      }
    }
  }, { passive: true });
  const pageScroller = document.querySelector('.page');
  if (pageScroller) on(pageScroller, 'scroll', onScroll, { passive: true });
  on(document, 'visibilitychange', () => {
    if (document.hidden) stopLoop();
    else if (!reduce && !staticMode) startLoop();
  });
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (!visible) stopLoop();
    else if (!reduce && !staticMode) startLoop();
  });
  io.observe(canvas);
  cleanups.push(() => io.disconnect());

  on(window, 'pointermove', (event) => {
    ndc.x = (event.clientX / window.innerWidth) * 2 - 1;
    ndc.y = -((event.clientY / window.innerHeight) * 2 - 1);
    if (ring.isConnected) {
      const hero = document.getElementById('launchpad');
      const rect = hero ? hero.getBoundingClientRect() : null;
      const over = Boolean(rect)
        && event.clientY >= rect.top
        && event.clientY <= rect.bottom
        && event.clientX >= rect.left
        && event.clientX <= rect.right
        && heroVisible();
      ring.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      ring.classList.toggle('is-on', over);
    }
    if (pointerId != null && explore) {
      const dx = event.clientX - pointerX;
      const dy = event.clientY - pointerY;
      pointerMoved += Math.abs(dx) + Math.abs(dy);
      yawT -= dx * 0.005;
      pitchT = clamp(pitchT + dy * 0.005, 55 * Math.PI / 180, 85 * Math.PI / 180);
      pointerX = event.clientX;
      pointerY = event.clientY;
    }
    if (world && !staticMode) {
      const hit = world.raycast(ndc, camera);
      const next = hit && hit.kind === 'lab' ? hit.id : null;
      if (next !== highlight && !(labels.matches(':hover') || labels.querySelector(':hover'))) {
        highlight = next;
        world.setHighlight(next);
      }
    }
    lastInput = performance.now();
  }, { passive: true });

  on(canvas, 'pointerdown', (event) => {
    pointerId = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerMoved = 0;
    downMods = {
      meta: event.metaKey,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      button: event.button,
    };
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (explore) canvas.setPointerCapture(event.pointerId);
    lastInput = performance.now();
  });
  on(canvas, 'pointerup', (event) => {
    pointers.delete(event.pointerId);
    const tap = pointerMoved < 10 && event.button === 0;
    pointerId = null;
    if (!tap || !world || staticMode) return;
    const hit = world.raycast(ndc, camera);
    if (!hit) return;
    select(hit.id);
    if (hit.kind === 'system') {
      const target = world.focusSystem(hit.id);
      if (target) startFly(target);
      return;
    }
    const lab = labs.find((item) => item.id === hit.id);
    if (!lab || !lab.url) return;
    if (downMods.meta || downMods.ctrl || downMods.shift || downMods.alt || reduce) {
      window.location.assign(lab.url);
      return;
    }
    startWormhole(lab.url);
  });
  on(window, 'wheel', (event) => {
    if (!explore) return;
    event.preventDefault();
    radiusT = clamp(radiusT * (event.deltaY > 0 ? 1.08 : 0.92), 14, 110);
    lastInput = performance.now();
  }, { passive: false });
  on(window, 'keydown', (event) => {
    lastInput = performance.now();
    const tag = event.target && event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if ((event.key === 'f' || event.key === 'F') && shortcuts && !event.metaKey && !event.ctrlKey) {
      setExplore(!explore);
    } else if (event.key === 'Escape' && explore) {
      setExplore(false);
    } else if (explore && (event.key === '+' || event.key === '=')) {
      radiusT = clamp(radiusT * 0.9, 14, 110);
    } else if (explore && event.key === '-') {
      radiusT = clamp(radiusT * 1.1, 14, 110);
    }
  });
  on(controls, 'click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const act = button.dataset.act;
    if (act === 'in') radiusT = clamp(radiusT * 0.9, 14, 110);
    if (act === 'out') radiusT = clamp(radiusT * 1.1, 14, 110);
    if (act === 'reset') {
      fly = null;
      yawT = 0.2;
      pitchT = 1.15;
      radiusT = 48;
      if (world && world.focusedSystem) {
        world.clearSystem();
        controls.querySelector('[data-act="back"]').hidden = true;
      }
    }
    if (act === 'full') {
      const root = canvas.parentElement || document.documentElement;
      if (!document.fullscreenElement) root.requestFullscreen?.();
      else document.exitFullscreen?.();
    }
    if (act === 'explore') setExplore(!explore);
    if (act === 'back' && world) {
      world.clearSystem();
      fly = null;
      button.hidden = true;
      poke();
    }
    if (!explore && (act === 'in' || act === 'out' || act === 'reset')) setExplore(true);
  });
  on(window, 'cm:settings', (event) => {
    const detail = event.detail || {};
    if (detail.theme) setTheme(detail.theme);
    if (detail.quality) setQuality(detail.quality);
    if (detail.motion) {
      reduce = resolveMotion(detail.motion);
      if (reduce) stopLoop();
      else startLoop();
      poke();
    }
    if (typeof detail.shortcuts === 'boolean') shortcuts = detail.shortcuts;
  });
  on(window, 'pageshow', (event) => {
    if (event.persisted) worm = null;
  });

  function setExplore(next) {
    explore = next;
    canvas.classList.toggle('is-explore', explore);
    const button = controls.querySelector('[data-act="explore"]');
    if (button) button.setAttribute('aria-pressed', explore ? 'true' : 'false');
    if (explore) {
      yawT = yaw;
      pitchT = clamp(pitch, 55 * Math.PI / 180, 85 * Math.PI / 180);
      radiusT = clamp(camera ? camera.position.length() : 48, 14, 110);
    }
    poke();
  }

  const api = {
    setQuality,
    setTheme,
    focusLab,
    destroy,
    stats() {
      const sorted = frameSamples.slice().sort((a, b) => a - b);
      const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0;
      const info = (composer && composer.sceneInfo) || (renderer ? renderer.info.render : { calls: 0, triangles: 0 });
      return {
        ready,
        tier: tierName,
        fps,
        p95,
        samples: frameSamples.slice(),
        draws: info.calls,
        triangles: info.triangles,
        mode: layout.mode,
        labs: labs.length,
        reduce,
        theme: themeName,
      };
    },
  };
  canvas.__universe = api;

  if (window.matchMedia('(forced-colors: active)').matches) {
    applyStatic('forced');
  } else if (!staticMode) {
    const bootWhenIdle = () => {
      const run = () => {
        yieldThread().then(boot);
      };
      if (document.readyState === 'complete') {
        const ric = window.requestIdleCallback;
        if (ric) ric(run, { timeout: 2500 });
        else run();
      } else {
        window.addEventListener('load', () => {
          const ric = window.requestIdleCallback;
          if (ric) ric(run, { timeout: 2500 });
          else setTimeout(run, 0);
        }, { once: true });
      }
    };
    bootWhenIdle();
  } else {
    paintRadial(labItems());
  }
  syncHeroChrome();

  return api;
}
