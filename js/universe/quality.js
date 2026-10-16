/** Quality tiers and the FPS governor (Pack 1 §1.9). */

export const TIER_ORDER = ['ultra', 'high', 'medium', 'low', 'static'];

export const TIERS = {
  ultra: {
    id: 'ultra', dprCap: 2, stars: 9000, dust: 2000, nebula: 12, seg: [64, 48],
    starDetail: 5, bloom: true, bloomScale: 1, smaa: true, shooters: 3, comets: 160,
    gems: 80, maxDraw: 150, maxTri: 600000, maxTexMB: 64, targetFps: 60,
  },
  high: {
    id: 'high', dprCap: 2, stars: 6000, dust: 1200, nebula: 8, seg: [48, 32],
    starDetail: 5, bloom: true, bloomScale: 0.75, smaa: true, shooters: 2, comets: 120,
    gems: 60, maxDraw: 120, maxTri: 400000, maxTexMB: 48, targetFps: 60,
  },
  medium: {
    id: 'medium', dprCap: 1.5, stars: 3500, dust: 600, nebula: 5, seg: [32, 24],
    starDetail: 4, bloom: true, bloomScale: 0.5, smaa: false, shooters: 1, comets: 60,
    gems: 32, maxDraw: 80, maxTri: 180000, maxTexMB: 32, targetFps: 60,
  },
  low: {
    id: 'low', dprCap: 1, stars: 1200, dust: 0, nebula: 2, seg: [20, 14],
    starDetail: 3, bloom: false, bloomScale: 0, smaa: false, shooters: 0, comets: 0,
    gems: 16, maxDraw: 50, maxTri: 80000, maxTexMB: 16, targetFps: 30,
  },
  static: {
    id: 'static', dprCap: 1, stars: 0, dust: 0, nebula: 0, seg: [8, 6],
    starDetail: 1, bloom: false, bloomScale: 0, smaa: false, shooters: 0, comets: 0,
    gems: 0, maxDraw: 0, maxTri: 0, maxTexMB: 0, targetFps: 0,
  },
};

const QUALITY_ALIAS = {
  auto: 'auto',
  ultra: 'ultra',
  high: 'high',
  medium: 'medium',
  balanced: 'medium',
  low: 'low',
  battery: 'low',
  'battery-saver': 'low',
  static: 'static',
  '2d': 'static',
  '2d-only': 'static',
};

export function canonicalQuality(pref) {
  if (!pref) return 'auto';
  const key = String(pref).toLowerCase();
  return QUALITY_ALIAS[key] || 'auto';
}

export function tierConfig(name) {
  return TIERS[name] || TIERS.high;
}

export function stepTier(name, direction) {
  const index = Math.max(0, TIER_ORDER.indexOf(name));
  const next = index + (direction < 0 ? 1 : -1);
  const clamped = Math.max(0, Math.min(TIER_ORDER.length - 1, next));
  return TIER_ORDER[clamped];
}

/**
 * Pick a starting tier. The probe context is released so the real renderer
 * can be created afterwards.
 */
export function initialTier(pref) {
  const choice = canonicalQuality(pref);
  if (choice !== 'auto') return choice;
  const n = navigator;
  if (n.connection && n.connection.saveData) return 'low';
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
  if (!gl) return 'static';
  const mem = typeof n.deviceMemory === 'number' ? n.deviceMemory : 8;
  const cores = typeof n.hardwareConcurrency === 'number' ? n.hardwareConcurrency : 8;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const rendererName = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '') : '';
  const software = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(rendererName);
  const lose = gl.getExtension('WEBGL_lose_context');
  if (lose) lose.loseContext();
  if (software) return 'static';
  if (mem <= 4 || cores <= 4) return 'low';
  if (coarse) {
    if (mem >= 6 && cores >= 8) return 'medium';
    if (mem >= 4) return 'low';
    return 'static';
  }
  if (cores >= 8 && mem >= 8 && maxTex >= 16384) return 'ultra';
  if (cores >= 4) return 'high';
  return 'medium';
}

/** Step down fast, step up once per session after sustained headroom. */
export function createGovernor(step) {
  let acc = 0;
  let frames = 0;
  let good = 0;
  let upgraded = false;
  return {
    reset() {
      acc = 0;
      frames = 0;
      good = 0;
    },
    sample(dtMs) {
      acc += dtMs;
      frames += 1;
      if (acc < 2000) return;
      const avg = acc / frames;
      acc = 0;
      frames = 0;
      if (avg > 22) {
        good = 0;
        step(-1);
      } else if (avg < 12 && !upgraded && (good += 1) >= 5) {
        upgraded = true;
        step(1);
      }
    },
  };
}
