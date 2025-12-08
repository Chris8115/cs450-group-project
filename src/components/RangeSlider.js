import React from "react";
import "./RangeSlider.css";

function RangeSlider({ min, max, valueMin, valueMax, onChange }) {

  // Ensure handles do not cross
  const handleMin = (e) => {
    const v = Number(e.target.value);
    if (v <= valueMax) onChange(v, valueMax);
  };

  const handleMax = (e) => {
    const v = Number(e.target.value);
    if (v >= valueMin) onChange(valueMin, v);
  };

  return (
    <div className="range-slider">
      <input
        type="range"
        min={min}
        max={max}
        value={valueMin}
        onChange={handleMin}
        className="thumb thumb-left"
      />

      <input
        type="range"
        min={min}
        max={max}
        value={valueMax}
        onChange={handleMax}
        className="thumb thumb-right"
      />

      <div className="slider">
        <div className="slider-track"></div>
        <div
          className="slider-range"
          style={{
            left: `${(valueMin / max) * 100}%`,
            width: `${((valueMax - valueMin) / max) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}

export default RangeSlider;
