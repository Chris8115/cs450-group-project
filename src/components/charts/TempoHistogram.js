import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

function TempoHistogram({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 700;
    const height = 350;
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    // X scale (tempo ranges)
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.tempo))
      .range([margin.left, width - margin.right]);

    // Histogram binning
    const bins = d3.bin()
      .value(d => d.tempo)
      .domain(x.domain())
      .thresholds(40)(data); // 40 bins = nice resolution

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Bars
    svg.append("g")
       .selectAll("rect")
       .data(bins)
       .enter()
       .append("rect")
       .attr("x", d => x(d.x0))
       .attr("y", d => y(d.length))
       .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
       .attr("height", d => y(0) - y(d.length))
       .attr("fill", "#69b3a2")
       .attr("opacity", 0.85);

    // Mean tempo line
    const avgTempo = d3.mean(data, d => d.tempo);

    svg.append("line")
       .attr("x1", x(avgTempo))
       .attr("x2", x(avgTempo))
       .attr("y1", margin.top)
       .attr("y2", height - margin.bottom)
       .attr("stroke", "red")
       .attr("stroke-width", 2);

    svg.append("text")
       .attr("x", x(avgTempo))
       .attr("y", margin.top + 10)
       .attr("text-anchor", "middle")
       .attr("fill", "black")
       .attr("font-size", 12)
       .text(`Avg: ${avgTempo.toFixed(1)} BPM`);

    // Axes
    svg.append("g")
       .attr("transform", `translate(0, ${height - margin.bottom})`)
       .call(d3.axisBottom(x));

    svg.append("g")
       .attr("transform", `translate(${margin.left}, 0)`)
       .call(d3.axisLeft(y));

    // Labels
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height - 5)
       .attr("text-anchor", "middle")
       .text("Tempo (BPM)");

    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -height / 2)
       .attr("y", 15)
       .attr("text-anchor", "middle")
       .text("Number of Songs");

    svg.append("text")
       .attr("x", width / 2)
       .attr("y", margin.top - 10)
       .attr("text-anchor", "middle")
       .attr("font-size", 16)
       .attr("font-weight", "bold")
       .text("Tempo Distribution");
  }, [data]);

  return <svg ref={svgRef}></svg>;
}

export default TempoHistogram;
