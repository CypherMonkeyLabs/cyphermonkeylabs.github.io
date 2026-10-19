import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette, parseColor, clamp01 } from '../color.js';
import { safeUrl } from '../url.js';

test('clamp and hex colors', () => {
  assert.equal(clamp01(2), 1);
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01('nope'), 0);
  const color = parseColor('#abc', null);
  assert.equal(color.hex, '#aabbcc');
  assert.equal(parseColor('red', null), null);
});

test('palette always has three colors', () => {
  const colors = palette(['#112233']);
  assert.equal(colors.length, 3);
  assert.equal(colors[0].hex, '#112233');
  assert.equal(colors[1].hex, '#112233');
  const fallback = palette(['nope']);
  assert.equal(fallback[0].hex, '#7c5cff');
});

test('globe urls stay on allowed hosts', () => {
  const base = 'https://cyphermonkeylabs.com/v2/fx/demo.html';
  assert.equal(
    safeUrl('https://github.com/CypherMonkeyLabs/python-lab-free-university-mesmerizing', base),
    'https://github.com/CypherMonkeyLabs/python-lab-free-university-mesmerizing',
  );
  assert.equal(safeUrl('https://github.com/other/repo', base), '');
  assert.equal(safeUrl('https://linktr.ee/CypherMonkey', base), 'https://linktr.ee/CypherMonkey');
  assert.equal(safeUrl('https://linktr.ee/someone', base), '');
  assert.equal(safeUrl('javascript:alert(1)', base), '');
  assert.equal(safeUrl('https://evil.example/', base), '');
  assert.match(safeUrl('/python-lab-free-university-mesmerizing/', base), /^https:\/\/cyphermonkeylabs.com\/python-lab/);
  assert.equal(safeUrl('http://cyphermonkeylabs.com/', base), '');
});
