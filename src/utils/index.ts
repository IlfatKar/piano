import wavetable from "../wavetables/Organ.json";
export const keysCount = 7 * 6;
const skipKeys = 7 * 2;
let iota = 0;
export const keys: ([number] | [number, number])[] = new Array(keysCount)
  .fill(0)
  .map((_, i) => {
    if (i % 7 === 3 || i % 7 === 0) return [0, ++iota];
    const w = ++iota,
      b = ++iota;
    return [b, w];
  });

const whites = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"];
export const getCurrentOscillatorKey = (key: string) => {
  const idx = whites.findIndex((item) => item === key);
  if (idx !== -1) {
    return keys[idx + skipKeys];
  } else {
    return keys.find((_, idx) => idx === +key + skipKeys);
  }
};

export const createOscillator = (audioCtx: AudioContext, idx: number) => {
  const oscillator = audioCtx.createOscillator();
  return oscillator;
};

export const activeType = (active: Set<number>, n: number[]) => {
  if (active.has(n[1]) && active.has(n[0])) return 3;
  if (active.has(n[1])) return 1;
  if (active.has(n[0])) return 2;
  return 0;
};
export const setFq = (
  audioContext: AudioContext,
  oscillator: OscillatorNode,
  frequency: number
) => {
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  const wave = new PeriodicWave(audioContext, {
    real: wavetable.real,
    imag: wavetable.imag,
  });

  oscillator.setPeriodicWave(wave);
};
