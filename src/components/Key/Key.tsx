import React, { memo } from "react";
import "./Key.css";

export default memo(function Key({
  isBlack,
  active,
}: {
  isBlack?: boolean;
  active: 0 | 1 | 2;
}) {
  return (
    <div className="Key">
      <div className={`KeyWhite ${active === 1 ? "active" : ""}`}></div>
      {isBlack && (
        <div className={`KeyBlack ${active === 2 ? "active" : ""}`}></div>
      )}
    </div>
  );
});
