import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const outDir = process.env.SHOT_DIR || '/tmp/trust-shots';
const site = 'http://127.0.0.1:8765';
await mkdir(outDir, { recursive: true });

const shutdown = () => { server.kill(); chrome.kill(); };
process.on('exit', shutdown);
const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], {
  cwd: new URL('../..', import.meta.url).pathname,
  stdio: 'ignore',
});
const chrome = spawn('google-chrome', [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--remote-debugging-port=9222',
  `--user-data-dir=/tmp/chrome-trust-${process.pid}`,
  'about:blank',
], { stdio: 'ignore' });

async function waitOk(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // Chrome or the static server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`timed out waiting for ${url}`);
}

function rpc(ws, method, params = {}) {
  const id = rpc.nextId += 1;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout ${method}`)), 20_000);
    rpc.pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
rpc.nextId = 0;
rpc.pending = new Map();

await waitOk(`${site}/trust-demo.html`);
const version = await (await waitOk('http://127.0.0.1:9222/json/version')).json();
const browser = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve) => browser.addEventListener('open', resolve));
browser.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  const pending = rpc.pending.get(message.id);
  if (!pending) return;
  clearTimeout(pending.timer);
  rpc.pending.delete(message.id);
  if (message.error) pending.reject(new Error(message.error.message));
  else pending.resolve(message.result);
});

const { targetId } = await rpc(browser, 'Target.createTarget', { url: 'about:blank' });
const { webSocketDebuggerUrl } = (await (await fetch('http://127.0.0.1:9222/json/list')).json()).find((target) => target.id === targetId);
const page = new WebSocket(webSocketDebuggerUrl);
await new Promise((resolve) => page.addEventListener('open', resolve));
page.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') console.log('exception', JSON.stringify(message.params.exceptionDetails));
  if (message.method === 'Runtime.consoleAPICalled') {
    console.log('console', message.params.type, message.params.args.map((arg) => arg.value || arg.description).join(' '));
  }
  const pending = rpc.pending.get(message.id);
  if (!pending) return;
  clearTimeout(pending.timer);
  rpc.pending.delete(message.id);
  if (message.error) pending.reject(new Error(message.error.message));
  else pending.resolve(message.result);
});
await rpc(page, 'Page.enable');
await rpc(page, 'Runtime.enable');

async function evaluate(expression) {
  const result = await rpc(page, 'Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'evaluate failed');
  return result.result.value;
}

async function shot(name) {
  const image = await rpc(page, 'Page.captureScreenshot', { format: 'png' });
  await writeFile(`${outDir}/${name}.png`, Buffer.from(image.data, 'base64'));
  console.log('shot', name);
}

async function open(path, width, height) {
  await rpc(page, 'Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 800 });
  await rpc(page, 'Page.navigate', { url: `${site}${path}` });
  await evaluate('new Promise((resolve) => { if (document.readyState === "complete") resolve(); else addEventListener("load", () => resolve(), { once: true }); })');
  await evaluate('new Promise((resolve) => setTimeout(resolve, 500))');
}

const failures = [];
function check(name, ok, detail = '') {
  console.log(`${ok ? 'ok' : 'FAIL'} ${name}${detail ? ` ${detail}` : ''}`);
  if (!ok) failures.push(name);
}

await open('/trust-demo.html', 360, 740);
check('disclaimer', await evaluate('Boolean(document.querySelector("#disclaimer"))'));
check('motto', await evaluate('document.body.innerText.includes("Not just fun, also good work.")'));
check('affiliation', await evaluate('document.body.innerText.includes("not affiliated with, sponsored by, or endorsed by")'));
check('actions', await evaluate('["Repo","Rate","Comment","Help"].every((label) => document.body.innerText.includes(label))'));
check('no mail link', await evaluate('!document.documentElement.outerHTML.includes("mailto:")'));
check('linkedin not a link', await evaluate('![...document.querySelectorAll("a")].some((a) => a.textContent.includes("LinkedIn"))'));
await shot('trust_360_hero');

await open('/trust-demo.html?topic=correction&lab=sip#contact', 390, 844);
await evaluate('document.querySelector("#disclaimer").scrollIntoView()');
await evaluate('new Promise((resolve) => setTimeout(resolve, 200))');
await shot('trust_390_ground_rules');
await evaluate(`new Promise((resolve) => {
  const start = Date.now();
  const timer = setInterval(() => {
    const select = document.querySelector("#contact-lab");
    const ready = select && [...select.options].some((option) => option.value === "sip");
    if (ready || Date.now() - start > 4000) { clearInterval(timer); resolve(); }
  }, 50);
})`);
check('prefill topic', await evaluate('document.querySelector("#contact-topic").value === "correction"'));
check('prefill lab', await evaluate('document.querySelector("#contact-lab").value === "sip"'));
check('heading focusable', await evaluate('document.querySelector("#contact-title").tabIndex === -1'));

await evaluate(`(() => {
  const form = document.querySelector("#contact-form");
  form.elements.t.value = String(Date.now());
  form.elements.name.value = "A";
  form.elements.email.value = "not-an-email";
  form.elements.message.value = "short";
  form.requestSubmit();
  return true;
})()`);
await evaluate('new Promise((resolve) => setTimeout(resolve, 100))');
check('error summary', await evaluate('!document.querySelector("#contact-errors").hidden'));
await evaluate('document.querySelector("#contact").scrollIntoView()');
await shot('trust_390_errors');

await open('/trust-demo.html', 768, 1024);
await evaluate('document.querySelector("#contact").scrollIntoView()');
await shot('trust_768_contact');

await open('/trust-demo.html', 1440, 900);
await evaluate('document.querySelector("#disclaimer").scrollIntoView()');
await shot('trust_1440_ground_rules');
check('full width panel', await evaluate(`(() => {
  const panel = document.querySelector("#disclaimer");
  return panel.getBoundingClientRect().width >= document.documentElement.clientWidth - 1;
})()`));

await evaluate(`new Promise((resolve) => {
  const start = Date.now();
  const timer = setInterval(() => {
    const select = document.querySelector("#contact-lab");
    const ready = select && [...select.options].some((option) => option.value === "sip");
    if (ready || Date.now() - start > 4000) { clearInterval(timer); resolve(); }
  }, 50);
})`);
await evaluate(`(() => {
  const email = ["ada", "example.com"].join("@");
  window.__opened = [];
  window.open = (url) => { window.__opened.push(url); return {}; };
  const form = document.querySelector("#contact-form");
  form.elements.t.value = String(Date.now() - 4000);
  form.elements.name.value = "Ada Lovelace";
  form.elements.email.value = email;
  form.elements.topic.value = "correction";
  form.elements.lab.value = "sip";
  form.elements.message.value = "The invite section should cite RFC 3261 for the call setup.";
  form.elements.consent.checked = true;
  form.requestSubmit();
  return true;
})()`);
await evaluate('new Promise((resolve) => setTimeout(resolve, 200))');
const opened = await evaluate('window.__opened && window.__opened[0] ? window.__opened[0] : ""');
const secret = ['ada', 'example.com'].join('@');
check('issue opened', opened.includes('github.com'));
check('email stayed out', !decodeURIComponent(opened).includes(secret));
check('success shown', await evaluate('!document.querySelector("#contact-success").hidden'));
check('mascot celebrate', await evaluate('document.querySelector("#mascot-status").textContent.includes("celebrate")'));
await evaluate('document.querySelector("#contact-success").scrollIntoView()');
await shot('trust_1440_fallback');

await open('/trust-demo.html?motion=reduce', 390, 844);
check('reduced motion', await evaluate('document.documentElement.dataset.motion === "reduce"'));
check('aurora static', await evaluate(`getComputedStyle(document.querySelector(".cml-aurora")).animationName === "none"`));

await open('/privacy.html', 390, 844);
check('privacy verify', await evaluate('Boolean(document.querySelector("#how-we-verify"))'));
check('privacy no mail', await evaluate('!document.documentElement.outerHTML.includes("mailto:")'));
await shot('privacy_390');

await open('/404.html', 390, 844);
await evaluate(`new Promise((resolve) => {
  const start = Date.now();
  const timer = setInterval(() => {
    if (document.querySelector(".lab-card") || Date.now() - start > 4000) { clearInterval(timer); resolve(); }
  }, 50);
})`);
await evaluate('document.querySelector("#lost-search").value = "sip"; document.querySelector("#lost-search").dispatchEvent(new Event("input"));');
await evaluate('new Promise((resolve) => setTimeout(resolve, 200))');
check('404 filter', await evaluate('document.body.innerText.includes("SIP Universe") && document.querySelectorAll(".lab-card").length === 1'));
await shot('not_found_390_search');

await open('/404.html', 1440, 900);
await shot('not_found_1440');

browser.close();
page.close();
server.kill();
chrome.kill();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('browse checks passed');
