/** Runtime glyph atlas. A baked GLB needs a build step; this stays deployable as plain files. */

export const ATLAS_COLS = 6;
export const ATLAS_ROWS = 4;
const CELL = 128;

const ORDER = [
  'headset', 'handset', 'cloud-phone', 'waveform', 'nodes', 'chat',
  'spark', 'gem', 'video', 'route', 'book', 'shield',
];

export function iconIndex(name) {
  const index = ORDER.indexOf(name);
  return index >= 0 ? index : ORDER.indexOf('spark');
}

export function makeGlyphAtlas() {
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_COLS * CELL;
  canvas.height = ATLAS_ROWS * CELL;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ORDER.forEach((name, index) => {
    const col = index % ATLAS_COLS;
    const row = Math.floor(index / ATLAS_COLS);
    ctx.save();
    ctx.translate(col * CELL, row * CELL);
    drawIcon(ctx, name);
    ctx.restore();
  });
  return canvas;
}

export function makeSoftTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return canvas;
}

export function makeNebulaTexture(seed) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  let s = seed >>> 0;
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = 0; i < 7; i += 1) {
    const x = rand() * 512;
    const y = rand() * 512;
    const r = 70 + rand() * 190;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const alpha = 0.35 + rand() * 0.45;
    g.addColorStop(0, `rgba(255,255,255,${alpha})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.55 + rand() * 0.5), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}

function stroke(ctx) {
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#fff';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function drawIcon(ctx, name) {
  stroke(ctx);
  ctx.translate(64, 64);
  if (name === 'headset') {
    ctx.beginPath();
    ctx.arc(0, 4, 28, Math.PI, 0);
    ctx.stroke();
    ctx.strokeRect(-36, 0, 14, 22);
    ctx.strokeRect(22, 0, 14, 22);
  } else if (name === 'handset') {
    ctx.beginPath();
    ctx.moveTo(-26, 18);
    ctx.quadraticCurveTo(-30, -28, 0, -30);
    ctx.quadraticCurveTo(30, -28, 26, 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-20, 22, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(20, 22, 8, 0, Math.PI * 2);
    ctx.stroke();
  } else if (name === 'cloud-phone') {
    ctx.beginPath();
    ctx.arc(-10, -6, 16, Math.PI, 0);
    ctx.arc(12, -8, 12, Math.PI, 0);
    ctx.lineTo(28, 10);
    ctx.lineTo(-28, 10);
    ctx.stroke();
    ctx.fillRect(-4, 14, 8, 16);
  } else if (name === 'waveform') {
    [-24, -12, 0, 12, 24].forEach((x, i) => {
      const h = 10 + (i % 2) * 22;
      ctx.beginPath();
      ctx.moveTo(x, -h);
      ctx.lineTo(x, h);
      ctx.stroke();
    });
  } else if (name === 'nodes') {
    [[-22, -16], [20, -18], [0, 18], [-24, 16]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(-22, -16);
    ctx.lineTo(20, -18);
    ctx.lineTo(0, 18);
    ctx.lineTo(-24, 16);
    ctx.stroke();
  } else if (name === 'chat') {
    roundRect(ctx, -30, -26, 60, 40, 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, 14);
    ctx.lineTo(-18, 30);
    ctx.lineTo(6, 14);
    ctx.stroke();
  } else if (name === 'spark') {
    star(ctx, 0, 0, 10, 28);
    ctx.fill();
  } else if (name === 'gem') {
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(24, -8);
    ctx.lineTo(0, 30);
    ctx.lineTo(-24, -8);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-24, -8);
    ctx.lineTo(24, -8);
    ctx.stroke();
  } else if (name === 'video') {
    roundRect(ctx, -32, -20, 40, 40, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, -8);
    ctx.lineTo(30, -18);
    ctx.lineTo(30, 18);
    ctx.lineTo(12, 8);
    ctx.stroke();
  } else if (name === 'route') {
    ctx.beginPath();
    ctx.moveTo(-28, 18);
    ctx.bezierCurveTo(-10, 18, -10, -20, 8, -20);
    ctx.bezierCurveTo(24, -20, 24, 0, 28, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(28, 0, 6, 0, Math.PI * 2);
    ctx.stroke();
  } else if (name === 'book') {
    ctx.beginPath();
    ctx.moveTo(-4, -26);
    ctx.lineTo(-28, -18);
    ctx.lineTo(-28, 26);
    ctx.lineTo(-4, 16);
    ctx.lineTo(22, 26);
    ctx.lineTo(22, -18);
    ctx.closePath();
    ctx.stroke();
  } else if (name === 'shield') {
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(26, -16);
    ctx.lineTo(22, 10);
    ctx.quadraticCurveTo(0, 32, -22, 10);
    ctx.lineTo(-26, -16);
    ctx.closePath();
    ctx.stroke();
  } else {
    star(ctx, 0, 0, 8, 26);
    ctx.stroke();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx, x, y, inner, outer) {
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const radius = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / 4;
    const px = x + Math.cos(a) * radius;
    const py = y + Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}
