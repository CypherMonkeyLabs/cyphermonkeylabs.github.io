/** SVG orbit illustration for static, no-WebGL, and context-loss fallbacks. */

import { accentHex } from './palette.js';
import { placePosition } from './layout.js';

function el(name, attrs, parent) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (parent) parent.appendChild(node);
  return node;
}

export function mountFallback(container, labs, layout, theme) {
  container.replaceChildren();
  container.classList.add('cml-universe-fallback');
  applyFallbackTheme(container, theme);

  const svg = el('svg', {
    viewBox: '0 0 1200 800',
    role: 'img',
    'aria-label': 'Orbits of the CypherMonkey labs',
  }, container);
  const defs = el('defs', {}, svg);
  const grad = el('radialGradient', { id: 'cml-star', cx: '50%', cy: '50%', r: '50%' }, defs);
  el('stop', { offset: '0%', 'stop-color': theme.starEmissive }, grad);
  el('stop', { offset: '70%', 'stop-color': theme.starEmissive, 'stop-opacity': '0.35' }, grad);
  el('stop', { offset: '100%', 'stop-color': theme.starEmissive, 'stop-opacity': '0' }, grad);

  const showPlanets = layout.mode !== 'galaxy';
  const rings = showPlanets ? layout.rings : [];
  rings.forEach((ring, index) => {
    const rx = 18 + ring.r * 9;
    const ry = rx * 0.42;
    const orbit = el('ellipse', {
      class: 'cml-orbit',
      cx: '600',
      cy: '430',
      rx: String(rx),
      ry: String(ry),
      fill: 'none',
      stroke: theme.ring,
      'stroke-width': '1.5',
      'stroke-dasharray': '7 6',
      opacity: '0.55',
    }, svg);
    orbit.style.animationDuration = `${60 + index * 30}s`;
  });

  const starfield = el('g', { class: 'cml-starfield', opacity: '0.9' }, svg);
  let seed = 17;
  for (let i = 0; i < 96; i += 1) {
    seed = (seed * 16807) % 2147483647;
    const x = seed % 1200;
    seed = (seed * 16807) % 2147483647;
    const y = seed % 800;
    seed = (seed * 16807) % 2147483647;
    const radius = ((seed % 3) * 0.45 + 0.55).toFixed(2);
    el('circle', {
      cx: String(x),
      cy: String(y),
      r: radius,
      fill: theme.stars[i % theme.stars.length],
    }, starfield);
  }

  const belt = el('g', { class: 'cml-gem-belt' }, svg);
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2;
    const x = 600 + Math.cos(angle) * 250;
    const y = 430 + Math.sin(angle) * 92;
    el('polygon', {
      points: `${x.toFixed(1)},${(y - 7).toFixed(1)} ${(x + 5).toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${(y + 7).toFixed(1)} ${(x - 5).toFixed(1)},${y.toFixed(1)}`,
      fill: theme.nebula[i % theme.nebula.length],
      stroke: theme.stars[0],
      'stroke-width': '0.6',
      opacity: '0.95',
    }, belt);
  }

  el('circle', { cx: '600', cy: '430', r: '46', fill: 'url(#cml-star)' }, svg);
  el('circle', { cx: '600', cy: '430', r: '16', fill: theme.starEmissive }, svg);

  if (showPlanets) {
    layout.planets.forEach((place) => addPlanetLink(svg, place, labs, theme));
  } else if (layout.systems) {
    layout.systems.forEach((system, index) => {
      const angle = system.theta || index;
      const x = 600 + Math.cos(angle) * (150 + index * 18);
      const y = 430 + Math.sin(angle) * (70 + index * 8);
      const color = accentHex(theme, categoryAccent(system.category));
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: '18', fill: color, opacity: '0.9' }, svg);
    });
  }

  const list = document.createElement('ul');
  list.className = 'cml-fallback-list';
  labs.forEach((lab) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = lab.url || `#${lab.id}`;
    if (!lab.url) link.removeAttribute('href');
    if (lab.repo) {
      link.href = lab.url || lab.repo;
    }
    if (lab.url) {
      link.href = lab.url;
      link.target = '_blank';
      link.rel = 'noopener';
    } else if (lab.repo) {
      link.href = lab.repo;
      link.target = '_blank';
      link.rel = 'noopener';
    } else {
      link.href = `#${lab.id}`;
    }
    link.dataset.id = lab.id;
    link.textContent = lab.shortTitle || lab.title;
    item.appendChild(link);
    list.appendChild(item);
  });
  container.appendChild(list);
  return container;
}

function categoryAccent(id) {
  if (id === 'contact-center') return 'peach';
  if (id === 'unified-comms') return 'sky';
  if (id === 'protocols') return 'mint';
  if (id === 'ai') return 'lavender';
  if (id === 'tools') return 'butter';
  return 'pink';
}

function addPlanetLink(svg, place, labs, theme) {
  const lab = labs.find((item) => item.id === place.id) || place.lab;
  const pos = placePosition(place, 0);
  const x = 600 + pos[0] * 9;
  const y = 430 + pos[2] * 3.8;
  const color = lab?.color || accentHex(theme, lab?.accent || 'lavender');
  const link = el('a', { href: lab?.url || `#${place.id}` }, svg);
  if (lab?.url) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
  }
  link.setAttribute('data-id', place.id);
  el('title', {}, link).textContent = lab?.title || place.id;
  el('circle', {
    cx: x.toFixed(1),
    cy: y.toFixed(1),
    r: String(14 + (place.size || 1) * 6),
    fill: color,
    stroke: theme.ink,
    'stroke-width': '2',
  }, link);
  const label = el('text', {
    x: x.toFixed(1),
    y: (y + 28).toFixed(1),
    'text-anchor': 'middle',
    fill: theme.ink,
    'font-size': '16',
    'font-family': 'system-ui, sans-serif',
  }, link);
  label.textContent = lab?.shortTitle || place.id;
}

export function applyFallbackTheme(container, theme) {
  container.style.setProperty('--cml-sky-top', theme.sky[0]);
  container.style.setProperty('--cml-sky-mid', theme.sky[1]);
  container.style.setProperty('--cml-sky-bot', theme.sky[2]);
  container.style.setProperty('--cml-ink', theme.ink);
}
