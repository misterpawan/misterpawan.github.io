import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { City } from '../types';

interface MapCanvasProps {
  cities: City[];
  userPath: string[];
  optimalPath: string[] | null;
  onCityClick: (cityId: string) => void;
}

const MapCanvas: React.FC<MapCanvasProps> = ({ cities, userPath, optimalPath, onCityClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500; // Aspect ratio
    
    // Clear previous renders
    svg.selectAll("*").remove();

    // Background (simulating a paper map or light screen)
    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "#f1f5f9"); // Slate 100

    // Scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([50, width - 50]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([50, height - 50]);

    // Draw Grid lines (Decoration)
    const gridGroup = svg.append("g").attr("opacity", 0.15);
    for (let i = 0; i <= 100; i += 10) {
      gridGroup.append("line")
        .attr("x1", xScale(i)).attr("y1", yScale(0))
        .attr("x2", xScale(i)).attr("y2", yScale(100))
        .attr("stroke", "#475569").attr("stroke-width", 1); // Slate 600
      gridGroup.append("line")
        .attr("x1", xScale(0)).attr("y1", yScale(i))
        .attr("x2", xScale(100)).attr("y2", yScale(i))
        .attr("stroke", "#475569").attr("stroke-width", 1);
    }

    // --- DRAW OPTIMAL PATH (If exists) ---
    if (optimalPath && optimalPath.length > 0) {
      const lineGenerator = d3.line<string>()
        .x(id => { const c = cities.find(city => city.id === id); return c ? xScale(c.x) : 0; })
        .y(id => { const c = cities.find(city => city.id === id); return c ? yScale(c.y) : 0; })
        .curve(d3.curveLinear);

      // Close the loop
      const closedOptimalPath = [...optimalPath, optimalPath[0]];

      svg.append("path")
        .datum(closedOptimalPath)
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", "#059669") // Emerald 600 (slightly darker for light bg)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.6);
    }

    // --- DRAW USER PATH ---
    if (userPath.length > 1) {
       const lineGenerator = d3.line<string>()
        .x(id => { const c = cities.find(city => city.id === id); return c ? xScale(c.x) : 0; })
        .y(id => { const c = cities.find(city => city.id === id); return c ? yScale(c.y) : 0; })
        .curve(d3.curveLinear);

      svg.append("path")
        .datum(userPath)
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", "#e11d48") // Rose 600
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");
    }

    // --- DRAW CITIES ---
    const citiesGroup = svg.append("g");

    cities.forEach((city) => {
      const isSelected = userPath.includes(city.id);
      const isStart = userPath[0] === city.id;
      
      const g = citiesGroup.append("g")
        .attr("transform", `translate(${xScale(city.x)}, ${yScale(city.y)})`)
        .style("cursor", "pointer")
        .on("click", () => onCityClick(city.id));

      // Glow effect for selected
      if (isSelected) {
        g.append("circle")
          .attr("r", 20)
          .attr("fill", isStart ? "#3b82f6" : "#e11d48") // Blue start, Red others
          .attr("opacity", 0.15)
          .append("animate")
            .attr("attributeName", "r")
            .attr("values", "20;25;20")
            .attr("dur", "2s")
            .attr("repeatCount", "indefinite");
      }
      
      // Main Node
      g.append("circle")
        .attr("r", 12)
        .attr("fill", isSelected ? (isStart ? "#3b82f6" : "#e11d48") : "#cbd5e1") // Slate 300 for unselected
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1); // Ensure white stroke is visible

      // Number badge if selected
      if (isSelected) {
        const index = userPath.indexOf(city.id) + 1;
        g.append("text")
          .attr("y", 4)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .style("pointer-events", "none")
          .text(index);
      } else {
         g.append("text")
          .attr("y", 5)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("pointer-events", "none")
          .text(city.emoji);
      }

      // Label
      g.append("text")
        .attr("y", 28)
        .attr("text-anchor", "middle")
        .attr("fill", "#1e293b") // Slate 800
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("text-shadow", "0px 1px 3px white, 0px 0px 5px white") // White shadow for contrast
        .text(city.name);

      // Tooltip-ish interaction via Title
      g.append("title").text(city.description);
    });

  }, [cities, userPath, optimalPath, onCityClick]);

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-xl border border-slate-200 bg-slate-50 relative">
       <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};

export default MapCanvas;