/**
 * Knowledge Universe scene graph.
 * Planets are instanced so ten labs and a hundred labs share one draw path.
 */

import {
  Scene,
  Color,
  Vector3,
  Object3D,
  IcosahedronGeometry,
  SphereGeometry,
  PlaneGeometry,
  BufferGeometry,
  TubeGeometry,
  OctahedronGeometry,
  CatmullRomCurve3,
  Mesh,
  InstancedMesh,
  Points,
  Sprite,
  MeshStandardMaterial,
  ShaderMaterial,
  SpriteMaterial,
  CanvasTexture,
  AdditiveBlending,
  NormalBlending,
  BackSide,
  DoubleSide,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  AmbientLight,
  PointLight,
  Raycaster,
  DynamicDrawUsage,
  Line2,
  LineMaterial,
  LineGeometry,
} from '../../vendor/three/three.module.js';
import { accentHex, hexToRgb } from './palette.js';
import { placePosition } from './layout.js';
import { hashString, mulberry32 } from './math.js';
import {
  ATLAS_COLS,
  ATLAS_ROWS,
  iconIndex,
  makeGlyphAtlas,
  makeNebulaTexture,
  makeSoftTexture,
} from './glyphs.js';

const NOISE = `
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = p * 2.02 + 11.0;
    a *= 0.5;
  }
  return v;
}
`;

const _pos = [0, 0, 0];
const _dummy = new Object3D();
const _color = new Color();
const _ray = new Raycaster();

function segmentsFor(tier, count) {
  let w = tier.seg[0];
  let h = tier.seg[1];
  const budget = Math.max(24000, tier.maxTri * 0.5);
  while (count > 0 && count * w * h * 4 > budget && w > 12) {
    w = Math.max(12, Math.round(w * 0.72));
    h = Math.max(8, Math.round(h * 0.72));
  }
  return [w, h];
}

function crossGeometry(size) {
  const a = new PlaneGeometry(size, size);
  const b = new PlaneGeometry(size, size);
  b.rotateY(Math.PI / 2);
  const parts = [a, b];
  const positions = [];
  const uvs = [];
  parts.forEach((geo) => {
    const index = geo.getIndex();
    const pos = geo.getAttribute('position');
    const uv = geo.getAttribute('uv');
    for (let i = 0; i < index.count; i += 1) {
      const v = index.getX(i);
      positions.push(pos.getX(v), pos.getY(v), pos.getZ(v));
      uvs.push(uv.getX(v), uv.getY(v));
    }
    geo.dispose();
  });
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  return geo;
}

function canvasTexture(canvas) {
  const tex = new CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createUniverseScene({ layout, tier, theme }) {
  const scene = new Scene();
  const resources = [];
  const live = {
    skyMat: null,
    starMats: [],
    starGeos: [],
    mindMat: null,
    corona: null,
    ambient: null,
    point: null,
    planetMesh: null,
    atmoMesh: null,
    glyphMesh: null,
    moonMesh: null,
    glowMesh: null,
    rings: [],
    dustMat: null,
    nebula: [],
    shooters: [],
    comet: null,
    gems: null,
    ribbonMat: null,
    systemMesh: null,
    places: [],
    moons: [],
    gemBases: [],
    hover: [],
    highlight: null,
    focused: null,
    lineMats: [],
    links: [],
    linkKey: '',
    view: { w: 1, h: 1, dpr: 1 },
  };

  function track(obj) {
    resources.push(obj);
    return obj;
  }

  function makeStars(count, radius, themeNow, index) {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const rand = mulberry32(1000 + index * 17 + count);
    const palette = themeNow.stars.map((hex) => new Color(hex));
    for (let i = 0; i < count; i += 1) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = radius * (0.92 + rand() * 0.08);
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.cos(phi) * r * 0.72;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      phases[i] = rand() * Math.PI * 2;
      speeds[i] = 0.5 + rand() * 1.5;
      const color = palette[i % palette.length];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const geo = track(new BufferGeometry());
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('aPhase', new Float32BufferAttribute(phases, 1));
    geo.setAttribute('aSpeed', new Float32BufferAttribute(speeds, 1));
    geo.setAttribute('aColor', new Float32BufferAttribute(colors, 3));
    const mat = track(new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: themeNow.id === 'dawn' ? NormalBlending : AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uFreeze: { value: 0 },
        uSize: { value: (2.1 + index * 0.55) },
        uDpr: { value: 1 },
      },
      vertexShader: `
        attribute float aPhase;
        attribute float aSpeed;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uFreeze;
        uniform float uSize;
        uniform float uDpr;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float tw = 0.55 + 0.45 * sin(uTime * aSpeed + aPhase);
          vAlpha = uFreeze > 0.5 ? 0.75 : tw;
          vColor = aColor;
          gl_PointSize = uSize * uDpr * clamp(240.0 / max(1.0, -mv.z), 0.6, 7.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.15, d) * vAlpha;
          gl_FragColor = vec4(vColor, a);
        }
      `,
    }));
    const points = new Points(geo, mat);
    points.frustumCulled = false;
    points.renderOrder = -10 + index;
    scene.add(points);
    live.starMats.push(mat);
    live.starGeos.push(geo);
  }

  function build(themeNow, tierNow) {
    scene.clear();
    live.starMats = [];
    live.starGeos = [];
    live.rings = [];
    live.lineMats = [];
    live.links = [];
    live.linkKey = '';
    live.nebula = [];
    live.shooters = [];
    live.places = [];
    live.moons = [];
    live.hover = [];
    live.gemBases = [];

    const skyGeo = track(new SphereGeometry(900, 32, 20));
    live.skyMat = track(new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new Color(themeNow.sky[0]) },
        uMid: { value: new Color(themeNow.sky[1]) },
        uBot: { value: new Color(themeNow.sky[2]) },
        uNebA: { value: new Color(themeNow.nebula[0]) },
        uNebB: { value: new Color(themeNow.nebula[1]) },
        uMix: { value: themeNow.nebulaMix },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vDir;
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uBot;
        uniform vec3 uNebA;
        uniform vec3 uNebB;
        uniform float uMix;
        uniform float uTime;
        ${NOISE}
        void main() {
          vec3 dir = normalize(vDir);
          float h = dir.y * 0.5 + 0.5;
          vec3 col = mix(uBot, uMid, smoothstep(0.0, 0.55, h));
          col = mix(col, uTop, smoothstep(0.45, 1.0, h));
          float n = fbm(dir * 2.2 + vec3(uTime * 0.008, 0.0, 0.0));
          vec3 neb = mix(uNebA, uNebB, n);
          col = mix(col, neb, uMix * n);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }));
    const sky = new Mesh(skyGeo, live.skyMat);
    sky.frustumCulled = false;
    sky.renderOrder = -20;
    scene.add(sky);

    const splits = [0.5, 0.3, 0.2];
    const radii = [200, 400, 800];
    splits.forEach((share, index) => {
      const count = Math.max(0, Math.round(tierNow.stars * share));
      if (count > 0) makeStars(count, radii[index], themeNow, index);
    });

    if (tierNow.dust > 0) {
      const count = tierNow.dust;
      const positions = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      const rand = mulberry32(42);
      for (let i = 0; i < count; i += 1) {
        const angle = rand() * Math.PI * 2;
        const radius = 8 + rand() * 32;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = (rand() - 0.5) * 3;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        seeds[i] = rand() * 20;
      }
      const geo = track(new BufferGeometry());
      geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geo.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1));
      live.dustMat = track(new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uDpr: { value: 1 } },
        vertexShader: `
          attribute float aSeed;
          uniform float uTime;
          uniform float uDpr;
          varying float vAlpha;
          void main() {
            float a = atan(position.z, position.x) + uTime * 0.02 + aSeed * 0.01;
            float r = length(position.xz);
            vec3 p = vec3(cos(a) * r, position.y + sin(uTime * 0.15 + aSeed) * 0.25, sin(a) * r);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = 1.6 * uDpr * clamp(80.0 / max(1.0, -mv.z), 0.4, 3.5);
            vAlpha = 0.35;
          }
        `,
        fragmentShader: `
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            gl_FragColor = vec4(vec3(1.0), (1.0 - d * 2.0) * vAlpha);
          }
        `,
      }));
      const dust = new Points(geo, live.dustMat);
      dust.frustumCulled = false;
      dust.renderOrder = -4;
      scene.add(dust);
    }

    const nebulaTex = track(canvasTexture(makeNebulaTexture(7)));
    const nebulaCount = tierNow.nebula;
    for (let i = 0; i < nebulaCount; i += 1) {
      const mat = track(new SpriteMaterial({
        map: nebulaTex,
        color: new Color(themeNow.nebula[i % themeNow.nebula.length]),
        transparent: true,
        depthWrite: false,
        opacity: 0.22,
        blending: themeNow.id === 'starlight' ? AdditiveBlending : NormalBlending,
      }));
      const sprite = new Sprite(mat);
      const dist = 40 + i * 18;
      const ang = i * 1.7;
      sprite.position.set(Math.cos(ang) * dist, (i % 3 - 1) * 8, Math.sin(ang) * dist);
      sprite.scale.set(50 + (i % 4) * 16, 28 + (i % 3) * 10, 1);
      sprite.renderOrder = -15;
      scene.add(sprite);
      live.nebula.push(sprite);
    }

    live.ambient = new AmbientLight(themeNow.ambient, themeNow.ambientIntensity);
    scene.add(live.ambient);
    live.point = new PointLight(0xffe2b0, 1.4, 0, 0);
    scene.add(live.point);

    const mindGeo = track(new IcosahedronGeometry(4, tierNow.starDetail));
    live.mindMat = track(new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(themeNow.starEmissive) },
        uGain: { value: themeNow.starGain },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vObj;
        varying vec3 vNormalW;
        varying vec3 vWorld;
        ${NOISE}
        void main() {
          float n = fbm(normalize(position) * 1.7 + uTime * 0.05);
          vec3 displaced = position + normal * (n - 0.42) * 0.55;
          vec4 world = modelMatrix * vec4(displaced, 1.0);
          vWorld = world.xyz;
          vObj = displaced;
          vNormalW = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uGain;
        varying vec3 vObj;
        varying vec3 vNormalW;
        varying vec3 vWorld;
        ${NOISE}
        void main() {
          float n = fbm(normalize(vObj) * 1.8 + uTime * 0.05);
          vec3 hot = mix(uColor, vec3(1.0, 0.84, 0.48), smoothstep(0.58, 0.96, n));
          vec3 viewDir = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - max(dot(normalize(vNormalW), viewDir), 0.0), 2.2);
          gl_FragColor = vec4(hot * uGain + fres * uColor * 0.35, 1.0);
        }
      `,
    }));
    scene.add(new Mesh(mindGeo, live.mindMat));
    const soft = track(canvasTexture(makeSoftTexture()));
    live.corona = new Sprite(track(new SpriteMaterial({
      map: soft,
      color: new Color(themeNow.starEmissive),
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: themeNow.id === 'dawn' ? 0.34 : 0.55,
    })));
    live.corona.scale.set(12.8, 12.8, 1);
    live.corona.renderOrder = 1;
    scene.add(live.corona);

    buildBodies(themeNow, tierNow, soft);
    buildGems(tierNow, themeNow);
    buildRibbon(themeNow);
    buildShooters(tierNow, themeNow, soft);
    buildComets(tierNow);
    if (layout.mode === 'galaxy') buildSystems(themeNow);
  }

  function planetColor(place, themeNow) {
    if (themeNow.id === 'contrast') return new Color(accentHex(themeNow, place.lab.accent));
    if (place.lab.color && themeNow.id === 'dawn') return new Color(place.lab.color);
    return new Color(accentHex(themeNow, place.lab.accent));
  }

  function buildBodies(themeNow, tierNow, soft) {
    const source = layout.mode === 'galaxy' ? [] : layout.planets;
    const capacity = layout.mode === 'galaxy'
      ? Math.max(1, ...layout.systems.map((system) => system.planets.length))
      : Math.max(1, layout.planets.length);
    const [segW, segH] = segmentsFor(tierNow, Math.max(source.length, capacity));
    const geo = track(new SphereGeometry(1, segW, segH));
    const emis = new Float32Array(capacity);
    emis.fill(0.18);
    geo.setAttribute('aEmis', new InstancedBufferAttribute(emis, 1));
    const mat = track(new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.1,
      emissive: 0x000000,
    }));
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aEmis;\nvarying float vEmis;\nvarying float vLat;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEmis = aEmis;\nvLat = position.y;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vEmis;\nvarying float vLat;')
        .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= (0.72 + 0.08 * sin(vLat * 11.0));')
        .replace(
          'vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',
          'vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance + diffuseColor.rgb * vEmis;',
        );
    };
    mat.customProgramCacheKey = () => 'cml-planet-v1';
    const mesh = new InstancedMesh(geo, mat, capacity);
    mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
    mesh.count = 0;
    mesh.frustumCulled = false;
    scene.add(mesh);
    live.planetMesh = mesh;

    const atmoGeo = track(new SphereGeometry(1.12, Math.max(16, segW >> 1), Math.max(12, segH >> 1)));
    const atmoMat = track(new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: BackSide,
      uniforms: { uGain: { value: themeNow.rimMode === 'boost' ? 1.4 : 1 } },
      vertexShader: `
        varying vec3 vColor;
        varying vec3 vNormalW;
        varying vec3 vWorld;
        void main() {
          vColor = instanceColor;
          vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying vec3 vNormalW;
        varying vec3 vWorld;
        uniform float uGain;
        void main() {
          vec3 n = normalize(vNormalW);
          vec3 v = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - abs(dot(n, v)), 2.5) * 1.4 * uGain;
          gl_FragColor = vec4(vColor, clamp(fres, 0.0, 1.0));
        }
      `,
    }));
    const atmo = new InstancedMesh(atmoGeo, atmoMat, capacity);
    atmo.instanceColor = new InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
    atmo.count = 0;
    atmo.frustumCulled = false;
    atmo.renderOrder = 2;
    scene.add(atmo);
    live.atmoMesh = atmo;

    const glyphGeo = track(crossGeometry(0.72));
    const atlas = track(canvasTexture(makeGlyphAtlas()));
    glyphGeo.setAttribute('aIcon', new InstancedBufferAttribute(new Float32Array(capacity), 1));
    const glyphMat = track(new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      uniforms: {
        uAtlas: { value: atlas },
        uCols: { value: ATLAS_COLS },
        uRows: { value: ATLAS_ROWS },
      },
      vertexShader: `
        attribute float aIcon;
        varying vec2 vUv;
        varying float vIcon;
        varying vec3 vColor;
        void main() {
          vUv = uv;
          vIcon = aIcon;
          vColor = instanceColor;
          vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        uniform sampler2D uAtlas;
        uniform float uCols;
        uniform float uRows;
        varying vec2 vUv;
        varying float vIcon;
        varying vec3 vColor;
        void main() {
          float col = mod(vIcon, uCols);
          float row = floor(vIcon / uCols);
          vec2 uv = (vUv + vec2(col, uRows - 1.0 - row)) / vec2(uCols, uRows);
          vec4 tex = texture2D(uAtlas, uv);
          if (tex.a < 0.4) discard;
          gl_FragColor = vec4(vColor, tex.a);
        }
      `,
    }));
    const glyphs = new InstancedMesh(glyphGeo, glyphMat, capacity);
    glyphs.instanceColor = new InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
    glyphs.count = 0;
    glyphs.frustumCulled = false;
    glyphs.renderOrder = 4;
    scene.add(glyphs);
    live.glyphMesh = glyphs;

    const moonCap = Math.max(1, capacity * 3);
    const moonGeo = track(new SphereGeometry(0.22, 10, 8));
    const moonMat = track(new MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0 }));
    const moons = new InstancedMesh(moonGeo, moonMat, moonCap);
    moons.instanceColor = new InstancedBufferAttribute(new Float32Array(moonCap * 3), 3);
    moons.count = 0;
    moons.frustumCulled = false;
    scene.add(moons);
    live.moonMesh = moons;

    const glowGeo = track(new PlaneGeometry(1, 1));
    const glowMat = track(new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uMap: { value: soft } },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vColor;
        void main() {
          vUv = uv;
          vColor = instanceColor;
          vec3 center = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          float s = length(vec3(instanceMatrix[0][0], instanceMatrix[0][1], instanceMatrix[0][2]));
          vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
          vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
          vec3 world = center + (right * position.x + up * position.y) * s;
          gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        varying vec2 vUv;
        varying vec3 vColor;
        void main() {
          float a = texture2D(uMap, vUv).a * 0.5;
          gl_FragColor = vec4(vColor, a);
        }
      `,
    }));
    const glow = new InstancedMesh(glowGeo, glowMat, capacity);
    glow.instanceColor = new InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
    glow.count = 0;
    glow.frustumCulled = false;
    glow.visible = !tierNow.bloom;
    glow.renderOrder = 0;
    scene.add(glow);
    live.glowMesh = glow;

    if (layout.mode !== 'galaxy') {
      setActivePlanets(layout.planets, themeNow);
      buildRingLines(layout.rings, themeNow);
    }
  }

  function setActivePlanets(planets, themeNow) {
    live.places = planets;
    live.hover = planets.map(() => 0);
    const count = planets.length;
    live.planetMesh.count = count;
    live.atmoMesh.count = count;
    live.glyphMesh.count = count;
    live.glowMesh.count = count;
    live.planetMesh.visible = count > 0;
    live.atmoMesh.visible = count > 0;
    live.glyphMesh.visible = count > 0;
    const iconAttr = live.glyphMesh.geometry.getAttribute('aIcon');
    const moonList = [];
    planets.forEach((place, index) => {
      const color = planetColor(place, themeNow);
      const rim = themeNow.rimMode === 'lighten'
        ? color.clone().lerp(new Color('#ffffff'), 0.2)
        : color.clone().multiplyScalar(1.15);
      live.planetMesh.setColorAt(index, color);
      live.atmoMesh.setColorAt(index, rim);
      live.glyphMesh.setColorAt(index, color);
      live.glowMesh.setColorAt(index, color);
      iconAttr.setX(index, iconIndex(place.lab.icon));
      for (let m = 0; m < place.moons; m += 1) {
        moonList.push({
          index,
          slot: moonList.length,
          phase: hashString(place.id + m) * 0.01,
          dist: 1.8 + m * 0.3,
        });
      }
    });
    iconAttr.needsUpdate = true;
    live.planetMesh.instanceColor.needsUpdate = true;
    live.atmoMesh.instanceColor.needsUpdate = true;
    live.glyphMesh.instanceColor.needsUpdate = true;
    live.glowMesh.instanceColor.needsUpdate = true;
    live.moons = moonList;
    live.moonMesh.count = moonList.length;
    live.moonMesh.visible = moonList.length > 0;
    moonList.forEach((moon) => {
      const color = planetColor(planets[moon.index], themeNow);
      live.moonMesh.setColorAt(moon.slot, color.clone().lerp(new Color('#ffffff'), 0.35));
    });
    if (live.moonMesh.instanceColor) live.moonMesh.instanceColor.needsUpdate = true;
    writeBodies(0, 0, true);
  }

  function buildRingLines(rings, themeNow) {
    live.rings.forEach((line) => {
      scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });
    live.rings = [];
    live.lineMats = live.lineMats.filter((mat) => !mat.userData || mat.userData.role !== 'ring');
    rings.forEach((def) => {
      const positions = [];
      const steps = 128;
      for (let i = 0; i <= steps; i += 1) {
        const angle = (i / steps) * Math.PI * 2;
        const x = Math.cos(angle) * def.r;
        const z0 = Math.sin(angle) * def.r;
        positions.push(
          x + def.ox,
          Math.sin(def.tilt) * z0 + def.oy,
          Math.cos(def.tilt) * z0 + def.oz,
        );
      }
      const geo = track(new LineGeometry());
      geo.setPositions(positions);
      const mat = track(new LineMaterial({
        color: new Color(themeNow.ring),
        linewidth: 1.5,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }));
      mat.dashed = true;
      mat.dashSize = 0.6;
      mat.gapSize = 0.4;
      mat.userData.role = 'ring';
      const line = new Line2(geo, mat);
      line.computeLineDistances();
      line.frustumCulled = false;
      line.userData.ring = def.ring;
      line.userData.base = themeNow.ring;
      scene.add(line);
      live.rings.push(line);
      live.lineMats.push(mat);
    });
  }

  function buildSystems(themeNow) {
    const systems = layout.systems || [];
    const geo = track(new IcosahedronGeometry(1.7, 2));
    const mat = track(new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.45,
      roughness: 0.4,
      metalness: 0.05,
    }));
    const mesh = new InstancedMesh(geo, mat, Math.max(1, systems.length));
    mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(Math.max(1, systems.length) * 3), 3);
    mesh.count = systems.length;
    mesh.frustumCulled = false;
    systems.forEach((system, index) => {
      _dummy.position.set(system.x, system.y, system.z);
      _dummy.scale.setScalar(1);
      _dummy.updateMatrix();
      mesh.setMatrixAt(index, _dummy.matrix);
      mesh.setColorAt(index, new Color(accentHex(themeNow, categoryAccent(system.category))));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
    live.systemMesh = mesh;
  }

  function categoryAccent(id) {
    if (id === 'contact-center') return 'peach';
    if (id === 'unified-comms') return 'sky';
    if (id === 'protocols') return 'mint';
    if (id === 'ai') return 'lavender';
    if (id === 'tools') return 'butter';
    return 'pink';
  }

  function buildGems(tierNow, themeNow) {
    const count = tierNow.gems;
    if (!count) return;
    const geo = track(new OctahedronGeometry(0.35, 0));
    const mat = track(new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec3 vNormalW;
        varying vec3 vWorld;
        varying vec3 vColor;
        void main() {
          vColor = instanceColor;
          vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        varying vec3 vNormalW;
        varying vec3 vWorld;
        varying vec3 vColor;
        void main() {
          vec3 n = normalize(vNormalW);
          vec3 v = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - max(dot(n, v), 0.0), 1.6);
          float hue = fract(dot(n, v) * 1.7 + vWorld.x * 0.01);
          vec3 iri = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
          vec3 col = mix(vColor, iri, 0.55) + fres * 0.8;
          gl_FragColor = vec4(col, 0.92);
        }
      `,
    }));
    const mesh = new InstancedMesh(geo, mat, count);
    mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(count * 3), 3);
    mesh.frustumCulled = false;
    const rand = mulberry32(99);
    const look = Math.atan2(-10, 2);
    for (let i = 0; i < count; i += 1) {
      const along = i < count * 0.75 ? look + (rand() - 0.5) * 1.1 : rand() * Math.PI * 2;
      const radius = 70 + rand() * 8;
      const x = Math.cos(along) * radius + 60;
      const y = (rand() - 0.5) * 10;
      const z = Math.sin(along) * radius;
      const scale = 3.2 + rand() * 4.2;
      live.gemBases.push({ x, y, z, scale, spin: rand() * Math.PI, speed: 0.2 + rand() * 0.4 });
      _color.set(themeNow.id === 'contrast' ? '#5B21B6' : '#FFE8A3');
      if (i % 3 === 1) _color.set('#C9B8FF');
      if (i % 3 === 2) _color.set('#FFC6E0');
      mesh.setColorAt(i, _color);
    }
    mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
    live.gems = mesh;
  }

  function buildRibbon(themeNow) {
    const curve = new CatmullRomCurve3([
      new Vector3(-90, -4, -40),
      new Vector3(-78, -1, -30),
      new Vector3(-64, 1, -22),
      new Vector3(-50, 3, -12),
      new Vector3(-38, 4, -2),
      new Vector3(-28, 5, 4),
      new Vector3(-20, 6, 10),
    ]);
    const geo = track(new TubeGeometry(curve, 200, 0.25, 8, false));
    live.ribbonMat = track(new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uSky: { value: new Color('#A7D8FF') },
        uPeach: { value: new Color('#FFB4A2') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uSky;
        uniform vec3 uPeach;
        void main() {
          float dash = smoothstep(0.35, 0.55, fract(vUv.x * 28.0 - uTime * 0.6));
          vec3 col = mix(uSky, uPeach, smoothstep(0.35, 0.7, vUv.x));
          float alpha = (0.25 + 0.75 * dash) * 0.85;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    }));
    if (themeNow.id === 'contrast') {
      live.ribbonMat.uniforms.uSky.value.set('#075985');
      live.ribbonMat.uniforms.uPeach.value.set('#9A3412');
    }
    const mesh = new Mesh(geo, live.ribbonMat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    scene.add(mesh);
  }

  function buildShooters(tierNow, themeNow, soft) {
    const pool = tierNow.shooters;
    for (let i = 0; i < pool; i += 1) {
      const positions = new Float32Array(24 * 3);
      const geo = track(new LineGeometry());
      geo.setPositions(positions);
      const mat = track(new LineMaterial({
        color: new Color(themeNow.shooter),
        linewidth: 2,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }));
      const line = new Line2(geo, mat);
      line.frustumCulled = false;
      line.visible = false;
      scene.add(line);
      const head = new Sprite(track(new SpriteMaterial({
        map: soft,
        color: new Color(themeNow.shooter),
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        opacity: 0.9,
      })));
      head.scale.set(1.4, 1.4, 1);
      head.visible = false;
      scene.add(head);
      live.lineMats.push(mat);
      live.shooters.push({
        line,
        head,
        mat,
        positions,
        life: 0,
        wait: 3 + i * 4 + (hashString(`star-${i}`) % 80) / 10,
        dir: new Vector3(),
        cursor: new Vector3(),
      });
    }
  }

  function buildComets(tierNow) {
    const count = tierNow.comets;
    if (!count) {
      live.comet = null;
      return;
    }
    const positions = new Float32Array(count * 3);
    const ages = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    const geo = track(new BufferGeometry());
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('aAge', new Float32BufferAttribute(ages, 1));
    geo.setAttribute('aColor', new Float32BufferAttribute(colors, 3));
    geo.getAttribute('position').setUsage(DynamicDrawUsage);
    geo.getAttribute('aAge').setUsage(DynamicDrawUsage);
    const mat = track(new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uDpr: { value: 1 } },
      vertexShader: `
        attribute float aAge;
        attribute vec3 aColor;
        uniform float uDpr;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          vAlpha = aAge <= 0.0 ? 0.0 : aAge;
          vColor = aColor;
          gl_PointSize = (aAge <= 0.0 ? 0.0 : 5.0) * uDpr * clamp(120.0 / max(1.0, -mv.z), 0.5, 6.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          if (vAlpha <= 0.01) discard;
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vColor, (1.0 - d * 2.0) * vAlpha);
        }
      `,
    }));
    const points = new Points(geo, mat);
    points.frustumCulled = false;
    points.renderOrder = 3;
    scene.add(points);
    live.comet = { points, positions, ages, colors, vels, cursor: 0, life: 1.2 };
  }

  function writeBodies(time, dt, snap) {
    const places = live.places;
    const emis = live.planetMesh.geometry.getAttribute('aEmis');
    let emisDirty = false;
    for (let i = 0; i < places.length; i += 1) {
      const place = places[i];
      const target = live.highlight === place.id ? 1 : 0;
      if (snap) live.hover[i] = target;
      else live.hover[i] += (target - live.hover[i]) * (1 - Math.exp(-dt / 0.12));
      const hover = live.hover[i];
      placePosition(place, time, _pos);
      place.worldX = _pos[0];
      place.worldY = _pos[1];
      place.worldZ = _pos[2];
      const scale = place.size * (1 + 0.25 * hover);
      _dummy.position.set(_pos[0], _pos[1], _pos[2]);
      _dummy.scale.setScalar(scale);
      _dummy.rotation.set(0, 0, 0);
      _dummy.updateMatrix();
      live.planetMesh.setMatrixAt(i, _dummy.matrix);
      _dummy.scale.setScalar(scale);
      _dummy.updateMatrix();
      live.atmoMesh.setMatrixAt(i, _dummy.matrix);
      const bob = snap ? 0 : Math.sin((time / 3.2) * Math.PI * 2 + i) * 0.08;
      const spin = snap ? 0 : time * 0.4;
      _dummy.position.set(_pos[0], _pos[1] + place.size + 1.6 + bob, _pos[2]);
      _dummy.scale.setScalar(1);
      _dummy.rotation.set(0, spin, 0);
      _dummy.updateMatrix();
      live.glyphMesh.setMatrixAt(i, _dummy.matrix);
      _dummy.position.set(_pos[0], _pos[1], _pos[2]);
      _dummy.scale.setScalar(place.size * 3.4);
      _dummy.rotation.set(0, 0, 0);
      _dummy.updateMatrix();
      live.glowMesh.setMatrixAt(i, _dummy.matrix);
      const nextEmis = 0.18 + (1.6 - 0.18) * hover;
      if (Math.abs(emis.getX(i) - nextEmis) > 0.002) {
        emis.setX(i, nextEmis);
        emisDirty = true;
      }
    }
    if (places.length) {
      live.planetMesh.instanceMatrix.needsUpdate = true;
      live.atmoMesh.instanceMatrix.needsUpdate = true;
      live.glyphMesh.instanceMatrix.needsUpdate = true;
      live.glowMesh.instanceMatrix.needsUpdate = true;
    }
    if (emisDirty) emis.needsUpdate = true;

    live.moons.forEach((moon) => {
      const place = places[moon.index];
      if (!place) return;
      const ang = (snap ? moon.phase : time * 0.6 + moon.phase);
      const dist = moon.dist * place.size;
      _dummy.position.set(
        place.worldX + Math.cos(ang) * dist,
        place.worldY + Math.sin(ang * 1.3) * 0.15,
        place.worldZ + Math.sin(ang) * dist,
      );
      _dummy.scale.setScalar(1);
      _dummy.rotation.set(0, 0, 0);
      _dummy.updateMatrix();
      live.moonMesh.setMatrixAt(moon.slot, _dummy.matrix);
    });
    if (live.moons.length) live.moonMesh.instanceMatrix.needsUpdate = true;

    const hotRing = new Set();
    if (live.highlight) {
      const hit = places.find((place) => place.id === live.highlight);
      if (hit) hotRing.add(hit.ring);
    }
    live.rings.forEach((line) => {
      const hot = hotRing.has(line.userData.ring);
      line.material.opacity = hot ? 0.9 : 0.35;
    });
  }

  function syncConstellations() {
    const pairs = [];
    const current = live.highlight
      ? live.places.find((place) => place.id === live.highlight)
      : null;
    if (current) {
      const tags = new Set(current.lab.tags || []);
      live.places.forEach((place) => {
        if (place !== current && (place.lab.tags || []).some((tag) => tags.has(tag))) pairs.push(place);
      });
    }
    const key = current ? `${current.id}:${pairs.map((place) => place.id).sort().join(',')}` : '';
    if (key !== live.linkKey) {
      live.linkKey = key;
      live.links.forEach((line) => {
        scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
      });
      live.links = pairs.map(() => {
        const geo = new LineGeometry();
        geo.setPositions([0, 0, 0, 0.01, 0, 0]);
        const mat = new LineMaterial({
          color: new Color(accentHex(theme, current.lab.accent)),
          linewidth: live.view.w >= 2200 ? 2 : 1.5,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        });
        mat.dashed = true;
        mat.dashSize = 0.45;
        mat.gapSize = 0.28;
        mat.resolution.set(live.view.w, live.view.h);
        const line = new Line2(geo, mat);
        line.computeLineDistances();
        line.frustumCulled = false;
        line.userData.born = performance.now();
        scene.add(line);
        return line;
      });
    }
    live.links.forEach((line, index) => {
      const other = pairs[index];
      if (!current || !other) return;
      line.geometry.setPositions([
        current.worldX || 0, current.worldY || 0, current.worldZ || 0,
        other.worldX || 0, other.worldY || 0, other.worldZ || 0,
      ]);
      line.computeLineDistances();
      const age = Math.min(1, (performance.now() - line.userData.born) / 600);
      line.material.opacity = 0.6 * age;
      if (line.material.dashOffset !== undefined) line.material.dashOffset = 1 - age;
    });
  }

  function updateComets(time, dt) {
    const comet = live.comet;
    if (!comet) return;
    const sources = live.places.filter((place) => place.lab.isNew);
    sources.forEach((place) => {
      const per = Math.max(1, Math.floor(comet.positions.length / 3 / Math.max(1, sources.length)));
      for (let n = 0; n < 2; n += 1) {
        if (per < 1) break;
        const slot = comet.cursor % (comet.positions.length / 3);
        comet.cursor += 1;
        const ox = place.worldX || 0;
        const oy = place.worldY || 0;
        const oz = place.worldZ || 0;
        const len = Math.hypot(ox, oy, oz) || 1;
        comet.positions[slot * 3] = ox;
        comet.positions[slot * 3 + 1] = oy;
        comet.positions[slot * 3 + 2] = oz;
        comet.vels[slot * 3] = (ox / len) * 1.6;
        comet.vels[slot * 3 + 1] = (oy / len) * 0.4;
        comet.vels[slot * 3 + 2] = (oz / len) * 1.6;
        comet.ages[slot] = 1;
        const rgb = hexToRgb(accentHex({ id: 'dawn' }, place.lab.accent));
        comet.colors[slot * 3] = rgb[0];
        comet.colors[slot * 3 + 1] = rgb[1];
        comet.colors[slot * 3 + 2] = rgb[2];
      }
    });
    const max = comet.positions.length / 3;
    for (let i = 0; i < max; i += 1) {
      if (comet.ages[i] <= 0) continue;
      comet.ages[i] = Math.max(0, comet.ages[i] - dt / comet.life);
      comet.positions[i * 3] += comet.vels[i * 3] * dt;
      comet.positions[i * 3 + 1] += comet.vels[i * 3 + 1] * dt;
      comet.positions[i * 3 + 2] += comet.vels[i * 3 + 2] * dt;
    }
    const geo = comet.points.geometry;
    geo.getAttribute('position').needsUpdate = true;
    geo.getAttribute('aAge').needsUpdate = true;
    geo.getAttribute('aColor').needsUpdate = true;
    void time;
  }

  function updateShooters(dt, themeNow) {
    live.shooters.forEach((shot) => {
      if (shot.life <= 0) {
        shot.wait -= dt;
        shot.line.visible = false;
        shot.head.visible = false;
        if (shot.wait > 0) return;
        shot.life = 0.9;
        shot.wait = 8 + Math.random() * 12;
        const rand = mulberry32(hashString(String(shot.wait + performance.now())));
        shot.cursor.set((rand() - 0.5) * 160, 20 + rand() * 40, (rand() - 0.5) * 160);
        shot.dir.set(-0.6 - rand(), -0.35, -0.2 - rand()).normalize().multiplyScalar(90);
        shot.mat.color.set(themeNow.shooter);
        shot.head.material.color.set(themeNow.shooter);
        return;
      }
      shot.life -= dt;
      const t = 1 - Math.max(0, shot.life) / 0.9;
      shot.line.visible = true;
      shot.head.visible = true;
      shot.head.position.set(
        shot.cursor.x + shot.dir.x * t,
        shot.cursor.y + shot.dir.y * t,
        shot.cursor.z + shot.dir.z * t,
      );
      for (let i = 0; i < 24; i += 1) {
        const u = Math.max(0, t - i * 0.012);
        shot.positions[i * 3] = shot.cursor.x + shot.dir.x * u;
        shot.positions[i * 3 + 1] = shot.cursor.y + shot.dir.y * u;
        shot.positions[i * 3 + 2] = shot.cursor.z + shot.dir.z * u;
      }
      shot.line.geometry.setPositions(shot.positions);
      shot.line.computeLineDistances();
      shot.mat.opacity = Math.max(0, shot.life / 0.9);
    });
  }

  function updateGems(time) {
    if (!live.gems) return;
    live.gemBases.forEach((gem, index) => {
      _dummy.position.set(gem.x, gem.y + Math.sin(time * 0.3 + index) * 0.4, gem.z);
      _dummy.rotation.set(time * gem.speed, gem.spin + time * gem.speed, 0);
      _dummy.scale.setScalar(gem.scale);
      _dummy.updateMatrix();
      live.gems.setMatrixAt(index, _dummy.matrix);
    });
    live.gems.instanceMatrix.needsUpdate = true;
  }

  build(theme, tier);
  if (live.focused) {
    const system = (layout.systems || []).find((item) => item.id === live.focused);
    if (system) setActivePlanets(system.planets, theme);
  }

  return {
    scene,
    get highlight() {
      return live.highlight;
    },
    get focusedSystem() {
      return live.focused;
    },
    setHighlight(id) {
      live.highlight = id;
    },
    focusSystem(id) {
      const system = (layout.systems || []).find((item) => item.id === id);
      if (!system) return null;
      live.focused = id;
      setActivePlanets(system.planets, theme);
      buildRingLines(system.rings, theme);
      return {
        look: [system.x, system.y, system.z],
        distance: Math.max(22, system.localRadius * 2.2),
      };
    },
    clearSystem() {
      live.focused = null;
      if (layout.mode !== 'galaxy') return;
      setActivePlanets([], theme);
      buildRingLines([], theme);
    },
    applyTheme(next) {
      theme = next;
      live.skyMat.uniforms.uTop.value.set(next.sky[0]);
      live.skyMat.uniforms.uMid.value.set(next.sky[1]);
      live.skyMat.uniforms.uBot.value.set(next.sky[2]);
      live.skyMat.uniforms.uNebA.value.set(next.nebula[0]);
      live.skyMat.uniforms.uNebB.value.set(next.nebula[1]);
      live.skyMat.uniforms.uMix.value = next.nebulaMix;
      live.mindMat.uniforms.uColor.value.set(next.starEmissive);
      live.mindMat.uniforms.uGain.value = next.starGain;
      live.corona.material.color.set(next.starEmissive);
      live.corona.material.opacity = next.id === 'dawn' ? 0.34 : next.id === 'contrast' ? 0.25 : 0.55;
      live.ambient.color.set(next.ambient);
      live.ambient.intensity = next.ambientIntensity;
      live.starMats.forEach((mat) => {
        mat.blending = next.id === 'dawn' ? NormalBlending : AdditiveBlending;
        mat.needsUpdate = true;
      });
      live.starGeos.forEach((geo) => {
        const colors = geo.getAttribute('aColor');
        const palette = next.stars.map((hex) => new Color(hex));
        for (let i = 0; i < colors.count; i += 1) {
          const color = palette[i % palette.length];
          colors.setXYZ(i, color.r, color.g, color.b);
        }
        colors.needsUpdate = true;
      });
      live.nebula.forEach((sprite, index) => {
        sprite.material.color.set(next.nebula[index % next.nebula.length]);
        sprite.material.opacity = next.nebulaMix > 0 ? 0.22 : 0.05;
      });
      if (live.places.length) setActivePlanets(live.places, next);
    },
    rebuild(nextTier) {
      const keepFocus = live.focused;
      const keepHighlight = live.highlight;
      resources.splice(0).forEach((resource) => {
        if (resource.dispose) resource.dispose();
      });
      tier = nextTier;
      build(theme, tier);
      live.highlight = keepHighlight;
      if (keepFocus) this.focusSystem(keepFocus);
    },
    resize(width, height, dpr) {
      live.view.w = width;
      live.view.h = height;
      live.view.dpr = dpr;
      live.lineMats.forEach((mat) => {
        if (mat.resolution) mat.resolution.set(width, height);
        if (mat.linewidth !== undefined) {
          mat.linewidth = width >= 2200 ? 2 : 1.5;
        }
      });
      live.starMats.forEach((mat) => {
        mat.uniforms.uDpr.value = dpr;
      });
      if (live.dustMat) live.dustMat.uniforms.uDpr.value = dpr;
      if (live.comet) live.comet.points.material.uniforms.uDpr.value = dpr;
    },
    update(dt, time, state) {
      const frozen = state.reduce ? 0 : time;
      const step = state.reduce ? 0 : dt;
      live.highlight = state.highlight;
      if (live.skyMat) live.skyMat.uniforms.uTime.value = frozen;
      live.starMats.forEach((mat) => {
        mat.uniforms.uTime.value = frozen;
        mat.uniforms.uFreeze.value = state.reduce ? 1 : 0;
      });
      if (live.dustMat) live.dustMat.uniforms.uTime.value = frozen;
      if (live.mindMat) live.mindMat.uniforms.uTime.value = frozen;
      if (live.ribbonMat) live.ribbonMat.uniforms.uTime.value = frozen;
      if (live.corona) {
        const pulse = state.reduce ? 1 : 1 + Math.sin((frozen / 6) * Math.PI * 2) * 0.06;
        live.corona.scale.setScalar(12.8 * pulse);
      }
      writeBodies(frozen, Math.max(step, 0.001), state.reduce);
      syncConstellations();
      if (!state.reduce) {
        updateComets(frozen, step);
        updateShooters(step, theme);
        updateGems(frozen);
        live.nebula.forEach((sprite, index) => {
          sprite.material.rotation = frozen * (index % 2 ? 0.002 : -0.002);
        });
      }
    },
    raycast(ndc, camera) {
      _ray.setFromCamera(ndc, camera);
      const targets = [];
      if (live.planetMesh && live.planetMesh.visible) targets.push(live.planetMesh);
      if (live.systemMesh && layout.mode === 'galaxy' && !live.focused) targets.push(live.systemMesh);
      const hits = _ray.intersectObjects(targets, false);
      if (!hits.length || hits[0].instanceId == null) return null;
      if (hits[0].object === live.systemMesh) {
        const system = layout.systems[hits[0].instanceId];
        return system ? { id: system.id, kind: 'system' } : null;
      }
      const place = live.places[hits[0].instanceId];
      return place ? { id: place.id, kind: 'lab', url: place.lab.url } : null;
    },
    anchors() {
      if (layout.mode === 'galaxy' && !live.focused) {
        return (layout.systems || []).map((system) => ({
          id: system.id,
          kind: 'system',
          title: system.label,
          href: '',
          accent: categoryAccent(system.category),
          position: new Vector3(system.x, system.y + 3.2, system.z),
        }));
      }
      return live.places.map((place) => ({
        id: place.id,
        kind: 'lab',
        title: place.lab.shortTitle || place.lab.title,
        href: place.lab.url || '',
        accent: place.lab.accent,
        position: new Vector3(place.worldX || 0, (place.worldY || 0) + place.size + 2.5, place.worldZ || 0),
      }));
    },
    constellationPairs() {
      if (!live.highlight) return [];
      const current = live.places.find((place) => place.id === live.highlight);
      if (!current) return [];
      const tags = new Set(current.lab.tags || []);
      return live.places
        .filter((place) => place !== current && (place.lab.tags || []).some((tag) => tags.has(tag)))
        .map((place) => [current, place]);
    },
    dispose() {
      resources.forEach((resource) => {
        if (resource.dispose) resource.dispose();
      });
      scene.clear();
    },
  };
}

export function projectToScreen(position, camera, width, height, target) {
  _dummy.position.copy(position);
  _dummy.position.project(camera);
  target.x = (_dummy.position.x * 0.5 + 0.5) * width;
  target.y = (-_dummy.position.y * 0.5 + 0.5) * height;
  target.visible = _dummy.position.z < 1;
  return target;
}
