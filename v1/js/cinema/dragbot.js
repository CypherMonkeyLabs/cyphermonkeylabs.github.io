/* Guide monkey: draggable (Pointer Events, edge snap with bounce, saved spot, reset) and answers
   a short list of questions from /data/labs.json. Pattern adapted from the lab guides' dragbot.js. */
const KEY = 'cml-guide-pos-v1', M = 8;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));

async function catalog() {
  try { const r = await fetch('/data/labs.json'); const d = await r.json(); return (d.labs || []).filter((l) => l.kind === 'lab' && l.id !== 'sutra-nexus'); } catch { return []; }
}
const names = (labs, ids) => labs.filter((l) => ids.includes(l.id)).map((l) => l.title).join(', ');

export function mountGuide() {
  const dock = document.getElementById('guide'), bot = document.getElementById('guide-bot'), panel = document.getElementById('guide-panel');
  if (!dock || !bot) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  let labs = null;

  /* questions */
  const QA = [
    ['What is this place?', async () => 'Thirteen free labs about voice, contact center, SIP, AI, and Python, plus Sutra Nexus. I built them while learning, and they are all open source.'],
    ['Where should I start?', async () => 'New to calls? Try SIP Universe. Curious about AI? Open the AI Lab. Work with phones or queues? Pick the platform you use from the labs list.'],
    ['Which labs cover contact center?', async () => { labs = labs || await catalog(); return 'Contact center: ' + (names(labs, ['amazon-connect', 'five9', 'genesys-cloud', 'nice-cxone', 'zoom-talkdesk-avaya']) || 'see the labs list') + '.'; }],
    ['Is it really free?', async () => 'Yes. No sign-up, no ads, and no tracking on this page.'],
    ['Who made this?', async () => 'Lucky, a lifelong student and AI enthusiast who is learning in the open. See the About section.'],
  ];
  panel.textContent = '';
  const hi = document.createElement('p'); hi.innerHTML = '<strong>Hi, I am the guide monkey.</strong> Ask me, or drag me anywhere.';
  const qs = document.createElement('div'); qs.className = 'guide-qs';
  const ans = document.createElement('p'); ans.className = 'guide-ans'; ans.setAttribute('aria-live', 'polite');
  QA.forEach(([q, f]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.addEventListener('click', async () => { ans.textContent = await f(); }); qs.append(b); });
  const jump = document.createElement('div'); jump.className = 'guide-actions';
  [['Trailer', '#trailer'], ['Labs', '#labs'], ['About', '#about'], ['Contact', '#contact']].forEach(([t, h]) => { const a = document.createElement('a'); a.href = h; a.textContent = t; jump.append(a); });
  const home = document.createElement('button'); home.type = 'button'; home.className = 'guide-home'; home.textContent = 'Put me back';
  panel.append(hi, qs, ans, jump, home);

  /* open / close */
  const toggle = (open) => { panel.hidden = !open; bot.setAttribute('aria-expanded', String(open)); place(); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { toggle(false); bot.focus(); } });
  document.addEventListener('click', (e) => { if (!panel.hidden && !dock.contains(e.target)) toggle(false); });
  jump.addEventListener('click', () => toggle(false));

  /* position */
  let pos = null, drag = null, swallow = false;
  try { pos = JSON.parse(localStorage.getItem(KEY)); } catch { pos = null; }
  if (!pos || typeof pos.fx !== 'number') pos = null;
  const bounds = () => ({ x0: M, y0: 72, x1: innerWidth - bot.offsetWidth - M, y1: innerHeight - bot.offsetHeight - M });
  function setBotXY(x, y) { // dock is placed by the bot's top-left; panel opens above/below, left/right
    const w = panel.hidden ? 0 : dock.offsetWidth;
    dock.classList.add('is-moved');
    const right = x + bot.offsetWidth / 2 > innerWidth / 2;
    const left = right ? x + bot.offsetWidth - Math.max(dock.offsetWidth, bot.offsetWidth) : x;
    const lowHalf = y + bot.offsetHeight / 2 > innerHeight / 2;
    dock.classList.toggle('at-bottom', lowHalf); dock.classList.toggle('at-top', !lowHalf);
    dock.style.left = clamp(left, M, innerWidth - dock.offsetWidth - M) + 'px';
    const top = lowHalf ? y - (dock.offsetHeight - bot.offsetHeight) : y;
    dock.style.top = Math.max(M, top) + 'px';
    dock.style.alignItems = right ? 'flex-end' : 'flex-start';
  }
  function place() {
    if (!pos) return;
    const b = bounds();
    setBotXY(b.x0 + pos.fx * (b.x1 - b.x0), b.y0 + pos.fy * (b.y1 - b.y0));
  }
  function goHome() {
    pos = null; try { localStorage.removeItem(KEY); } catch {}
    ['left', 'top', 'alignItems'].forEach((p) => dock.style.removeProperty(p === 'alignItems' ? 'align-items' : p));
    dock.classList.remove('is-moved', 'at-top', 'at-bottom');
  }
  home.addEventListener('click', goHome);
  bot.addEventListener('dblclick', goHome);

  function tilt(rx, ry, lift) {
    bot.style.transform = rx || ry || lift ? `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${lift ? 1.1 : 1})` : '';
    dock.classList.toggle('is-lifted', !!lift);
  }
  bot.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const r = bot.getBoundingClientRect();
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, x: r.left, y: r.top, px: e.clientX, py: e.clientY, t: e.timeStamp, vx: 0, vy: 0, moved: false };
    try { bot.setPointerCapture(e.pointerId); } catch {}
  });
  bot.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 6) return;
    if (!drag.moved) { drag.moved = true; dock.classList.remove('is-snapping'); }
    const b = bounds(), dt = Math.max(1, e.timeStamp - drag.t);
    drag.vx = drag.vx * .6 + ((e.clientX - drag.px) / dt) * .4; drag.vy = drag.vy * .6 + ((e.clientY - drag.py) / dt) * .4;
    drag.px = e.clientX; drag.py = e.clientY; drag.t = e.timeStamp;
    drag.x = clamp(drag.ox + e.clientX - drag.sx, b.x0, b.x1); drag.y = clamp(drag.oy + e.clientY - drag.sy, b.y0, b.y1);
    setBotXY(drag.x, drag.y);
    calm.matches ? tilt(0, 0, true) : tilt(clamp(-drag.vy * 22, -25, 25).toFixed(1), clamp(drag.vx * 22, -25, 25).toFixed(1), true);
  });
  function end(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    try { bot.releasePointerCapture(e.pointerId); } catch {}
    if (!d.moved) return;
    swallow = true; setTimeout(() => { swallow = false; }, 80);
    const b = bounds(), toLeft = d.x - b.x0 < b.x1 - d.x, x = toLeft ? b.x0 : b.x1;
    dock.classList.add('is-snapping'); setBotXY(x, d.y); tilt(0, 0, 0);
    pos = { fx: b.x1 > b.x0 ? (x - b.x0) / (b.x1 - b.x0) : 0, fy: b.y1 > b.y0 ? (d.y - b.y0) / (b.y1 - b.y0) : 0 };
    try { localStorage.setItem(KEY, JSON.stringify(pos)); } catch {}
    setTimeout(() => dock.classList.remove('is-snapping'), 450);
  }
  bot.addEventListener('pointerup', end); bot.addEventListener('pointercancel', end);
  bot.addEventListener('click', (e) => { if (swallow) { e.stopImmediatePropagation(); e.preventDefault(); return; } toggle(panel.hidden); }, true);
  addEventListener('resize', place);
  place();
}
