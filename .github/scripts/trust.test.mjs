import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildPlainMessage } from '../../worker/contact/src/mime.js';
import { handleContact } from '../../worker/contact/src/handler.js';
import { contactFailureCode } from '../../js/trust/contact.js';
import { MOTTO, NON_AFFILIATION, ENDPOINT, strings } from '../../js/trust/copy.js';
import { buildPublicIssueUrl } from '../../js/trust/issue-url.js';
import { normalizeLabs } from '../../js/trust/labs.js';
import { hashKey, timingError, validateFields } from '../../js/trust/message-rules.js';
import { classifyProbe } from './check-links.mjs';
import { validateManifest } from './validate-labs.mjs';

function addr(local, host) {
  return [local, host].join('@');
}

function mockReq({ method = 'POST', origin = 'https://cyphermonkeylabs.com', length = 200, fields = {}, ip = '203.0.113.10' } = {}) {
  const map = new Map(Object.entries(fields));
  return {
    method,
    headers: new Headers({ origin, 'content-length': String(length), 'cf-connecting-ip': ip }),
    formData: async () => ({ get: (name) => (map.has(name) ? map.get(name) : null) }),
  };
}

function goodFields(extra = {}) {
  return {
    name: 'Ada Lovelace',
    email: addr('ada', 'example.com'),
    topic: 'correction',
    lab: 'sip-universe',
    message: 'The SIP lesson should cite RFC 3261 for the invite flow.',
    consent: 'yes',
    t: String(Date.now() - 5000),
    'cf-turnstile-response': 'token',
    ...extra,
  };
}

function deps(overrides = {}) {
  const api = {
    calls: { verify: 0, limit: 0, send: 0 },
    payload: null,
    async verifyTurnstile() { api.calls.verify += 1; return { success: true }; },
    async rateLimit() { api.calls.limit += 1; return { success: true }; },
    async sendEmail(payload) { api.calls.send += 1; api.payload = payload; },
  };
  return Object.assign(api, overrides);
}

test('english copy keeps the trust phrases', () => {
  const copy = strings('en');
  assert.equal(copy.motto, MOTTO);
  assert.equal(copy.affiliatedStrong, NON_AFFILIATION);
  assert.equal(strings('es').motto, MOTTO);
  assert.match(copy.independent, /Independent & educational/);
});

test('pages include the ground rules phrases and no mailto', async () => {
  for (const file of ['privacy.html', '404.html', 'trust-demo.html']) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /not affiliated with, sponsored by, or endorsed by/i);
    assert.match(html, /Not just fun, also good work/);
    assert.doesNotMatch(html, /mailto:/i);
    assert.doesNotMatch(html, /href="#"/);
    assert.doesNotMatch(html, /href=""/);
  }
});

test('public issue URL leaves the visitor address out', () => {
  const email = addr('ada', 'example.com');
  const url = buildPublicIssueUrl({
    name: 'Ada',
    email,
    topic: 'correction',
    lab: 'sip-universe',
    message: 'Please cite the RFC in the invite section of the lab.',
  });
  assert.equal(decodeURIComponent(url).includes(email), false);
  assert.match(url, /^https:\/\/github\.com\/CypherMonkeyLabs\/cyphermonkeylabs\.github\.io\/issues\/new\?/);
  assert.throws(() => buildPublicIssueUrl({
    name: 'Ada',
    email,
    topic: 'general',
    lab: '',
    message: `Write me at ${email} please, this note is long enough.`,
  }));
});

test('field rules', () => {
  const ok = validateFields({
    name: 'Ada',
    email: addr('ada', 'example.com'),
    topic: '',
    message: 'This message is long enough to send.',
    consent: true,
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.value.topic, 'general');
  const urls = validateFields({
    name: 'Ada',
    email: addr('ada', 'example.com'),
    topic: 'general',
    message: 'See https://a.example https://b.example https://c.example https://d.example now',
    consent: true,
  });
  assert.equal(urls.ok, false);
  assert.equal(timingError(Date.now()), 'too_fast');
  assert.equal(timingError(Date.now() - 4000), '');
});

test('hash key does not keep the raw IP', async () => {
  const ip = '203.0.113.10';
  const hash = await hashKey(ip, 'salt');
  assert.equal(hash.includes(ip), false);
  assert.equal(hash, await hashKey(ip, 'salt'));
  assert.notEqual(hash, await hashKey(ip, 'other'));
});

test('pack3 fixture passes and the invalid fixture fails', async () => {
  const good = validateManifest(JSON.parse(await readFile('.github/fixtures/labs-pack3.json', 'utf8')));
  assert.deepEqual(good.findings.filter((item) => item.level === 'error'), []);
  const bad = validateManifest(JSON.parse(await readFile('.github/fixtures/labs-invalid.json', 'utf8')));
  assert.ok(bad.findings.some((item) => item.level === 'error'));
  const legacy = validateManifest(JSON.parse(await readFile('labs.json', 'utf8')));
  assert.equal(legacy.mode, 'legacy');
  assert.deepEqual(legacy.findings.filter((item) => item.level === 'error'), []);
});

test('legacy labs normalize', () => {
  const labs = normalizeLabs({ labs: [{ id: 'sip', name: 'SIP Universe', url: 'https://example.com/sip/', source: 'https://github.com/CypherMonkeyLabs/sip', status: 'live' }] });
  assert.equal(labs[0].title, 'SIP Universe');
  assert.equal(labs[0].repo, 'https://github.com/CypherMonkeyLabs/sip');
});

test('worker rejects the closed cases and sends a good note', async () => {
  const secretTo = addr('inbox', 'example.com');
  const secretFrom = addr('no-reply', 'example.com');
  const env = { FROM_ADDR: secretFrom, TO_ADDR: secretTo, SALT: 'salt', TURNSTILE_SECRET: 'secret' };

  assert.equal((await handleContact(mockReq({ origin: 'https://evil.example' }), env, deps())).status, 403);
  assert.equal((await handleContact(mockReq({ method: 'GET' }), env, deps())).status, 405);
  assert.equal((await handleContact(mockReq({ method: 'OPTIONS' }), env, deps())).status, 204);
  assert.equal((await handleContact(mockReq({ length: 10_001 }), env, deps())).status, 413);

  const honey = deps();
  const honeyRes = await handleContact(mockReq({ fields: { ...goodFields(), company: 'acme' } }), env, honey);
  assert.equal(honeyRes.status, 200);
  assert.equal(honey.calls.send, 0);
  assert.equal(honey.calls.verify, 0);

  const fast = deps();
  const fastRes = await handleContact(mockReq({ fields: goodFields({ t: String(Date.now()) }) }), env, fast);
  assert.equal(fastRes.status, 400);
  assert.equal((await fastRes.json()).code, 'too_fast');
  assert.equal(fast.calls.verify, 0);

  const captcha = deps();
  captcha.verifyTurnstile = async () => { captcha.calls.verify += 1; return { success: false }; };
  assert.equal((await handleContact(mockReq({ fields: goodFields() }), env, captcha)).status, 400);

  const limited = deps({ async rateLimit() { return { success: false }; } });
  assert.equal((await handleContact(mockReq({ fields: goodFields() }), env, limited)).status, 429);

  const invalid = deps();
  assert.equal((await handleContact(mockReq({ fields: goodFields({ message: 'too short' }) }), env, invalid)).status, 422);
  assert.equal(invalid.calls.send, 0);

  const bare = deps();
  assert.equal((await handleContact(mockReq({ fields: goodFields() }), { SALT: 'salt' }, bare)).status, 503);
  assert.equal(bare.calls.send, 0);

  const sent = deps();
  const ok = await handleContact(mockReq({ fields: goodFields({ name: 'Ada\nBcc: nope' }) }), env, sent);
  const body = await ok.text();
  assert.equal(ok.status, 200);
  assert.equal(sent.calls.send, 1);
  assert.equal(body.includes(secretTo), false);
  assert.equal(body.includes(secretFrom), false);
  assert.equal(body.includes(addr('ada', 'example.com')), false);
  assert.equal(sent.payload.subject.includes('\n'), false);
  assert.equal(sent.payload.replyTo, addr('ada', 'example.com'));
  assert.equal(sent.payload.toAddr, secretTo);
});

test('x.com bot wall warns and a missing profile still fails', () => {
  assert.equal(classifyProbe({ host: 'x.com', status: 403, error: null }), 'bot-wall');
  assert.equal(classifyProbe({ host: 'x.com', status: 0, error: 'network' }), 'bot-wall');
  assert.equal(classifyProbe({ host: 'www.twitter.com', status: 429, error: null }), 'bot-wall');
  assert.equal(classifyProbe({ host: 'x.com', status: 404, error: null }), 'fail');
  assert.equal(classifyProbe({ host: 'x.com', status: 410, error: null }), 'fail');
  assert.equal(classifyProbe({ host: 'github.com', status: 403, error: null }), 'fail');
  assert.equal(classifyProbe({ host: 'github.com', status: 200, error: null }), 'ok');
});

test('worker mode pages allow Turnstile and keep the endpoint private', async () => {
  assert.equal(ENDPOINT, 'https://contact.cyphermonkeylabs.com');
  const sitekey = '0x4AAAAAAFX-0D95hXYzwVx-';
  for (const file of ['index.html', 'trust-demo.html']) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /name="cml-contact-mode" content="worker"/);
    assert.match(html, new RegExp(`name="cml-turnstile-sitekey" content="${sitekey}"`));
    assert.match(html, /script-src 'self' https:\/\/challenges\.cloudflare\.com/);
    assert.match(html, /connect-src 'self' https:\/\/contact\.cyphermonkeylabs\.com https:\/\/challenges\.cloudflare\.com/);
    assert.match(html, /frame-src https:\/\/challenges\.cloudflare\.com/);
    assert.match(html, /form-action [^"]*https:\/\/contact\.cyphermonkeylabs\.com/);
  }
  const contact = await readFile('js/trust/contact.js', 'utf8');
  assert.match(contact, /response-field-name': 'cf-turnstile-response'/);
  assert.match(contact, /appearance: 'always'/);
  assert.doesNotMatch(contact, /interaction-only/);
  const wrangler = await readFile('worker/contact/wrangler.toml', 'utf8');
  const routesAt = wrangler.indexOf('routes = [{ pattern = "contact.cyphermonkeylabs.com", custom_domain = true }]');
  const tableAt = wrangler.indexOf('[[send_email]]');
  assert.ok(routesAt > -1 && routesAt < tableAt);
  assert.equal(contactFailureCode(429, {}), 'rate');
  assert.equal(contactFailureCode(503, {}), 'unconfigured');
  assert.equal(contactFailureCode(400, { code: 'too_fast' }), 'too_fast');
  assert.equal(contactFailureCode(400, { code: 'captcha' }), 'captcha');
  assert.equal(contactFailureCode(422, { code: 'invalid' }), 'invalid');
});

test('mime subject cannot break the header', () => {
  const raw = buildPlainMessage({
    fromName: 'CML Mission Control',
    fromAddr: addr('no-reply', 'example.com'),
    toAddr: addr('inbox', 'example.com'),
    replyTo: addr('ada', 'example.com'),
    subject: 'Hello\nBcc: nope',
    text: 'A real note',
  });
  assert.equal(raw.split('\r\n').filter((line) => line.startsWith('Subject:')).length, 1);
  assert.equal(raw.includes('\nBcc'), false);
  const encoded = raw.split('\r\n\r\n')[1].replace(/\r\n/g, '');
  assert.equal(Buffer.from(encoded, 'base64').toString('utf8'), 'A real note');
});
