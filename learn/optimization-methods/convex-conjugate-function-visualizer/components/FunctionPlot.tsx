
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { FunctionDefinition } from '../types';

interface FunctionPlotProps {
  funcDef: FunctionDefinition;
  slope: number;
  tangentPointX: number;
  yIntercept: number;
}

export const FunctionPlot: React.FC<FunctionPlotProps> = ({ funcDef, slope, tangentPointX, yIntercept }) => {
  const d3Container = useRef<SVGSVGElement | null>(null);
  const { func, domain, range } = funcDef;

  useEffect(() => {
    if (!d3Container.current) return;
    
    const svg = d3.select(d3Container.current);
    
    const observer = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        svg.selectAll("*").remove(); // Clear SVG for redraw

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const x = d3.scaleLinear().domain(domain).range([margin.left, innerWidth + margin.left]);
        const y = d3.scaleLinear().domain(range).range([innerHeight + margin.top, margin.top]);

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${y(0) < height - margin.bottom && y(0) > margin.top ? y(0) : height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80))
            .attr('class', 'stroke-slate-500');
        svg.append("g")
            .attr("transform", `translate(${x(0) > margin.left && x(0) < width - margin.right ? x(0) : margin.left},0)`)
            .call(d3.axisLeft(y).ticks(height / 50))
            .attr('class', 'stroke-slate-500');
            
        svg.selectAll('.domain, .tick line').attr('stroke', 'currentColor');
        svg.selectAll('.tick text').attr('fill', 'currentColor').style('font-size', '12px');

        // Function curve
        const line = d3.line<number>()
            .x(d => x(d))
            .y(d => {
                const val = func(d);
                return isFinite(val) ? y(val) : -10; // Push infinite values off-screen
            })
            .defined(d => isFinite(func(d)));

        const points = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / 200);
        svg.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", "rgb(134 239 172)") // lime-400
            .attr("stroke-width", 2.5)
            .attr("d", line);

        // Tangent Line
        const tangentLine = svg.append("line")
            .attr("stroke", "rgb(34 211 238)") // cyan-400
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "4 4");

        // Tangent Point
        const tangentPoint = svg.append("circle")
            .attr("r", 5)
            .attr("fill", "rgb(239 68 68)"); // red-500
        
        // Update function for animation
        const update = (newSlope: number, newTangentX: number, newYIntercept: number) => {
            if (!isFinite(newTangentX) || !isFinite(func(newTangentX))) {
            tangentPoint.style("opacity", 0);
            tangentLine.style("opacity", 0);
            return;
            }

            tangentPoint.style("opacity", 1).attr("cx", x(newTangentX)).attr("cy", y(func(newTangentX)));
            
            const lineFunc = (lx: number) => newSlope * lx + newYIntercept;
            const x1 = domain[0] - (domain[1] - domain[0]);
            const y1 = lineFunc(x1);
            const x2 = domain[1] + (domain[1] - domain[0]);
            const y2 = lineFunc(x2);

            tangentLine.style("opacity", 1)
            .attr("x1", x(x1))
            .attr("y1", y(y1))
            .attr("x2", x(x2))
            .attr("y2", y(y2));
        };

        update(slope, tangentPointX, yIntercept);
    });

    observer.observe(d3Container.current);

    return () => observer.disconnect();
  }, [funcDef, domain, range, func, slope, tangentPointX, yIntercept]);

  return (
    <div className="w-full h-full min-h-[300px]">
      <svg
        className="d3-component w-full h-full"
        ref={d3Container}
      />
    </div>
  );
};
