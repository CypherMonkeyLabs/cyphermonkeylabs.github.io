/**
 * Mipmapped bloom, ACES, and a short FXAA pass.
 * pmndrs postprocessing is not vendored: together with a full three build it
 * breaks the 230KB gzip scene budget, and Pages does not run a bundler.
 */

import {
  WebGLRenderTarget,
  HalfFloatType,
  UnsignedByteType,
  LinearFilter,
  ShaderMaterial,
  Mesh,
  PlaneGeometry,
  Scene,
  OrthographicCamera,
  Vector2,
} from '../../vendor/three/three.module.js';

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const BRIGHT = `
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float uThreshold;
uniform float uSmoothing;
void main() {
  vec3 c = texture2D(tDiffuse, vUv).rgb;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float knee = max(uThreshold * uSmoothing, 1e-4);
  float soft = clamp(l - uThreshold + knee, 0.0, 2.0 * knee);
  soft = (soft * soft) / (4.0 * knee + 1e-4);
  float contrib = max(soft, l - uThreshold);
  contrib = max(contrib, 0.0) / max(l, 1e-4);
  gl_FragColor = vec4(c * contrib, 1.0);
}
`;

const BLUR = `
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 uTexel;
uniform float uRadius;
void main() {
  vec2 o = uTexel * uRadius;
  vec3 c = texture2D(tDiffuse, vUv).rgb * 4.0;
  c += texture2D(tDiffuse, vUv + vec2(o.x, o.y)).rgb;
  c += texture2D(tDiffuse, vUv + vec2(-o.x, o.y)).rgb;
  c += texture2D(tDiffuse, vUv + vec2(o.x, -o.y)).rgb;
  c += texture2D(tDiffuse, vUv + vec2(-o.x, -o.y)).rgb;
  gl_FragColor = vec4(c / 8.0, 1.0);
}
`;

const COMPOSITE = `
varying vec2 vUv;
uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform float uBloom;
uniform float uExposure;
uniform float uVignette;
vec3 aces(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
void main() {
  vec3 color = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb * uBloom;
  color *= uExposure;
  color = aces(color);
  vec2 p = vUv * 2.0 - 1.0;
  float vig = 1.0 - dot(p, p) * uVignette;
  color *= clamp(vig, 0.0, 1.0);
  color = pow(max(color, 0.0), vec3(0.454545));
  gl_FragColor = vec4(color, 1.0);
}
`;

const FXAA = `
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 uTexel;
void main() {
  vec3 c = texture2D(tDiffuse, vUv).rgb;
  vec3 n = texture2D(tDiffuse, vUv + vec2(0.0, uTexel.y)).rgb;
  vec3 s = texture2D(tDiffuse, vUv - vec2(0.0, uTexel.y)).rgb;
  vec3 e = texture2D(tDiffuse, vUv + vec2(uTexel.x, 0.0)).rgb;
  vec3 w = texture2D(tDiffuse, vUv - vec2(uTexel.x, 0.0)).rgb;
  float lc = dot(c, vec3(0.299, 0.587, 0.114));
  float ln = dot(n, vec3(0.299, 0.587, 0.114));
  float ls = dot(s, vec3(0.299, 0.587, 0.114));
  float le = dot(e, vec3(0.299, 0.587, 0.114));
  float lw = dot(w, vec3(0.299, 0.587, 0.114));
  float edge = abs(ln - lc) + abs(ls - lc) + abs(le - lc) + abs(lw - lc);
  vec3 blur = (n + s + e + w) * 0.25;
  gl_FragColor = vec4(mix(c, blur, clamp(edge * 1.6, 0.0, 0.65)), 1.0);
}
`;

const WORM = `
varying vec2 vUv;
uniform float uT;
uniform float uAspect;
uniform float uStrength;
void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float r = length(p);
  float a = fract(r * 8.0 - uT * 3.0);
  float b = fract(r * 18.0 - uT * 3.0);
  float band = smoothstep(0.02, 0.18, a) * smoothstep(0.62, 0.28, a);
  band = max(band, smoothstep(0.0, 0.12, b) * smoothstep(0.45, 0.18, b) * 0.85);
  vec3 lavender = vec3(0.788, 0.722, 1.0);
  vec3 peach = vec3(1.0, 0.706, 0.635);
  vec3 col = mix(lavender, peach, clamp(r * 1.4, 0.0, 1.0));
  float vig = smoothstep(0.95, 0.15, r);
  float alpha = band * vig * uStrength;
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function makePass(fragment, uniforms) {
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: fragment,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  const scene = new Scene();
  scene.add(mesh);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return { material, mesh, scene, camera };
}

function target(width, height, type, depth) {
  const rt = new WebGLRenderTarget(Math.max(1, width), Math.max(1, height), {
    type,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: depth,
    stencilBuffer: false,
  });
  rt.texture.generateMipmaps = false;
  return rt;
}

export function createComposer(renderer) {
  const gl = renderer.getContext();
  const halfFloat = Boolean(gl.getExtension('EXT_color_buffer_float'));
  const floatType = halfFloat ? HalfFloatType : UnsignedByteType;
  const size = new Vector2();
  let sceneRT = target(4, 4, floatType, true);
  let bloomRTs = [];
  let ldrRT = target(4, 4, UnsignedByteType, false);
  const bright = makePass(BRIGHT, {
    tDiffuse: { value: null },
    uThreshold: { value: 0.88 },
    uSmoothing: { value: 0.12 },
  });
  const blur = makePass(BLUR, {
    tDiffuse: { value: null },
    uTexel: { value: new Vector2() },
    uRadius: { value: 1 },
  });
  const composite = makePass(COMPOSITE, {
    tScene: { value: null },
    tBloom: { value: null },
    uBloom: { value: 0.55 },
    uExposure: { value: 1.1 },
    uVignette: { value: 0.18 },
  });
  const fxaa = makePass(FXAA, {
    tDiffuse: { value: null },
    uTexel: { value: new Vector2() },
  });
  let useBloom = true;
  let useFxaa = false;
  let bloomRadius = 0.5;

  function disposeList(list) {
    list.forEach((rt) => rt.dispose());
  }

  function resize(width, height, bloomScale) {
    sceneRT.dispose();
    ldrRT.dispose();
    disposeList(bloomRTs);
    sceneRT = target(width, height, floatType, true);
    ldrRT = target(width, height, UnsignedByteType, false);
    bloomRTs = [];
    let bw = Math.max(1, Math.floor(width * Math.max(0.25, bloomScale) * 0.5));
    let bh = Math.max(1, Math.floor(height * Math.max(0.25, bloomScale) * 0.5));
    for (let i = 0; i < 5; i += 1) {
      bloomRTs.push(target(bw, bh, floatType, false));
      bw = Math.max(1, bw >> 1);
      bh = Math.max(1, bh >> 1);
    }
  }

  function blit(pass, to) {
    renderer.setRenderTarget(to);
    renderer.render(pass.scene, pass.camera);
  }

  return {
    halfFloat,
    resize,
    configure(theme, tier) {
      useBloom = Boolean(tier.bloom && bloomRTs.length);
      useFxaa = Boolean(tier.smaa);
      bloomRadius = theme.bloom.radius;
      bright.material.uniforms.uThreshold.value = theme.bloom.luminanceThreshold;
      bright.material.uniforms.uSmoothing.value = theme.bloom.luminanceSmoothing;
      composite.material.uniforms.uBloom.value = useBloom ? theme.bloom.intensity : 0;
      composite.material.uniforms.uExposure.value = theme.exposure;
      composite.material.uniforms.uVignette.value = theme.id === 'contrast' ? 0.02 : 0.18;
    },
    render(scene, camera) {
      renderer.setRenderTarget(sceneRT);
      renderer.setClearColor(0x000000, 1);
      renderer.clear(true, true, false);
      renderer.render(scene, camera);
      this.sceneInfo = {
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
      };
      if (useBloom && bloomRTs.length) {
        bright.material.uniforms.tDiffuse.value = sceneRT.texture;
        blit(bright, bloomRTs[0]);
        for (let i = 1; i < bloomRTs.length; i += 1) {
          const src = bloomRTs[i - 1];
          blur.material.uniforms.tDiffuse.value = src.texture;
          blur.material.uniforms.uTexel.value.set(1 / src.width, 1 / src.height);
          blur.material.uniforms.uRadius.value = 1 + bloomRadius;
          blit(blur, bloomRTs[i]);
        }
        for (let i = bloomRTs.length - 2; i >= 0; i -= 1) {
          const src = bloomRTs[i + 1];
          blur.material.uniforms.tDiffuse.value = src.texture;
          blur.material.uniforms.uTexel.value.set(1 / bloomRTs[i].width, 1 / bloomRTs[i].height);
          blur.material.uniforms.uRadius.value = 0.8 + bloomRadius;
          blit(blur, bloomRTs[i]);
        }
        composite.material.uniforms.tBloom.value = bloomRTs[0].texture;
      } else if (bloomRTs[0]) {
        composite.material.uniforms.tBloom.value = bloomRTs[0].texture;
      }
      composite.material.uniforms.tScene.value = sceneRT.texture;
      if (useFxaa) {
        blit(composite, ldrRT);
        fxaa.material.uniforms.tDiffuse.value = ldrRT.texture;
        renderer.getDrawingBufferSize(size);
        fxaa.material.uniforms.uTexel.value.set(1 / size.x, 1 / size.y);
        blit(fxaa, null);
      } else {
        blit(composite, null);
      }
    },
    dispose() {
      sceneRT.dispose();
      ldrRT.dispose();
      disposeList(bloomRTs);
      [bright, blur, composite, fxaa].forEach((pass) => {
        pass.material.dispose();
        pass.mesh.geometry.dispose();
      });
    },
  };
}

export function createWormhole() {
  const pass = makePass(WORM, {
    uT: { value: 0 },
    uAspect: { value: 1 },
    uStrength: { value: 0 },
  });
  pass.material.transparent = true;
  return {
    render(renderer, progress, aspect) {
      if (progress <= 0) return;
      pass.material.uniforms.uT.value = progress;
      pass.material.uniforms.uAspect.value = aspect;
      pass.material.uniforms.uStrength.value = progress;
      const prev = renderer.autoClear;
      renderer.autoClear = false;
      renderer.setRenderTarget(null);
      renderer.render(pass.scene, pass.camera);
      renderer.autoClear = prev;
    },
    dispose() {
      pass.material.dispose();
      pass.mesh.geometry.dispose();
    },
  };
}
