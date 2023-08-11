export const whites = [
  "q",
  "w",
  "e",
  "r",
  "t",
  "y",
  "u",
  "i",
  "o",
  "p",
  "[",
  "]",
];
export const blacks = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "-",
  "=",
];
export const keysCount = 7 * 5;
export const blackDelta = 50;
export const getCurrentOscillatorKey = (key: string) => {
  let idx = -1;
  if (Number.isInteger(+key)) {
    idx = blacks.findIndex((item) => item === key) + blackDelta;
  } else {
    idx = whites.findIndex((item) => item === key);
  }
  return idx;
};

export const createOscillator = (audioCtx: AudioContext, idx: number) => {
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  oscillator.detune.setValueAtTime(100 * idx, audioCtx.currentTime);
  return oscillator;
};

export const activeType = (active: Set<number>, idx: number) =>
  active.has(idx) && active.has(idx + blackDelta)
    ? 3
    : active.has(idx)
    ? 1
    : active.has(idx + blackDelta)
    ? 2
    : 0;

export const oscillatorInit = (audioCtx: AudioContext, gain: GainNode) => {
  let iota = -1;
  const copy = new Map<number, OscillatorNode>();
  for (let i = 0; i < keysCount; i++) {
    const osc = createOscillator(audioCtx, ++iota);
    copy.set(iota, osc);
    osc.connect(gain);
    if (!(i % 7 === 0 || i % 7 === 3)) {
      const blackOsc = createOscillator(audioCtx, iota + blackDelta);
      copy.set(iota + blackDelta, blackOsc);
      blackOsc.detune.setValueAtTime(
        100 * iota + blackDelta,
        audioCtx.currentTime
      );
      copy.get(iota + blackDelta)!.connect(gain);
    }
  }
  return copy;
};
