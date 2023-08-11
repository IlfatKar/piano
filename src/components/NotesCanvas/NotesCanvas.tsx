import React, { useRef, useEffect, useContext, useState } from "react";
import "./NotesCanvas.css";
import { keysCount } from "../../utils";
import { ActiveNotesContext } from "../../App";

class NoteBlock {
  constructor(
    note: number,
    position: [number, number],
    color: string,
    isBlack: boolean
  ) {
    this.id = Date.now() + note * Date.now();
    this.note = note;
    this.position = position;
    this.color = color;
    this.isBlack = isBlack;
  }
  id;
  note;
  position;
  color;
  isBlack;
}
const blockHeight = 100;
const speed = 1;

function getWhiteCount(key: number) {
  const a = key / 12;
  const w = key - Math.round(a * 5);
  return w;
}

export default function NotesCanvas() {
  const { active } = useContext(ActiveNotesContext);
  const [blocks, setBlocks] = useState<NoteBlock[]>([]);
  const [blockWidth, setBlockWidth] = useState<number>(0);
  const requestAnim = useRef<number>(0);
  const canvas = useRef<HTMLCanvasElement>(null);

  let prev: number | null = null;
  // FIXME
  let draw = (timestamp: number, ctx: CanvasRenderingContext2D) => {
    setBlocks((blocks) => {
      if (!prev) prev = timestamp;
      const dt = timestamp - prev;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      prev = timestamp;
      let arr: NoteBlock[] = [...blocks];
      const blackWidth = blockWidth * 0.6;
      blocks.forEach((item) => {
        ctx.fillStyle = item.color;
        ctx.fillRect(
          item.position[0],
          item.position[1],
          !item.isBlack ? blockWidth : blackWidth,
          blockHeight
        );

        item.position[1] -= speed * dt;
        if (item.position[1] + blockHeight < 0) {
          arr = arr.filter((block) => block.id !== item.id);
        }
      });
      return arr;
    });
    requestAnim.current = requestAnimationFrame((timestamp) => {
      draw(timestamp, ctx);
    });
  };

  useEffect(() => {
    if (canvas.current) {
      const ctx = canvas.current.getContext("2d");
      if (!ctx) {
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.current.getBoundingClientRect();
      canvas.current.width = rect.width * dpr;
      canvas.current.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      setBlockWidth(ctx.canvas.width / keysCount);
      requestAnim.current = requestAnimationFrame((time) => draw(time, ctx));
    }
    return () => cancelAnimationFrame(requestAnim.current);
  }, [canvas]);

  useEffect(() => {
    const arr: NoteBlock[] = [...blocks];
    let blackWidth = blockWidth * 0.6;
    active.forEach((isBlack, key) => {
      const w = getWhiteCount(key - 1);
      // FIXME
      const x = !isBlack ? w * blockWidth : w * blockWidth - blackWidth / 2;

      arr.push(
        new NoteBlock(
          key,
          [x, window.innerHeight * 0.75],
          `rgb(${Math.random() * 255},${Math.random() * 255},${
            Math.random() * 255
          })`,
          isBlack
        )
      );
    });
    setBlocks(arr);
  }, [active, blockWidth]);

  return (
    <div className="notes">
      <canvas ref={canvas}></canvas>
    </div>
  );
}
