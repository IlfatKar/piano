import React, { useEffect, useState } from "react";
import Key from "../Key/Key";
import "./Keyboard.css";
import { usePlayNote, useStopNote } from "../../hooks/index";
import { activeType, getCurrentOscillatorKey, keys } from "../../utils";

export default function Keyboard() {
  const audioCtx = new AudioContext();
  const gain = audioCtx.createGain();
  gain.gain.value = 1;
  gain.connect(audioCtx.destination);

  const [active, setActive] = useState(new Set<number>());
  const [oscillators, setOscillators] = useState(
    new Map<number, OscillatorNode>()
  );

  const playNote = usePlayNote({
    audioCtx,
    baseFq: 220,
    gain,
    oscillators,
  });
  const stopNote = useStopNote(oscillators);

  const changeNoteStatus = (
    key: number[] | undefined,
    newStatus: "on" | "off",
    isBlack: boolean
  ) => {
    if (!key) {
      return;
    }
    const isHas = isBlack ? active.has(key[0]) : active.has(key[1]);
    const idx = isBlack ? key[0] : key[1];
    if ((isHas && newStatus === "off") || (!isHas && newStatus === "on")) {
      setOscillators(newStatus === "on" ? playNote(idx) : stopNote(idx));
      setActive((prev) => {
        const copy = new Set(prev);
        copy[newStatus === "on" ? "add" : "delete"](idx);
        return copy;
      });
    }
  };

  const keyDown = (e: KeyboardEvent) => {
    const key = getCurrentOscillatorKey(e.key);
    changeNoteStatus(key, "on", Number.isInteger(+e.key));
  };

  const keyUp = (e: KeyboardEvent) => {
    const key = getCurrentOscillatorKey(e.key);
    changeNoteStatus(key, "off", Number.isInteger(+e.key));
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
      {keys.map((n, i) => {
        return (
          <Key
            onLeave={(isBlack: boolean) => {
              changeNoteStatus(n, "off", isBlack);
            }}
            onEnter={(isBlack: boolean) => {
              changeNoteStatus(n, "on", isBlack);
            }}
            active={activeType(active, n)}
            key={i}
            isBlack={n[0] > 1}
          />
        );
      })}
    </div>
  );
}
