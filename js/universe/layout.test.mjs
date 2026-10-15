import assert from 'node:assert/strict';
import { chooseMode, layoutLabs, separationReport } from './layout.js';
import { normalizeLabs, isNewLab } from './normalize.js';

function fixture(count) {
  const cats = ['contact-center', 'unified-comms', 'protocols', 'ai', 'tools'];
  return Array.from({ length: count }, (_, index) => ({
    id: `lab-${index + 1}`,
    title: `Lab ${index + 1}`,
    category: cats[index % cats.length],
    tags: [`group-${index % 4}`, cats[index % cats.length]],
    order: index,
    scene: { size: 0.8 + (index % 5) * 0.15, moons: index % 4 },
  }));
}

function check(count, opts, expected) {
  const labs = normalizeLabs(fixture(count));
  const mode = chooseMode(labs.length, opts);
  assert.equal(mode, expected, `mode for ${count}`);
  const layout = layoutLabs(labs, opts);
  assert.equal(layout.mode, expected);
  assert.equal(layout.planets.length, count);
  const report = separationReport(layout, count > 40 ? 12 : 24);
  assert.equal(report.ok, true, `separation ${count} ${report.pair && JSON.stringify(report.pair)}`);
}

check(10, { width: 1440, coarse: false }, 'solar');
check(20, { width: 1440, coarse: false }, 'multi');
check(36, { width: 1440, coarse: false }, 'multi');
check(13, { width: 390, coarse: true }, 'galaxy');
check(40, { width: 1440, coarse: false }, 'galaxy');
check(100, { width: 1440, coarse: false }, 'galaxy');

const now = Date.parse('2026-10-15T19:00:00Z');
assert.equal(isNewLab('2026-10-14', now), true);
assert.equal(isNewLab('2026-07-31', now), false);
const normalized = normalizeLabs({
  labs: [{ id: 'Amazon Connect', name: 'Amazon Connect Lab', category: 'contact-center', orbit: { size: 4 }, status: 'coming' }],
});
assert.equal(normalized[0].id, 'amazon-connect');
assert.equal(normalized[0].scene.size, 1.6);
assert.equal(normalized[0].status, 'coming-soon');

console.log('layout tests passed');
