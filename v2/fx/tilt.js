/** Pointer tilt for cards. Reduced motion leaves the cards flat. */

import { onMotionChange, prefersReducedMotion } from './motion.js';

function bind(el) {
  el.classList.add('cmfx-tilt');
  const onMove = (event) => {
    if (prefersReducedMotion()) return;
    if (event.pointerType === 'touch') return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--cmfx-rx', `${(-py * 8).toFixed(2)}deg`);
    el.style.setProperty('--cmfx-ry', `${(px * 10).toFixed(2)}deg`);
  };
  const reset = () => {
    el.style.setProperty('--cmfx-rx', '0deg');
    el.style.setProperty('--cmfx-ry', '0deg');
  };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', reset);
  el.addEventListener('blur', reset);
  return () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', reset);
    el.removeEventListener('blur', reset);
    reset();
    el.classList.remove('cmfx-tilt');
  };
}

export function mountTilt(selector) {
  const nodes = typeof selector === 'string' ? [...document.querySelectorAll(selector)] : [];
  const cleanups = nodes.map(bind);
  const unsub = onMotionChange((reduced) => {
    if (reduced) {
      nodes.forEach((el) => {
        el.style.setProperty('--cmfx-rx', '0deg');
        el.style.setProperty('--cmfx-ry', '0deg');
      });
    }
  });
  return {
    ready: Promise.resolve(true),
    pause() {},
    resume() {},
    set() {},
    destroy() {
      unsub();
      cleanups.forEach((fn) => fn());
    },
  };
}
