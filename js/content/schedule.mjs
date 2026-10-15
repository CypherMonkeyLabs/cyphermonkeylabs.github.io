/** Clock and priority rules for the CypherMonkey mascot. Pure functions, no DOM. */

export const DWELL_MS = 150_000;
export const IDLE_MS = 90_000;

export const CORE = [
  "stargazer",
  "astronaut",
  "headset-helper",
  "signal-surfer",
  "robo-buddy",
  "bookworm",
  "gem-collector",
  "inventor",
];

export function hash(value) {
  let h = 7;
  const s = String(value);
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function clockVariant(now, core = CORE) {
  const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const slot = Math.floor((now.getTime() - midnight.getTime()) / DWELL_MS);
  return core[(hash(day) + slot) % core.length];
}

/**
 * Priority: event, then idle dreamer, then context, then the daily clock.
 * @param {{ event?: string, idleMs: number, context?: string, now: Date }} state
 */
export function pick(state, core = CORE) {
  if (state.event) return state.event;
  if (state.idleMs >= IDLE_MS) return "dreamer";
  if (state.context) return state.context;
  return clockVariant(state.now, core);
}

export function guardsClear(guards) {
  return !guards.pointerOver && !guards.tipOpen && !guards.formFocus && !guards.hidden;
}

export function modeForCount(count, mobile) {
  if (mobile && count > 12) return "galaxy";
  if (count <= 12) return "solar";
  if (count <= 36) return "multi-ring";
  return "galaxy";
}
