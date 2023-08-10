import React, { useEffect } from "react";
import Key from "../Key/Key";
import "./Keyboard.css";

const whites = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"];
const blacks = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
const keysCount = 7 * 5;

const getCurrentOscillatorKey = (key: string) => {
  let idx = -1;
  if (Number.isInteger(+key)) {
    idx = blacks.findIndex((item) => item === key) + 50;
  } else {
    idx = whites.findIndex((item) => item === key);
  }
  return idx;
};

const createOscillator = (audioCtx: AudioContext, idx: number) => {
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  oscillator.detune.setValueAtTime(100 * idx, audioCtx.currentTime);
  return oscillator;
};

export default function Keyboard() {
  const audioCtx = new AudioContext();
  const gain = audioCtx.createGain();
  gain.gain.value = 0.2;
  gain.connect(audioCtx.destination);
  let iota = -1;
  const oscillators = new Map<number, OscillatorNode>();
  const active = new Set<number>();
  for (let i = 0; i < keysCount; i++) {
    const osc = createOscillator(audioCtx, ++iota);
    oscillators.set(iota, osc);
    osc.connect(gain);
    if (!(i % 7 === 0 || i % 7 === 3)) {
      const blackOsc = createOscillator(audioCtx, iota + 50);
      oscillators.set(iota + 50, blackOsc);
      blackOsc.detune.setValueAtTime(100 * iota + 50, audioCtx.currentTime);
      oscillators.get(iota + 50)!.connect(gain);
    }
  }

  const keyDown = (e: KeyboardEvent) => {
    const idx = getCurrentOscillatorKey(e.key);
    const t = oscillators.get(idx);
    if (t && !active.has(idx)) {
      active.add(idx);
      t.start();
    }
  };

  const keyUp = (e: KeyboardEvent) => {
    const idx = getCurrentOscillatorKey(e.key);
    const t = oscillators.get(idx);
    if (t) {
      active.delete(idx);
      t.stop();

      oscillators.set(idx, createOscillator(audioCtx, idx));
      if (idx - 50 > 0) {
        oscillators
          .get(idx)!
          .detune.setValueAtTime(100 * (idx - 50) + 50, audioCtx.currentTime);
      }
      oscillators.get(idx)!.connect(gain);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  return (
    <div className="Keyboard">
      {new Array(keysCount).fill(0).map((_, i) => {
        return <Key key={i} isBlack={!(i % 7 === 0 || i % 7 === 3)} />;
      })}
    </div>
  );
}
