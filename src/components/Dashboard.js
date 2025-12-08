import React, { useState, useCallback } from "react";
import { debounce } from "lodash";
import EnergyVsDanceability from "./charts/EnergyVsDanceability";
import TempoHistogram from "./charts/TempoHistogram";
import ValenceLoudnessScatter from "./charts/ValenceLoudnessScatter";
import KeyFeatureBarChart from "./charts/KeyFeatureBarChart";
import RangeSlider from "./RangeSlider";

function Dashboard({ data }) {
  const [popMinLive, setPopMinLive] = useState(0);
  const [popMaxLive, setPopMaxLive] = useState(100);

  const [popMin, setPopMin] = useState(0);
  const [popMax, setPopMax] = useState(100);

  const debouncedSet = useCallback(
    debounce((min, max) => {
      setPopMin(min);
      setPopMax(max);
    }, 120),
    []
  );

  const handleRangeChange = (minVal, maxVal) => {
    setPopMinLive(minVal);
    setPopMaxLive(maxVal);
    debouncedSet(minVal, maxVal);
  };

  const filteredChart1Data = data.filter(
    (d) => d.popularity >= popMin && d.popularity <= popMax
  );

  return (
    <div className="dashboard-container">

      {/* Chart 1 */}
      <div className="chart-section">
        <h3>Chart 1: Energy vs Danceability</h3>

        <label>
          <strong>Popularity:</strong> {popMinLive} – {popMaxLive}
        </label>

        {/* REQUIRED WRAPPER TO KEEP SLIDER POSITIONING STABLE */}
        <div className="range-slider-wrapper">
          <RangeSlider
            min={0}
            max={100}
            valueMin={popMinLive}
            valueMax={popMaxLive}
            onChange={handleRangeChange}
          />
        </div>

        <EnergyVsDanceability data={filteredChart1Data} />
      </div>

      {/* Chart 2 */}
      <div className="chart-section">
        <h3>Chart 2: Tempo Distribution</h3>
        <TempoHistogram data={data} />
      </div>
        {/* ---------------- Chart 3 ---------------- */}
        <div className="chart-section">
        <h3>Chart 3: Valence vs Loudness</h3>
        <ValenceLoudnessScatter data={data} />
        </div>
        
        {/* Chart 4 */}
        <div className="chart-section">
        <h3>Chart 4: Key Feature Bar Chart</h3>
        <KeyFeatureBarChart data={data} feature="energy" />
        </div>


    </div>
  );
}

export default Dashboard;
