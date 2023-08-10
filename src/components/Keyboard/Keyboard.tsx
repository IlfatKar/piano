import React, { useCallback, useEffect, useState } from "react";
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

const activeType = (active: Set<number>, idx: number) =>
  active.has(idx) && active.has(idx + 50)
    ? 3
    : active.has(idx)
    ? 1
    : active.has(idx + 50)
    ? 2
    : 0;

export default function Keyboard() {
  const [active, setActive] = useState(new Set<number>());
  const audioCtx = new AudioContext();
  const gain = audioCtx.createGain();
  gain.gain.value = 0.2;
  gain.connect(audioCtx.destination);

  const [oscillators, setOscillators] = useState(() => {
    let iota = -1;
    const copy = new Map<number, OscillatorNode>();
    for (let i = 0; i < keysCount; i++) {
      const osc = createOscillator(audioCtx, ++iota);
      copy.set(iota, osc);
      osc.connect(gain);
      if (!(i % 7 === 0 || i % 7 === 3)) {
        const blackOsc = createOscillator(audioCtx, iota + 50);
        copy.set(iota + 50, blackOsc);
        blackOsc.detune.setValueAtTime(100 * iota + 50, audioCtx.currentTime);
        copy.get(iota + 50)!.connect(gain);
      }
    }
    return copy;
  });

  const activate = (oscillators: Map<number, OscillatorNode>, idx: number) => {
    const t = oscillators.get(idx);

    setActive((prev) => {
      if (!prev.has(idx) && t) {
        prev.add(idx);
        try {
          t.start();
        } catch (e) {}
        return new Set(prev);
      }
      return prev;
    });
  };

  useEffect(() => {}, [active]);

  const deactivate = (
    oscillators: Map<number, OscillatorNode>,
    idx: number
  ) => {
    const t = oscillators.get(idx);
    if (t && active.has(idx))
      setActive((prev) => {
        if (prev.has(idx)) {
          t.stop();
          prev.delete(idx);
          setOscillators((prev) => {
            const copy = new Map(prev);
            copy.set(idx, createOscillator(audioCtx, idx));
            if (idx - 50 >= 0) {
              copy
                .get(idx)!
                .detune.setValueAtTime(
                  100 * (idx - 50) + 50,
                  audioCtx.currentTime
                );
            }
            copy.get(idx)!.connect(gain);
            return copy;
          });

          return new Set(prev);
        }
        return prev;
      });
  };

  const keyDown = (e: KeyboardEvent) => {
    const idx = getCurrentOscillatorKey(e.key);

    activate(oscillators, idx);
  };

  const keyUp = (e: KeyboardEvent) => {
    const idx = getCurrentOscillatorKey(e.key);

    deactivate(oscillators, idx);
  };

  useEffect(() => {
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [oscillators]);

  return (
    <div className="Keyboard">
      {new Array(keysCount).fill(0).map((_, i) => {
        return (
          <Key
            onLeave={(isBlack: boolean) => {
              const idx = isBlack ? i + 50 : i;
              deactivate(oscillators, idx);
            }}
            onEnter={(isBlack: boolean) => {
              const idx = isBlack ? i + 50 : i;
              activate(oscillators, idx);
            }}
            active={activeType(active, i)}
            key={i}
            isBlack={!(i % 7 === 0 || i % 7 === 3)}
          />
        );
      })}
    </div>
  );
}
