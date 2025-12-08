import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const FEATURES = [
  "energy",
  "danceability",
  "valence",
  "acousticness",
  "instrumentalness",
  "loudness",
  "tempo",
];

// Compute Pearson correlation between two numeric arrays
function pearsonCorrelation(xArr, yArr) {
  const n = xArr.length;
  if (n === 0) return 0;

  const meanX = d3.mean(xArr);
  const meanY = d3.mean(yArr);

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = xArr[i] - meanX;
    const dy = yArr[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;
  return num / den;
}

function CorrelationMatrix({ data }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 520;
    const height = 440;
    const margin = { top: 60, right: 60, bottom: 70, left: 90 };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    // Tooltip (reuse the global tooltip-root like in other charts)
    const tooltip = d3
      .select("#tooltip-root")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(0,0,0,0.85)")
      .style("color", "white")
      .style("padding", "6px 10px")
      .style("font-size", "12px")
      .style("border-radius", "4px")
      .style("opacity", 0);

    const n = FEATURES.length;
    const cellSize = Math.min(
      (width - margin.left - margin.right) / n,
      (height - margin.top - margin.bottom) / n
    );

    //------------------------------------------------
    // 1. Prepare data: compute correlations for i < j
    //------------------------------------------------
    const corrData = [];

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const f1 = FEATURES[i];
        const f2 = FEATURES[j];

        const xVals = [];
        const yVals = [];

        data.forEach((d) => {
          const x = d[f1];
          const y = d[f2];
          if (typeof x === "number" && !isNaN(x) &&
              typeof y === "number" && !isNaN(y)) {
            xVals.push(x);
            yVals.push(y);
          }
        });

        const r = pearsonCorrelation(xVals, yVals);
        corrData.push({
          xFeature: f2,
          yFeature: f1,
          corr: r,
          row: i,
          col: j,
        });
      }
    }

    //---------------------------------------
    // 2. Scales for axes and color
    //---------------------------------------
    const xScale = d3
      .scaleBand()
      .domain(FEATURES)
      .range([margin.left, margin.left + cellSize * n])
      .padding(0.05);

    const yScale = d3
      .scaleBand()
      .domain(FEATURES)
      .range([margin.top, margin.top + cellSize * n])
      .padding(0.05);

    // Color scale: -1 (blue) to +1 (red)
    const color = d3
      .scaleSequential(d3.interpolateRdBu) // RdBu goes red->white->blue
      .domain([1, -1]); // flip so red=+1, blue=-1

    //---------------------------------------
    // X labels (top, rotated + offset)
    //---------------------------------------
    const xOffset = 18;   // horizontal shift
    const yOffset = -50;  // vertical shift (moves labels DOWN slightly)

    svg.append("g")
    .selectAll("text")
    .data(FEATURES)
    .enter()
    .append("text")
    .attr("x", f => xScale(f) + xScale.bandwidth() / 2 + xOffset)
    .attr("y", margin.top + yOffset)
    .attr("transform", f =>
        `rotate(-45, ${xScale(f) + xScale.bandwidth() / 2 + xOffset}, ${margin.top + yOffset})`
    )
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text(d => d);




    // Y labels (left)
    svg
      .append("g")
      .selectAll("text")
      .data(FEATURES)
      .enter()
      .append("text")
      .attr("x", margin.left - 10)
      .attr("y", (f) => yScale(f) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .style("font-size", "11px")
      .text((d) => d);

    //---------------------------------------
    // 4. Cells (upper triangle only)
    //---------------------------------------
    svg
      .append("g")
      .selectAll("rect")
      .data(corrData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.xFeature))
      .attr("y", (d) => yScale(d.yFeature))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", (d) => color(d.corr))
      .attr("stroke", "#eee")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "#333").attr("stroke-width", 1.5);
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.yFeature}</strong> vs <strong>${d.xFeature}</strong><br/>
             Correlation: ${d.corr.toFixed(2)}`
          );
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 12 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#eee").attr("stroke-width", 1);
        tooltip.style("opacity", 0);
      });

    //---------------------------------------
    // 5. Color legend (horizontal)
    //---------------------------------------
    const legendWidth = 180;
    const legendHeight = 10;
    const legendX = width / 2 - legendWidth / 2;
    const legendY = height - margin.bottom + 30;

    const legendScale = d3
      .scaleLinear()
      .domain([-1, 1])
      .range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat((d) => d.toFixed(1));

    // Gradient definition
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "corr-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    const stops = d3.range(0, 1.01, 0.1);
    stops.forEach((t) => {
      gradient
        .append("stop")
        .attr("offset", `${t * 100}%`)
        .attr("stop-color", color(1 - 2 * t)); // maps back to domain [1,-1]
    });

    // Draw gradient bar
    svg
      .append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#corr-gradient)")
      .style("stroke", "#aaa")
      .style("stroke-width", 0.5);

    // Legend axis
    svg
      .append("g")
      .attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "10px");

    // Legend label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", legendY - 8)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Correlation (Pearson r)");

    //---------------------------------------
    // 6. Title
    //---------------------------------------
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")

  }, [data]);

  return <svg ref={svgRef}></svg>;
}

export default CorrelationMatrix;
