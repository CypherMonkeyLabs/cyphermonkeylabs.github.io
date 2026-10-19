/**
 * Fullscreen aurora on a caller-supplied canvas.
 * Band shape is the Python Lab studio shader (MIT, CYPHER0X9), see
 * vendor/python-lab/aurora.js. Wisps use Ashima simplex noise (MIT).
 */
import { SNOISE } from './vendor/webgl-noise/noise3D.js';
import { palette, clamp01 } from './color.js';
import {
  bufferSize,
  fieldNote,
  hasWebGL,
  isPhone,
  markHost,
  onMotionChange,
  prefersReducedMotion,
  startLoop,
} from './motion.js';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
${SNOISE}
varying vec2 vUv;
uniform float uTime;
uniform float uIntensity;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
void main() {
  float w = sin(vUv.x * 6.0 + uTime * 0.35) * 0.08 + sin(vUv.x * 13.0 - uTime * 0.22) * 0.04;
  float n = snoise(vec3(vUv * 2.1, uTime * 0.05));
  float veil = snoise(vec3(vUv.yx * 3.0 + 2.0, uTime * 0.03));
  w += n * 0.07;
  float band = smoothstep(0.0, 0.35, 1.0 - abs(vUv.y - 0.62 - w) * 2.2);
  float band2 = smoothstep(0.0, 0.3, 1.0 - abs(vUv.y - 0.42 + w * 1.4) * 2.6);
  vec3 base = mix(vec3(0.04, 0.05, 0.12), uC * 0.45, vUv.y);
  vec3 col = base + uA * band * (0.45 + 0.55 * uIntensity) + uB * band2 * (0.35 + 0.45 * uIntensity);
  col += uA * smoothstep(0.15, 0.95, veil * 0.5 + 0.5) * 0.16 * uIntensity;
  float vig = smoothstep(1.2, 0.2, length(vUv - 0.5));
  col *= mix(0.62, 1.0, vig);
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl) {
  const vert = compile(gl, gl.VERTEX_SHADER, VERT);
  const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vert || !frag) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.bindAttribLocation(program, 0, 'aPos');
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function paint2d(canvas, colors, intensity) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const size = bufferSize(canvas, 1);
  const w = Math.max(size.cssWidth, 2);
  const h = Math.max(size.cssHeight, 2);
  const dpr = size.cssWidth > 0 ? size.width / size.cssWidth : 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createLinearGradient(0, h, w, 0);
  g.addColorStop(0, '#090712');
  g.addColorStop(0.45, colors[2].hex);
  g.addColorStop(0.72, colors[0].hex);
  g.addColorStop(1, colors[1].hex);
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.35 + 0.4 * intensity;
  ctx.fillStyle = colors[1].hex;
  ctx.beginPath();
  ctx.ellipse(w * 0.55, h * 0.58, w * 0.48, h * 0.16, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawGl(gl, program, locs, colors, time, intensity) {
  gl.useProgram(program);
  gl.uniform1f(locs.uTime, time);
  gl.uniform1f(locs.uIntensity, intensity);
  gl.uniform3f(locs.uA, colors[0].r, colors[0].g, colors[0].b);
  gl.uniform3f(locs.uB, colors[1].r, colors[1].g, colors[1].b);
  gl.uniform3f(locs.uC, colors[2].r, colors[2].g, colors[2].b);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

export function mountAurora(canvas, options = {}) {
  if (!canvas || canvas.tagName !== 'CANVAS') {
    return { destroy() {}, pause() {}, resume() {}, set() {}, ready: Promise.resolve(false) };
  }
  markHost(canvas.parentElement);
  canvas.classList.add('cmfx-canvas');
  canvas.setAttribute('aria-hidden', 'true');
  let colors = palette(options.palette);
  let intensity = clamp01(options.intensity ?? 0.8);
  let alive = true;
  let mode = '2d';
  const scale = isPhone() ? 0.55 : 0.85;
  const parent = canvas.parentElement;

  const gl = hasWebGL()
    ? (canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    }) || canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    }))
    : null;
  const program = gl ? link(gl) : null;

  if (gl && program) {
    mode = 'webgl';
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    fieldNote(parent, '');
  } else if (gl && !program) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.hidden = true;
    mode = 'css';
    parent?.classList.add('cmfx-aurora-css');
    fieldNote(parent, 'The aurora shader did not compile. A still gradient is shown instead.');
  } else {
    fieldNote(parent, 'WebGL is off. This is a still aurora painted in 2D.');
  }
  canvas.dataset.cmfx = mode;

  const locs = program && gl ? {
    uTime: gl.getUniformLocation(program, 'uTime'),
    uIntensity: gl.getUniformLocation(program, 'uIntensity'),
    uA: gl.getUniformLocation(program, 'uA'),
    uB: gl.getUniformLocation(program, 'uB'),
    uC: gl.getUniformLocation(program, 'uC'),
  } : null;

  let time = 0;
  const paintCss = () => {
    parent?.style.setProperty('--cmfx-a', colors[0].hex);
    parent?.style.setProperty('--cmfx-b', colors[1].hex);
    parent?.style.setProperty('--cmfx-c', colors[2].hex);
  };

  const render = (dt, frozen) => {
    if (!alive) return;
    const reduced = prefersReducedMotion();
    if (mode === 'css') {
      paintCss();
      return;
    }
    if (mode === 'webgl') {
      const size = bufferSize(canvas, scale);
      gl.viewport(0, 0, size.width, size.height);
      if (!frozen && !reduced) time += dt;
      drawGl(gl, program, locs, colors, reduced ? 0 : time, intensity);
      return;
    }
    paint2d(canvas, colors, intensity);
  };

  render(0, true);
  const loop = mode === 'webgl' && !prefersReducedMotion()
    ? startLoop({ host: parent || canvas, fps: 60, onFrame: (dt) => render(dt, false) })
    : { pause() {}, resume() {}, stop() {} };

  const unsub = onMotionChange((reduced) => {
    if (reduced) {
      loop.pause();
      time = 0;
      render(0, true);
    } else if (mode === 'webgl') {
      loop.resume();
    }
  });

  const ro = new ResizeObserver(() => render(0, prefersReducedMotion()));
  ro.observe(parent || canvas);

  return {
    ready: Promise.resolve(true),
    pause() { loop.pause(); },
    resume() { if (!prefersReducedMotion()) loop.resume(); },
    set(next = {}) {
      if (next.palette) colors = palette(next.palette);
      if (next.intensity !== undefined) intensity = clamp01(next.intensity);
      render(0, prefersReducedMotion());
    },
    destroy() {
      alive = false;
      unsub();
      ro.disconnect();
      loop.stop();
      if (gl && program) {
        gl.deleteProgram(program);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    },
  };
}
