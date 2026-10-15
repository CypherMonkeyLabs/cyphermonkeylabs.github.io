/** Flat glyphs. Stacked in CSS for a 3D look. currentColor follows the card ink. */

const PATHS = {
  headset:
    '<path d="M16 28a16 16 0 0 1 32 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="10" y="26" width="8" height="14" rx="3" fill="currentColor"/><rect x="46" y="26" width="8" height="14" rx="3" fill="currentColor"/><path d="M50 40c6 6 4 14-2 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="46" cy="58" r="3" fill="currentColor"/>',
  handset:
    '<path d="M18 22c-6 8-4 18 4 24l8-8c2 4 6 8 10 10l8-8c6 8 16 10 24 4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M22 18c8-6 14-4 18 2M42 46c6 4 8 10 2 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  "cloud-phone":
    '<path d="M18 36h28a10 10 0 0 0 2-20 14 14 0 0 0-26-2A8 8 0 0 0 18 36z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M28 40v8M24 52h8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  waveform:
    '<path d="M8 32h6l4-12 6 24 6-18 6 14 4-8h12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  nodes:
    '<circle cx="16" cy="40" r="6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="40" cy="18" r="6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="48" cy="46" r="6" fill="none" stroke="currentColor" stroke-width="3"/><path d="M21 36 35 22M21 42l22 6M44 24l2 16" fill="none" stroke="currentColor" stroke-width="3"/>',
  chat:
    '<path d="M12 16h32a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H28l-10 8v-8h-6a8 8 0 0 1-8-8V24a8 8 0 0 1 8-8z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>',
  spark:
    '<path d="M32 8l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>',
  gem:
    '<path d="M32 8l16 12-16 36L16 20z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M16 20h32M24 20l8 36 8-36" fill="none" stroke="currentColor" stroke-width="3"/>',
  video:
    '<rect x="8" y="18" width="32" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><path d="M40 26l14-6v24l-14-6z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>',
  route:
    '<circle cx="16" cy="48" r="5" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="48" cy="16" r="5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M20 44c12-2 8-20 16-22h8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  book:
    '<path d="M10 16h18a8 8 0 0 1 8 8v28H18a8 8 0 0 0-8 8zM54 16H36a8 8 0 0 0-8 8v28h18a8 8 0 0 1 8 8z" fill="none" stroke="currentColor" stroke-width="3"/>',
  shield:
    '<path d="M32 8l18 6v16c0 14-8 22-18 26C22 52 14 44 14 30V14z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>',
};

export function iconSvg(name) {
  const body = PATHS[name] || PATHS.spark;
  return `<svg class="glyph-svg" viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`;
}

export function iconStack(name) {
  const svg = iconSvg(name);
  return `<span class="glyph">${svg}${svg}${svg}</span>`;
}
