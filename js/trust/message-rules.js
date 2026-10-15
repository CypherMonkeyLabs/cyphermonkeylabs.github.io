/** Shared contact rules for the browser form and the Cloudflare Worker. */

export const TOPIC_VALUES = Object.freeze([
  'general',
  'correction',
  'lab-idea',
  'collaboration',
  'accessibility',
]);

export const LIMITS = Object.freeze({
  nameMin: 2,
  nameMax: 80,
  emailMax: 254,
  messageMin: 20,
  messageMax: 4000,
  urlMax: 3,
  labMax: 40,
  bodyBytes: 10_000,
  minDelayMs: 3_000,
  maxAgeMs: 86_400_000,
  futureSkewMs: 60_000,
  rateLimit: 5,
  rateWindowSec: 3600,
});

const TOPIC_ALIASES = new Map([
  ['general', 'general'],
  ['correction', 'correction'],
  ['lab idea', 'lab-idea'],
  ['lab-idea', 'lab-idea'],
  ['collaboration', 'collaboration'],
  ['accessibility issue', 'accessibility'],
  ['accessibility', 'accessibility'],
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LAB_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EMAIL_IN_TEXT = /[^\s@]+@[^\s@]+\.[^\s@]+/;

export function normalizeTopic(value) {
  const key = String(value ?? '').trim().toLowerCase();
  return TOPIC_ALIASES.get(key) || '';
}

export function countUrls(message) {
  return (String(message).match(/https?:\/\//g) ?? []).length;
}

export function containsEmailAddress(value) {
  return EMAIL_IN_TEXT.test(String(value ?? ''));
}

export function validateFields(input, opts = {}) {
  const name = String(input.name ?? '').trim();
  const email = String(input.email ?? '').trim();
  const topic = normalizeTopic(input.topic ?? '') || (String(input.topic ?? '').trim() ? '' : 'general');
  const lab = String(input.lab ?? '').trim();
  const message = String(input.message ?? '').trim();
  const consent = Boolean(input.consent);
  const errors = [];

  if (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax) errors.push({ field: 'name', code: 'name' });
  if (email.length > LIMITS.emailMax || !EMAIL_PATTERN.test(email)) errors.push({ field: 'email', code: 'email' });
  if (!TOPIC_VALUES.includes(topic)) errors.push({ field: 'topic', code: 'topic' });
  if (lab && (lab.length > LIMITS.labMax || !LAB_PATTERN.test(lab))) errors.push({ field: 'lab', code: 'lab' });
  if (Array.isArray(opts.knownLabs) && lab && !opts.knownLabs.includes(lab)) errors.push({ field: 'lab', code: 'lab-unknown' });
  if (message.length < LIMITS.messageMin || message.length > LIMITS.messageMax) errors.push({ field: 'message', code: 'message' });
  if (countUrls(message) > LIMITS.urlMax) errors.push({ field: 'message', code: 'urls' });
  if (!consent) errors.push({ field: 'consent', code: 'consent' });
  if (opts.rejectPublicEmail && (containsEmailAddress(name) || containsEmailAddress(message))) {
    errors.push({ field: 'message', code: 'public-email' });
  }

  return {
    ok: errors.length === 0,
    errors,
    value: { name: name.replace(/[\r\n]+/g, ' '), email, topic, lab, message },
  };
}

export function timingError(stamp, now = Date.now()) {
  const started = Number(stamp);
  if (!Number.isFinite(started)) return 'too_fast';
  const elapsed = now - started;
  if (elapsed < LIMITS.minDelayMs) return 'too_fast';
  if (started - now > LIMITS.futureSkewMs) return 'too_fast';
  if (elapsed > LIMITS.maxAgeMs) return 'too_fast';
  return '';
}

export async function hashKey(ip, salt) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(ip) + String(salt)));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
