/**
 * Canvas particle field.
 * Drift, count tiers, and the rising motion are adapted from Python Lab js/fx.js
 * (MIT, Copyright (c) 2026 CYPHER0X9). The snapshot is vendor/python-lab/fx.js.
 * Mouse attraction is added here.
 */
import { palette } from './color.js';
import {
  bufferSize,
  fieldNote,
  isPhone,
  markHost,
  onMotionChange,
  pixelRatio,
  prefersReducedMotion,
  saveDataOn,
  startLoop,
} from './motion.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function resolveCount(requested, width, height) {
  const phone = isPhone();
  const base = phone ? 48 : 140;
  const asked = Number.isFinite(requested) ? requested : base;
  const cap = phone ? 180 : 420;
  let n = Math.round(Math.min(cap, Math.max(12, asked)));
  const area = Math.min(1, (width * height) / (900 * 420));
  n = Math.max(12, Math.round(n * Math.max(0.4, area || 0.4)));
  if (saveDataOn()) n = Math.min(n, phone ? 28 : 64);
  if (prefersReducedMotion()) n = Math.min(n, 32);
  return n;
}

function makeSprite(color) {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d');
  const rad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  rad.addColorStop(0, color);
  rad.addColorStop(0.45, color);
  rad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

function seedField(count, width, height, colors, rng) {
  const sprites = colors.map((color) => makeSprite(color.hex));
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    parts.push({
      x: rng() * width,
      y: rng() * height,
      r: 1.2 + rng() * 3.2,
      vx: (rng() - 0.5) * 18,
      vy: -8 - rng() * 22,
      sprite: sprites[i % sprites.length],
      phase: rng() * Math.PI * 2,
    });
  }
  return parts;
}

export function mountParticles(canvas, options = {}) {
  if (!canvas || canvas.tagName !== 'CANVAS') {
    return { destroy() {}, pause() {}, resume() {}, set() {}, ready: Promise.resolve(false) };
  }
  const parent = canvas.parentElement;
  markHost(parent);
  canvas.classList.add('cmfx-canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    fieldNote(parent, 'This browser cannot paint the particle field.');
    return { destroy() {}, pause() {}, resume() {}, set() {}, ready: Promise.resolve(false) };
  }
  canvas.dataset.cmfx = '2d';
  fieldNote(parent, prefersReducedMotion() ? 'Reduced motion is on, so the field is still.' : '');

  let mouseOn = options.mouse !== false;
  let requested = Number(options.count);
  let colors = palette(options.palette || ['#c4b5ff', '#7ef0dc', '#ffd166']);
  let parts = [];
  let width = 1;
  let height = 1;
  const pointer = { x: 0, y: 0, inside: false };
  const rng = mulberry32(0xc0ffee);

  function resize() {
    const size = bufferSize(canvas, 1);
    width = Math.max(2, size.cssWidth);
    height = Math.max(2, size.cssHeight);
    const dpr = pixelRatio();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = seedField(resolveCount(requested, width, height), width, height, colors, rng);
  }

  function step(dt) {
    const reduced = prefersReducedMotion();
    for (const p of parts) {
      if (!reduced) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.phase += dt;
        if (mouseOn && pointer.inside) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const d2 = dx * dx + dy * dy;
          const radius = 150;
          if (d2 < radius * radius && d2 > 4) {
            const d = Math.sqrt(d2);
            const pull = (1 - d / radius) * 70;
            p.vx += (dx / d) * pull * dt;
            p.vy += (dy / d) * pull * dt;
          }
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        if (Math.abs(p.vx) < 4) p.vx += (rng() - 0.5) * 8 * dt;
        if (p.vy > -6) p.vy -= 10 * dt;
      }
      if (p.y < -12) {
        p.y = height + 8;
        p.x = rng() * width;
      }
      if (p.x < -12) p.x = width + 8;
      else if (p.x > width + 12) p.x = -8;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (mouseOn && pointer.inside && !prefersReducedMotion()) {
      ctx.lineWidth = 1;
      let links = 0;
      for (const p of parts) {
        if (links > 16) break;
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        if (dx * dx + dy * dy < 130 * 130) {
          ctx.strokeStyle = 'rgba(196, 181, 255, 0.35)';
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          links += 1;
        }
      }
    }
    for (const p of parts) {
      const alpha = prefersReducedMotion() ? 0.8 : 0.45 + 0.4 * Math.sin(p.phase);
      ctx.globalAlpha = alpha;
      const size = p.r * 6;
      ctx.drawImage(p.sprite, p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }

  resize();
  step(0);
  draw();

  const loop = prefersReducedMotion()
    ? { pause() {}, resume() {}, stop() {} }
    : startLoop({
      host: parent || canvas,
      fps: isPhone() ? 30 : 60,
      onFrame: (dt) => {
        step(dt);
        draw();
      },
    });

  const unsub = onMotionChange((reduced) => {
    fieldNote(parent, reduced ? 'Reduced motion is on, so the field is still.' : '');
    if (reduced) {
      loop.pause();
      draw();
    } else {
      loop.resume();
    }
  });

  const ro = new ResizeObserver(() => {
    resize();
    draw();
  });
  ro.observe(parent || canvas);

  const onMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.inside = true;
    if (prefersReducedMotion()) {
      draw();
    }
  };
  const onLeave = () => {
    pointer.inside = false;
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  return {
    ready: Promise.resolve(true),
    pause() { loop.pause(); },
    resume() { if (!prefersReducedMotion()) loop.resume(); },
    set(next = {}) {
      if (next.count !== undefined) requested = Number(next.count);
      if (next.mouse !== undefined) mouseOn = Boolean(next.mouse);
      if (next.palette) colors = palette(next.palette);
      resize();
      draw();
    },
    destroy() {
      unsub();
      ro.disconnect();
      loop.stop();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    },
  };
}
