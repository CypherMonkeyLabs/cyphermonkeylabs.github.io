/* Procedural Cypher Monkey. three.js r186 is vendored locally (MIT).
   The monkey is built from primitives so there is no model download. */

const MAX_LOOK = (25 * Math.PI) / 180;

function prefersSaveData() {
  return Boolean(navigator.connection && navigator.connection.saveData);
}

function canWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function mesh(THREE, geometry, material, x, y, z, scale) {
  const node = new THREE.Mesh(geometry, material);
  node.position.set(x, y, z);
  if (scale) node.scale.set(scale[0], scale[1], scale[2]);
  return node;
}

function buildMonkey(THREE, tier) {
  const detail = tier === 'high' ? 1 : 0;
  const fur = new THREE.MeshStandardMaterial({ color: 0xc9895a, roughness: 0.62, metalness: 0.05, flatShading: true });
  const face = new THREE.MeshStandardMaterial({ color: 0xffe0c2, roughness: 0.48, metalness: 0.02 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1033, roughness: 0.35 });
  const white = new THREE.MeshStandardMaterial({ color: 0xfff8ef, roughness: 0.25 });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0xffb703,
    emissiveIntensity: 0.45,
    roughness: 0.32,
  });
  const headGeo = new THREE.IcosahedronGeometry(0.62, detail);
  const earGeo = new THREE.SphereGeometry(0.24, 14, 10);
  const eyeGeo = new THREE.SphereGeometry(0.1, 14, 10);
  const pupilGeo = new THREE.SphereGeometry(0.045, 10, 8);
  const bodyGeo = new THREE.IcosahedronGeometry(0.58, detail);
  const limbGeo = new THREE.SphereGeometry(0.16, 12, 8);
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.add(mesh(THREE, bodyGeo, fur, 0, -0.72, 0, [1.05, 1.15, 0.82]));
  body.add(mesh(THREE, new THREE.SphereGeometry(0.32, 14, 10), face, 0, -0.78, 0.28, [0.9, 0.95, 0.62]));
  const armR = new THREE.Group();
  armR.position.set(0.42, -0.35, 0.08);
  armR.add(mesh(THREE, limbGeo, fur, 0.28, -0.08, 0, [1.7, 0.85, 0.85]));
  armR.add(mesh(THREE, new THREE.SphereGeometry(0.1, 10, 8), face, 0.52, -0.12, 0.05));
  const armL = new THREE.Group();
  armL.position.set(-0.42, -0.38, 0.05);
  armL.add(mesh(THREE, limbGeo, fur, -0.26, -0.12, 0, [1.55, 0.85, 0.85]));
  armL.add(mesh(THREE, new THREE.SphereGeometry(0.1, 10, 8), face, -0.48, -0.18, 0.04));
  body.add(armR, armL);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, -1.15, -0.15),
    new THREE.Vector3(-0.45, -0.85, -0.35),
    new THREE.Vector3(-0.72, -0.25, -0.15),
    new THREE.Vector3(-0.4, 0.15, 0.05),
  ]);
  body.add(new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 18, 0.055, 6, false), fur));
  const head = new THREE.Group();
  head.position.set(0, 0.28, 0);
  head.add(mesh(THREE, headGeo, fur, 0, 0, 0));
  head.add(mesh(THREE, new THREE.SphereGeometry(0.38, 16, 12), face, 0, -0.08, 0.28, [1, 0.86, 0.72]));
  head.add(mesh(THREE, earGeo, fur, -0.62, 0.12, 0, [0.55, 1, 0.45]));
  head.add(mesh(THREE, earGeo, fur, 0.62, 0.12, 0, [0.55, 1, 0.45]));
  head.add(mesh(THREE, new THREE.SphereGeometry(0.12, 10, 8), face, -0.62, 0.12, 0.08, [0.45, 0.75, 0.35]));
  head.add(mesh(THREE, new THREE.SphereGeometry(0.12, 10, 8), face, 0.62, 0.12, 0.08, [0.45, 0.75, 0.35]));
  head.add(mesh(THREE, new THREE.OctahedronGeometry(0.12, 0), gold, 0, 0.62, 0.18));
  const eyeL = new THREE.Group();
  eyeL.position.set(-0.2, 0.08, 0.48);
  const pupilL = mesh(THREE, pupilGeo, dark, 0, 0, 0.07);
  eyeL.add(mesh(THREE, eyeGeo, white, 0, 0, 0), pupilL);
  const eyeR = new THREE.Group();
  eyeR.position.set(0.2, 0.08, 0.48);
  const pupilR = mesh(THREE, pupilGeo, dark, 0, 0, 0.07);
  eyeR.add(mesh(THREE, eyeGeo, white, 0, 0, 0), pupilR);
  head.add(eyeL, eyeR);
  head.add(mesh(THREE, new THREE.SphereGeometry(0.07, 10, 8), dark, 0, -0.08, 0.6));
  const smile = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.16, -0.22, 0.55),
    new THREE.Vector3(0, -0.3, 0.62),
    new THREE.Vector3(0.16, -0.22, 0.55),
  ]);
  head.add(new THREE.Mesh(new THREE.TubeGeometry(smile, 8, 0.018, 5, false), dark));
  if (tier === 'high') {
    const rim = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color('#ffd166') } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vView;
        uniform vec3 uColor;
        void main() {
          float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.4);
          gl_FragColor = vec4(uColor, fresnel * 0.8);
        }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, detail), rim);
    head.add(shell);
  }
  root.add(body, head);
  return { root, head, body, armR, eyeL, eyeR, pupilL, pupilR };
}

function buildParticles(THREE, count, color) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 3.2;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 3.4;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 1.2;
    seeds[index] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
    },
    vertexShader: `
      attribute float aSeed;
      uniform float uTime;
      void main() {
        vec3 moved = position;
        moved.y = mod(moved.y + uTime * (0.12 + aSeed * 0.16) + 1.7, 3.4) - 1.7;
        vec4 mv = modelViewMatrix * vec4(moved, 1.0);
        float size = (1.6 + aSeed * 1.4) * (48.0 / max(2.0, -mv.z));
        gl_PointSize = clamp(size, 1.0, 6.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor;
      void main() {
        vec2 point = gl_PointCoord - vec2(0.5);
        float dist = length(point);
        float alpha = smoothstep(0.5, 0.18, dist) * 0.45;
        gl_FragColor = vec4(uColor * alpha, alpha);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    premultipliedAlpha: true,
  });
  return new THREE.Points(geometry, material);
}

function stripIsWashedOut(renderer) {
  const gl = renderer.getContext();
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  if (width < 4 || height < 4) return false;
  const row = Math.floor(height * 0.28);
  const band = Math.max(1, Math.floor(height * 0.44));
  const pixels = new Uint8Array(width * band * 4);
  gl.readPixels(0, row, width, band, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let white = 0;
  let opaque = 0;
  let sum = 0;
  const count = width * band;
  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const alpha = pixels[index + 3];
    sum += (red + green + blue) / 3;
    if (alpha > 40) opaque += 1;
    if (red > 230 && green > 230 && blue > 230 && alpha > 160) white += 1;
  }
  const mean = sum / count;
  let variance = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const lum = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
    variance += (lum - mean) ** 2;
  }
  variance /= count;
  const whiteShare = white / count;
  const opaqueShare = opaque / count;
  return whiteShare >= 0.45 || (mean > 215 && variance < 80) || opaqueShare < 0.06;
}

export function mountStage(stage) {
  if (!stage || document.documentElement.dataset.motion === 'reduce' || prefersSaveData()) return null;
  const params = new URLSearchParams(location.search);
  if (params.get('webgl') === '0' || !canWebGL()) return null;
  const slot = stage.querySelector('.monkey-slot');
  if (!slot) return null;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  slot.appendChild(canvas);

  let stopped = false;
  let disposed = false;
  let frame = 0;
  let lookX = 0;
  let lookY = 0;
  let wave = 0;
  const started = performance.now();

  const ready = import('../vendor/three/three.module.js').then((THREE) => {
    if (stopped) return null;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const memory = navigator.deviceMemory || 4;
    let tier = !coarse && memory >= 4 ? 'high' : 'medium';
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: tier === 'high' ? 'high-performance' : 'low-power',
      premultipliedAlpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
    camera.position.set(0, 0.15, 4.2);
    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const key = new THREE.PointLight(0xfff4e0, 6, 12, 0.4);
    key.position.set(1.8, 2.2, 2.6);
    const fill = new THREE.PointLight(0x9d8cff, 3.2, 12, 0.5);
    fill.position.set(-2.2, 0.4, 1.4);
    scene.add(key, fill);
    const monkey = buildMonkey(THREE, tier);
    scene.add(monkey.root);
    /* Medium (coarse pointer, low memory, or a slow frame probe) skips the
       point layer. Additive point sprites on an alpha canvas were painting
       an opaque white square over the monkey on touch devices. */
    let particles = tier === 'high' ? buildParticles(THREE, 280, '#c4b5fd') : null;
    if (particles) scene.add(particles);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.18, roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.45;
    scene.add(floor);

    function resize() {
      const width = Math.max(1, slot.clientWidth);
      const height = Math.max(1, slot.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier === 'high' ? 1.25 : 1));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(slot);

    let slowFrames = 0;
    let frames = 0;
    let checks = 0;
    let last = performance.now();
    function dropParticles() {
      if (!particles) return;
      particles.visible = false;
      scene.remove(particles);
      particles.geometry.dispose();
      particles.material.dispose();
      particles = null;
    }
    function releaseRenderer() {
      if (disposed) return;
      disposed = true;
      renderer.dispose();
    }
    function fallbackToPoster() {
      stopped = true;
      cancelAnimationFrame(frame);
      stage.classList.remove('is-awake');
      releaseRenderer();
      if (canvas.isConnected) canvas.remove();
    }
    function tick(now) {
      if (stopped) return;
      frame = requestAnimationFrame(tick);
      const delta = now - last;
      last = now;
      frames += 1;
      if (delta > 34) slowFrames += 1;
      if (tier === 'high' && now - started > 2000 && frames > 20 && slowFrames / frames > 0.4) {
        tier = 'medium';
        dropParticles();
      }
      const t = (now - started) / 1000;
      monkey.body.scale.y = 1 + Math.sin(t * Math.PI * 0.5) * 0.02;
      const blink = Math.sin(t * 0.7) > 0.97 ? 0.12 : 1;
      monkey.eyeL.scale.y = blink;
      monkey.eyeR.scale.y = blink;
      monkey.head.rotation.y += (lookX * MAX_LOOK - monkey.head.rotation.y) * 0.12;
      monkey.head.rotation.x += (lookY * MAX_LOOK * 0.65 - monkey.head.rotation.x) * 0.12;
      monkey.pupilL.position.x = monkey.head.rotation.y * 0.04;
      monkey.pupilR.position.x = monkey.head.rotation.y * 0.04;
      if (wave > 0) {
        wave = Math.max(0, wave - delta);
        monkey.armR.rotation.z = Math.sin((1 - wave / 700) * Math.PI) * 0.9;
      } else {
        monkey.armR.rotation.z += (0 - monkey.armR.rotation.z) * 0.08;
      }
      if (particles) particles.material.uniforms.uTime.value = t;
      renderer.render(scene, camera);
      /* Two readbacks, not one per frame. Chrome logs GL_CLOSE_PATH_NV
         "GPU stall due to ReadPixels" when the drawing buffer is read. */
      const due = (checks === 0 && frames >= 3) || (checks === 1 && now - started > 2100);
      if (due && checks < 2) {
        checks += 1;
        let washed = false;
        try {
          washed = stripIsWashedOut(renderer);
        } catch {
          washed = true;
        }
        if (washed) {
          fallbackToPoster();
          return;
        }
        stage.classList.add('is-awake');
      }
    }
    frame = requestAnimationFrame(tick);

    let visible = true;
    const onScreen = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (!visible) cancelAnimationFrame(frame);
      else frame = requestAnimationFrame(tick);
    });
    onScreen.observe(stage);
    function onHide() {
      if (document.hidden) cancelAnimationFrame(frame);
      else if (visible) frame = requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange', onHide);
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      stopped = true;
      cancelAnimationFrame(frame);
      stage.classList.remove('is-awake');
      canvas.remove();
    });

    return {
      look(x, y) {
        lookX = Math.max(-1, Math.min(1, x));
        lookY = Math.max(-1, Math.min(1, y));
      },
      wave() { wave = 700; },
      setColor(hex) {
        if (particles) particles.material.uniforms.uColor.value.set(hex);
      },
      stop() {
        stopped = true;
        cancelAnimationFrame(frame);
        observer.disconnect();
        onScreen.disconnect();
        document.removeEventListener('visibilitychange', onHide);
        releaseRenderer();
        stage.classList.remove('is-awake');
        canvas.remove();
      },
    };
  }).catch(() => {
    canvas.remove();
    stage.classList.remove('is-awake');
    return null;
  });

  return {
    look(x, y) { ready.then((api) => api && api.look(x, y)); },
    wave() { ready.then((api) => api && api.wave()); },
    setColor(hex) { ready.then((api) => api && api.setColor(hex)); },
    stop() { ready.then((api) => api && api.stop()); },
  };
}
