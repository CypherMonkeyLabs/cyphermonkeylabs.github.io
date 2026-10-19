/** Fading cursor trail. Skipped for reduced motion and touch-only screens. */

import { isPhone, pixelRatio, prefersReducedMotion } from './motion.js';

let active = null;

export function mountTrail() {
  active?.destroy();
  if (prefersReducedMotion() || isPhone()) {
    const handle = {
      ready: Promise.resolve(false),
      destroy() {},
      pause() {},
      resume() {},
      set() {},
    };
    active = handle;
    return handle;
  }
  const canvas = document.createElement('canvas');
  canvas.className = 'cmfx-trail';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.cmfx = 'trail';
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const points = [];
  let running = true;
  let raf = 0;

  function resize() {
    const dpr = pixelRatio();
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.max(2, Math.floor(w * dpr));
    canvas.height = Math.max(2, Math.floor(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame() {
    raf = 0;
    if (!running) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = points.length - 1; i >= 0; i -= 1) {
      const p = points[i];
      p.life -= 0.02;
      if (p.life <= 0) {
        points.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (points.length) raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (!raf && running && !document.hidden) raf = requestAnimationFrame(frame);
  }

  const onMove = (event) => {
    if (!running || document.hidden) return;
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    points.push({
      x: event.clientX,
      y: event.clientY,
      life: 1,
      r: 7,
      color: points.length % 2 ? '#7ef0dc' : '#c4b5ff',
    });
    if (points.length > 48) points.shift();
    kick();
  };
  const onVis = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      points.length = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('visibilitychange', onVis);

  const handle = {
    ready: Promise.resolve(true),
    pause() { running = false; cancelAnimationFrame(raf); raf = 0; },
    resume() { running = true; },
    set() {},
    destroy() {
      if (active === handle) active = null;
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      canvas.remove();
    },
  };
  active = handle;
  return handle;
}
