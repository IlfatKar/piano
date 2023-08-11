import { createOscillator, setFq } from "../utils";

export const usePlayNote = (settings: {
  audioCtx: AudioContext;
  oscillators: Map<number, OscillatorNode>;
  gain: GainNode;
  baseFq: number;
}) => {
  return (note: number) => {
    const copy = new Map(settings.oscillators);
    let t = copy.get(note);
    if (t) {
      t.stop();
      t.disconnect();
    }
    copy.set(note, createOscillator(settings.audioCtx, note));
    t = copy.get(note)!;

    setFq(settings.audioCtx, t, settings.baseFq * Math.pow(2, (note - 1) / 12));
    t.connect(settings.gain);
    t.start();
    return copy;
  };
};

export const useStopNote = (oscillators: Map<number, OscillatorNode>) => {
  return (note: number) => {
    const copy = new Map(oscillators);
    let t = copy.get(note);
    if (t) {
      t.stop();
      t.disconnect();
      copy.delete(note);
    }
    return copy;
  };
};
