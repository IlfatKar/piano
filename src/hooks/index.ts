import { blackDelta, createOscillator } from "../utils";

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
    t.frequency.setValueAtTime(settings.baseFq, settings.audioCtx.currentTime);
    if (note - blackDelta >= 0) {
      t.detune.setValueAtTime(
        100 * (note - blackDelta) + blackDelta,
        settings.audioCtx.currentTime
      );
    }
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
