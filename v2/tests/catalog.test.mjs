import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { countLabs, deniedLinks, featuredDoors, filterLabs, makeFixtureLabs, mergeTimeline } from '../js/catalog.mjs';
import { doorArticle } from '../js/render.mjs';

const root = join(import.meta.dirname, '..');
const labs = JSON.parse(readFileSync(join(root, 'data/labs.json'), 'utf8')).labs;
const socials = JSON.parse(readFileSync(join(root, 'data/socials.json'), 'utf8'));
const categories = JSON.parse(readFileSync(join(root, 'data/categories.json'), 'utf8')).categories;

test('registry counts real labs and keeps the front door to 12', () => {
  assert.equal(countLabs(labs), 14);
  assert.equal(featuredDoors(labs).length, 12);
  const fixture = makeFixtureLabs(100, labs);
  assert.equal(fixture.length, 100);
  assert.equal(featuredDoors(fixture).length, 12);
  assert.equal(filterLabs(fixture, {}).length, 100);
});

test('search finds SIP Universe and protocols filter keeps it', () => {
  const hits = filterLabs(labs, { q: 'sip' });
  assert.equal(hits[0].id, 'sip-universe');
  const protocols = filterLabs(labs, { cat: 'protocols' });
  assert.ok(protocols.some((lab) => lab.id === 'sip-universe'));
  assert.ok(protocols.some((lab) => lab.id === 'cpaas'));
  assert.equal(filterLabs(labs, { cat: 'agents' }).length, 0);
});

test('building entries come from launch dates and none are undated', () => {
  const entries = mergeTimeline([], labs);
  assert.ok(entries.length >= 5);
  for (const entry of entries) {
    assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(entry.kind, 'building');
    assert.equal(entry.source, 'registry');
  }
  assert.equal(entries[0].date >= entries.at(-1).date, true);
});

test('social links are present and LinkedIn is denied', () => {
  assert.equal(socials.profiles.length, 12);
  const hrefs = socials.profiles.map((profile) => profile.url);
  assert.deepEqual(deniedLinks(hrefs, socials.deny), []);
  assert.equal(hrefs.some((href) => /linkedin/i.test(href)), false);
  assert.equal(hrefs.some((href) => href.includes('x.com/Cypher0x9')), true);
});

test('coming soon doors are not links', () => {
  const soon = makeFixtureLabs(2, labs).find((lab) => lab.status === 'coming-soon');
  const html = doorArticle(soon, categories);
  assert.equal(html.includes('<a '), false);
  assert.match(html, /Not open yet/);
});

test('published v2 copy avoids narrow job labels and personal names', () => {
  const banned = [/uc engineer/i, /contact[- ]center engineer/i, /lakshman/i];
  const files = [];
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name === 'vendor' || name === 'icons' || name === 'tests') continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(html|js|mjs|json|css|md|svg)$/.test(name) && name !== 'LICENSE.md') files.push(path);
    }
  }
  walk(root);
  const offenders = [];
  for (const path of files) {
    const text = readFileSync(path, 'utf8');
    for (const pattern of banned) {
      if (pattern.test(text)) offenders.push(`${path} ${pattern}`);
    }
    if (/href="[^"]*linkedin\.com/i.test(text)) offenders.push(`${path} linkedin href`);
  }
  assert.deepEqual(offenders, []);
});
