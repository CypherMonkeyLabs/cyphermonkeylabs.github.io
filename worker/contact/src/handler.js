import { LIMITS, hashKey, timingError, validateFields } from '../../../js/trust/message-rules.js';

const ORIGINS = new Set([
  'https://cyphermonkeylabs.com',
  'https://www.cyphermonkeylabs.com',
]);

function json(status, body, origin) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    vary: 'Origin',
  };
  if (origin) headers['access-control-allow-origin'] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}

function knownLabs(env) {
  const raw = env && env.LAB_IDS ? String(env.LAB_IDS) : '';
  if (!raw.trim()) return undefined;
  return raw.split(',').map((id) => id.trim()).filter(Boolean);
}

async function defaultVerify(env, token, ip) {
  const body = new URLSearchParams({
    secret: String(env.TURNSTILE_SECRET || ''),
    response: String(token || ''),
    remoteip: String(ip || ''),
  });
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = await response.json();
  return { success: Boolean(data && data.success) };
}

async function defaultRateLimit(env, key) {
  if (env.RATE_LIMITER && typeof env.RATE_LIMITER.limit === 'function') {
    return env.RATE_LIMITER.limit({ key });
  }
  if (env.RATE_KV) {
    const current = Number((await env.RATE_KV.get(key)) || '0');
    if (current >= LIMITS.rateLimit) return { success: false };
    await env.RATE_KV.put(key, String(current + 1), { expirationTtl: LIMITS.rateWindowSec });
    return { success: true };
  }
  return { success: false, unconfigured: true };
}

export async function handleContact(req, env, deps = {}) {
  const origin = req.headers.get('Origin') ?? '';
  if (!ORIGINS.has(origin)) return json(403, { ok: false }, '');
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'POST',
        'access-control-allow-headers': 'content-type, accept',
        'access-control-max-age': '86400',
        vary: 'Origin',
      },
    });
  }
  if (req.method !== 'POST') return json(405, { ok: false }, origin);
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (Number.isFinite(declared) && declared > LIMITS.bodyBytes) return json(413, { ok: false }, origin);

  const form = await req.formData();
  if (String(form.get('company') ?? '')) return json(200, { ok: true }, origin);
  if (timingError(form.get('t'))) return json(400, { ok: false, code: 'too_fast' }, origin);

  const ip = req.headers.get('CF-Connecting-IP') ?? '';
  const verify = deps.verifyTurnstile
    ? deps.verifyTurnstile(String(form.get('cf-turnstile-response') ?? ''), ip)
    : defaultVerify(env, form.get('cf-turnstile-response'), ip);
  const verdict = await verify;
  if (!verdict || !verdict.success) return json(400, { ok: false, code: 'captcha' }, origin);

  const key = await hashKey(ip, env.SALT || '');
  const limit = deps.rateLimit ? await deps.rateLimit(key) : await defaultRateLimit(env, key);
  if (limit && limit.unconfigured) return json(503, { ok: false, code: 'unconfigured' }, origin);
  if (!limit || !limit.success) return json(429, { ok: false, code: 'rate' }, origin);

  const checked = validateFields({
    name: form.get('name'),
    email: form.get('email'),
    topic: form.get('topic'),
    lab: form.get('lab'),
    message: form.get('message'),
    consent: form.get('consent'),
  }, { knownLabs: knownLabs(env) });
  if (!checked.ok) return json(422, { ok: false, code: 'invalid' }, origin);

  if (!env.FROM_ADDR || !env.TO_ADDR || (!env.SEND_EMAIL && !deps.sendEmail)) {
    return json(503, { ok: false, code: 'unconfigured' }, origin);
  }
  const { name, email, topic, lab, message } = checked.value;
  const subject = `[CML] ${topic}${lab ? ` · ${lab}` : ''} from ${name}`.replace(/[\r\n]+/g, ' ');
  const text = `${message}\n\n— ${name} <${email}>\nTopic: ${topic}\nLab: ${lab || 'n/a'}`;
  const payload = {
    fromName: 'CML Mission Control',
    fromAddr: env.FROM_ADDR,
    toAddr: env.TO_ADDR,
    replyTo: email,
    subject,
    text,
  };
  try {
    if (deps.sendEmail) await deps.sendEmail(payload);
  } catch {
    return json(422, { ok: false, code: 'invalid' }, origin);
  }
  return json(200, { ok: true }, origin);
}
