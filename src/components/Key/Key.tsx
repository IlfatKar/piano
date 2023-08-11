import React, { memo } from "react";
import "./Key.css";

export default memo(function Key({
  isBlack,
  active,
  onEnter,
  onLeave,
}: {
  isBlack?: boolean;
  active: 0 | 1 | 2 | 3;
  onEnter: (isBlack: boolean) => void;
  onLeave: (isBlack: boolean) => void;
}) {
  return (
    <div className="Key">
      <div
        className={`KeyWhite ${active === 1 || active === 3 ? "active" : ""}`}
        onMouseEnter={(e) => e.buttons && onEnter(false)}
        onMouseLeave={(e) => e.buttons && onLeave(false)}
        onMouseDown={() => onEnter(false)}
        onMouseUp={() => onLeave(false)}
      ></div>
      {isBlack && (
        <div
          onMouseEnter={(e) => e.buttons && onEnter(true)}
          onMouseLeave={(e) => e.buttons && onLeave(true)}
          onMouseDown={() => onEnter(true)}
          onMouseUp={() => onLeave(true)}
          className={`KeyBlack ${active === 2 || active === 3 ? "active" : ""}`}
        ></div>
      )}
    </div>
  );
});
