import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

function KeyFeatureBarChart({ data, feature = "energy" }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 450;
    const height = 350;
    const margin = { top: 40, right: 20, bottom: 40, left: 50 };

    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    // Convert numeric keys → labels
    const KEY_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    // Group songs by key → calculate avg feature per key
    const avgByKey = d3.rollups(
      data,
      v => d3.mean(v, d => d[feature]),
      d => KEY_NAMES[d.key] || "Unknown"
    ).sort((a, b) => KEY_NAMES.indexOf(a[0]) - KEY_NAMES.indexOf(b[0]));

    // Scales
    const x = d3.scaleBand()
      .domain(avgByKey.map(d => d[0]))
      .range([margin.left, width - margin.right])
      .padding(0.25);

    const y = d3.scaleLinear()
      .domain([0, d3.max(avgByKey, d => d[1])])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Average ${feature} by Musical Key`);

    // Bars
    svg.append("g")
      .selectAll("rect")
      .data(avgByKey)
      .join("rect")
      .attr("x", d => x(d[0]))
      .attr("y", d => y(d[1]))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d[1]))
      .attr("fill", "#69b3a2")
      .attr("opacity", 0.85);

  }, [data, feature]);

  return <svg ref={svgRef}></svg>;
}

export default KeyFeatureBarChart;
