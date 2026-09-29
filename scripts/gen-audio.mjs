/**
 * gen-audio.mjs — fully programmatic soundtrack for the showreel.
 * No samples, no libraries: oscillators, noise, one-pole filters, envelopes.
 * BPM 128. Section boundaries are frame-derived (frames/30) so every hit
 * lands exactly on a rendered frame.
 *
 * Outputs: public/audio/music.wav -> music.mp3, public/audio/sfx/*.wav
 */
import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const SR = 44100;
const BPM = 128;
const BEAT = 60 / BPM;          // 0.46875s
const S16 = BEAT / 4;           // sixteenth
const DUR = 195;

// ---------------- section boundaries (seconds, frame-derived) ----------------
const B = [0, 10, 20, 29, 38, 47, 57, 65, 75, 85, 93, 105, 115, 125, 133, 141, 149, 158, 167, 177, 185, 195];

// ---------------- mix buffers ----------------
const N = Math.ceil(DUR * SR);
const L = new Float64Array(N);
const R = new Float64Array(N);
const SEND = new Float64Array(N); // reverb/delay send (mono)

let seedState = 12345;
const rnd = () => {
  seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
  return seedState / 0x7fffffff;
};

// ---------------- primitives ----------------
const add = (t, v, pan = 0) => {
  const i = Math.round(t * SR);
  if (i < 0 || i >= N) return;
  const gl = Math.min(1, 1 - pan), gr = Math.min(1, 1 + pan);
  L[i] += v * gl; R[i] += v * gr;
};
const addSend = (t, v) => {
  const i = Math.round(t * SR);
  if (i >= 0 && i < N) SEND[i] += v;
};

/** render an event into the mix with a per-sample generator */
function event(t0, dur, gen, opts = {}) {
  const { amp = 1, pan = 0, send = 0 } = opts;
  const start = Math.round(t0 * SR);
  const len = Math.min(Math.round(dur * SR), N - start);
  if (len <= 0) return;
  let lp = 0;
  for (let j = 0; j < len; j++) {
    const s = gen(j / SR) * amp;
    lp += 0.68 * (s - lp); // gentle anti-alias LP
    const i = start + j;
    const gl = Math.min(1, 1 - pan), gr = Math.min(1, 1 + pan);
    L[i] += lp * gl; R[i] += lp * gr;
    if (send) SEND[i] += lp * send;
  }
}

// ---------------- instruments ----------------
const kick = (t, a = 1) => {
  event(t, 0.32, (x) => {
    const f = 42 + 95 * Math.exp(-x * 55);
    const env = Math.exp(-x * 13) * (1 - Math.exp(-x * 900));
    const click = Math.exp(-x * 400) * (rnd() * 2 - 1) * 0.4;
    return Math.sin(2 * Math.PI * f * x) * env * 0.95 + click * env;
  }, { amp: a });
  addSend(t, a * 0.18);
};
const subHit = (t, a = 1, f = 44) => {
  event(t, 1.2, (x) => Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 4.2), { amp: a });
};
const hat = (t, open = false, a = 1, pan = 0.25) => {
  const d = open ? 0.24 : 0.045;
  event(t, d, (x) => {
    const n = rnd() * 2 - 1;
    return (n - (rnd() * 2 - 1)) * Math.exp(-x * (open ? 18 : 90));
  }, { amp: a * (open ? 0.5 : 0.4), pan });
};
const snare = (t, a = 1) => {
  event(t, 0.22, (x) => {
    const n = (rnd() * 2 - 1) * Math.exp(-x * 22);
    const tone = Math.sin(2 * Math.PI * 190 * x) * Math.exp(-x * 28);
    return n * 0.8 + tone * 0.5;
  }, { amp: a * 0.7, send: 0.25 });
};
const bass = (t, f, dur, a = 1) => {
  let lp = 0;
  event(t, dur, (x) => {
    const ph = (x * f) % 1;
    const saw = 2 * ph - 1;
    const cut = 220 + 700 * Math.exp(-x * 6);
    lp += Math.min(1, cut / SR * 2 * Math.PI) * (saw - lp);
    const env = Math.min(1, x * 200) * Math.exp(-x * 1.4) * (x < dur ? 1 : 0);
    return lp * env;
  }, { amp: a * 0.8 });
};
const ARPS = [110, 130.81, 146.83, 164.81, 196, 220, 261.63, 293.66, 329.63, 392];
let arpAlt = 0;
const arp = (t, f, dur = 0.14, a = 1) => {
  const g = (x) => {
    const tri = 2 * Math.abs(2 * ((x * f) % 1) - 1) - 1;
    const env = Math.exp(-x * 16) * Math.min(1, x * 800);
    return tri * env;
  };
  arpAlt ^= 1;
  event(t, dur, g, { amp: a * 0.42, pan: arpAlt ? 0.3 : -0.3, send: 0.3 });
  event(t + S16 * 1.5, dur, g, { amp: a * 0.14, pan: arpAlt ? -0.5 : 0.5, send: 0.3 });
};
const pad = (t, freqs, dur, a = 1) => {
  for (const f of freqs) {
    for (const det of [-0.002, 0.0025]) {
      const fd = f * (1 + det);
      event(t, dur, (x) => {
        const ph = (x * fd) % 1;
        const saw = 2 * ph - 1;
        const attack = Math.min(1, x / 0.8);
        const release = Math.min(1, (dur - x) / 1.2);
        return saw * attack * release * 0.16;
      }, { amp: a, pan: det < 0 ? -0.55 : 0.55, send: 0.45 });
    }
  }
};
const riser = (t, dur, a = 1) => {
  let lp = 0;
  event(t, dur, (x) => {
    const p = x / dur;
    const n = rnd() * 2 - 1;
    const cut = 400 + 5200 * p * p;
    lp += Math.min(1, cut / SR * 6.28) * (n - lp);
    const tone = Math.sin(2 * Math.PI * (160 + 700 * p) * x) * 0.4;
    const env = p * p * 0.9;
    return (lp + tone) * env;
  }, { amp: a * 0.5, send: 0.2 });
};
const impact = (t, a = 1) => {
  kick(t, a);
  subHit(t, a * 0.8);
  event(t, 0.5, (x) => (rnd() * 2 - 1) * Math.exp(-x * 9) * 0.5, { amp: a * 0.6, send: 0.4 });
};
const tick = (t, a = 1) => {
  event(t, 0.07, (x) => {
    const ping = Math.sin(2 * Math.PI * 4200 * x) * Math.exp(-x * 90);
    const click = (rnd() * 2 - 1) * Math.exp(-x * 700);
    return ping * 0.6 + click * 0.5;
  }, { amp: a * 0.5, pan: (rnd() - 0.5) * 0.6 });
};
const whooshM = (t, a = 1) => {
  let bp = 0, bp2 = 0;
  event(t, 0.9, (x) => {
    const p = x / 0.9;
    const n = rnd() * 2 - 1;
    const center = 0.12 + 0.5 * Math.sin(p * Math.PI);
    bp += (n - bp) * center; bp2 += (bp - bp2) * center * 0.9;
    const bell = Math.sin(p * Math.PI);
    return (bp - bp2) * bell;
  }, { amp: a * 0.9, send: 0.3 });
};

// ---------------- arrangement ----------------
const inRange = (t, a, b) => t >= a && t < b;
const chordRoots = [55, 55, 43.65, 49]; // A1 A1 F1 G1 per bar

// A — intro 0–10
[[0.8, 0.9], [2.4, 0.85], [4.0, 0.95], [5.0, 1.0]].forEach(([t, a]) => impact(t, a));
subHit(6.2, 0.5, 58);
for (let i = 0; i < 10; i++) arp(6.4 + i * S16 * 2, ARPS[2 + (i % 3)], 0.12, 0.5 + i * 0.05);
riser(7.6, 2.4, 0.9);

// bars helper: iterate beats
function eachBar(t0, t1, cb) {
  const b0 = Math.ceil(t0 / BEAT), b1 = Math.floor(t1 / BEAT);
  for (let b = b0; b <= b1; b++) cb(b, b * BEAT);
}

// B/C — groove 10–47 (full after 29)
eachBar(B[1], B[5], (b, t) => {
  const root = chordRoots[b % 4];
  for (let k = 0; k < 4; k++) kick(t + k * BEAT, inRange(t, B[3], B[5]) ? 1 : 0.82);
  if (inRange(t, B[3], B[5])) { snare(t + BEAT, 0.9); snare(t + 3 * BEAT, 0.9); }
  for (let k = 0; k < 8; k++) {
    hat(t + k * BEAT * 0.5 + BEAT * 0.25, false, inRange(t, B[3], B[5]) ? 0.8 : 0.55);
    bass(t + k * BEAT * 0.5, k % 2 === 0 ? root : root * 2, 0.2, 0.85);
  }
  if (inRange(t, B[3], B[5])) for (let k = 0; k < 16; k++) if (k % 4 !== 0) hat(t + k * S16, false, 0.22, -0.25);
  const arpPat = inRange(t, B[3], B[5]) ? [0, 2, 3, 5, 6, 8, 10, 11, 12, 14] : [0, 3, 6, 8, 12, 14];
  for (const s of arpPat) arp(t + s * S16, ARPS[(s + b) % ARPS.length], 0.13, 0.8);
  if (b % 4 === 0) pad(t, [110 * 2, 130.81 * 2, 164.81 * 2], BEAT * 4, 0.7);
});

// D — transition lab 47–57: ticks on cuts + groove continues
for (let k = 1; k <= 6; k++) tick(B[5] + (44 * k) / 30, 1);
eachBar(B[5], B[6], (b, t) => {
  for (let k = 0; k < 4; k++) kick(t + k * BEAT, 0.75);
  for (let k = 0; k < 4; k++) bass(t + k * BEAT * 0.5, chordRoots[b % 4], 0.2, 0.7);
  for (const s of [2, 6, 10, 14]) arp(t + s * S16, ARPS[(s + 3) % ARPS.length], 0.1, 0.6);
});

// E — physics 57–65
eachBar(B[6], B[7], (b, t) => {
  for (let k = 0; k < 4; k++) kick(t + k * BEAT, 0.8);
  for (let k = 0; k < 8; k++) hat(t + k * BEAT * 0.5, false, 0.5);
  for (const s of [0, 3, 7, 10, 13]) arp(t + s * S16, ARPS[(s * 2 + b) % ARPS.length], 0.12, 0.85);
  for (let k = 0; k < 4; k++) bass(t + k * BEAT * 0.5, chordRoots[b % 4] * 2, 0.18, 0.7);
});
riser(63.4, 1.6, 0.8);

// F — particles 65–75
eachBar(B[7], B[8], (b, t) => {
  for (let k = 0; k < 4; k++) kick(t + k * BEAT, 0.85);
  for (let k = 0; k < 16; k++) hat(t + k * S16, k % 8 === 4, k % 2 ? 0.3 : 0.55);
  for (const s of [0, 1, 3, 6, 8, 11, 12, 14]) arp(t + s * S16, ARPS[(s + b * 2) % ARPS.length] * 2, 0.11, 0.75);
  for (let k = 0; k < 8; k++) bass(t + k * S16 * 2, chordRoots[b % 4], 0.16, 0.8);
  if (b % 2 === 0) pad(t, [110, 164.81, 196], BEAT * 2, 0.5);
});

// G — DROP 75–85 (audio reactive: bass-rich + treble sparkle for the FFT)
eachBar(B[8], B[9], (b, t) => {
  for (let k = 0; k < 4; k++) kick(t + k * BEAT, 1);
  subHit(t, 0.9, 41.2); subHit(t + 2 * BEAT, 0.75, 41.2);
  snare(t + BEAT, 1); snare(t + 3 * BEAT, 1);
  for (let k = 0; k < 16; k++) hat(t + k * S16, false, k % 4 === 2 ? 0.75 : 0.5);
  for (let k = 0; k < 4; k++) bass(t + k * BEAT, k % 4 === 3 ? chordRoots[b % 4] * 1.5 : chordRoots[b % 4], BEAT * 0.92, 1);
  // sustained sub drone so the low end never falls silent between hits
  event(t, BEAT * 4, (x) => Math.sin(2 * Math.PI * 55 * x) * 0.5, { amp: 0.55 });
  for (const s of [2, 6, 10, 14]) arp(t + s * S16, ARPS[(s + b) % ARPS.length] * 4, 0.09, 0.4);
  if (b % 2 === 1) impact(t + 3.5 * BEAT, 0.7);
});

// H — sound design 85–93 (music ducks; scene plays its own SFX)
pad(B[9], [110, 130.81, 164.81], 7.5, 0.85);
kick(B[9] + 2, 0.5); kick(B[9] + 4, 0.5); kick(B[9] + 6, 0.5);
whooshM(B[9] + 0.4, 0.4);
subHit(B[9] + 7.2, 0.6, 49);

// I — 3D 93–105 (halftime, wide)
eachBar(B[10], B[11], (b, t) => {
  kick(t, 0.95); kick(t + 2.5 * BEAT, 0.7);
  snare(t + 2 * BEAT, 0.85);
  for (let k = 0; k < 8; k++) hat(t + k * BEAT * 0.5 + BEAT * 0.5, k % 4 === 3, 0.42, 0.3);
  bass(t, chordRoots[b % 4], BEAT * 1.8, 0.9); bass(t + 2.5 * BEAT, chordRoots[b % 4], BEAT, 0.7);
  if (b % 2 === 0) pad(t, [55, 110, 164.81, 246.94], BEAT * 4, 1.0);
});

// J — VFX/shader 105–125 (glitchy)
eachBar(B[11], B[13], (b, t) => {
  for (let k = 0; k < 4; k++) kick(t + k * BEAT, 0.8);
  snare(t + BEAT, 0.8); snare(t + 3 * BEAT, 0.85);
  const gl = [0, 1, 4, 7, 8, 11, 13];
  for (const s of gl) tick(t + s * S16 * 2, 0.8);
  for (const s of [0, 3, 6, 9, 12, 15]) arp(t + s * S16, ARPS[(s + b) % ARPS.length] * 2, 0.1, 0.55);
  for (let k = 0; k < 4; k++) bass(t + k * BEAT * 0.5, chordRoots[b % 4], 0.2, 0.75);
  if (b % 4 === 3) riser(t + BEAT * 3, BEAT, 0.4);
});

// K — lottie 125–133 (light)
eachBar(B[13], B[14], (b, t) => {
  kick(t, 0.6); kick(t + 2 * BEAT, 0.55);
  for (const s of [0, 4, 8, 12]) hat(t + s * S16 * 2 + S16, false, 0.4, 0.3);
  for (const s of [0, 6, 10]) arp(t + s * S16, ARPS[(s + b) % ARPS.length] * 2, 0.14, 0.7);
});

// L — rough 133–141 (sparse)
pad(B[14], [110, 164.81, 196, 261.63], 7.8, 0.7);
for (let i = 0; i < 14; i++) tick(B[14] + i * 0.53, 0.35);

// M — captions 141–149 (voice space)
pad(B[15], [110, 130.81, 164.81], 7.6, 0.6);
kick(B[15] + 2.5, 0.45); kick(B[15] + 5.5, 0.45);
subHit(B[15] + 7.4, 0.5, 55);

// N/O — media + code 149–167 (groove returns)
eachBar(B[16], B[18], (b, t) => {
  const full = t >= B[17];
  for (let k = 0; k < 4; k++) kick(t + k * BEAT, full ? 0.95 : 0.8);
  if (full) { snare(t + BEAT, 0.85); snare(t + 3 * BEAT, 0.85); }
  for (let k = 0; k < 8; k++) {
    hat(t + k * BEAT * 0.5 + BEAT * 0.25, false, 0.5);
    bass(t + k * BEAT * 0.5, k % 2 ? chordRoots[b % 4] * 2 : chordRoots[b % 4], 0.18, 0.85);
  }
  const pat = full ? [0, 2, 3, 5, 6, 8, 11, 12, 14] : [0, 3, 6, 10, 12];
  for (const s of pat) arp(t + s * S16, ARPS[(s + b) % ARPS.length], 0.12, full ? 0.85 : 0.65);
});

// P — EVERYTHING drop 167–177 (peak)
eachBar(B[18], B[19], (b, t) => {
  for (let k = 0; k < 4; k++) kick(t + k * BEAT, 1);
  snare(t + BEAT, 1); snare(t + 3 * BEAT, 1);
  for (let k = 0; k < 16; k++) hat(t + k * S16, k % 8 === 6, k % 4 === 2 ? 0.55 : 0.3);
  for (let k = 0; k < 8; k++) bass(t + k * S16 * 2, k % 4 === 3 ? chordRoots[b % 4] * 1.5 : chordRoots[b % 4], 0.14, 1);
  for (const s of [0, 1, 3, 4, 6, 8, 9, 11, 12, 14, 15]) arp(t + s * S16, ARPS[(s + b) % ARPS.length] * 2, 0.1, 0.8);
  if (b % 2 === 0) pad(t, [110, 164.81, 220, 329.63], BEAT * 2, 0.8);
  if (b % 4 === 3) riser(t + BEAT * 2, BEAT * 2, 0.5);
});

// Q — matrix 177–185 (halftime heavy)
eachBar(B[19], B[20], (b, t) => {
  kick(t, 1); kick(t + 2.5 * BEAT, 0.85);
  snare(t + 2 * BEAT, 0.95);
  for (let k = 0; k < 8; k++) bass(t + k * BEAT * 0.5, chordRoots[b % 4], 0.18, 0.95);
  for (let k = 0; k < 16; k++) if (k % 2) hat(t + k * S16, false, 0.3);
});

// R — hero 185–195
pad(B[20], [110, 164.81, 196, 220, 329.63], 9.5, 1.0);
impact(B[20] + 0.5, 0.9);
subHit(B[20] + 4.4, 1.0, 41.2); // S22 hit at local f132 = 189.4s
for (let i = 0; i < 12; i++) arp(B[20] + 1 + i * S16 * 3, ARPS[2 + (i % 5)] * 2, 0.3, 0.35);

// ---------------- delay bus (dotted 8th feedback) ----------------
const DT = Math.round(S16 * 3 * SR);
const dL = new Float64Array(DT), dR = new Float64Array(DT);
let di = 0;
for (let i = 0; i < N; i++) {
  const s = SEND[i];
  const out = (dL[di] + dR[di]) * 0.5;
  dL[di] = (s + out * 0.42) * 0.985;
  dR[di] = (s * 0.7 + out * 0.42);
  L[i] += out * 0.55;
  R[i] += out * 0.62;
  di = (di + 1) % DT;
}

// ---------------- ducking ----------------
function duckFactor(t) {
  if (t >= B[9] && t < B[10]) return 0.38;      // sound design
  if (t >= B[15] && t < B[16]) return 0.55;     // captions/voice
  return 1;
}
const smooth = new Float64Array(N);
let cur = 1;
for (let i = 0; i < N; i++) {
  const target = duckFactor(i / SR);
  cur += (target - cur) * 0.0006;
  smooth[i] = cur;
}

// ---------------- master ----------------
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const d = smooth[i];
  let l = L[i] * d, r = R[i] * d;
  l = Math.tanh(l * 1.15) * 0.92;
  r = Math.tanh(r * 1.15) * 0.92;
  const fadeIn = Math.min(1, t / 0.02);
  const fadeOut = Math.min(1, (DUR - t) / 2.2);
  L[i] = l * fadeIn * fadeOut;
  R[i] = r * fadeIn * fadeOut;
}

// ---------------- WAV writer ----------------
function writeWav(path, left, right) {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(left[i] * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(right[i] * 32767))), 46 + i * 4);
  }
  writeFileSync(path, buf);
}

mkdirSync('public/audio/sfx', { recursive: true });
writeWav('public/audio/music.wav', L, R);
console.log('music.wav written', (N / SR).toFixed(1) + 's');

// ---------------- SFX files (used by Scene 10 + others) ----------------
function renderSfx(name, dur, gen) {
  const n = Math.ceil(dur * SR);
  const l = new Float64Array(n), r = new Float64Array(n);
  let lp = 0;
  for (let j = 0; j < n; j++) {
    const v = Math.tanh(gen(j / SR) * 1.1) * 0.9;
    lp += 0.7 * (v - lp);
    l[j] = lp; r[j] = lp;
  }
  writeWav(`public/audio/sfx/${name}.wav`, l, r);
  console.log(`sfx/${name}.wav`);
}

renderSfx('whoosh', 1.0, (x) => {
  const p = x / 1.0;
  let bp = 0, bp2 = 0;
  const n = rnd() * 2 - 1;
  const c = 0.08 + 0.4 * Math.sin(p * Math.PI);
  bp += (n - bp) * c; bp2 += (bp - bp2) * c * 0.85;
  return (bp - bp2) * Math.sin(p * Math.PI) * 2.2;
});
renderSfx('impact', 0.7, (x) => {
  const f = 40 + 110 * Math.exp(-x * 50);
  return Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 8) * 1.3 + (rnd() * 2 - 1) * Math.exp(-x * 30) * 0.6;
});
renderSfx('sub', 1.0, (x) => Math.sin(2 * Math.PI * 44 * x) * Math.exp(-x * 4.5) * 1.25);
renderSfx('tick', 0.12, (x) => Math.sin(2 * Math.PI * 4200 * x) * Math.exp(-x * 70) * 0.8 + (rnd() * 2 - 1) * Math.exp(-x * 500) * 0.4);
renderSfx('riser', 2.8, (x) => {
  const p = x / 2.8;
  const n = rnd() * 2 - 1;
  const tone = Math.sin(2 * Math.PI * (180 + 720 * p) * x) * 0.5;
  return (n * 0.7 + tone) * p * p * 1.6;
});

// mp3 for music (smaller for git + browser decode is fine)
execSync('ffmpeg -y -loglevel error -i public/audio/music.wav -codec:a libmp3lame -b:a 192k public/audio/music.mp3');
console.log('music.mp3 written');
