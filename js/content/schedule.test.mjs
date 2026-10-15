import assert from "node:assert/strict";
import test from "node:test";
import { CORE, DWELL_MS, clockVariant, guardsClear, pick } from "./schedule.mjs";
import { makeFixture, minSeparation, solar } from "./layout.mjs";
import { modeForCount } from "./schedule.mjs";

test("clock variant changes every 150 seconds and covers 8 cores in 20 minutes", () => {
  const start = new Date(2026, 9, 15, 0, 0, 1);
  const first = clockVariant(start, CORE);
  const next = clockVariant(new Date(start.getTime() + DWELL_MS), CORE);
  const almost = clockVariant(new Date(start.getTime() + DWELL_MS - 2000), CORE);
  assert.notEqual(first, next);
  assert.equal(almost, first);
  const seen = new Set();
  for (let i = 0; i < CORE.length; i += 1) {
    seen.add(clockVariant(new Date(start.getTime() + i * DWELL_MS), CORE));
  }
  assert.equal(seen.size, 8);
  assert.deepEqual([...seen].sort(), [...CORE].sort());
});

test("idle dreamer beats context, and an event beats idle", () => {
  const now = new Date(2026, 9, 15, 12, 0, 0);
  assert.equal(pick({ idleMs: 90_000, context: "astronaut", now }, CORE), "dreamer");
  assert.equal(pick({ event: "party", idleMs: 90_000, context: "astronaut", now }, CORE), "party");
  assert.equal(pick({ idleMs: 1000, context: "bookworm", now }, CORE), "bookworm");
  assert.equal(pick({ idleMs: 0, now }, CORE), clockVariant(now, CORE));
});

test("swap guards block while a form field is focused", () => {
  assert.equal(guardsClear({ pointerOver: false, tipOpen: false, formFocus: true, hidden: false }), false);
  assert.equal(guardsClear({ pointerOver: false, tipOpen: false, formFocus: false, hidden: false }), true);
});

test("10, 40, and 100 labs pick a mode and keep separation", () => {
  for (const count of [10, 40, 100]) {
    const { labs, cats } = makeFixture(count);
    const placed = solar(labs, cats);
    assert.equal(placed.length, count);
    const ratio = minSeparation(placed, (item) => {
      const lab = labs.find((entry) => entry.id === item.id);
      return lab.scene.size;
    });
    assert.ok(ratio >= 1, `separation ratio ${ratio} for ${count}`);
  }
  assert.equal(modeForCount(10, false), "solar");
  assert.equal(modeForCount(40, false), "galaxy");
  assert.equal(modeForCount(40, true), "galaxy");
  assert.equal(modeForCount(24, false), "multi-ring");
  assert.equal(modeForCount(13, true), "galaxy");
});
