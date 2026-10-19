/**
 * Original Web Audio engine. Off until a click on the visible toggle.
 * Pings are short envelopes. The ambient bed is two quiet sines a fifth apart,
 * a slow filter, and a whisper of generated noise. Nothing is sampled from a file.
 */

import { onMotionChange, prefersReducedMotion } from './motion.js';

const PINGS = {
  tap: [{ f: 660, dur: 0.06, type: 'triangle', vol: 0.05, delay: 0 }],
  hover: [{ f: 920, dur: 0.045, type: 'sine', vol: 0.03, delay: 0 }],
  ok: [
    { f: 523, dur: 0.12, type: 'triangle', vol: 0.045, delay: 0 },
    { f: 784, dur: 0.14, type: 'triangle', vol: 0.045, delay: 0.09 },
  ],
  nav: [
    { f: 392, dur: 0.07, type: 'sine', vol: 0.04, delay: 0 },
    { f: 587, dur: 0.08, type: 'sine', vol: 0.04, delay: 0.06 },
  ],
  warn: [{ f: 174, dur: 0.16, type: 'sawtooth', vol: 0.028, delay: 0 }],
};

let ctx = null;
let on = false;
let bed = null;
let button = null;
let wanted = false;

function audioCtor() {
  return window.AudioContext || window.webkitAudioContext || null;
}

function context() {
  const Ctor = audioCtor();
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function tone(audio, step) {
  const t0 = audio.currentTime + (step.delay || 0);
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = step.type;
  osc.frequency.value = step.f;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(step.vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + step.dur);
  osc.connect(gain).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + step.dur + 0.03);
}

function startBed(audio) {
  if (prefersReducedMotion()) return null;
  const master = audio.createGain();
  master.gain.value = 0.0001;
  master.connect(audio.destination);
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 480;
  filter.Q.value = 0.7;
  filter.connect(master);
  const voices = [98, 147].map((freq, index) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.detune.value = index === 0 ? -4 : 6;
    gain.gain.value = 0.55;
    osc.connect(gain).connect(filter);
    osc.start();
    return osc;
  });
  const lfo = audio.createOscillator();
  const lfoGain = audio.createGain();
  lfo.frequency.value = 0.045;
  lfoGain.gain.value = 140;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();
  const seconds = 2;
  const noiseBuffer = audio.createBuffer(1, seconds * audio.sampleRate, audio.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const noise = audio.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseGain = audio.createGain();
  noiseGain.gain.value = 0.02;
  const band = audio.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 540;
  band.Q.value = 0.6;
  noise.connect(band).connect(noiseGain).connect(master);
  noise.start();
  const now = audio.currentTime;
  master.gain.exponentialRampToValueAtTime(0.018, now + 1.4);
  return {
    stop() {
      const t = audio.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      const nodes = [...voices, lfo, noise];
      window.setTimeout(() => {
        nodes.forEach((node) => {
          try { node.stop(); } catch (err) { /* already stopped */ }
        });
        master.disconnect();
      }, 480);
    },
  };
}

function labelFor(state) {
  if (!audioCtor()) return 'Sound unavailable';
  if (!state) return 'Sound off';
  if (prefersReducedMotion()) return 'Sound on, pings only';
  return 'Sound on';
}

function paintButton() {
  if (!button) return;
  const available = Boolean(audioCtor());
  button.disabled = !available;
  button.setAttribute('aria-pressed', String(on));
  button.textContent = labelFor(on);
}

function mountButton() {
  if (button || !document.body) return;
  button = document.createElement('button');
  button.type = 'button';
  button.id = 'cmfx-sound-toggle';
  button.className = 'cmfx-sound';
  button.addEventListener('click', () => {
    toggle();
  });
  document.body.append(button);
  paintButton();
}

function syncBed() {
  if (!on) {
    bed?.stop();
    bed = null;
    return;
  }
  const audio = context();
  if (!audio) return;
  if (prefersReducedMotion()) {
    bed?.stop();
    bed = null;
    return;
  }
  if (!bed) bed = startBed(audio);
}

export function isOn() {
  return on;
}

export function init() {
  mountButton();
  return on;
}

export function toggle() {
  if (!audioCtor()) {
    on = false;
    paintButton();
    return false;
  }
  on = !on;
  wanted = on;
  if (on) {
    const audio = context();
    if (!audio) {
      on = false;
      wanted = false;
      paintButton();
      return false;
    }
    syncBed();
  } else {
    bed?.stop();
    bed = null;
    if (ctx && ctx.state !== 'closed') ctx.suspend().catch(() => {});
  }
  paintButton();
  return on;
}

export function ping(kind) {
  if (!on) return false;
  const audio = context();
  if (!audio) return false;
  const steps = PINGS[kind] || PINGS.tap;
  steps.forEach((step) => tone(audio, step));
  return true;
}

function onVisibility() {
  if (!ctx) return;
  if (document.hidden) {
    ctx.suspend().catch(() => {});
    return;
  }
  if (on) ctx.resume().catch(() => {});
}

export function installSound() {
  mountButton();
  document.addEventListener('visibilitychange', onVisibility);
  onMotionChange(() => {
    if (wanted) syncBed();
    paintButton();
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountButton, { once: true });
  }
}
