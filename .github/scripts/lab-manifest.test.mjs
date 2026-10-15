import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mergeManifest, parseRepo, defaultScene } from './lab-manifest.mjs';
import { validateManifest } from './validate-labs.mjs';

const doc = () => JSON.parse(readFileSync(new URL('../../data/labs.json', import.meta.url), 'utf8'));
const base = () => ({
  schemaVersion: 1, id: 'demo-lab', kind: 'lab', title: 'Demo Lab', tagline: 'A tiny demo lab for the tests.',
  summary: 'This lab exists only for tests. It is long enough to satisfy the summary rule of eighty characters or more.',
  category: 'tools', status: 'live', url: 'https://cipher0x9.github.io/demo-lab/', icon: 'book',
  launchedAt: '2026-10-01', sources: [{ title: 'Example', url: 'https://example.com/' }],
});

test('current data/labs.json validates', () => {
  assert.equal(validateManifest(doc()).findings.filter((f) => f.level === 'error').length, 0);
});
test('adds a new lab with deterministic site defaults', () => {
  const r = mergeManifest(doc(), base(), 'cipher0x9/demo-lab');
  assert.equal(r.action, 'add'); assert.ok(r.changed);
  const e = r.doc.labs.find((l) => l.id === 'demo-lab');
  assert.equal(e.repo, 'https://github.com/cipher0x9/demo-lab');
  assert.equal(e.featured, false);
  assert.deepEqual(e.scene, defaultScene('demo-lab'));
  assert.equal(e.order % 10, 0);
});
test('update keeps site-owned fields and is idempotent', () => {
  const d = doc(); const first = d.labs[0];
  const m = Object.fromEntries(Object.entries(first).filter(([k]) => !['repo', 'updatedAt', 'lastVerified', 'order', 'featured', 'accent', 'scene', 'i18n'].includes(k)));
  m.tagline = 'See how phones, meetings, and teams meet.';
  const r = mergeManifest(d, m, 'cipher0x9/uc-lab-free-university-mesmerizing');
  assert.equal(r.action, 'update');
  const e = r.doc.labs[0];
  assert.equal(e.order, first.order); assert.deepEqual(e.scene, first.scene); assert.equal(e.accent, first.accent);
  assert.equal(e.tagline, m.tagline);
  const again = mergeManifest(r.doc, m, 'cipher0x9/uc-lab-free-university-mesmerizing');
  assert.equal(again.changed, false);
});
test('rejects site-owned fields, bad owner, duplicate id on another repo', () => {
  assert.equal(mergeManifest(doc(), { ...base(), order: 1 }, 'cipher0x9/demo-lab').action, 'rejected');
  assert.equal(mergeManifest(doc(), base(), 'evil/demo-lab').action, 'rejected');
  assert.equal(mergeManifest(doc(), { ...base(), id: 'uc', url: 'https://cipher0x9.github.io/other/' }, 'cipher0x9/other').action, 'rejected');
});
test('rejects a manifest that fails labs validation', () => {
  assert.equal(mergeManifest(doc(), { ...base(), title: 'x' }, 'cipher0x9/demo-lab').action, 'rejected');
});
test('parseRepo allowlist', () => {
  assert.ok(parseRepo('CypherMonkeyLabs/x')); assert.equal(parseRepo('a/b'), null); assert.equal(parseRepo('cipher0x9/../x'), null);
});
