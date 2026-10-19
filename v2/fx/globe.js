/**
 * Interactive lab globe. three.js draws the sphere, arcs, and star points.
 * The backdrop is makeAurora from the Python Lab studio (MIT, CYPHER0X9).
 * Without WebGL the same nodes render as an SVG circle plus a link list.
 */
import {
  AdditiveBlending,
  AmbientLight,
  Color,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  Line2,
  LineGeometry,
  LineMaterial,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  Raycaster,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  BufferGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from './vendor/three/three.module.js';
import { makeAurora } from './vendor/python-lab/aurora.js';
import { safeUrl } from './url.js';
import {
  hasWebGL,
  isPhone,
  onMotionChange,
  pixelRatio,
  prefersReducedMotion,
  startLoop,
} from './motion.js';

const NODE_COLORS = ['#7c5cff', '#3ee0c5', '#ffd166', '#ff8bd2'];

function fibonacci(count, radius) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const n = Math.max(1, count);
  for (let i = 0; i < n; i += 1) {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push(new Vector3(
      Math.cos(theta) * ring * radius,
      y * radius,
      Math.sin(theta) * ring * radius,
    ));
  }
  return points;
}

function arcPositions(a, b) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = mid.length() || 1;
  mid.multiplyScalar((1.32 * a.length()) / len);
  const steps = 16;
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const blended = a.clone().lerp(b, t);
    const bend = Math.sin(Math.PI * t);
    const point = blended.clone().lerp(mid, bend);
    out.push(point.x, point.y, point.z);
  }
  return out;
}

function readNodes(input) {
  const list = Array.isArray(input) ? input : [];
  const base = window.location.href;
  return list.slice(0, 24).map((node, index) => ({
    id: String(node?.id ?? index),
    label: String(node?.label ?? `Node ${index + 1}`).slice(0, 80),
    url: safeUrl(node?.url, base),
  }));
}

function linkList(nodes) {
  const nav = document.createElement('nav');
  nav.className = 'cmfx-globe-list';
  nav.setAttribute('aria-label', 'Labs on the globe');
  nodes.forEach((node) => {
    if (node.url) {
      const anchor = document.createElement('a');
      anchor.href = node.url;
      anchor.textContent = node.label;
      nav.append(anchor);
      return;
    }
    const span = document.createElement('span');
    span.textContent = node.label;
    nav.append(span);
  });
  return nav;
}

function mountFlat(container, nodes, reason) {
  container.dataset.cmfx = 'svg';
  container.classList.add('cmfx-globe');
  const view = document.createElement('div');
  view.className = 'cmfx-globe-view';
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Flat lab graph');
  const ring = document.createElementNS(svgNS, 'circle');
  ring.setAttribute('cx', '100');
  ring.setAttribute('cy', '100');
  ring.setAttribute('r', '72');
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', '#7c5cff');
  ring.setAttribute('stroke-width', '1.5');
  svg.append(ring);
  const coords = nodes.map((node, index) => {
    const angle = (index / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2;
    return {
      node,
      x: 100 + Math.cos(angle) * 72,
      y: 100 + Math.sin(angle) * 72,
    };
  });
  if (coords.length > 1) {
    coords.forEach((a, index) => {
      const b = coords[(index + 1) % coords.length];
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', String(a.x));
      line.setAttribute('y1', String(a.y));
      line.setAttribute('x2', String(b.x));
      line.setAttribute('y2', String(b.y));
      line.setAttribute('stroke', 'rgba(126, 240, 220, 0.45)');
      line.setAttribute('stroke-width', '0.6');
      svg.append(line);
    });
  }
  coords.forEach(({ x, y }) => {
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', String(x));
    dot.setAttribute('cy', String(y));
    dot.setAttribute('r', '3.2');
    dot.setAttribute('fill', '#ffd166');
    svg.append(dot);
  });
  view.append(svg);
  const note = document.createElement('p');
  note.className = 'cmfx-note cmfx-note-inline';
  note.textContent = reason;
  container.append(view, note, linkList(nodes));
  return {
    ready: Promise.resolve(true),
    destroy() {
      container.replaceChildren();
      container.classList.remove('cmfx-globe');
      delete container.dataset.cmfx;
    },
    pause() {},
    resume() {},
    set() {},
  };
}

function disposeTree(root) {
  root.traverse((obj) => {
    if (obj.geometry && !obj.geometry.userData.shared) obj.geometry.dispose?.();
    const material = obj.material;
    const list = Array.isArray(material) ? material : material ? [material] : [];
    list.forEach((item) => {
      item.map?.dispose?.();
      item.dispose?.();
    });
  });
}

function mountWebGL(container, nodes) {
  container.dataset.cmfx = 'webgl';
  container.classList.add('cmfx-globe');
  const view = document.createElement('div');
  view.className = 'cmfx-globe-view';
  view.tabIndex = 0;
  view.setAttribute('role', 'group');
  view.setAttribute('aria-label', 'Lab globe. Drag or use arrow keys to rotate. The lab links follow.');
  const canvas = document.createElement('canvas');
  canvas.className = 'cmfx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const labelLayer = document.createElement('div');
  labelLayer.className = 'cmfx-globe-labels';
  labelLayer.setAttribute('aria-hidden', 'true');
  view.append(canvas, labelLayer);
  container.append(view, linkList(nodes));

  const renderer = new WebGLRenderer({
    canvas,
    antialias: !isPhone(),
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0, 0.18, 3.4);
  const spin = new Group();
  scene.add(spin);
  scene.add(new AmbientLight(0xffffff, 0.7));
  const lamp = new PointLight(0xcbbdff, 6, 24);
  lamp.position.set(2.4, 1.6, 3.2);
  scene.add(lamp);

  const aurora = makeAurora({ ShaderMaterial, Color, PlaneGeometry, Mesh }, '#7c5cff', 16);
  scene.add(aurora.mesh);

  const globe = new Mesh(
    new SphereGeometry(1, isPhone() ? 28 : 40, isPhone() ? 20 : 28),
    new ShaderMaterial({
      transparent: true,
      uniforms: {
        uColor: { value: new Color('#140e2c') },
        uRim: { value: new Color('#8f7dff') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorld;
        void main() {
          vNormal = normalize(mat3(normalMatrix) * normal);
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorld;
        uniform vec3 uColor;
        uniform vec3 uRim;
        void main() {
          vec3 n = normalize(vNormal);
          vec3 viewDir = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 2.15);
          gl_FragColor = vec4(uColor + uRim * fres, 0.95);
        }
      `,
    }),
  );
  spin.add(globe);
  const wire = new Mesh(
    new IcosahedronGeometry(1.035, 1),
    new MeshStandardMaterial({
      color: 0x6d5cff,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    }),
  );
  spin.add(wire);

  const starCount = isPhone() ? 70 : 160;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const radius = 5.5 + Math.random() * 7;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = radius * Math.cos(phi) * 0.7;
    starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new BufferGeometry();
  starGeo.setAttribute('position', new Float32BufferAttribute(starPositions, 3));
  scene.add(new Points(starGeo, new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uColor: { value: new Color('#ddd7ff') } },
    vertexShader: `
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = 2.0;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(uColor, 0.8);
      }
    `,
  })));

  const spots = fibonacci(Math.max(1, nodes.length), 1.06);
  const nodeGeo = new SphereGeometry(0.048, 12, 10);
  nodeGeo.userData.shared = true;
  const nodeMeshes = spots.map((pos, index) => {
    const tint = NODE_COLORS[index % NODE_COLORS.length];
    const mesh = new Mesh(nodeGeo, new MeshStandardMaterial({
      color: tint,
      emissive: tint,
      emissiveIntensity: 0.7,
      roughness: 0.32,
      metalness: 0.08,
    }));
    mesh.position.copy(pos);
    mesh.userData = nodes[index] || { id: String(index), label: '', url: '' };
    spin.add(mesh);
    return mesh;
  });

  const lines = [];
  if (spots.length > 1) {
    spots.forEach((pos, index) => {
      const next = spots[(index + 1) % spots.length];
      const geometry = new LineGeometry();
      geometry.setPositions(arcPositions(pos, next));
      const material = new LineMaterial({
        color: 0x7ee6d4,
        linewidth: 1.4,
        transparent: true,
        opacity: 0.55,
      });
      material.resolution = new Vector2(1, 1);
      const line = new Line2(geometry, material);
      spin.add(line);
      lines.push(line);
    });
  }

  const labelEls = nodeMeshes.map((mesh) => {
    const el = document.createElement('span');
    el.className = 'cmfx-label';
    el.textContent = mesh.userData.label || '';
    labelLayer.append(el);
    return el;
  });

  const raycaster = new Raycaster();
  const pointer = new Vector2(2, 2);
  const world = new Vector3();
  let targetX = 0.25;
  let targetY = 0;
  let dragging = false;
  let moved = 0;
  let lastX = 0;
  let lastY = 0;
  let clock = 0;
  let alive = true;

  function measure() {
    const w = view.clientWidth || 320;
    const h = view.clientHeight || 260;
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    lines.forEach((line) => line.material.resolution.set(w, h));
  }

  const placed = [];
  function placeLabels() {
    placed.length = 0;
    nodeMeshes.forEach((mesh, index) => {
      const el = labelEls[index];
      mesh.getWorldPosition(world);
      const outward = world.clone().normalize();
      const towardCamera = camera.position.clone().sub(world).normalize();
      const front = outward.dot(towardCamera) > 0.2;
      if (!front) {
        el.hidden = true;
        return;
      }
      const projected = world.clone().project(camera);
      const x = (projected.x * 0.5 + 0.5) * view.clientWidth;
      const y = (-projected.y * 0.5 + 0.5) * view.clientHeight;
      const crowded = placed.some((spot) => Math.abs(spot.x - x) < 88 && Math.abs(spot.y - y) < 22);
      if (crowded) {
        el.hidden = true;
        return;
      }
      placed.push({ x, y });
      el.hidden = false;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    });
  }

  function render(dt) {
    if (!alive) return;
    const reduced = prefersReducedMotion();
    if (!reduced && !dragging) targetY += dt * 0.18;
    spin.rotation.y += (targetY - spin.rotation.y) * Math.min(1, dt * 5);
    spin.rotation.x += (targetX - spin.rotation.x) * Math.min(1, dt * 5);
    if (!reduced) clock += dt;
    aurora.update(clock);
    renderer.render(scene, camera);
    placeLabels();
  }

  measure();
  render(0.016);
  const loop = prefersReducedMotion()
    ? { pause() {}, resume() {}, stop() {} }
    : startLoop({
      host: view,
      fps: isPhone() ? 30 : 60,
      onFrame: (dt) => render(dt),
    });

  const unsub = onMotionChange((reduced) => {
    if (reduced) {
      loop.pause();
      render(0);
    } else {
      loop.resume();
    }
  });
  const ro = new ResizeObserver(() => {
    measure();
    render(0);
  });
  ro.observe(view);

  const onDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    moved = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    view.setPointerCapture?.(event.pointerId);
  };
  const onMove = (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    moved += Math.abs(dx) + Math.abs(dy);
    lastX = event.clientX;
    lastY = event.clientY;
    targetY += dx * 0.005;
    targetX = Math.max(-0.85, Math.min(0.85, targetX + dy * 0.005));
    if (prefersReducedMotion()) render(0);
  };
  const onUp = (event) => {
    if (!dragging) return;
    dragging = false;
    if (moved > 8) return;
    const rect = view.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(nodeMeshes, false)[0];
    const url = hit?.object?.userData?.url;
    if (url) window.location.assign(url);
  };
  const onKey = (event) => {
    const step = 0.2;
    if (event.key === 'ArrowLeft') targetY -= step;
    else if (event.key === 'ArrowRight') targetY += step;
    else if (event.key === 'ArrowUp') targetX -= step;
    else if (event.key === 'ArrowDown') targetX += step;
    else return;
    event.preventDefault();
    targetX = Math.max(-0.85, Math.min(0.85, targetX));
    if (prefersReducedMotion()) render(0);
  };
  view.addEventListener('pointerdown', onDown);
  view.addEventListener('pointermove', onMove);
  view.addEventListener('pointerup', onUp);
  view.addEventListener('pointercancel', () => { dragging = false; });
  view.addEventListener('keydown', onKey);

  return {
    ready: Promise.resolve(true),
    pause() { loop.pause(); },
    resume() { if (!prefersReducedMotion()) loop.resume(); },
    set() {},
    destroy() {
      alive = false;
      unsub();
      ro.disconnect();
      loop.stop();
      view.removeEventListener('pointerdown', onDown);
      view.removeEventListener('pointermove', onMove);
      view.removeEventListener('pointerup', onUp);
      view.removeEventListener('keydown', onKey);
      nodeGeo.dispose();
      disposeTree(scene);
      renderer.dispose();
      renderer.forceContextLoss?.();
      container.replaceChildren();
      container.classList.remove('cmfx-globe');
      delete container.dataset.cmfx;
    },
  };
}

export function mount(container, options = {}) {
  if (!container || !container.append) {
    return { destroy() {}, pause() {}, resume() {}, set() {}, ready: Promise.resolve(false) };
  }
  const nodes = readNodes(options.nodes);
  container.replaceChildren();
  if (!hasWebGL()) {
    return mountFlat(container, nodes, 'WebGL is off. The labs are drawn as a flat circle, and every name is a link.');
  }
  try {
    return mountWebGL(container, nodes);
  } catch (err) {
    container.replaceChildren();
    return mountFlat(container, nodes, 'The 3D globe could not start. The labs are listed as links.');
  }
}
