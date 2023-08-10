import React from "react";
import "./Key.css";

export default function Key({ isBlack }: { isBlack?: boolean }) {
  return (
    <div className="Key">
      <div className={`KeyWhite`}></div>
      {isBlack && <div className="KeyBlack"></div>}
    </div>
  );
}
