/**
 * CMFX runtime. three.js loads only when globe3d() runs.
 * That import stays inside the function on purpose: the module is about 590KB
 * and the hub should be able to paint before asking for the globe.
 */
import { mountAurora } from './aurora.js';
import { mountParticles } from './particles.js';
import { installSound, init, isOn, ping, toggle } from './sound.js';
import { mountTilt } from './tilt.js';
import { mountTrail } from './trail.js';
import { prefersReducedMotion } from './motion.js';

function loadGlobe() {
  return import('./globe.js');
}

export function createApi() {
  installSound();
  const api = {
    get reducedMotion() {
      return prefersReducedMotion();
    },
    aurora(canvas, options) {
      return mountAurora(canvas, options);
    },
    particles(canvas, options) {
      return mountParticles(canvas, options);
    },
    globe3d(container, options) {
      let inner = null;
      let dead = false;
      const ready = loadGlobe().then((mod) => {
        if (dead) return null;
        inner = mod.mount(container, options);
        return inner;
      }).catch(() => {
        if (!container) return null;
        container.dataset.cmfx = 'error';
        const note = document.createElement('p');
        note.className = 'cmfx-note cmfx-note-inline';
        note.textContent = 'The 3D globe could not load. The lab links are in the page text.';
        container.append(note);
        return null;
      });
      return {
        ready,
        destroy() {
          dead = true;
          ready.then((handle) => handle?.destroy());
        },
        pause() { ready.then((handle) => handle?.pause()); },
        resume() { ready.then((handle) => handle?.resume()); },
        set(next) { ready.then((handle) => handle?.set(next)); },
      };
    },
    tiltCards(selector) {
      return mountTilt(selector);
    },
    cursorTrail() {
      return mountTrail();
    },
    sound: { init, toggle, ping, isOn },
  };
  return api;
}
