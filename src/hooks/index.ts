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
      t.gain.gain.setValueAtTime(
        t.gain.gain.value,
        settings.audioCtx.currentTime
      );
      t.gain.gain.exponentialRampToValueAtTime(
        0.0001,
        settings.audioCtx.currentTime + 2
      );
      t.oscillator.stop(settings.audioCtx.currentTime + 2.1);
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
    if (t) {
      t.gain.gain.setValueAtTime(t.gain.gain.value, audioCtx.currentTime);
      t.gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + 2
      );
      t.oscillator.stop(audioCtx.currentTime + 2.1);
      copy.delete(note);
    }
    return copy;
  };
};
