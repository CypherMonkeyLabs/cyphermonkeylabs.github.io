/* Ambient pad: three soft sine voices, slow filter sweep. Created only after a click. Quiet by design. */
let ctx = null, master = null, nodes = [];
export function start() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 700; filt.connect(master);
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 260; lfo.connect(lg); lg.connect(filt.frequency); lfo.start();
    [110, 164.81, 220.5, 329.6].forEach((f, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = (i - 1.5) * 6; g.gain.value = 0.22 / (i + 1); o.connect(g); g.connect(filt); o.start(); nodes.push(o); });
  }
  ctx.resume(); master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.5);
}
export function stop() {
  if (!ctx) return; master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  setTimeout(() => ctx && ctx.suspend(), 900);
}
