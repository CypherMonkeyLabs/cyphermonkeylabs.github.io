const THEMES = ['dawn', 'starlight', 'contrast', 'system'];
const MOTIONS = ['system', 'reduce', 'full'];

export function readSettings() {
  try {
    const raw = localStorage.getItem('cm.settings');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function prefersReduced() {
  const motion = document.documentElement.dataset.motion;
  if (motion === 'reduce') return true;
  if (motion === 'full') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function resolveTheme(theme) {
  const value = THEMES.includes(theme) ? theme : 'dawn';
  switch (value) {
    case 'dawn':
    case 'starlight':
    case 'contrast':
      return value;
    case 'system':
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'starlight' : 'dawn';
    default: {
      const neverTheme = value;
      return neverTheme;
    }
  }
}

export function resolveMotion(motion) {
  const value = MOTIONS.includes(motion) ? motion : 'system';
  switch (value) {
    case 'reduce':
    case 'full':
      return value;
    case 'system':
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'full';
    default: {
      const neverMotion = value;
      return neverMotion;
    }
  }
}

export function applySettingsDetail(detail) {
  if (!detail || typeof detail !== 'object') return;
  if (detail.theme) document.documentElement.dataset.theme = resolveTheme(detail.theme);
  if (detail.motion) document.documentElement.dataset.motion = resolveMotion(detail.motion);
  if (detail.lang) document.documentElement.lang = String(detail.lang).toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
  const main = document.getElementById('main');
  if (!main) return;
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  main.focus();
}

const mounts = new WeakMap();

export function replaceMount(rootEl, api) {
  const previous = mounts.get(rootEl);
  if (previous) previous.destroy();
  mounts.set(rootEl, api);
  return api;
}
