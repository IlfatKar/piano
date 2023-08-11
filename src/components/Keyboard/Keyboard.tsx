import React, { useEffect, useState } from "react";
import Key from "../Key/Key";
import "./Keyboard.css";
import { usePlayNote, useStopNote } from "../../hooks/index";
import {
  activeType,
  blackDelta,
  getCurrentOscillatorKey,
  keysCount,
} from "../../utils";

export default function Keyboard() {
  const audioCtx = new AudioContext();
  const gain = audioCtx.createGain();
  gain.gain.value = 0.05;
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

  const changeNoteStatus = (idx: number, newStatus: "on" | "off") => {
    if (
      (idx !== -1 && active.has(idx) && newStatus === "off") ||
      (!active.has(idx) && newStatus === "on")
    ) {
      setOscillators(newStatus === "on" ? playNote(idx) : stopNote(idx));
      setActive((prev) => {
        const copy = new Set(prev);
        copy[newStatus === "on" ? "add" : "delete"](idx);
        return copy;
      });
    }
  };

  const keyDown = (e: KeyboardEvent) => {
    const idx = getCurrentOscillatorKey(e.key);
    changeNoteStatus(idx, "on");
  };

  const keyUp = (e: KeyboardEvent) => {
    const idx = getCurrentOscillatorKey(e.key);
    changeNoteStatus(idx, "off");
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
              const idx = isBlack ? i + blackDelta : i;
              changeNoteStatus(idx, "off");
            }}
            onEnter={(isBlack: boolean) => {
              const idx = isBlack ? i + blackDelta : i;
              changeNoteStatus(idx, "on");
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
