import { getStore } from "./store.js";

let ctx = null;
let ambient = null;

function audioContext() {
  const Construct = window.AudioContext || window.webkitAudioContext;
  if (!Construct) return null;
  if (!ctx) ctx = new Construct();
  return ctx;
}

function peak(volume, amount) {
  return amount * (Math.max(0, Math.min(100, volume)) / 100);
}

function tone({ type, freq, start, duration, gain }) {
  const context = ctx;
  if (!context || gain <= 0.00001) return;
  const osc = context.createOscillator();
  const amp = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0001), start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(context.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function stopAmbient() {
  if (!ambient) return;
  for (const node of ambient.nodes) {
    try { node.stop?.(); } catch (err) { /* already stopped */ }
    try { node.disconnect?.(); } catch (err) { /* already disconnected */ }
  }
  ambient = null;
}

function startAmbient(volume) {
  const context = audioContext();
  if (!context) return;
  if (ambient) {
    ambient.master.gain.setTargetAtTime(peak(volume, 0.03), context.currentTime, 0.05);
    return;
  }
  const master = context.createGain();
  master.gain.value = peak(volume, 0.03);
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  const lfo = context.createOscillator();
  lfo.frequency.value = 1 / 20;
  const depth = context.createGain();
  depth.gain.value = 300;
  lfo.connect(depth);
  depth.connect(filter.frequency);
  const oscA = context.createOscillator();
  const oscB = context.createOscillator();
  oscA.type = "sine";
  oscB.type = "sine";
  oscA.frequency.value = 110;
  oscB.frequency.value = 164.8;
  const mixA = context.createGain();
  const mixB = context.createGain();
  mixA.gain.value = 0.5;
  mixB.gain.value = 0.5;
  oscA.connect(mixA);
  oscB.connect(mixB);
  mixA.connect(master);
  mixB.connect(master);
  master.connect(filter);
  filter.connect(context.destination);
  oscA.start();
  oscB.start();
  lfo.start();
  ambient = { master, nodes: [oscA, oscB, lfo, mixA, mixB, master, filter, depth] };
}

export function primeFromGesture() {
  const state = getStore().getState();
  if (state.sound === "off") return;
  const context = audioContext();
  if (!context) return;
  if (context.state === "suspended") context.resume();
  if (state.sound === "ambient") startAmbient(state.volume);
  else stopAmbient();
}

export function playCue(cue) {
  const state = getStore().getState();
  if (state.sound === "off") return;
  const context = ctx;
  if (!context) return;
  const now = context.currentTime;
  switch (cue) {
    case "tick": {
      const osc = context.createOscillator();
      const amp = context.createGain();
      const amount = peak(state.volume, 0.04);
      if (amount <= 0.00001) return;
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
      amp.gain.setValueAtTime(amount, now);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(amp);
      amp.connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.07);
      return;
    }
    case "open": {
      [523.25, 659.25, 783.99].forEach((freq, index) => {
        tone({
          type: "triangle",
          freq,
          start: now + index * 0.12,
          duration: 0.12,
          gain: peak(state.volume, 0.05),
        });
      });
      return;
    }
    case "sent": {
      [1046.5, 1318.5, 1568, 2093].forEach((freq, index) => {
        tone({
          type: "sine",
          freq,
          start: now + index * 0.08,
          duration: 0.09,
          gain: peak(state.volume, 0.04),
        });
      });
      return;
    }
    default: {
      const unknown = cue;
      return unknown;
    }
  }
}

export function bindSound() {
  if (typeof document === "undefined") return () => {};
  const onSettings = (event) => {
    const state = event.detail;
    if (!state || state.sound !== "ambient") stopAmbient();
    else if (ctx) startAmbient(state.volume);
    else stopAmbient();
  };
  const onCue = (event) => {
    const cue = event.detail?.cue;
    if (cue === "tick" || cue === "open" || cue === "sent") playCue(cue);
  };
  const onHide = () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (getStore().getState().sound !== "off") ctx.resume();
  };
  document.addEventListener("cm:settings", onSettings);
  document.addEventListener("cm:sound", onCue);
  document.addEventListener("visibilitychange", onHide);
  return () => {
    document.removeEventListener("cm:settings", onSettings);
    document.removeEventListener("cm:sound", onCue);
    document.removeEventListener("visibilitychange", onHide);
    stopAmbient();
  };
}
