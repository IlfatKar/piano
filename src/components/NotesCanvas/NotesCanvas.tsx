import React, { useRef, useEffect, useContext, useState } from "react";
import "./NotesCanvas.css";
import { keysCount } from "../../utils";
import { ActiveNotesContext } from "../../App";

const colors = [
  "#00FEFC",
  "#00FF00",
  "#15F4EE",
  "#4D4DFF",
  "#50BFE6",
  "#66FF66",
  "#6F00FF",
  "#9457EB",
  "#C3732A",
  "#CCFF00",
  "#DF00FF",
  "#FF6EFF",
];

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
  continuous: boolean = true;
  height: number = 1;
}
const speed = 1;

function getWhiteCount(key: number) {
  const a = key / 12;
  const w = key - Math.round(a * 5 - 0.05);
  return w;
}

export default function NotesCanvas() {
  const { active } = useContext(ActiveNotesContext);
  const [prevActive, setPrevActive] = useState(new Map(active));
  const [blocks, setBlocks] = useState<NoteBlock[]>([]);
  const [blockWidth, setBlockWidth] = useState<number>(0);
  const requestAnim = useRef<number>(0);
  const canvas = useRef<HTMLCanvasElement>(null);

  let prev: number | null = null;
  let draw = (
    timestamp: number,
    ctx: CanvasRenderingContext2D,
    blockWidth: number
  ) => {
    setBlocks((blocks) => {
      if (!prev) prev = timestamp;
      const dt = timestamp - prev;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      prev = timestamp;
      let arr: NoteBlock[] = [...blocks];
      const blackWidth = blockWidth * 0.6;
      blocks.forEach((item) => {
        ctx.fillStyle = item.color;
        if (item.continuous) item.height += speed * dt;
        ctx.fillRect(
          item.position[0],
          item.position[1],
          !item.isBlack ? blockWidth : blackWidth,
          item.height
        );
        item.position[1] -= speed * dt;
        if (item.position[1] + item.height < 0) {
          arr = arr.filter((block) => block.id !== item.id);
        }
      });
      return arr;
    });
    requestAnim.current = requestAnimationFrame((timestamp) => {
      draw(timestamp, ctx, blockWidth);
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
      requestAnim.current = requestAnimationFrame((time) =>
        draw(time, ctx, blockWidth)
      );
    }
    return () => cancelAnimationFrame(requestAnim.current);
  }, [canvas, blockWidth]);

  useEffect(() => {
    const arr: NoteBlock[] = [...blocks];
    let blackWidth = blockWidth * 0.6;
    const skip = new Set<number>();

    prevActive.forEach((_, key) => {
      if (!active.has(key)) {
        const item = arr.find((item) => item.note === key && item.continuous);
        if (item) {
          item.continuous = false;
          skip.add(key);
        }
      }
    });

    active.forEach((isBlack, key) => {
      if (!skip.has(key) && !prevActive.has(key)) {
        let w = getWhiteCount(key - 1);
        const x = !isBlack ? w * blockWidth : w * blockWidth - blackWidth / 2;
        arr.push(
          new NoteBlock(
            key,
            [x, window.innerHeight * 0.75],
            colors[key % 12],
            isBlack
          )
        );
      }
    });

    setBlocks(arr);
    setPrevActive(active);
  }, [active, blockWidth]);

  return (
    <div className="notes">
      <canvas ref={canvas}></canvas>
    </div>
  );
}
