import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

function EnergyVsDanceability({ data }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const width = 700;
    const chartHeight = 450;    // Chart area only
    const legendSpace = 70;     // Space for legend
    const height = chartHeight + legendSpace;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    
    const svg = d3
    .select(svgRef.current)
    .attr("width", width)
    .attr("height", height);

    svg.selectAll("*").remove();

    // Scales
    const x = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, 1]).range([chartHeight - margin.bottom, margin.top]);

    const popExtent = d3.extent(data, (d) => d.popularity);
    // ---- Percentile Normalization for Popularity ----
    const sortedPops = data
    .map(d => d.popularity)
    .sort((a, b) => a - b);

    const percentile = (v) => {
    // Find the index of the first value >= v
    let idx = sortedPops.findIndex(x => x >= v);
    if (idx === -1) idx = sortedPops.length - 1;
    return idx / (sortedPops.length - 1);
    };

    // Color scale from 0–1
    const color = d3.scaleSequential(d3.interpolateTurbo)
    .domain([0, 1]);


    // Axes
    svg.append("g")
      .attr("transform", `translate(0, ${chartHeight - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(10));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(10));

    // Axis Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", chartHeight - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Danceability");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Energy");

    // Tooltip
    const tooltip = d3
      .select("#tooltip-root")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "#fff")
      .style("padding", "6px 8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("opacity", 0);

    // Points
    svg.append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.danceability))
      .attr("cy", (d) => y(d.energy))
      .attr("r", 3)
      .attr("fill", (d) => color(percentile(d.popularity)))
      .attr("opacity", 0.7)
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", 1).html(
          `<strong>${d.track_name}</strong><br/>
           ${d.artist_name}<br/>
           Popularity: ${d.popularity}<br/>
           Danceability: ${d.danceability.toFixed(2)}<br/>
           Energy: ${d.energy.toFixed(2)}`
        );
      })
      .on("mousemove", function (event) {
        tooltip.style("left", event.pageX + 12 + "px").style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 16)
      .attr("font-weight", "bold")
      .text("Energy vs Danceability (colored by Popularity)");

    // ----------- Legend (Clean Centered Version) -----------
    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient")
      .attr("id", "popularity-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      gradient.append("stop")
        .attr("offset", `${t * 100}%`)
        .attr("stop-color", d3.interpolateTurbo(t));
    }

    const legendWidth = 200;
    const legendHeight = 12;

    // Add extra spacing so legend does not touch x-axis
    const legendX = (width - legendWidth) / 8;
    const legendY = height - margin.bottom;

    const legend = svg.append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    // Legend Title
    legend.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -18)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "black")
      .text("Popularity");

    // Low / High labels
    legend.append("text")
      .attr("x", -10)
      .attr("y", legendHeight - 2)
      .attr("text-anchor", "end")
      .style("font-size", "10px")
      .style("fill", "black")
      .text("Low");

    legend.append("text")
      .attr("x", legendWidth + 10)
      .attr("y", legendHeight - 2)
      .attr("text-anchor", "start")
      .style("font-size", "10px")
      .style("fill", "black")
      .text("High");

    // Gradient Bar
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#popularity-gradient)")
      .style("stroke", "black")
      .style("stroke-width", 0.5);

    // Tick labels
    const legendScale = d3.scaleLinear().domain([0, 1]).range([0, legendWidth]);
    const legendAxis = d3.axisBottom(legendScale).ticks(4).tickFormat(d => `${Math.round(d * 100)}%`);

    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "black");

  }, [data]);

  return <svg ref={svgRef}></svg>;
}

export default EnergyVsDanceability;
