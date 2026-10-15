/**
 * Orbit layout that scales from a handful of labs to 100.
 * Solar (1–12), multi-ring (13–36), galaxy (37+, or mobile when N > 12).
 * Planet centers stay at least 2.5× the larger radius apart.
 */

import { CATEGORIES } from './palette.js';

export const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const TILT = 4 * Math.PI / 180;
const MIN_SEP_FACTOR = 2.5;

export function chooseMode(count, opts = {}) {
  const coarse = Boolean(opts.coarse);
  const width = opts.width ?? 1280;
  if (coarse && width < 768 && count > 12) return 'galaxy';
  if (count <= 12) return 'solar';
  if (count <= 36) return 'multi';
  return 'galaxy';
}

function omegaFor(radius) {
  return 0.08 / Math.sqrt(Math.max(radius, 1) / 10);
}

function categoryOrder(id, extras) {
  const known = CATEGORIES.find((cat) => cat.id === id);
  if (known) return known.order;
  if (!extras.has(id)) extras.set(id, 50 + extras.size);
  return extras.get(id);
}

function groupLabs(labs) {
  const extras = new Map();
  const buckets = new Map();
  labs.forEach((lab) => {
    const id = lab.category || 'tools';
    if (!buckets.has(id)) buckets.set(id, []);
    buckets.get(id).push(lab);
  });
  return [...buckets.entries()]
    .map(([id, group]) => ({
      id,
      order: categoryOrder(id, extras),
      labs: group.slice().sort((a, b) => (a.order - b.order) || a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.order - b.order);
}

function pushPlanet(out, lab, ring, radius, angle, tilt, origin, systemId) {
  const size = lab.scene?.size ?? 1;
  out.push({
    id: lab.id,
    ring,
    r: radius,
    a0: angle,
    tilt,
    omega: omegaFor(radius),
    ox: origin?.x || 0,
    oy: origin?.y || 0,
    oz: origin?.z || 0,
    size,
    moons: lab.scene?.moons ?? 0,
    category: lab.category,
    systemId: systemId || null,
    lab,
  });
}

function safeRadius(count, size, preferred) {
  if (count <= 1) return preferred;
  const need = MIN_SEP_FACTOR * size + 0.45;
  const minR = need / (2 * Math.sin(Math.PI / count));
  return Math.max(preferred, minR);
}

function solarPlanets(labs, origin = null, systemId = null, radiusScale = 1) {
  const groups = groupLabs(labs);
  const planets = [];
  const rings = [];
  let ring = 0;
  groups.forEach((group) => {
    for (let i = 0; i < group.labs.length; i += 4, ring += 1) {
      const slice = group.labs.slice(i, i + 4);
      const maxSize = Math.max(...slice.map((lab) => lab.scene?.size ?? 1));
      const preferred = (10 + ring * 5.5) * radiusScale;
      const radius = safeRadius(slice.length, maxSize, preferred);
      const tilt = (ring % 2 ? 1 : -1) * TILT;
      slice.forEach((lab, k) => {
        const angle = (2 * Math.PI * k) / slice.length + ring * GOLDEN;
        pushPlanet(planets, lab, ring, radius, angle, tilt, origin, systemId);
      });
      rings.push({
        ring,
        r: radius,
        tilt,
        ox: origin?.x || 0,
        oy: origin?.y || 0,
        oz: origin?.z || 0,
        systemId: systemId || null,
        category: group.id,
      });
    }
  });
  return { planets, rings };
}

function multiPlanets(labs) {
  const groups = groupLabs(labs);
  const planets = [];
  const rings = [];
  let ring = 0;
  let cursor = 10;
  groups.forEach((group) => {
    const maxSize = Math.max(1, ...group.labs.map((lab) => lab.scene?.size ?? 1));
    const gap = Math.max(2.4, MIN_SEP_FACTOR * maxSize + 0.55);
    const mid = Math.ceil(group.labs.length / 2);
    const slices = [group.labs.slice(0, mid), group.labs.slice(mid)].filter((slice) => slice.length);
    slices.forEach((slice, index) => {
      const preferred = cursor + index * gap;
      const radius = safeRadius(slice.length, maxSize, preferred);
      const tilt = (ring % 2 ? 1 : -1) * TILT;
      slice.forEach((lab, k) => {
        const angle = (2 * Math.PI * k) / slice.length + ring * GOLDEN + index * 0.45;
        pushPlanet(planets, lab, ring, radius, angle, tilt, null, null);
      });
      rings.push({ ring, r: radius, tilt, ox: 0, oy: 0, oz: 0, systemId: null, category: group.id });
      ring += 1;
    });
    const used = slices.length ? Math.max(...slices.map((slice, index) => safeRadius(slice.length, maxSize, cursor + index * gap))) : cursor;
    cursor = used + gap + 3.2;
  });
  return { planets, rings };
}

function chunkCategory(group) {
  if (group.labs.length <= 15) return [group.labs];
  const buckets = new Map();
  group.labs.forEach((lab) => {
    const key = (lab.tags && lab.tags[0]) || 'general';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(lab);
  });
  return [...buckets.values()];
}

function galaxyLayout(labs) {
  const groups = groupLabs(labs);
  const systems = [];
  groups.forEach((group) => {
    const chunks = chunkCategory(group);
    chunks.forEach((chunk, index) => {
      const tag = index === 0 ? '' : (chunk[0].tags?.[0] ? ` · ${chunk[0].tags[0]}` : ` · ${index + 1}`);
      systems.push({
        id: index === 0 ? group.id : `${group.id}-${index + 1}`,
        category: group.id,
        label: `${labelFor(group.id)} · ${chunk.length} labs${tag}`,
        labs: chunk,
      });
    });
  });

  systems.forEach((system, index) => {
    const theta = index * 1.2;
    const radius = 18 * Math.exp(0.22 * theta);
    system.theta = theta;
    system.arm = radius;
    system.x = Math.cos(theta) * radius;
    system.z = Math.sin(theta) * radius;
    system.y = Math.sin(index * 1.7) * 1.6;
  });

  const drafts = systems.map((system) => {
    const built = solarPlanets(system.labs, { x: 0, y: 0, z: 0 }, system.id, 1);
    const localRadius = Math.max(8, ...built.planets.map((planet) => planet.r + planet.size));
    return { built, localRadius };
  });
  let posScale = 1;
  for (let i = 0; i < systems.length; i += 1) {
    for (let j = i + 1; j < systems.length; j += 1) {
      const dx = systems[i].x - systems[j].x;
      const dy = systems[i].y - systems[j].y;
      const dz = systems[i].z - systems[j].z;
      const dist = Math.hypot(dx, dy, dz) || 0.001;
      const need = drafts[i].localRadius + drafts[j].localRadius + 1.5;
      posScale = Math.max(posScale, need / dist);
    }
  }
  systems.forEach((system, index) => {
    system.x *= posScale;
    system.y *= posScale;
    system.z *= posScale;
    system.arm *= posScale;
    system.posScale = posScale;
    const built = solarPlanets(
      system.labs,
      { x: system.x, y: system.y, z: system.z },
      system.id,
      1,
    );
    system.planets = built.planets;
    system.rings = built.rings;
    system.localRadius = drafts[index].localRadius;
  });

  return {
    mode: 'galaxy',
    planets: systems.flatMap((system) => system.planets),
    rings: systems.flatMap((system) => system.rings),
    systems,
  };
}

function labelFor(id) {
  return CATEGORIES.find((cat) => cat.id === id)?.label || id;
}

export function layoutLabs(labs, opts = {}) {
  const mode = chooseMode(labs.length, opts);
  if (mode === 'solar') {
    const built = solarPlanets(labs);
    return { mode, planets: built.planets, rings: built.rings, systems: null };
  }
  if (mode === 'multi') {
    const built = multiPlanets(labs);
    return { mode, planets: built.planets, rings: built.rings, systems: null };
  }
  return galaxyLayout(labs);
}

export function placePosition(place, time, out = [0, 0, 0]) {
  const angle = place.a0 + place.omega * time;
  const x = Math.cos(angle) * place.r;
  const z0 = Math.sin(angle) * place.r;
  out[0] = x + place.ox;
  out[1] = Math.sin(place.tilt) * z0 + place.oy;
  out[2] = Math.cos(place.tilt) * z0 + place.oz;
  return out;
}

export function separationReport(layout, samples = 36) {
  const planets = layout.planets;
  let min = Infinity;
  let pair = null;
  const span = 80;
  const tmpA = [0, 0, 0];
  const tmpB = [0, 0, 0];
  for (let s = 0; s < samples; s += 1) {
    const time = (span * s) / samples;
    for (let i = 0; i < planets.length; i += 1) {
      placePosition(planets[i], time, tmpA);
      for (let j = i + 1; j < planets.length; j += 1) {
        placePosition(planets[j], time, tmpB);
        const dist = Math.hypot(tmpA[0] - tmpB[0], tmpA[1] - tmpB[1], tmpA[2] - tmpB[2]);
        const need = MIN_SEP_FACTOR * Math.max(planets[i].size, planets[j].size);
        if (dist < min) {
          min = dist;
          pair = { a: planets[i].id, b: planets[j].id, dist, need, time };
        }
      }
    }
  }
  return {
    min,
    pair,
    ok: !pair || pair.dist + 1e-6 >= pair.need,
  };
}
