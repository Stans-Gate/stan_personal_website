// Optional sound, off by default. Everything is synthesized with WebAudio, so
// there are no audio files to download.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;

function noiseBuffer(ac: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * seconds), ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = white;
  }
  return buf;
}

function start() {
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  // low dungeon ambience: filtered brown noise that slowly breathes
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 4, true);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 260;
  const amb = ctx.createGain();
  amb.gain.value = 0.5;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.18;
  lfo.connect(lfoGain).connect(amb.gain);
  src.connect(lp).connect(amb).connect(master);
  src.start();
  lfo.start();
}

export function setSound(on: boolean) {
  enabled = on;
  try {
    if (on && !ctx) start();
    if (ctx && master) {
      if (on) void ctx.resume();
      master.gain.setTargetAtTime(on ? 0.6 : 0, ctx.currentTime, 0.15);
    }
  } catch {
    enabled = false;
  }
  return enabled;
}

function burst(freq: number, q: number, dur: number, gain: number) {
  if (!enabled || !ctx || !master) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, dur, false);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  src.connect(bp).connect(g).connect(master);
  src.start();
}

export const sfx = {
  step() {
    burst(380 + Math.random() * 120, 1.2, 0.07, 0.22);
  },
  page() {
    burst(2400, 0.7, 0.28, 0.16);
    setTimeout(() => burst(3000, 0.7, 0.2, 0.12), 110);
  },
  cork() {
    if (!enabled || !ctx || !master) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.09);
    g.gain.setValueAtTime(0.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(g).connect(master);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  },
};
