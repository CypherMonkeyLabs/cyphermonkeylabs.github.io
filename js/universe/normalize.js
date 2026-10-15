/**
 * Accepts the Pack 3 lab manifest and the legacy labs.json shape.
 * Comets are labs whose launchedAt falls inside the last 30 days.
 */

import { ACCENTS, CATEGORIES } from './palette.js';
import { clamp } from './math.js';

const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const CATEGORY_ALIAS = {
  'contact-center': 'contact-center',
  contact: 'contact-center',
  'unified-comms': 'unified-comms',
  voice: 'unified-comms',
  protocols: 'protocols',
  sip: 'protocols',
  ai: 'ai',
  tools: 'tools',
  gallery: 'tools',
  languages: 'languages',
  coding: 'coding',
};

const ICON_ALIAS = {
  headset: 'headset',
  handset: 'handset',
  phone: 'handset',
  'cloud-phone': 'cloud-phone',
  cloud: 'cloud-phone',
  waveform: 'waveform',
  wave: 'waveform',
  nodes: 'nodes',
  signal: 'nodes',
  chat: 'chat',
  spark: 'spark',
  gem: 'gem',
  video: 'video',
  rooms: 'video',
  route: 'route',
  orbit: 'route',
  book: 'book',
  shield: 'shield',
  bloom: 'spark',
  glyphs: 'book',
  code: 'nodes',
};

function cleanTag(tag) {
  return String(tag || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32);
}

function categoryOf(raw) {
  const key = String(raw || '').toLowerCase();
  return CATEGORY_ALIAS[key] || key || 'tools';
}

export function isNewLab(launchedAt, now) {
  if (!launchedAt) return false;
  const stamp = Date.parse(launchedAt);
  if (Number.isNaN(stamp)) return false;
  const age = now - stamp;
  return age >= 0 && age <= NEW_WINDOW_MS;
}

export function normalizeLabs(input, opts = {}) {
  const now = opts.now ?? Date.now();
  const source = Array.isArray(input) ? input : (input && Array.isArray(input.labs) ? input.labs : []);
  const seen = new Set();
  return source.map((raw, index) => normalizeOne(raw, index, seen, now)).filter(Boolean);
}

function normalizeOne(raw, index, seen, now) {
  if (!raw || typeof raw !== 'object') return null;
  let id = String(raw.id || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!id) id = `lab-${index + 1}`;
  if (seen.has(id)) id = `${id}-${index + 1}`;
  seen.add(id);

  const category = categoryOf(raw.category);
  const known = CATEGORIES.find((cat) => cat.id === category);
  const accentName = raw.accent && ACCENTS[raw.accent] ? raw.accent : (known ? known.accent : 'pink');
  const size = clamp(Number(raw.scene?.size ?? raw.orbit?.size ?? raw.size ?? 1) || 1, 0.6, 1.6);
  const moons = clamp(Math.round(Number(raw.scene?.moons ?? raw.moons ?? 0) || 0), 0, 3);
  const tags = [...new Set((raw.tags || []).map(cleanTag).filter(Boolean))].slice(0, 8);
  const statusRaw = String(raw.status || 'live');
  const status = statusRaw === 'coming' ? 'coming-soon' : statusRaw;
  const launchedAt = raw.launchedAt || raw.launched || null;

  return {
    id,
    kind: raw.kind === 'gallery' ? 'gallery' : 'lab',
    title: String(raw.title || raw.name || id).slice(0, 80),
    shortTitle: String(raw.shortTitle || raw.short || raw.title || raw.name || id).slice(0, 24),
    tagline: String(raw.tagline || raw.description || '').slice(0, 140),
    category,
    accent: accentName,
    color: typeof raw.color === 'string' ? raw.color : null,
    tags,
    status,
    url: typeof raw.url === 'string' ? raw.url : '',
    repo: typeof raw.repo === 'string' ? raw.repo : (typeof raw.source === 'string' ? raw.source : ''),
    icon: ICON_ALIAS[raw.icon] || 'spark',
    launchedAt,
    isNew: isNewLab(launchedAt, now),
    featured: Boolean(raw.featured),
    order: Number.isFinite(raw.order) ? raw.order : index,
    scene: { size, moons, ringHint: raw.scene?.ringHint ?? null },
  };
}
