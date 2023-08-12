import React, { useContext, useEffect, useState } from "react";
import Key from "../Key/Key";
import "./Keyboard.css";
import { usePlayNote, useStopNote } from "../../hooks/index";
import { activeType, getCurrentOscillatorKey, keys } from "../../utils";
import { ActiveNotesContext } from "../../App";

const Volume = 1;
export default function Keyboard() {
  const audioCtx = new AudioContext();
  const master = audioCtx.createGain();
  master.gain.value = Volume;
  master.connect(audioCtx.destination);
  const { active, setActive } = useContext(ActiveNotesContext);
  const [oscillators, setOscillators] = useState(
    new Map<number, { oscillator: OscillatorNode; gain: GainNode }>()
  );

  const playNote = usePlayNote({
    audioCtx,
    baseFq: 27.5,
    master,
    oscillators,
  });
  const stopNote = useStopNote(audioCtx, oscillators);

  const changeNoteStatus = (
    key: number[] | undefined,
    newStatus: "on" | "off",
    isBlack: boolean
  ) => {
    if (!key) {
      return;
    }
    const isHas = isBlack ? active.has(key[1]) : active.has(key[0]);
    const idx = isBlack ? key[1] : key[0];
    if ((isHas && newStatus === "off") || (!isHas && newStatus === "on")) {
      setOscillators(newStatus === "on" ? playNote(idx) : stopNote(idx));
      setActive((prev) => {
        const copy = new Map(prev);
        copy[newStatus === "on" ? "set" : "delete"](idx, isBlack);
        return copy;
      });
    }
  };

  const keyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    const key = getCurrentOscillatorKey(e.key);
    changeNoteStatus(key, "on", Number.isInteger(+e.key));
  };

  const keyUp = (e: KeyboardEvent) => {
    e.preventDefault();
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
            isBlack={n[1] > 1}
          />
        );
      })}
    </div>
  );
}
