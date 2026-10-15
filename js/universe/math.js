/** Small numeric helpers shared by layout and the scene. */

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/** Frame-rate independent damping. lambda is the approach rate (1/s). */
export function damp(current, target, lambda, dt) {
  const k = 1 - Math.exp(-lambda * Math.max(0, dt));
  return current + (target - current) * k;
}

export function hashString(text) {
  let h = 2166136261;
  const s = String(text);
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bezierComponent(t, p1, p2) {
  const c = 3 * p1;
  const b = 3 * (p2 - p1) - c;
  const a = 1 - c - b;
  return ((a * t + b) * t + c) * t;
}

function bezierDerivative(t, p1, p2) {
  const c = 3 * p1;
  const b = 3 * (p2 - p1) - c;
  const a = 1 - c - b;
  return (3 * a * t + 2 * b) * t + c;
}

/** Cubic-bezier easing, matching the CSS motion tokens. */
export function cubicBezier(x1, y1, x2, y2) {
  return function ease(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let u = t;
    for (let i = 0; i < 6; i += 1) {
      const x = bezierComponent(u, x1, x2) - t;
      const dx = bezierDerivative(u, x1, x2);
      if (Math.abs(dx) < 1e-5) break;
      u = clamp(u - x / dx, 0, 1);
    }
    return bezierComponent(u, y1, y2);
  };
}

export const easeDecel = cubicBezier(0.05, 0.7, 0.1, 1);
export const easeAccel = cubicBezier(0.3, 0, 0.8, 0.15);
export const easeStandard = cubicBezier(0.2, 0, 0, 1);
