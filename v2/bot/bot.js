/* Cypher Monkey Labs v2 guide monkey ("Cyph").
   Body and motion: spring physics, hang by the tail, drag and fling, jetpack, eyes follow the cursor.
   Brain: BM25 retrieval with synonyms + typo-tolerant fallback, follow-up memory, path builder, quiz, tour, recommender, moods.
   Self-contained: loads ./kb.json and /assets/mascot/*.svg from this origin only. No external calls, no keys. */
(function () {
  'use strict';
  if (window.__cmbLoaded) return; window.__cmbLoaded = true;
  var SCRIPT = document.currentScript, BASE = SCRIPT ? SCRIPT.src.replace(/[^\/]*$/, '') : '/v2/bot/';
  var KEY = 'cmb-v2-bot-state';
  var RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var st = { open: false, min: false, tts: false, hist: [], last: null, seen: {}, quiz: null, score: 0, asked: 0, tour: null };
  try { var sv = JSON.parse(localStorage.getItem(KEY)); if (sv) for (var k0 in sv) st[k0] = sv[k0]; } catch (e) {}
  if (!Array.isArray(st.hist)) st.hist = [];
  var KB = null, IDX = null;
  function save() { try { st.hist = st.hist.slice(-24); localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function mobile() { return innerWidth < 720; }
  function still() { return RM.matches || document.documentElement.classList.contains('reduce-motion') || st.still; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  /* link policy: only the owner's domains, or same-site paths and anchors */
  function safe(u) {
    if (!u) return null;
    if (/^(#|\/(?!\/))/.test(u)) return u;
    var x; try { x = new URL(u); } catch (e) { return null; }
    if (x.protocol !== 'https:') return null;
    if (x.hostname === 'cyphermonkeylabs.com' || x.hostname === 'www.cyphermonkeylabs.com') return u;
    if (x.hostname === 'linktr.ee' && /^\/CypherMonkey\/?$/.test(x.pathname)) return u;
    if (x.hostname === 'github.com' && /^\/CypherMonkeyLabs(\/|$)/.test(x.pathname)) return u;
    return null;
  }
  var ART = { curious: 'signal-surfer', excited: 'party', sleepy: 'dreamer', think: 'inventor', help: 'headset-helper' };

  /* ---------------- DOM ---------------- */
  var root = h('div', 'cmb'); root.id = 'cmb';
  var mk = h('button', 'cmb-monkey'); mk.type = 'button'; mk.setAttribute('aria-label', 'Cyph the guide monkey: open chat. You can also drag and fling me.'); mk.setAttribute('aria-expanded', 'false'); mk.setAttribute('aria-controls', 'cmb-panel');
  var body = h('span', 'cmb-body'); var flame = h('span', 'cmb-flame'); flame.setAttribute('aria-hidden', 'true');
  var zzz = h('span', 'cmb-zzz', 'z z z'); zzz.setAttribute('aria-hidden', 'true');
  var bubble = h('span', 'cmb-bubble'); bubble.setAttribute('aria-hidden', 'true');
  body.appendChild(flame); mk.appendChild(body); mk.appendChild(zzz); mk.appendChild(bubble);
  var rope = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); rope.setAttribute('class', 'cmb-rope'); rope.setAttribute('aria-hidden', 'true');
  var ropePath = document.createElementNS('http://www.w3.org/2000/svg', 'path'); rope.appendChild(ropePath);
  var panel = h('section', 'cmb-panel'); panel.id = 'cmb-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'cmb-h'); panel.hidden = true;
  panel.innerHTML = '<header class="cmb-head"><img class="cmb-face" src="/assets/mascot/signal-surfer.svg" alt="" width="30" height="30"><div class="cmb-ttl"><h2 id="cmb-h">Cyph <small class="cmb-mood">curious</small></h2><p>Guide monkey · knows all 13 labs</p></div>' +
    '<button type="button" class="cmb-ic" data-a="tour" title="Guided tour of the 13 labs">Tour</button>' +
    '<button type="button" class="cmb-ic" data-a="tts" aria-pressed="false" title="Read answers aloud">Voice off</button>' +
    '<button type="button" class="cmb-ic" data-a="min" aria-label="Minimize chat">&#8211;</button></header>' +
    '<div class="cmb-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0"></div>' +
    '<div class="cmb-typing" hidden aria-hidden="true"><i></i><i></i><i></i> Cyph is thinking…</div>' +
    '<div class="cmb-quick" role="group" aria-label="Suggested questions"></div>' +
    '<form class="cmb-form"><label class="cmb-sr" for="cmb-in">Ask Cyph the guide monkey</label><input id="cmb-in" autocomplete="off" maxlength="300" placeholder="Try “1 hour, AI agents” or “webex”"><button type="submit">Ask</button></form>';
  root.appendChild(rope); root.appendChild(panel); root.appendChild(mk);
  var log = panel.querySelector('.cmb-log'), quick = panel.querySelector('.cmb-quick'), input = panel.querySelector('#cmb-in'), typing = panel.querySelector('.cmb-typing'),
      face = panel.querySelector('.cmb-face'), moodEl = panel.querySelector('.cmb-mood');
  var svgEl = null, pupils = [], armR = null, tailG = null;

  function loadArt() {
    fetch('/assets/mascot/signal-surfer.svg').then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (t) {
      if (!/^\s*<svg/.test(t)) throw 0;
      body.insertAdjacentHTML('beforeend', t.replace(/id="/g, 'id="cmb-'));
      svgEl = body.querySelector('svg'); svgEl.setAttribute('aria-hidden', 'true'); svgEl.setAttribute('focusable', 'false');
      pupils = [body.querySelector('#cmb-pupil-l'), body.querySelector('#cmb-pupil-r')].filter(Boolean);
      armR = body.querySelector('#cmb-arm-r'); tailG = body.querySelector('#cmb-tail');
    }).catch(function () { body.insertAdjacentHTML('beforeend', '<img src="/assets/mascot/signal-surfer.svg" alt="" width="64" height="64" draggable="false">'); });
  }

  /* ---------------- moods ---------------- */
  var mood = 'curious', idleT;
  function setMood(m) { mood = m; root.setAttribute('data-mood', m); face.src = '/assets/mascot/' + (ART[m] || ART.curious) + '.svg'; moodEl.textContent = m; }
  function poke() {
    if (mood === 'sleepy') { setMood('curious'); say(pick(['Huh? I’m up!', 'Oh! You’re back.', '*yawn* Where were we?'])); hopUp(); }
    clearTimeout(idleT); idleT = setTimeout(function () { setMood('sleepy'); say('zzz… (move to wake me)', 4000); }, 30000);
  }
  ['pointermove', 'keydown', 'touchstart', 'scroll'].forEach(function (ev) { addEventListener(ev, poke, { passive: true }); });
  function hopUp() { if (still()) return; if (P.mode === 'spring') { P.vy -= 7; kick(); } }

  /* ---------------- physics ---------------- */
  var P = { x: innerWidth - 90, y: innerHeight - 100, vx: 0, vy: 0, tx: 0, ty: 0, mode: 'spring', ang: 0, av: 0, rot: 0, face: 1 };
  var SIZE = 64, mouse = { x: innerWidth / 2, y: innerHeight / 2 }, drag = null, idleUntil = 0, flyT = 0, pointAt = null, last = 0, raf = 0, hopT = 0;
  function dock() { var s = mobile() ? 52 : 64; SIZE = s; return { x: innerWidth - s - 12, y: innerHeight - s - 12 }; }
  function headerBottom() { var hd = document.querySelector('header.top'); if (!hd) return 0; var r = hd.getBoundingClientRect(); return Math.max(0, r.bottom); }
  function chooseTarget() {
    if (drag || P.mode === 'free' || P.mode === 'fly') return;
    var d = dock();
    if (!panel.hidden || st.min || mobile()) { setT(d.x, d.y, 'spring'); return; }
    if (performance.now() < idleUntil && P.perch) { setT(P.perch.x, P.perch.y, 'spring'); return; }
    if (scrollY < 120) { // hang from header by tail
      var hb = headerBottom(); P.anchor = { x: Math.min(78, innerWidth * 0.06 + 20), y: hb }; if (P.mode !== 'hang') { P.mode = 'hang'; P.ang = 0.35; P.av = 0; } return;
    }
    var sec = current(); if (!sec) { setT(d.x, d.y, 'spring'); return; }
    var hd = sec.querySelector('h2') || sec; var r = hd.getBoundingClientRect();
    var range = document.createRange(); range.selectNodeContents(hd); var tr = range.getBoundingClientRect();
    var x = Math.min(tr.right + 14, innerWidth - SIZE - 16), y = r.top - SIZE + 8;
    if (y < headerBottom() + 4 || y > innerHeight - SIZE) { setT(d.x, d.y, 'spring'); pointAt = r; return; }
    pointAt = r; setT(x, y, 'spring');
  }
  function setT(x, y, mode) {
    if (P.mode === 'hang') { P.mode = 'spring'; P.vy = -6; }
    if (Math.abs(x - P.tx) + Math.abs(y - P.ty) > 120 && P.mode === 'spring') { P.vy -= 9; hopT = 30; } // jump between elements
    P.tx = x; P.ty = y; if (mode) P.mode = mode;
  }
  var secs = [], seen = new Map();
  function current() { var best = null, bv = 0; seen.forEach(function (v, k) { if (v > bv) { bv = v; best = k; } }); return best; }
  function step(t) {
    raf = 0; var dt = Math.min(2, (t - (last || t)) / 16.67 || 1); last = t;
    if (P.mode === 'spring') {
      var k = 0.06, c = 0.18;
      P.vx += (k * (P.tx - P.x) - c * P.vx) * dt; P.vy += (k * (P.ty - P.y) - c * P.vy + (hopT > 0 ? 0.25 : 0)) * dt;
      hopT = Math.max(0, hopT - dt);
      if (Math.abs(P.tx - P.x) > 30) P.face = P.tx > P.x ? 1 : -1;
    } else if (P.mode === 'hang') {
      var L = 46; P.av += (-0.004 * Math.sin(P.ang) - 0.012 * P.av) * dt; P.ang += P.av * dt; if (Math.abs(P.av) < 0.0004 && Math.abs(P.ang) < 0.01) { P.av = 0; P.ang = 0; }
      var ax = P.anchor.x + Math.sin(P.ang) * L, ay = P.anchor.y + Math.cos(P.ang) * L - 6;
      P.vx = (ax - P.x) * 0.3; P.vy = (ay - P.y) * 0.3;
      ropePath.setAttribute('d', 'M' + P.anchor.x + ' ' + P.anchor.y + ' Q' + (P.anchor.x + (ax - P.anchor.x) * 0.5 + 10) + ' ' + (P.anchor.y + L * 0.5) + ' ' + (P.x + SIZE * 0.3) + ' ' + (P.y + SIZE * 0.75));
    } else if (P.mode === 'free') {
      P.vy += 0.6 * dt; P.vx *= Math.pow(0.995, dt);
      var fl = innerHeight - SIZE - 8;
      if (P.y > fl) { P.y = fl; P.vy *= -0.45; P.vx *= 0.8; if (Math.abs(P.vy) < 1.2 && Math.abs(P.vx) < 0.5) { P.mode = 'spring'; P.perch = { x: P.x, y: P.y }; idleUntil = performance.now() + 4000; } }
      if (P.x < 4) { P.x = 4; P.vx *= -0.7; } if (P.x > innerWidth - SIZE - 4) { P.x = innerWidth - SIZE - 4; P.vx *= -0.7; }
      if (P.y < 0) { P.y = 0; P.vy *= -0.5; }
    } else if (P.mode === 'fly') {
      flyT += dt; var u = Math.min(1, flyT / 90), F = P.fly;
      var bx = (1 - u) * (1 - u) * F.x0 + 2 * u * (1 - u) * F.cx + u * u * F.x1, by = (1 - u) * (1 - u) * F.y0 + 2 * u * (1 - u) * F.cy + u * u * F.y1;
      P.vx = bx - P.x; P.vy = by - P.y; P.face = P.vx >= 0 ? 1 : -1;
      if (u >= 1) { P.mode = 'spring'; root.classList.remove('cmb-flying'); if (F.done) F.done(); }
    }
    if (!drag) { P.x += P.vx * (P.mode === 'hang' || P.mode === 'fly' ? 1 : dt); P.y += P.vy * (P.mode === 'hang' || P.mode === 'fly' ? 1 : dt); }
    P.x = Math.max(-10, Math.min(innerWidth - SIZE + 10, P.x)); P.y = Math.max(-10, Math.min(innerHeight - SIZE + 10, P.y));
    var tilt = Math.max(-25, Math.min(25, P.vx * 2.2)); if (P.mode === 'hang') tilt = P.ang * 40 + 180;
    var walking = P.mode === 'spring' && Math.abs(P.vx) > 0.6 && Math.abs(P.vy) < 1.5;
    mk.style.transform = 'translate3d(' + P.x.toFixed(1) + 'px,' + P.y.toFixed(1) + 'px,0)';
    body.style.transform = 'rotate(' + tilt.toFixed(1) + 'deg) scaleX(' + P.face + ')' + (walking ? ' translateY(' + (Math.abs(Math.sin(t / 90)) * -4).toFixed(1) + 'px)' : '');
    root.classList.toggle('cmb-hanging', P.mode === 'hang');
    eyes(); arm(t);
    var hangRest = P.mode === 'hang' && P.av === 0 && Math.abs(P.vx) + Math.abs(P.vy) < 0.05;
    if (!hangRest && (Math.abs(P.vx) + Math.abs(P.vy) > 0.05 || P.mode !== 'spring' || drag || walking)) kick(); else setTimeout(kick, 400);
  }
  function kick() { if (!raf && !still()) raf = requestAnimationFrame(step); }
  function eyes() {
    if (!pupils.length) return; var cx = P.x + SIZE / 2, cy = P.y + SIZE * 0.45, dx = mouse.x - cx, dy = mouse.y - cy, d = Math.hypot(dx, dy) || 1;
    var m = Math.min(3, d / 40), px = dx / d * m * P.face, py = dy / d * m; if (P.mode === 'hang') { px = -px; py = -py; }
    pupils.forEach(function (p) { p.setAttribute('transform', 'translate(' + (px - 2).toFixed(2) + ' ' + (py - 2).toFixed(2) + ')'); });
  }
  function arm(t) {
    if (tailG) tailG.setAttribute('transform', 'rotate(' + (Math.sin(t / 400) * 8).toFixed(1) + ' 82 176)');
    if (!armR) return; var a = 0;
    if (pointAt && P.mode === 'spring' && !mobile()) { var dx = (pointAt.left + 40) - (P.x + SIZE / 2), dy = (pointAt.top + pointAt.height / 2) - (P.y + SIZE / 2); a = Math.atan2(dy, dx * P.face) * 180 / Math.PI; a = Math.max(-80, Math.min(40, a)) - 20; }
    armR.setAttribute('transform', 'rotate(' + a.toFixed(1) + ' 152 160)');
  }
  function flyTo(x, y, done) {
    if (still()) { if (done) done(); return; }
    P.fly = { x0: P.x, y0: P.y, x1: x, y1: y, cx: (P.x + x) / 2, cy: Math.min(P.y, y) - 220, done: done }; flyT = 0; P.mode = 'fly'; root.classList.add('cmb-flying'); kick();
  }
  function jetFlyOver() { flyTo(P.x < innerWidth / 2 ? innerWidth - SIZE - 30 : 30, Math.max(headerBottom() + 20, 120), function () { idleUntil = 0; P.perch = null; chooseTarget(); }); say('Wheee!'); }
  function say(t, ms) { bubble.textContent = t; root.classList.toggle('cmb-right', P.x > innerWidth / 2); bubble.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(function () { bubble.classList.remove('on'); }, ms || 2400); }

  /* drag + fling */
  mk.addEventListener('pointerdown', function (e) {
    if (e.button) return; drag = { sx: e.clientX, sy: e.clientY, ox: e.clientX - P.x, oy: e.clientY - P.y, moved: false, hist: [] };
    try { mk.setPointerCapture(e.pointerId); } catch (x) {}
  });
  mk.addEventListener('pointermove', function (e) {
    if (!drag) return; if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
    if (!drag.moved) return; P.mode = 'spring'; P.x = e.clientX - drag.ox; P.y = e.clientY - drag.oy; drag.hist.push([e.clientX, e.clientY, performance.now()]); if (drag.hist.length > 5) drag.hist.shift();
    mk.classList.add('cmb-drag'); kick();
  });
  mk.addEventListener('pointerup', function (e) {
    if (!drag) return; var d = drag; drag = null; mk.classList.remove('cmb-drag');
    if (!d.moved) return;
    mk.dataset.dragged = '1'; setTimeout(function () { delete mk.dataset.dragged; }, 50);
    var a = d.hist[0], b = d.hist[d.hist.length - 1];
    if (a && b && b[2] > a[2]) { P.vx = (b[0] - a[0]) / (b[2] - a[2]) * 16; P.vy = (b[1] - a[1]) / (b[2] - a[2]) * 16; }
    if (still()) { P.perch = { x: P.x, y: P.y }; st.pos = P.perch; save(); place(); return; }
    P.mode = 'free'; say(Math.hypot(P.vx, P.vy) > 15 ? 'Whoa!' : 'Hup!'); kick();
  });
  mk.addEventListener('click', function () { if (mk.dataset.dragged) return; toggle(); });
  addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; if (still()) return; kick(); }, { passive: true });
  addEventListener('scroll', function () { if (P.mode !== 'free' && P.mode !== 'fly') { P.perch = null; idleUntil = 0; } chooseTarget(); kick(); }, { passive: true });
  addEventListener('resize', function () { chooseTarget(); place(); kick(); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.btn.primary, a.open, a.portal, .hero-ctas .btn');
    if (a && !root.contains(a)) { jetFlyOver(); setMood('excited'); }
  });
  function place() { if (!still()) return; var d = st.pos && !mobile() ? st.pos : dock(); P.x = Math.min(d.x, innerWidth - SIZE - 8); P.y = Math.min(d.y, innerHeight - SIZE - 8); mk.style.transform = 'translate3d(' + P.x + 'px,' + P.y + 'px,0)'; body.style.transform = ''; }


  /* ---------------- panel ---------------- */
  function toggle(force, noFocus) {
    var open = force != null ? force : panel.hidden; panel.hidden = !open; st.open = open; st.min = !open; save();
    mk.setAttribute('aria-expanded', String(open)); mk.setAttribute('aria-label', open ? 'Cyph the guide monkey: close chat' : 'Cyph the guide monkey: open chat. You can also drag and fling me.');
    root.classList.toggle('cmb-open', open);
    if (open) { if (!log.children.length) greet(); if (!noFocus) setTimeout(function () { input.focus({ preventScroll: true }); }, 30); }
    chooseTarget(); kick();
  }
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { toggle(false); mk.focus(); } });
  panel.querySelector('[data-a=min]').addEventListener('click', function () { toggle(false); mk.focus(); });
  var ttsBtn = panel.querySelector('[data-a=tts]');
  function ttsUI() { ttsBtn.setAttribute('aria-pressed', String(!!st.tts)); ttsBtn.textContent = st.tts ? 'Voice on' : 'Voice off'; }
  ttsBtn.addEventListener('click', function () { st.tts = !st.tts; save(); ttsUI(); if (!st.tts && window.speechSynthesis) speechSynthesis.cancel(); });
  panel.querySelector('[data-a=tour]').addEventListener('click', function () { ask('Give me the guided tour'); });
  panel.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });

  function add(who, html, keep) {
    var d = h('div', 'cmb-msg cmb-' + who); d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight;
    if (keep !== false) { st.hist.push({ w: who, h: html }); save(); }
    return d;
  }
  function chips(list) {
    quick.innerHTML = '';
    (list || []).forEach(function (c) { var b = h('button', null, c); b.type = 'button'; b.addEventListener('click', function () { ask(c); }); quick.appendChild(b); });
  }
  function link(label, url, nav) {
    var u = safe(url); if (!u) return esc(label);
    var ext = /^https:/.test(u);
    return '<a href="' + esc(u) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + (nav ? ' data-nav="' + esc(nav) + '"' : '') + '>' + esc(label) + (ext ? '<span class="cmb-sr"> (opens a new tab)</span>' : '') + '</a>';
  }
  log.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-nav]'); if (!a) return;
    var el = document.querySelector(a.getAttribute('data-nav')); if (!el) return;
    e.preventDefault(); goTo(el);
  });
  function goTo(el, label) {
    if (typeof el === 'string') el = document.querySelector(el.charAt(0) === '#' ? el : '#' + el);
    if (!el) return;
    el.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'center' });
    el.classList.add('cmb-glow'); setTimeout(function () { el.classList.remove('cmb-glow'); }, 2600);
    if (mobile() && !panel.hidden) toggle(false, true);
    setTimeout(function () {
      if (mobile() || !panel.hidden || still()) return;
      var r = el.getBoundingClientRect(), tx = Math.min(r.right - SIZE / 2, innerWidth - SIZE - 10), ty = Math.max(r.top - SIZE + 10, headerBottom() + 4);
      flyTo(tx, ty, function () { P.perch = { x: tx, y: ty }; idleUntil = performance.now() + 5000; });
    }, still() ? 0 : 450);
    if (label) say(label);
  }
  function speak(t) {
    if (!st.tts || !window.speechSynthesis) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')); u.rate = 1.05; u.pitch = 1.2; speechSynthesis.speak(u); } catch (e) {}
  }
  function reply(r) {
    typing.hidden = false; setMood('think');
    setTimeout(function () {
      typing.hidden = true; add('bot', r.html); speak(r.html); chips(r.chips || defaults()); setMood(r.mood || 'curious');
      if (r.mood === 'excited') hopUp();
      if (r.go) goTo(r.go, r.say);
    }, still() ? 60 : 300 + Math.min(700, r.html.length * 1.5));
  }
  function defaults() { return ['What labs do you have?', 'Build me a path', 'Recommend a lab', 'Quiz me', 'Who made this?']; }

  /* ---------------- retrieval: BM25 + synonyms, typo-tolerant fallback ---------------- */
  var STOP = 'a an the is are am i me my you your to of in on for and or it its this that do does have has with what which who how can please want learn about show tell give some any be at from there here lab labs'.split(' ');
  function stem(w) { return w.length > 4 ? w.replace(/(ing|ers|er|es|s)$/, '') : w; }
  function toks(s) { return (String(s).toLowerCase().match(/[a-z0-9]+/g) || []); }
  var SYN = {};
  function expand(words) { var out = []; words.forEach(function (w) { out.push(stem(w)); (SYN[w] || []).forEach(function (s) { out.push(stem(s)); }); }); return out; }
  function buildIndex() {
    Object.keys(KB.synonyms).forEach(function (k) { var g = [k].concat(KB.synonyms[k]); g.forEach(function (w) { SYN[w] = (SYN[w] || []).concat(g.filter(function (x) { return x !== w; })); }); });
    var docs = [];
    KB.labs.forEach(function (l) { docs.push({ type: 'lab', ref: l, text: [l.title, l.title, l.slug.replace(/-/g, ' '), l.desc, l.topics.join(' '), l.topics.join(' '), l.category.replace(/-/g, ' '), l.secondary.replace(/-/g, ' '), l.level].join(' ') }); });
    KB.side.forEach(function (l) { docs.push({ type: 'side', ref: l, text: [l.title, l.desc, l.topics.join(' ')].join(' ') }); });
    Object.keys(KB.sections).forEach(function (k) { var s = KB.sections[k]; docs.push({ type: 'section', key: k, ref: s, text: [k, k, s.title, s.tip, s.text || ''].join(' ') }); });
    docs.push({ type: 'owner', text: 'who made built creator owner cypher monkey cypher0x9 lifelong student ai builder about me ' + KB.owner.bio });
    var df = {}, N = docs.length, len = 0;
    docs.forEach(function (d) { d.tf = {}; var t = toks(d.text).map(stem); d.len = t.length; len += t.length; t.forEach(function (w) { d.tf[w] = (d.tf[w] || 0) + 1; }); Object.keys(d.tf).forEach(function (w) { df[w] = (df[w] || 0) + 1; }); });
    IDX = { docs: docs, df: df, N: N, avg: len / N };
  }
  function search(q) {
    var qt = expand(toks(q).filter(function (w) { return STOP.indexOf(w) < 0; })), k1 = 1.4, b = .7;
    return IDX.docs.map(function (d) {
      var s = 0; qt.forEach(function (w) { var f = d.tf[w]; if (!f) return; var idf = Math.log(1 + (IDX.N - IDX.df[w] + .5) / (IDX.df[w] + .5)); s += idf * f * (k1 + 1) / (f + k1 * (1 - b + b * d.len / IDX.avg)); });
      return { d: d, s: s };
    }).filter(function (r) { return r.s > 0; }).sort(function (a, b) { return b.s - a.s; });
  }
  function lev(a, b) { if (Math.abs(a.length - b.length) > 2) return 9; var d = [], i, j; for (i = 0; i <= a.length; i++) d[i] = [i]; for (j = 0; j <= b.length; j++) d[0][j] = j; for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
  function fuzzyLab(q) { // typo fallback: "webx", "pyhton", "genesis"
    var qt = toks(q).filter(function (w) { return w.length >= 4 && STOP.indexOf(w) < 0; }), best = null, bs = 0;
    KB.labs.forEach(function (l) { var words = toks(l.title + ' ' + l.slug.replace(/-/g, ' ') + ' ' + l.topics.join(' ')), s = 0;
      qt.forEach(function (t) { var m = 0; words.forEach(function (w) { var d = lev(t, w); if (d === 0) m = Math.max(m, 1); else if (d === 1) m = Math.max(m, .8); else if (d === 2 && t.length >= 6) m = Math.max(m, .5); }); s += m; });
      if (s > bs) { bs = s; best = l; } });
    return bs >= .5 ? best : null;
  }
  function findLab(q) {
    var t = q.toLowerCase();
    var direct = KB.labs.filter(function (l) { return t.indexOf(l.slug.replace(/-lab-grok/, '').replace(/-/g, ' ')) >= 0 || t.indexOf(l.title.toLowerCase().replace(/ lab$/, '')) >= 0 || (l.id.length > 2 && new RegExp('\\b' + l.id + '\\b').test(t)); });
    if (direct.length) return direct[0];
    var r = search(q).filter(function (x) { return x.d.type === 'lab'; });
    return r.length && r[0].s > 1.2 ? r[0].d.ref : null;
  }

  /* ---------------- answers ---------------- */
  function bySlug(s) { return KB.labs.filter(function (l) { return l.slug === s || l.id === s; })[0]; }
  function labCard(l, intro) {
    st.last = { type: 'lab', slug: l.slug }; save();
    return { html: (intro ? esc(intro) + ' ' : '') + '<strong>' + esc(l.title) + '</strong> — ' + esc(l.desc) + '<br><span class="cmb-meta">' + esc(l.meta || l.level) + ' · free</span><br>' +
      link('Portal', l.url) + ' · ' + link('Open the live lab', l.live) + ' · ' + link('Show me on this page', l.anchor, l.anchor),
      chips: ['Take me there', 'What level is it?', 'Something similar', 'Build me a path'], mood: 'excited' };
  }
  function listLabs() {
    var by = {}; KB.labs.forEach(function (l) { (by[l.category] = by[l.category] || []).push(l); });
    var o = 'All <strong>13 free labs</strong>, grouped:<ul class="cmb-list">';
    Object.keys(by).forEach(function (c) { o += '<li><b>' + esc(c.replace(/-/g, ' ')) + ':</b> ' + by[c].map(function (l) { return link(l.title, l.url) + ' <small>(' + esc(l.level) + ')</small>'; }).join(', ') + '</li>'; });
    o += '</ul>Side projects: ' + KB.side.map(function (s) { return link(s.title, s.live); }).join(', ') + '.';
    st.last = { type: 'list' }; save();
    return { html: o, chips: ['Starter labs only', 'I want to learn AI agents', 'Give me the guided tour', 'Recommend a lab'] };
  }
  var PRE = { 'ai': 'python', 'cpaas': 'sip-universe', 'uc': 'sip-universe', 'webex': 'sip-universe', 'microsoft-voice-cc': 'sip-universe', 'amazon-connect': 'sip-universe', 'five9': 'sip-universe', 'genesys-cloud': 'sip-universe', 'nice-cxone': 'sip-universe', 'zoom-talkdesk-avaya': 'sip-universe' };
  function minutes(q) {
    var m = q.match(/(\d+(?:\.\d+)?|an?|one|two|three|half)\s*(?:-|\s)?(hours?|hrs?|h\b|minutes?|mins?|m\b)/i); if (!m) return null;
    var n = { a: 1, an: 1, one: 1, two: 2, three: 3, half: .5 }[m[1].toLowerCase()] || parseFloat(m[1]);
    return /^h/i.test(m[2]) ? Math.round(n * 60) : Math.round(n);
  }
  function path(q) {
    var mins = minutes(q) || 60, topic = q.replace(/\d+|hours?|hrs?|minutes?|mins?|i have|want|and|build|path|plan|learning|make it/gi, ' ');
    var hits = search(topic).filter(function (r) { return r.d.type === 'lab'; }).slice(0, 3).map(function (r) { return r.d.ref; });
    if (!hits.length && st.last && st.last.type === 'lab') hits = [bySlug(st.last.slug)];
    if (!hits.length) hits = [bySlug('sip-universe'), bySlug('python'), bySlug('ba-lab-grok')];
    var main = hits[0], plan = [], pre = PRE[main.slug] && bySlug(PRE[main.slug]);
    if (/agent/i.test(q)) { main = bySlug('ai'); pre = bySlug('python'); hits = [main, bySlug('cpaas')]; }
    if (pre && mins >= 45) plan.push([pre, Math.round(mins * .25), 'warm-up: starter fundamentals']);
    var rest = mins - (plan[0] ? plan[0][1] : 0);
    if (hits[1] && hits[1] !== pre && rest >= 90) { plan.push([main, Math.round(rest * .65), 'main course']); plan.push([hits[1], rest - Math.round(rest * .65), 'stretch: a neighbouring campus']); }
    else plan.push([main, rest, 'main course']);
    st.last = { type: 'lab', slug: main.slug }; save();
    return { html: 'Here’s a <strong>' + mins + '-minute</strong> path:<ol class="cmb-list">' + plan.map(function (p) { return '<li><b>' + p[1] + ' min</b> — ' + link(p[0].title, p[0].url) + ' <small>(' + esc(p[0].level) + ', ' + esc(p[2]) + ')</small></li>'; }).join('') + '</ol>Levels describe the campus, not a required order, and they are not a certificate. Want a quick quiz after?', chips: ['Take me there', 'Quiz me', 'Make it 3 hours', 'Something similar'], mood: 'excited' };
  }
  function quizNext() {
    var q = KB.quiz[Math.floor(Math.random() * KB.quiz.length)]; st.quiz = q; save();
    return { html: '<strong>Quiz:</strong> ' + esc(q.q), chips: q.choices.concat(['Stop quiz']), mood: 'excited' };
  }
  function quizAnswer(t) {
    var q = st.quiz, ok = t.trim().toLowerCase() === q.a.toLowerCase(); st.asked++; if (ok) st.score++; st.quiz = null; save();
    var n = quizNext();
    return { html: (ok ? 'Yes! ' : 'Not quite, it’s <b>' + esc(q.a) + '</b>. ') + 'Score: ' + st.score + '/' + st.asked + '.<br>' + n.html, chips: n.chips, mood: ok ? 'excited' : 'curious' };
  }
  function owner() {
    st.last = { type: 'section', key: 'about' }; save();
    return { html: 'The labs are built by ' + esc(KB.owner.bio).replace('Cypher Monkey', '<strong>Cypher Monkey</strong>') + ' Every lab here is a free, independent learning project.<br>' + link('GitHub', KB.links.github) + ' · ' + link('Linktree', KB.links.linktree) + ' · ' + link('About section', '#about', '#about'), chips: ['Contact', 'What labs do you have?', 'Is this official training?'] };
  }
  function contact() {
    st.last = { type: 'section', key: 'contact' }; save();
    return { html: 'Say hi to Cypher Monkey: the private form lives in the live site’s contact section (' + link('cyphermonkeylabs.com', KB.links.site + '#contact') + '). From this preview you can ' + link('open a public GitHub issue', KB.links.issue) + ' (please don’t put an email address in it; issues are public). Also: ' + link('Linktree', KB.links.linktree) + ' · ' + link('Jump to the contact section', '#contact', '#contact'), chips: ['Take me there', 'Who made this?', 'What labs do you have?'] };
  }
  function section(k) {
    var s = KB.sections[k]; st.last = { type: 'section', key: k }; save();
    return { html: esc(s.text || s.tip) + ' ' + link('Go to ' + (s.title || k), s.anchor, s.anchor), chips: ['Take me there', 'What labs do you have?'] };
  }
  var REC = { 'ai and agents': ['ai', 'python'], 'coding': ['python', 'ai'], 'contact center': ['amazon-connect', 'genesys-cloud', 'five9'], 'phones and protocols': ['sip-universe', 'uc', 'cpaas'], 'business analysis': ['ba-lab-grok', 'ai'], 'cisco / webex': ['webex', 'uc'], 'microsoft teams': ['microsoft-voice-cc', 'uc'], 'brand new to all this': ['sip-universe', 'python', 'ba-lab-grok'] };
  function recommend(k) {
    var ids = REC[k], ls = ids.map(bySlug).filter(Boolean), r = labCard(ls[0], 'My pick:');
    if (ls.length > 1) r.html += '<br>Then try ' + ls.slice(1).map(function (l) { return link(l.title, l.url); }).join(' or ') + '.';
    return r;
  }
  function tour(i) {
    if (i >= KB.labs.length) { st.tour = null; save(); return { html: 'That was all 13 labs! Want a recommendation or a timed path?', chips: ['Recommend a lab', 'Build me a path', 'Quiz me'], mood: 'excited' }; }
    st.tour = i; var l = KB.labs[i]; st.last = { type: 'lab', slug: l.slug }; save();
    return { html: '<b>Tour stop ' + (i + 1) + ' of ' + KB.labs.length + ':</b> <strong>' + esc(l.title) + '</strong> — ' + esc(l.desc) + ' <span class="cmb-meta">(' + esc(l.level) + ')</span><br>' + link('Portal', l.url) + ' · ' + link('Open the live lab', l.live),
      chips: [i + 1 < KB.labs.length ? 'Next lab' : 'Finish tour', 'Stop tour'], go: l.anchor, say: l.title, mood: 'excited' };
  }
  function brain(q) {
    var t = q.toLowerCase().trim();
    if (st.quiz) { if (/stop|quit|exit|enough/.test(t)) { st.quiz = null; save(); return { html: 'Quiz paused. Final score ' + st.score + '/' + st.asked + '.', chips: defaults() }; } if (st.quiz.choices.some(function (c) { return c.toLowerCase() === t; })) return quizAnswer(q); st.quiz = null; save(); }
    if (st.tour != null) { if (/^(next|next lab|continue|go on|finish tour)\b/.test(t)) return tour(st.tour + 1); if (/stop tour|end tour|stop/.test(t)) { st.tour = null; save(); return { html: 'Tour stopped. I’m here if you need me.', chips: defaults() }; } }
    if (/\b(tour|show me around|fly me through|walk me through)\b/.test(t)) return tour(0);
    if (/^(hi|hey|hello|yo|sup|howdy|hola)\b/.test(t)) return { html: pick(['Hey hey! ', 'Hello, explorer! ', 'Oh hi! ']) + 'Ask me about any lab, or say “I have 1 hour and want AI agents”.', chips: defaults(), mood: 'excited' };
    if (/banana/.test(t)) { bananas(); return { html: 'You found the banana stash. Don’t tell the other monkeys.', mood: 'excited' }; }
    if (/\b(thank|thanks|thx|cheers)\b/.test(t)) return { html: 'Any time! Happy learning.', mood: 'excited' };
    if (/\b(quiz|test me)\b/.test(t)) { st.score = 0; st.asked = 0; return quizNext(); }
    if (REC[t]) return recommend(t);
    if (/\b(recommend|suggest|which (lab|one) should|help me (choose|pick)|not sure where)\b/.test(t)) return { html: 'Happy to pick one for you. What are you most into?', chips: Object.keys(REC).map(function (k) { return k.charAt(0).toUpperCase() + k.slice(1); }), mood: 'curious' };
    if (/\b(help|what can you do|commands)\b/.test(t)) return { html: 'I can list the 13 labs, find a lab by topic, build a timed learning path, recommend a lab, quiz you, fly you through a guided tour, take you to any section, and tell you about Cypher Monkey. Voice is off unless you turn it on. Secrets exist.', chips: defaults() };
    if (/who are you|what are you/.test(t)) return { html: 'I’m <strong>Cyph</strong>, the guide monkey of Cypher Monkey Labs. I run entirely in your browser: no servers, no keys. Drag me and fling me if you like.', chips: ['Who made this?', 'What labs do you have?'] };
    if (/(who (made|built|is behind|created|runs|owns)|creator|author|\bowner\b|about (the )?(author|owner|cypher|him)|made this|built this)/.test(t)) return owner();
    if (/\bcontact\b(?!\s*(cent|lab))|\b(reach (you|him|out)|email|get in touch|send (a )?(note|message)|hire|linktree|socials?)\b/.test(t)) return contact();
    // money/job/cert safety. Word boundaries matter: "learn" must not trip "earn".
    if (/\b(income|money|salary|salaries|earn|earning|earnings|get paid|paycheck|job guarantee|guaranteed job|get (me )?a job|certificate|certification|certified|cert)\b/.test(t)) return { html: 'These are free, independent educational projects, not official vendor training and not a certificate. I can’t promise jobs or earnings, but I can help you learn.', chips: ['Build me a path', 'What labs do you have?'] };
    if (/\b(official|vendor|affiliat\w*|endorsed)\b/.test(t)) return { html: esc(KB.disclaimer), chips: defaults() };
    if (/\b(free|cost|price)\b/.test(t)) return { html: 'Every lab is free and open in your browser, no sign-up. ' + esc(KB.disclaimer), chips: defaults() };
    if (/(make it|what about|how about)\s+\d|\b\d+(\.\d+)?\s*(hours?|hrs?|minutes?|mins?)\b|\b(an?|one|two|three|half)\s+(an\s+)?hours?\b|\bpath\b|\bplan\b|roadmap|where (do|should) i start/.test(t)) {
      if (/learning path|the path section/.test(t) && !/\d|hour/.test(t)) return section('path');
      return path(q);
    }
    var follow = /^(take me there|go there|open it|show me( it)?|that one|go|yes|more|tell me more|what level is it\??|which level|something similar|similar)\b/.test(t) || (/\b(it|that|there)\b/.test(t) && t.split(' ').length < 6);
    if (follow && st.last) {
      if (st.last.type === 'lab') {
        var L = bySlug(st.last.slug);
        if (/level/.test(t)) return { html: esc(L.title) + ' is <b>' + esc(L.level) + '</b> level. Starter → Explorer → Navigator describes how deep the campus goes, not a required order.', chips: ['Take me there', 'Something similar'] };
        if (/similar/.test(t)) { var sim = KB.labs.filter(function (x) { return (x.category === L.category || x.secondary === L.category) && x !== L; }); return sim.length ? { html: 'Neighbours of ' + esc(L.title) + ': ' + sim.map(function (x) { return link(x.title, x.url); }).join(', ') + '.', chips: sim.slice(0, 3).map(function (x) { return x.title; }) } : labCard(bySlug('python'), 'Nothing in the same group, but try'); }
        if (/(take|go|show|open|there)/.test(t)) return { html: 'Swinging you to <b>' + esc(L.title) + '</b>. ' + link('Portal', L.url) + ' · ' + link('Live lab', L.live), chips: ['What level is it?', 'Something similar', 'Quiz me'], mood: 'excited', go: L.anchor, say: L.title };
        return labCard(L);
      }
      if (st.last.type === 'section') { var s = KB.sections[st.last.key]; return { html: 'Here you go: the ' + esc(s.title || st.last.key) + ' section.', chips: defaults(), go: s.anchor }; }
      if (st.last.type === 'list') return { html: 'Off to the lab doors!', chips: defaults(), go: '#doors' };
    }
    if (/(what|which|list|all|show|see).*(labs|courses|campus)|^labs\??$|how many labs/.test(t)) return listLabs();
    if (/\b(starter|beginner|new to|easy|fundamentals)\b/.test(t)) { var sl = KB.labs.filter(function (l) { return l.level === 'Starter'; }); st.last = { type: 'list' }; save(); return { html: 'Starter labs: ' + sl.map(function (l) { return link(l.title, l.url) + ' — ' + esc(l.desc); }).join('<br>'), chips: ['Build me a path', 'Quiz me'] }; }
    if (/\b(navigator|advanced|deepest)\b/.test(t)) { var nv = KB.labs.filter(function (l) { return l.level === 'Navigator'; }); return { html: 'Navigator (deepest today): ' + nv.map(function (l) { return link(l.title, l.url); }).join(', ') + '.', chips: ['Build me a path'] }; }
    var nav = t.match(/(?:take me to|go to|open|show me|jump to|navigate to|bring me to|scroll to)\s+(?:the\s+)?(.+)/);
    if (nav) {
      var key = Object.keys(KB.sections).filter(function (k) { return nav[1].indexOf(k) >= 0 || (k === 'doors' && /^labs?\b|doors/.test(nav[1])) || (k === 'hero' && /top|home/.test(nav[1])); })[0];
      var LL = findLab(nav[1]);
      if (LL && !(key && key !== 'doors')) { var c = labCard(LL, 'Here it is!'); c.go = LL.anchor; c.say = LL.title; return c; }
      if (key) { var sc = section(key); sc.go = KB.sections[key].anchor; return sc; }
    }
    if (/\bagents?\b|agentic/.test(t)) return labCard(bySlug('ai'), 'AI agents are where Cypher Monkey is heading too! Start with');
    var lab = findLab(q); if (lab) return labCard(lab);
    var r = search(q);
    if (r.length && r[0].s > .8) {
      var d = r[0].d;
      if (d.type === 'side') return { html: '<strong>' + esc(d.ref.title) + '</strong> — ' + esc(d.ref.desc) + ' ' + link('Open', d.ref.live), chips: defaults() };
      if (d.type === 'section') return section(d.key);
      if (d.type === 'owner') return owner();
    }
    var fz = fuzzyLab(q); if (fz) return labCard(fz, 'Did you mean');
    if (/\b(wfm|crm|e911|recording|analytics)\b/.test(t)) return section('map');
    return { html: pick(['Hmm, my monkey brain came up empty. ', 'That one’s beyond my branch. ']) + 'Try a topic like “SIP”, “routing”, “Python”, ask for a recommendation, or ask for the list of labs.', chips: defaults() };
  }
  function ask(q) {
    q = String(q).trim(); if (!q) return;
    if (panel.hidden) toggle(true, true);
    add('you', esc(q)); input.value = '';
    if (!KB) { reply({ html: 'Still waking up… one sec!' }); return; }
    var r; try { r = brain(q); } catch (e) { r = { html: 'Oops, I slipped on a banana peel. Try asking another way?' }; }
    reply(r);
  }
  window.cmbAsk = ask; // test hook
  function greet() {
    add('bot', 'Hi! I’m <strong>Cyph</strong>, the guide monkey. I know all 13 free labs. Ask me anything, try “I have 1 hour and want AI agents”, take the guided tour, or drag and fling me.');
    chips(['What labs do you have?', 'I want to learn AI agents', 'Recommend a lab', 'Give me the guided tour', 'Quiz me', 'Who made this?', 'Contact']);
  }

  /* ---------------- per-section tips (once each) ---------------- */
  function watchTips() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; var id = e.target.id, s = KB.sections[id]; if (!s || st.seen[id] || !panel.hidden) return;
        st.seen[id] = 1; save(); if (mood !== 'sleepy') setMood('curious'); say(s.tip, mobile() ? 3500 : 6000);
      });
    }, { threshold: .45 });
    Object.keys(KB.sections).forEach(function (k) { var el = document.getElementById(k); if (el) io.observe(el); });
  }

  /* ---------------- easter eggs ---------------- */
  var KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], ki = 0, typed = '';
  addEventListener('keydown', function (e) {
    var k = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
    ki = (k === KON[ki]) ? ki + 1 : (k === KON[0] ? 1 : 0);
    if (ki === KON.length) { ki = 0; setMood('excited'); root.classList.add('cmb-party'); setTimeout(function () { root.classList.remove('cmb-party'); }, 4000); if (!still()) jetFlyOver(); if (!panel.hidden) add('bot', '↑↑↓↓←→←→BA! Party monkey unlocked. +30 lives (in spirit).'); else say('Konami! Party monkey unlocked!'); }
    var tg = e.target; if (tg && /INPUT|TEXTAREA|SELECT/.test(tg.tagName)) return;
    if (k && k.length === 1) { typed = (typed + k).slice(-6); if (typed === 'banana') { bananas(); setMood('excited'); say('BANANA! You speak my language.'); } }
  });
  function bananas() {
    if (still()) return;
    for (var i = 0; i < 14; i++) { var b = h('span', 'cmb-banana', '🍌'); b.setAttribute('aria-hidden', 'true'); b.style.left = Math.random() * 96 + 'vw'; b.style.animationDelay = Math.random() * .8 + 's'; document.body.appendChild(b); setTimeout(b.remove.bind(b), 3400); }
  }

  /* ---------------- phone character: small wave / peek from the dock ---------------- */
  setInterval(function () {
    if (!mobile() || still() || !panel.hidden || mood === 'sleepy' || P.mode !== 'spring' || document.hidden) return;
    var c = Math.random() < .6 ? 'cmb-wave' : 'cmb-peek'; root.classList.add(c); setTimeout(function () { root.classList.remove(c); }, 1700);
  }, 9000);

  /* ---------------- boot ---------------- */
  function boot() {
    document.body.appendChild(root); loadArt(); ttsUI(); setMood('curious');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { seen.set(e.target, e.isIntersecting ? e.intersectionRatio : 0); }); chooseTarget(); kick(); }, { threshold: [0, .15, .3, .5, .75, 1] });
      document.querySelectorAll('main > section[id]').forEach(function (s) { io.observe(s); });
    }
    st.hist.forEach(function (m) { if (m && m.h) add(m.w, m.h, false); });
    fetch(BASE + 'kb.json').then(function (r) { return r.json(); }).then(function (j) {
      KB = j; buildIndex(); watchTips(); if (log.children.length) chips(defaults());
      if (!st.open && !st.hist.length) setTimeout(function () { say('Psst! I’m Cyph. Tap me for help or a tour.', 4000); }, 2200);
    }).catch(function () { KB = null; });
    var d = dock(); P.x = d.x; P.y = d.y; P.tx = d.x; P.ty = d.y;
    if (st.open) toggle(true, true);
    if (still()) { root.classList.add('cmb-still'); place(); } else { chooseTarget(); kick(); }
    if (RM.addEventListener) RM.addEventListener('change', function () { root.classList.toggle('cmb-still', still()); place(); kick(); });
    setInterval(function () { if (!still() && pupils.length && mood !== 'sleepy') { root.classList.add('cmb-blink'); setTimeout(function () { root.classList.remove('cmb-blink'); }, 160); } }, 4200);
    poke();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
