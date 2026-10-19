/* Cinematic hero: a core, orbit rings of dotted light, 13 lab nodes, signal pulses, and a star shell.
   three.js is vendored at /vendor/three. Renders only while the hero is on screen. */
import * as T from '../../vendor/three/three.module.js';

const ACCENTS = [0x62d4f5, 0xffc65c, 0x6ee7b7, 0x9d8cff]; // voice, contact center, protocols, AI
const NODE_GROUPS = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 3]; // matches the 13 labs by group

export async function mountHero(canvas, hero) {
  const portrait = () => innerWidth < 900;
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  let dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
  renderer.setPixelRatio(dpr); renderer.setClearColor(0x000000, 0);
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(48, 1, 0.1, 200);
  const root = new T.Group(); scene.add(root);

  const glowMat = (size) => new T.ShaderMaterial({
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uS: { value: size }, uPR: { value: dpr } },
    vertexShader: `attribute float aS; attribute vec3 aC; varying vec3 vC; varying float vA; uniform float uT,uS,uPR;
      void main(){ vC=aC; vec4 mv=modelViewMatrix*vec4(position,1.); float tw=.75+.25*sin(uT*1.7+position.x*3.1+position.y*5.3);
      vA=tw; gl_PointSize=aS*uS*uPR*tw*(180./-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5)*2.; if(d>1.) discard;
      float g=pow(1.-d,2.2); gl_FragColor=vec4(vC*(.6+g*1.4),g*vA); }`,
  });
  const points = (arr, cols, sizes, size) => {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(arr, 3)); g.setAttribute('aC', new T.BufferAttribute(cols, 3)); g.setAttribute('aS', new T.BufferAttribute(sizes, 1));
    const m = glowMat(size); const p = new T.Points(g, m); p.frustumCulled = false; return p;
  };
  const col = (hex) => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];

  // stars
  const NS = innerWidth < 700 ? 700 : 1400, sp = new Float32Array(NS * 3), sc = new Float32Array(NS * 3), ss = new Float32Array(NS);
  for (let i = 0; i < NS; i++) {
    const r = 30 + Math.random() * 60, a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1);
    sp.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)], i * 3);
    sc.set(col([0xbcd2ff, 0xffe0b0, 0xc9b8ff][i % 3]), i * 3); ss[i] = 0.35 + Math.random() * 0.9;
  }
  const stars = points(sp, sc, ss, 1.2); scene.add(stars);

  // orbits: dotted rings, each with its own tilt and spin
  const rings = [];
  const radii = [3.4, 5.0, 6.6, 8.2], tilts = [[1.15, 0.2], [0.9, -0.5], [1.3, 0.6], [1.0, 0.1]];
  radii.forEach((r, k) => {
    const N = 150 + k * 30, p = new Float32Array(N * 3), c = new Float32Array(N * 3), s = new Float32Array(N);
    for (let i = 0; i < N; i++) { const a = (i / N) * 6.283; p.set([r * Math.cos(a), 0, r * Math.sin(a)], i * 3); c.set(col(ACCENTS[k]), i * 3); s[i] = 0.6; }
    const pts = points(p, c, s, 1); const g = new T.Group(), inner = new T.Group(); g.rotation.set(tilts[k][0], 0, tilts[k][1]); g.updateMatrix(); inner.add(pts); g.add(inner); root.add(g); rings.push({ g, inner, pts, spin: 0, sp: (k % 2 ? -1 : 1) * (0.06 + k * 0.015) });
  });

  // core: wireframe icosahedron plus a hot center
  const coreMat = new T.ShaderMaterial({
    wireframe: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uT: { value: 0 } },
    vertexShader: `uniform float uT; varying float vF; void main(){ vec3 p=position*(1.+.06*sin(uT*1.4+position.y*4.)); vec4 mv=modelViewMatrix*vec4(p,1.); vF=.5+.5*sin(uT*2.+position.x*6.); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `varying float vF; void main(){ gl_FragColor=vec4(mix(vec3(.38,.83,.96),vec3(.62,.55,1.),vF),.55); }`,
  });
  const core = new T.Mesh(new T.IcosahedronGeometry(1.2, 2), coreMat); root.add(core);
  const hotP = points(new Float32Array([0, 0, 0]), new Float32Array([1, .85, .6]), new Float32Array([9]), 1); root.add(hotP);

  // nodes (13 labs), connections (dotted core->node), pulses
  const NN = 13, nodeBase = [], npos = new Float32Array(NN * 3), ncol = new Float32Array(NN * 3), nsz = new Float32Array(NN);
  for (let i = 0; i < NN; i++) {
    const ring = [0, 1, 2, 3][i % 4], k = Math.floor(i / 4);
    nodeBase.push({ ring, a0: (i / NN) * 6.283 * 2.1 + ring, r: radii[ring] });
    ncol.set(col(ACCENTS[NODE_GROUPS[i]]), i * 3); nsz[i] = 3.4;
  }
  const nodes = points(npos, ncol, nsz, 1); root.add(nodes);
  const CD = 18, cpos = new Float32Array(NN * CD * 3), ccol = new Float32Array(NN * CD * 3), csz = new Float32Array(NN * CD).fill(0.5);
  for (let i = 0; i < NN; i++) for (let j = 0; j < CD; j++) ccol.set(col(ACCENTS[NODE_GROUPS[i]]), (i * CD + j) * 3);
  const conns = points(cpos, ccol, csz, 1); root.add(conns);
  const pulses = points(new Float32Array(NN * 3), ncol.slice(), new Float32Array(NN).fill(3), 1); root.add(pulses);

  const tmp = new T.Vector3(), q = new T.Quaternion(), e = new T.Vector3();
  function nodePos(i, t, out) {
    const nb = nodeBase[i], rg = rings[nb.ring], a = nb.a0 - rg.spin; // inner group rotates +y, so the angle moves the other way in xz
    out.set(nb.r * Math.cos(a), 0, nb.r * Math.sin(a)).applyMatrix4(rg.g.matrix); return out;
  }

  function layout() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    if (portrait()) { cam.position.set(0, 0, 19); root.position.set(0, 5.6, 0); root.scale.setScalar(0.72); }
    else { cam.position.set(0, 0, 17); root.position.set(5.4, 0.6, 0); root.scale.setScalar(1); }
  }
  layout(); addEventListener('resize', layout);

  let mx = 0, my = 0, visible = true, raf = 0, last = 0, t = 0, slow = 0;
  addEventListener('pointermove', (ev) => { mx = ev.clientX / innerWidth - 0.5; my = ev.clientY / innerHeight - 0.5; }, { passive: true });
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible && !raf) loop(performance.now()); }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) loop(performance.now()); });
  canvas.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); cancelAnimationFrame(raf); raf = 0; canvas.classList.remove('on'); document.getElementById('hero-art').classList.remove('live'); });

  function frame(dt) {
    t += dt;
    for (const m of [stars.material, nodes.material, conns.material, pulses.material, hotP.material, ...rings.map((r) => r.pts.material)]) m.uniforms.uT.value = t;
    coreMat.uniforms.uT.value = t;
    rings.forEach((r) => { r.spin += r.sp * dt; r.inner.rotation.y = r.spin; });
    core.rotation.y += dt * 0.25; core.rotation.x += dt * 0.12;
    const np = nodes.geometry.attributes.position.array, cp = conns.geometry.attributes.position.array, pp = pulses.geometry.attributes.position.array;
    for (let i = 0; i < NN; i++) {
      // ring.g.rotation.y is the spin; apply it as extra angle through nodeBase time
      nodePos(i, t, tmp); np[i * 3] = tmp.x; np[i * 3 + 1] = tmp.y; np[i * 3 + 2] = tmp.z;
      for (let j = 0; j < CD; j++) { const f = (j + 1) / (CD + 1); cp.set([tmp.x * f, tmp.y * f, tmp.z * f], (i * CD + j) * 3); }
      const ph = (t * 0.35 + i * 0.173) % 1; pp[i * 3] = tmp.x * ph; pp[i * 3 + 1] = tmp.y * ph; pp[i * 3 + 2] = tmp.z * ph;
    }
    nodes.geometry.attributes.position.needsUpdate = conns.geometry.attributes.position.needsUpdate = pulses.geometry.attributes.position.needsUpdate = true;
    const tx = mx * 0.5, ty = my * 0.3;
    root.rotation.y += (tx - root.rotation.y) * 0.04; root.rotation.x += (ty - root.rotation.x) * 0.04;
    stars.rotation.y += dt * 0.008;
    renderer.render(scene, cam);
  }
  function loop(now) {
    raf = 0; if (!visible || document.hidden) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (dt > 0.034) { if (++slow > 40 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); for (const m of [stars, nodes, conns, pulses, hotP, ...rings.map((r) => r.pts)]) m.material.uniforms.uPR.value = 1; layout(); slow = 0; } } else slow = Math.max(0, slow - 1);
    frame(dt); raf = requestAnimationFrame(loop);
  }
  frame(0); last = 0; raf = requestAnimationFrame(loop);
  return true;
}
