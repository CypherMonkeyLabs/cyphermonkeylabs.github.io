/** Palette helpers. Hex in, unit floats out. Invalid input falls back. */

const DEFAULTS = ['#7c5cff', '#3ee0c5', '#24144a'];

export function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function parseColor(input, fallback) {
  if (typeof input !== 'string') return fallback;
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!match) return fallback;
  let hex = match[1];
  if (hex.length === 3) hex = hex.split('').map((ch) => ch + ch).join('');
  const n = Number.parseInt(hex, 16);
  return {
    hex: `#${hex.toLowerCase()}`,
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

function fallbackAt(index) {
  return parseColor(DEFAULTS[index] || DEFAULTS[0], {
    hex: '#7c5cff',
    r: 124 / 255,
    g: 92 / 255,
    b: 255 / 255,
  });
}

/** Always returns three colors. */
export function palette(input) {
  const src = Array.isArray(input) && input.length ? input : DEFAULTS;
  const colors = [];
  for (let i = 0; i < 3; i += 1) {
    const raw = src[Math.min(i, src.length - 1)];
    colors.push(parseColor(raw, fallbackAt(i)));
  }
  return colors;
}
