import { createGain, createOscillator, setFq } from "../utils";

export const usePlayNote = (settings: {
  audioCtx: AudioContext;
  oscillators: Map<number, { oscillator: OscillatorNode; gain: GainNode }>;
  master: GainNode;
  baseFq: number;
}) => {
  return (note: number) => {
    const copy = new Map(settings.oscillators);
    let t = copy.get(note);
    if (t) {
      t.oscillator.stop();
      t.oscillator.disconnect();
    }
    const gain = createGain(settings.audioCtx, settings.master);
    const oscillator = createOscillator(settings.audioCtx);
    copy.set(note, {
      gain,
      oscillator,
    });
    t = copy.get(note)!;

    setFq(
      settings.audioCtx,
      t.oscillator,
      settings.baseFq * Math.pow(2, (note - 1) / 12)
    );

    t.oscillator.connect(gain);
    t.oscillator.start();
    return copy;
  };
};

export const useStopNote = (
  audioCtx: AudioContext,
  oscillators: Map<number, { oscillator: OscillatorNode; gain: GainNode }>
) => {
  return (note: number) => {
    const copy = new Map(oscillators);
    const t = copy.get(note);
    t?.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
    return copy;
  };
};
