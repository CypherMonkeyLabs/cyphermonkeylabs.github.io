/** Scene palette from Pack 1 §1.3, plus a high-contrast theme for settings. */

export const ACCENTS = {
  peach: '#FFB4A2',
  sky: '#A7D8FF',
  mint: '#9EE6CF',
  lavender: '#C9B8FF',
  butter: '#FFE8A3',
  pink: '#FFC6E0',
};

export const CATEGORIES = [
  { id: 'contact-center', label: 'Contact Center Planets', accent: 'peach', order: 1 },
  { id: 'unified-comms', label: 'Voice & Collaboration', accent: 'sky', order: 2 },
  { id: 'protocols', label: 'Protocols & Networks', accent: 'mint', order: 3 },
  { id: 'ai', label: 'AI Frontier', accent: 'lavender', order: 4 },
  { id: 'tools', label: 'Tools & Gadgets', accent: 'butter', order: 5 },
];

const CONTRAST_ACCENTS = {
  peach: '#9A3412',
  sky: '#075985',
  mint: '#065F46',
  lavender: '#5B21B6',
  butter: '#92400E',
  pink: '#9D174D',
};

export const THEMES = {
  dawn: {
    id: 'dawn',
    sky: ['#EDE7FF', '#FFE9F0', '#E6F6FF'],
    nebula: ['#C9B8FF', '#FFC6E0', '#A7D8FF'],
    stars: ['#8B7CF6', '#FF9F8A', '#7CC4F0'],
    starEmissive: '#FFC46B',
    starGain: 1.6,
    ambient: '#B8B0FF',
    ambientIntensity: 0.35,
    exposure: 1,
    // Threshold is linear HDR. The spec's 0.88 would bloom the whole pastel sky.
    bloom: { intensity: 0.7, luminanceThreshold: 1.15, luminanceSmoothing: 0.18, radius: 0.55 },
    shooter: '#8B7CF6',
    ring: '#6E62C4',
    ink: '#1E1B3A',
    rimMode: 'lighten',
    nebulaMix: 0.22,
  },
  starlight: {
    id: 'starlight',
    sky: ['#0F1030', '#1B1450', '#12234A'],
    nebula: ['#6E5BD8', '#C85A9E', '#3C7BD0'],
    stars: ['#FFFFFF', '#FFE8A3', '#CFE6FF'],
    starEmissive: '#FFD38A',
    starGain: 2.4,
    ambient: '#B8B0FF',
    ambientIntensity: 0.18,
    exposure: 1.05,
    bloom: { intensity: 1.15, luminanceThreshold: 0.55, luminanceSmoothing: 0.2, radius: 0.72 },
    shooter: '#FFFFFF',
    ring: '#CFE6FF',
    ink: '#F4F1FF',
    rimMode: 'boost',
    nebulaMix: 0.3,
  },
  contrast: {
    id: 'contrast',
    sky: ['#FFFFFF', '#F4F4F4', '#FFFFFF'],
    nebula: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
    stars: ['#1A1A1A', '#1A1A1A', '#333333'],
    starEmissive: '#111111',
    starGain: 1.2,
    ambient: '#FFFFFF',
    ambientIntensity: 0.55,
    exposure: 1,
    bloom: { intensity: 0.15, luminanceThreshold: 0.95, luminanceSmoothing: 0.05, radius: 0.3 },
    shooter: '#000000',
    ring: '#000000',
    ink: '#000000',
    rimMode: 'boost',
    nebulaMix: 0,
    accents: CONTRAST_ACCENTS,
  },
};

export function hexToRgb(hex) {
  const h = String(hex).replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

export function lighten(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const channel = (c) => Math.round(clamp01(c + (1 - c) * amount) * 255);
  return `#${[channel(r), channel(g), channel(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export function themeByName(name) {
  if (name === 'starlight' || name === 'contrast' || name === 'dawn') return THEMES[name];
  return THEMES.dawn;
}

export function accentHex(theme, accent) {
  const table = theme.accents || ACCENTS;
  return table[accent] || table.lavender || ACCENTS.lavender;
}

export function categoryById(id) {
  return CATEGORIES.find((cat) => cat.id === id) || null;
}
