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

    // Tooltip root
    const tooltip = d3.select("#tooltip-root")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(0,0,0,0.85)")
      .style("color", "white")
      .style("padding", "6px 10px")
      .style("font-size", "12px")
      .style("border-radius", "4px")
      .style("opacity", 0);

    // SCALES
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin.left, width - margin.right]);

    const loudExtent = d3.extent(data, d => d.loudness);
    const y = d3.scaleLinear()
      .domain(loudExtent)
      .range([height - margin.bottom, margin.top]);

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

    // POINTS WITH TOOLTIPS
    svg.append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.valence))
      .attr("cy", d => y(d.loudness))
      .attr("r", 3)
      .attr("fill", d => color(d.energy))
      .attr("opacity", 0.65)
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.track_name}</strong><br/>
             ${d.artist_name}<br/>
             Valence: ${d.valence.toFixed(2)}<br/>
             Loudness: ${d.loudness.toFixed(1)} dB<br/>
             Energy: ${d.energy.toFixed(2)}`
          );
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 12 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

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
