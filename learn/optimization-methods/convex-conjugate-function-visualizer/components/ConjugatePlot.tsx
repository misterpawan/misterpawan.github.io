
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { FunctionDefinition } from '../types';

interface ConjugatePlotProps {
  funcDef: FunctionDefinition;
  currentSlope: number;
  conjugateValue: number;
}

export const ConjugatePlot: React.FC<ConjugatePlotProps> = ({ funcDef, currentSlope, conjugateValue }) => {
  const d3Container = useRef<SVGSVGElement | null>(null);
  const { conjugate, conjugateDomain, conjugateRange } = funcDef;

  useEffect(() => {
    if (!d3Container.current) return;

    const svg = d3.select(d3Container.current);
    
    const observer = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        svg.selectAll("*").remove(); // Clear SVG for redraw

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const x = d3.scaleLinear().domain(conjugateDomain).range([margin.left, innerWidth + margin.left]);
        const y = d3.scaleLinear().domain(conjugateRange).range([innerHeight + margin.top, margin.top]);

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
            
        // Conjugate function curve
        const line = d3.line<number>()
            .x(d => x(d))
            .y(d => {
            const val = conjugate(d);
            return isFinite(val) ? y(val) : -10;
            })
            .defined(d => isFinite(conjugate(d)));

        const points = d3.range(conjugateDomain[0], conjugateDomain[1], (conjugateDomain[1] - conjugateDomain[0]) / 200);
        
        const path = svg.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", "rgb(134 239 172)") // lime-400
            .attr("stroke-width", 2.5)
            .attr("d", line);

        // Path for tracing the curve
        const tracedPath = svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "rgb(239 68 68)") // red-500
            .attr("stroke-width", 3);

        // Current point
        const currentPoint = svg.append("circle")
            .attr("r", 5)
            .attr("fill", "rgb(239 68 68)");

        const update = (slope: number, conjValue: number) => {
            if (!isFinite(conjValue)) {
                currentPoint.style("opacity", 0);
            } else {
                currentPoint.style("opacity", 1)
                .attr("cx", x(slope))
                .attr("cy", y(conjValue));
            }
            
            // Update traced path
            const totalLength = path.node()?.getTotalLength() || 0;
            const slopeFraction = Math.max(0, Math.min(1, (slope - conjugateDomain[0]) / (conjugateDomain[1] - conjugateDomain[0])));
            tracedPath.attr("stroke-dasharray", `${slopeFraction * totalLength},${totalLength}`)
                    .attr("d", path.attr("d"));
        };
        update(currentSlope, conjugateValue);
    });

    observer.observe(d3Container.current);

    return () => observer.disconnect();
  }, [funcDef, conjugate, conjugateDomain, conjugateRange, currentSlope, conjugateValue]);

  return (
    <div className="w-full h-full min-h-[300px]">
      <svg
        className="d3-component w-full h-full"
        ref={d3Container}
      />
    </div>
  );
};
