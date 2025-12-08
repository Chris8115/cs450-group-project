import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

function ValenceLoudnessScatter({ data }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 700;
    const height = 450;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    // SCALES
    const x = d3.scaleLinear()
      .domain([0, 1]) // valence is normalized
      .range([margin.left, width - margin.right]);

    const loudExtent = d3.extent(data, d => d.loudness);
    const y = d3.scaleLinear()
      .domain(loudExtent) // loudness values are negative decibels
      .range([height - margin.bottom, margin.top]);

    // COLOR: Use energy as color dimension
    const color = d3.scaleSequential(d3.interpolatePlasma)
      .domain(d3.extent(data, d => d.energy));

    // AXES
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(10));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(10));

    // AXIS LABELS
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Valence (Positivity)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Loudness (dB)");

    // POINTS
    svg.append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.valence))
      .attr("cy", d => y(d.loudness))
      .attr("r", 3)
      .attr("fill", d => color(d.energy))
      .attr("opacity", 0.65);

    // TITLE
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 16)
      .attr("font-weight", "bold")
      .text("Valence (Mood) vs Loudness (colored by Energy)");

  }, [data]);

  return <svg ref={svgRef}></svg>;
}

export default ValenceLoudnessScatter;
