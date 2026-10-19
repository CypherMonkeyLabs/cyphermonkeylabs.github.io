/** Device budget, reduced motion, and a visibility-aware frame loop. */

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set();

function emitMotion() {
  listeners.forEach((fn) => {
    fn(motionQuery.matches);
  });
}

motionQuery.addEventListener?.('change', emitMotion);

export function prefersReducedMotion() {
  return motionQuery.matches;
}

export function onMotionChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isPhone() {
  const coarse = window.matchMedia('(pointer: coarse)').matches
    && !window.matchMedia('(pointer: fine)').matches;
  const narrow = Math.min(window.innerWidth, window.innerHeight) < 760;
  return coarse || narrow;
}

/** DPR cap is 2 on desktop and 1.5 on phones. The brief's hard cap is 2. */
export function pixelRatio() {
  const cap = isPhone() ? 1.5 : 2;
  return Math.min(window.devicePixelRatio || 1, cap);
}

export function saveDataOn() {
  return Boolean(navigator.connection && navigator.connection.saveData);
}

let webglKnown = null;

export function hasWebGL() {
  if (webglKnown !== null) return webglKnown;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false })
      || canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false });
    webglKnown = Boolean(gl);
    gl?.getExtension?.('WEBGL_lose_context')?.loseContext();
  } catch (err) {
    webglKnown = false;
  }
  return webglKnown;
}

export function bufferSize(canvas, scale = 1) {
  const rect = canvas.getBoundingClientRect();
  const dpr = pixelRatio() * scale;
  const cssWidth = Math.max(0, rect.width);
  const cssHeight = Math.max(0, rect.height);
  const width = Math.max(2, Math.floor(cssWidth * dpr) || 2);
  const height = Math.max(2, Math.floor(cssHeight * dpr) || 2);
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  return { cssWidth, cssHeight, width, height, dpr };
}

/**
 * Runs onFrame(dt) while the host is on screen and the tab is visible.
 * fps is a ceiling. 60 is the target.
 */
export function startLoop({ host, fps = 60, onFrame }) {
  let raf = 0;
  let running = true;
  let visible = true;
  let last = 0;
  const minGap = 1000 / fps - 1.5;
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    kick();
  }, { threshold: 0.01 });
  if (host) io.observe(host);
  const onVis = () => {
    if (!document.hidden) kick();
  };
  document.addEventListener('visibilitychange', onVis);
  const loop = (now) => {
    raf = 0;
    if (!running || !visible || document.hidden) return;
    raf = requestAnimationFrame(loop);
    if (now - last < minGap) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    onFrame(dt, now);
  };
  function kick() {
    if (!raf && running && visible && !document.hidden) {
      last = 0;
      raf = requestAnimationFrame(loop);
    }
  }
  kick();
  return {
    pause() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    },
    resume() {
      running = true;
      kick();
    },
    stop() {
      this.pause();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    },
  };
}

export function markHost(el) {
  if (el) el.classList.add('cmfx-host');
}

export function fieldNote(parent, text) {
  if (!parent) return null;
  let el = parent.querySelector(':scope > .cmfx-note');
  if (!text) {
    el?.remove();
    return null;
  }
  if (!el) {
    el = document.createElement('p');
    el.className = 'cmfx-note';
    parent.append(el);
  }
  el.textContent = text;
  return el;
}
