/* r3: 3D hero, intro, reveals, counters, chimes, magnetic buttons, guide monkey. Progressive: every piece fails soft. */
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const TONES = [0x8fd3ff, 0xffb48f, 0x8ff0c4, 0xc9a8ff, 0x8fd3ff, 0xffb48f, 0xffb48f, 0xffb48f, 0xffb48f, 0x8ff0c4, 0x8fd3ff, 0xc9a8ff, 0xffe28f];

/* ---------- sound: off unless the header toggle is pressed ---------- */
let ac = null;
const soundOn = () => $('#sound-btn')?.getAttribute('aria-pressed') === 'true';
function chime(f = 660, d = 0.18, v = 0.05) {
  if (!soundOn()) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const t = ac.currentTime, o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 1.5;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); o2.connect(g); g.connect(ac.destination); o.start(t); o2.start(t); o.stop(t + d); o2.stop(t + d);
  } catch (e) { /* audio unavailable */ }
}
const SCALE = [523, 587, 659, 784, 880, 1047];
document.addEventListener('pointerover', e => { const a = e.target.closest?.('a,button'); if (a && !a.contains(e.relatedTarget)) chime(SCALE[(a.textContent.length) % SCALE.length], 0.14, 0.025); });
document.addEventListener('click', e => { if (e.target.closest?.('a,button')) chime(1047, 0.3, 0.05); });

/* ---------- cinematic intro (skippable, once per session, skipped for reduced motion) ---------- */
function intro() {
  if (RM || sessionStorage.getItem('cm-r3-intro')) return;
  sessionStorage.setItem('cm-r3-intro', '1');
  const el = document.createElement('div');
  el.className = 'r3-intro'; el.setAttribute('role', 'presentation');
  el.innerHTML = '<div class="r3-intro-in"><img src="/assets/mascot/astronaut.svg" alt="" width="96" height="96"><p>Cypher Monkey Labs</p><small>13 free labs · learning in the open</small></div><button type="button" class="r3-skip">Skip intro</button>';
  document.body.appendChild(el);
  const done = () => { el.classList.add('out'); setTimeout(() => el.remove(), 700); };
  el.querySelector('.r3-skip').addEventListener('click', done);
  addEventListener('keydown', done, { once: true });
  setTimeout(done, 1800);
}

/* ---------- reveals + counters ---------- */
function reveals() {
  const els = $$('.band .sec-head, .band .wrap > *:not(.sec-head), .facts li');
  if (RM || !('IntersectionObserver' in window)) return;
  els.forEach(el => el.classList.add('r3-rv'));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
  setTimeout(() => els.forEach(el => el.classList.add('in')), 6000); // never leave content hidden
}
function counters() {
  $$('.facts b, [data-count]').forEach(b => {
    const m = b.textContent.trim().match(/^(\+?)(\d+)$/); if (!m || RM) return;
    const n = +m[2], pre = m[1], t0 = performance.now(), dur = 1400;
    b.textContent = pre + '0';
    const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); b.textContent = pre + Math.round(n * e); if (p < 1) requestAnimationFrame(step); };
    setTimeout(() => requestAnimationFrame(step), sessionStorage.getItem('cm-r3-intro') ? 400 : 0);
  });
}

/* ---------- magnetic buttons ---------- */
function magnetic() {
  if (RM || !matchMedia('(pointer: fine)').matches) return;
  $$('.btn, .icon-btn').forEach(b => {
    b.classList.add('r3-mag');
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------- astronaut + guide monkey (ported from root, same asset paths) ---------- */
function astronaut() {
  const stage = $('#hero-stage'); if (!stage) return;
  const img = document.createElement('img');
  img.src = '/assets/mascot/astronaut.svg'; img.alt = ''; img.className = 'r3-astro'; img.width = 150; img.height = 150; img.setAttribute('aria-hidden', 'true');
  stage.appendChild(img);
}
function guide() {
  const KEY = 'cm-v2-guide-pos';
  const dock = document.createElement('aside');
  dock.className = 'r3-guide'; dock.setAttribute('aria-label', 'Guide monkey');
  dock.innerHTML = '<div class="r3-guide-panel" hidden><p><strong>Hi, I am the guide monkey.</strong> Where to?</p><div class="r3-guide-actions"><a href="#doors">Labs</a><a href="#trailer">Trailer</a><a href="#map">Map</a><a href="#about">About</a><a href="#contact">Contact</a></div><button type="button" class="r3-guide-home">Put me back</button></div><button class="r3-guide-bot" type="button" aria-expanded="false" aria-label="Guide monkey. Drag me anywhere, or press to open."><img src="/assets/mascot/signal-surfer.svg" alt="" width="64" height="64" draggable="false"></button>';
  document.body.appendChild(dock);
  const bot = $('.r3-guide-bot', dock), panel = $('.r3-guide-panel', dock);
  const place = (x, y) => { x = Math.max(8, Math.min(innerWidth - 80, x)); y = Math.max(8, Math.min(innerHeight - 80, y)); dock.style.left = x + 'px'; dock.style.top = y + 'px'; dock.style.right = 'auto'; dock.style.bottom = 'auto'; };
  try { const p = JSON.parse(localStorage.getItem(KEY)); if (p) place(p.x, p.y); } catch (e) {}
  let sx, sy, ox, oy, moved = false, down = false;
  bot.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sy = e.clientY; const r = dock.getBoundingClientRect(); ox = r.left; oy = r.top; bot.setPointerCapture(e.pointerId); });
  bot.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.hypot(dx, dy) > 5) moved = true; if (moved) place(ox + dx, oy + dy); });
  bot.addEventListener('pointerup', () => { down = false; if (moved) { const r = dock.getBoundingClientRect(); try { localStorage.setItem(KEY, JSON.stringify({ x: r.left, y: r.top })); } catch (e) {} } });
  bot.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; return; } const open = panel.hidden; panel.hidden = !open; bot.setAttribute('aria-expanded', String(open)); });
  $('.r3-guide-home', dock).addEventListener('click', () => { dock.removeAttribute('style'); try { localStorage.removeItem(KEY); } catch (e) {} panel.hidden = true; bot.setAttribute('aria-expanded', 'false'); });
  panel.addEventListener('click', e => { if (e.target.closest('a')) { panel.hidden = true; bot.setAttribute('aria-expanded', 'false'); } });
}

/* ---------- three.js hero scene ---------- */
async function scene() {
  const stage = $('#hero-stage'); if (!stage) return;
  const test = document.createElement('canvas');
  let gl = null; try { gl = test.getContext('webgl2') || test.getContext('webgl'); } catch (e) {}
  if (!gl) return; // CSS ring + aurora stay as the fallback
  let T; try { T = await import('../vendor/three/three.module.js'); } catch (e) { return; }
  const cv = document.createElement('canvas'); cv.className = 'r3-scene'; cv.setAttribute('aria-hidden', 'true');
  stage.prepend(cv);
  let R; try { R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'low-power' }); } catch (e) { cv.remove(); return; }
  R.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const S = new T.Scene(), C = new T.PerspectiveCamera(55, 1, 0.1, 200);
  C.position.set(0, 1.2, 11);
  // starfield with twinkle shader
  const N = innerWidth < 600 ? 1400 : 3200, pos = new Float32Array(N * 3), sz = new Float32Array(N), col = new Float32Array(N * 3);
  const pal = [new T.Color(0xffffff), new T.Color(0x8fd3ff), new T.Color(0xc9a8ff), new T.Color(0xffb48f)];
  for (let i = 0; i < N; i++) { const r = 18 + Math.random() * 60, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.6, r * Math.sin(ph) * Math.sin(th) - 10], i * 3); sz[i] = Math.random() * 2 + 0.6; const c = pal[i % 4]; col.set([c.r, c.g, c.b], i * 3); }
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(pos, 3)); sg.setAttribute('size', new T.BufferAttribute(sz, 1)); sg.setAttribute('color', new T.BufferAttribute(col, 3));
  const sm = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { t: { value: 0 }, px: { value: R.getPixelRatio() } },
    vertexShader: 'attribute float size;attribute vec3 color;varying vec3 vC;varying float vT;uniform float t;uniform float px;void main(){vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);vT=.6+.4*sin(t*1.7+position.x*3.1+position.y*1.3);gl_PointSize=size*px*(60./-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'varying vec3 vC;varying float vT;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);gl_FragColor=vec4(vC,a*vT);}' });
  S.add(new T.Points(sg, sm));
  // nebula backdrop plane
  const neb = new T.Mesh(new T.PlaneGeometry(90, 50), new T.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { t: { value: 0 } },
    vertexShader: 'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec2 vU;uniform float t;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}void main(){vec2 p=vU*vec2(4.,2.2);float f=fbm(p+vec2(t*.02,t*.01)+fbm(p*1.3-t*.015));vec3 c=mix(vec3(.18,.08,.35),vec3(.1,.45,.6),f);c=mix(c,vec3(.9,.45,.4),smoothstep(.55,.85,f)*.6);float m=smoothstep(.0,.5,vU.y)*smoothstep(1.,.5,vU.y)*smoothstep(0.,.3,vU.x)*smoothstep(1.,.7,vU.x);gl_FragColor=vec4(c,f*f*.28*m);}' }));
  neb.position.z = -30; S.add(neb);
  // glow sprite texture
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; const g2 = gc.getContext('2d'), gr = g2.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 128, 128);
  const glowTex = new T.CanvasTexture(gc);
  // core crystal + 13 orbiting lab crystals
  S.add(new T.AmbientLight(0xffffff, 0.5)); const pl = new T.PointLight(0xffffff, 60, 40); pl.position.set(0, 0, 0); S.add(pl);
  const sys = new T.Group(); sys.rotation.x = 0.38; S.add(sys);
  const core = new T.Mesh(new T.IcosahedronGeometry(1.15, 1), new T.MeshStandardMaterial({ color: 0xffe9c9, emissive: 0xffb48f, emissiveIntensity: 0.9, flatShading: true, metalness: 0.2, roughness: 0.35 }));
  sys.add(core);
  const cg = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffc9a0, blending: T.AdditiveBlending, depthWrite: false, transparent: true })); cg.scale.setScalar(6); sys.add(cg);
  const cg2 = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0x9a7bff, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 })); cg2.scale.setScalar(13); sys.add(cg2);
  const labs = TONES.map((tone, i) => {
    const g = new T.Group(), m = new T.Mesh(new T.OctahedronGeometry(0.32, 0), new T.MeshStandardMaterial({ color: tone, emissive: tone, emissiveIntensity: 0.7, flatShading: true, roughness: 0.3 }));
    const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: tone, blending: T.AdditiveBlending, depthWrite: false, transparent: true })); s.scale.setScalar(2.6);
    g.add(m, s); sys.add(g);
    return { g, m, r: 3 + (i % 3) * 1.15, a: (i / 13) * Math.PI * 2, sp: 0.18 - (i % 3) * 0.04, y: Math.sin(i * 2.1) * 0.35 };
  });
  // orbit rings
  for (let k = 0; k < 3; k++) { const r = 3 + k * 1.15, pts = []; for (let j = 0; j <= 128; j++) { const a = j / 128 * 6.283; pts.push(Math.cos(a) * r, 0, Math.sin(a) * r); }
    const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(pts, 3));
    const ring = new T.Points(lg, new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, vertexShader: 'void main(){gl_PointSize=2.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'void main(){gl_FragColor=vec4(.7,.8,1.,.35);}' }));
    sys.add(ring); }
  const LK = 13, PER = 10, lp = new Float32Array(LK * PER * 3);
  const lgeo = new T.BufferGeometry(); lgeo.setAttribute('position', new T.BufferAttribute(lp, 3));
  const links = new T.Points(lgeo, new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { px: { value: R.getPixelRatio() } }, vertexShader: 'uniform float px;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=3.*px*(11./-mv.z);gl_Position=projectionMatrix*mv;}', fragmentShader: 'void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(.75,.85,1.,smoothstep(.5,0.,d)*.8);}' }));
  sys.add(links);
  const tmpA = new T.Vector3(), tmpB = new T.Vector3();
  const updLinks = t => { for (let i = 0; i < LK; i++) { tmpA.copy(labs[i].g.position); tmpB.copy(labs[(i + 1) % LK].g.position); for (let k = 0; k < PER; k++) { const f = ((k / PER) + t * 0.25 + i * 0.07) % 1, j = (i * PER + k) * 3; lp[j] = tmpA.x + (tmpB.x - tmpA.x) * f; lp[j + 1] = tmpA.y + (tmpB.y - tmpA.y) * f; lp[j + 2] = tmpA.z + (tmpB.z - tmpA.z) * f; } } lgeo.attributes.position.needsUpdate = true; };
  let warp = 0;
  addEventListener('cm-warp', () => { warp = 1; });
  stage.classList.add('r3-3d');
  const size = () => { const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight; R.setSize(w, h, false); C.aspect = w / h; const nar = w < 800; C.position.z = nar ? 15 : 11; sys.position.x = nar ? 0 : 3.2; sys.position.y = nar ? 4.6 : 0; sys.scale.setScalar(nar ? 0.44 : 1); R.setPixelRatio(Math.min(devicePixelRatio, nar ? 1.25 : 1.75)); R.setSize(w, h, false); C.updateProjectionMatrix(); };
  size(); addEventListener('resize', size);
  let mx = 0, my = 0, tx = 0, ty = 0, vis = true;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(stage);
  const t0 = performance.now();
  const frame = now => {
    const t = (now - t0) / 1000, sc = Math.min(1, scrollY / innerHeight);
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    sm.uniforms.t.value = t; neb.material.uniforms.t.value = t;
    C.position.x = mx * 2.4; C.position.y = 1.2 - my * 1.6 + sc * 3; C.lookAt(0, sc * -1.5, 0); const pulse = 1 + Math.sin(t * 2) * 0.08; cg.scale.setScalar(6 * pulse); cg2.scale.setScalar(13 * pulse);
    sys.rotation.y = t * 0.05 + sc * 1.2; core.rotation.y = t * 0.4; core.rotation.x = t * 0.25;
    labs.forEach(o => { const a = o.a + t * o.sp; o.g.position.set(Math.cos(a) * o.r, o.y + Math.sin(t + o.a) * 0.15, Math.sin(a) * o.r); o.m.rotation.y = t * 1.2; }); updLinks(t);
    warp *= 0.96; sm.uniforms.px.value = R.getPixelRatio() * (1 + warp * 4); C.position.z = (innerWidth < 800 ? 15 : 11) - warp * 4;
    R.render(S, C);
  };
  if (RM) { frame(t0 + 4000); addEventListener('resize', () => frame(t0 + 4000)); return; }
  R.setAnimationLoop(now => { if (vis && !document.hidden) frame(now); });
}

function holo() {
  $$('.portal').forEach((c, i) => {
    c.classList.add('r3-holo'); c.style.setProperty('--holo', '#' + TONES[i % 13].toString(16).padStart(6, '0'));
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); });
  });
}
function warpBtn() {
  const b = $('.cta-row .btn.primary'); if (!b) return;
  b.addEventListener('click', () => {
    dispatchEvent(new Event('cm-warp')); chime(1319, 0.5, 0.05);
    if (RM) return;
    for (let i = 0; i < 6; i++) { const s = document.createElement('i'); s.className = 'r3-star'; s.style.top = (8 + Math.random() * 50) + 'vh'; s.style.left = (30 + Math.random() * 70) + 'vw'; s.style.animationDelay = (i * 0.08) + 's'; document.body.appendChild(s); setTimeout(() => s.remove(), 1600); }
  });
}
intro(); astronaut(); holo(); warpBtn(); guide(); reveals(); counters(); magnetic();
scene().catch(() => {});
