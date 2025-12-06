import React from 'react';
import { City, LookaheadResult } from '../types';
import { calculateDistance } from '../services/tspUtils';

interface MapVisualizationProps {
  cities: City[];
  visitedIds: number[];
  currentCity: City | null;
  hoveredLookahead: LookaheadResult | null;
  width?: number;
  height?: number;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({
  cities,
  visitedIds,
  currentCity,
  hoveredLookahead,
  width = 800,
  height = 600,
}) => {
  // --- Layout Configuration ---
  
  // We want City A (ID 0) to be vertically centered.
  // Other cities should be distributed above and below.
  const organizeRows = () => {
    if (cities.length === 0) return [];
    
    const startNode = cities[0]; // A
    const others = cities.slice(1).sort((a, b) => a.id - b.id); // B, C, D...
    
    // Split others into two halves
    const mid = Math.ceil(others.length / 2);
    const topHalf = others.slice(0, mid);
    const bottomHalf = others.slice(mid);
    
    // Recombine: [B, C, A, D, E] layout order
    return [...topHalf, startNode, ...bottomHalf];
  };

  const orderedRowCities = organizeRows();
  
  // Grid Dimensions
  const PADDING_X = 80;
  const PADDING_Y = 60;
  const HEADER_HEIGHT = 40;
  
  // Columns: Start(0) + (N-1) Intermediate Steps + Sink(N)
  // Example 6 cities: Start(A) -> Step1 -> Step2 -> Step3 -> Step4 -> Step5 -> Sink(A)
  // Total edges = 6. Total Nodes in sequence = 7.
  const totalSteps = cities.length + 1; 
  const rowCount = cities.length;

  const usableWidth = width - PADDING_X * 2;
  const usableHeight = height - PADDING_Y * 2 - HEADER_HEIGHT;
  
  const colWidth = usableWidth / Math.max(1, totalSteps - 1);
  const rowHeight = usableHeight / Math.max(1, rowCount - 1);

  // Helper: Get X, Y for a given Step Index and City ID
  const getCoords = (stepIndex: number, cityId: number) => {
    // Find visual row index
    const rowIndex = orderedRowCities.findIndex(c => c.id === cityId);
    
    // Calculate Y based on row index
    // If not found (shouldn't happen), default to 0
    const safeRowIndex = rowIndex === -1 ? 0 : rowIndex;
    
    return {
      x: PADDING_X + stepIndex * colWidth,
      y: PADDING_Y + HEADER_HEIGHT + safeRowIndex * rowHeight
    };
  };

  // Helper: Check if a city should be visible at a specific step in the trellis
  const isCityVisibleAtStep = (stepIndex: number, city: City) => {
    const isStartCity = city.id === cities[0].id;
    const isFirstCol = stepIndex === 0;
    const isLastCol = stepIndex === totalSteps - 1;

    if (isFirstCol) return isStartCity;
    if (isLastCol) return isStartCity;
    return !isStartCity; // Intermediate steps show all EXCEPT Start
  };

  // --- Rendering Helpers ---

  const renderNode = (
    city: City, 
    stepIndex: number, 
    type: 'ghost' | 'history' | 'candidate' | 'future' | 'sink',
    isHovered: boolean = false
  ) => {
    const { x, y } = getCoords(stepIndex, city.id);
    const r = 24; 

    let fill = '#fff';
    let stroke = '#cbd5e1';
    let textFill = '#94a3b8';
    let strokeWidth = 2;
    let fontWeight = "normal";
    let opacity = 1;

    if (type === 'ghost') {
      fill = '#f8fafc';
      stroke = '#e2e8f0';
      textFill = '#cbd5e1';
      strokeWidth = 1;
      opacity = 0.5;
    } else if (type === 'history') {
      fill = '#4f46e5'; // Indigo 600
      stroke = '#312e81'; // Indigo 900
      textFill = '#fff';
      strokeWidth = 3;
      fontWeight = "bold";
    } else if (type === 'candidate') {
      fill = isHovered ? '#ecfdf5' : '#fff';
      stroke = isHovered ? '#059669' : '#64748b'; // Emerald or Slate
      textFill = isHovered ? '#059669' : '#475569';
      strokeWidth = isHovered ? 4 : 2;
      fontWeight = "bold";
    } else if (type === 'future') {
      fill = '#fff1f2'; // Rose 50
      stroke = '#e11d48'; // Rose 600
      textFill = '#e11d48';
      strokeWidth = 2;
      fontWeight = "bold";
    } else if (type === 'sink') {
      fill = '#f1f5f9';
      stroke = '#0f172a';
      textFill = '#0f172a';
      strokeWidth = 3;
      fontWeight = "bold";
    }

    return (
      <g key={`node-${city.id}-step-${stepIndex}`} className="transition-all duration-300" opacity={opacity}>
        <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        <text 
          x={x} y={y} dy="0.35em" textAnchor="middle" 
          fontSize="14" fontWeight={fontWeight} fill={textFill} pointerEvents="none"
        >
          {city.name}
        </text>
      </g>
    );
  };

  const renderEdge = (
    key: string,
    fromCity: City, fromStep: number,
    toCity: City, toStep: number,
    type: 'background' | 'history' | 'candidate' | 'future',
    cost: number
  ) => {
    const start = getCoords(fromStep, fromCity.id);
    const end = getCoords(toStep, toCity.id);

    let stroke = '#cbd5e1';
    let strokeWidth = 1;
    let dash = 'none';
    let opacity = 1;
    let showLabel = false;
    let labelColor = '#475569';
    let labelBg = 'white';
    let labelFontSize = 14;
    let labelPosRatio = 0.5; // 0.5 = middle

    if (type === 'background') {
        stroke = '#e2e8f0'; // Slate 200 - visible but light
        strokeWidth = 1;
        opacity = 1;
        showLabel = true;
        labelColor = '#94a3b8'; // Slate 400
        labelBg = '#f8fafc'; // Slate 50
        labelFontSize = 10;
        // Offset label slightly towards source to avoid overlap on symmetric paths
        // e.g. B->C and C->B overlap in middle.
        labelPosRatio = 0.25; 
    } else if (type === 'history') {
      stroke = '#4f46e5'; // Indigo 600
      strokeWidth = 5;
      opacity = 1;
      showLabel = true;
      labelColor = '#312e81';
      labelPosRatio = 0.5;
    } else if (type === 'candidate') {
      stroke = '#94a3b8';
      strokeWidth = 3;
      dash = '6,4';
      opacity = 0.8;
      showLabel = true;
      labelColor = '#475569';
      labelPosRatio = 0.5;
    } else if (type === 'future') {
      stroke = '#e11d48'; // Rose 600
      strokeWidth = 4;
      dash = 'none';
      showLabel = true;
      labelColor = '#be123c';
      labelPosRatio = 0.5;
    }

    // Label positioning
    const x = start.x + (end.x - start.x) * labelPosRatio;
    const y = start.y + (end.y - start.y) * labelPosRatio;

    return (
      <g key={key} opacity={opacity}>
        <line 
          x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
          stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash}
        />
        {showLabel && (
          <g transform={`translate(${x}, ${y})`}>
            {/* Background rect for text readability */}
            <rect 
                x={-12} y={-8} width={24} height={16} 
                fill={labelBg} rx="4"
                opacity={type === 'background' ? 0.8 : 1}
            />
            <text 
              textAnchor="middle" dy="4" 
              fontSize={labelFontSize} fontWeight={type === 'background' ? 'normal' : 'bold'} 
              fill={labelColor}
            >
              {Math.round(cost)}
            </text>
          </g>
        )}
      </g>
    );
  };

  // --- Main Render Loop ---

  const elements = []; 

  // Layers
  const layerBackgroundEdges: React.ReactNode[] = [];
  const layerGhostNodes: React.ReactNode[] = [];
  const layerEdges: React.ReactNode[] = [];
  const layerNodes: React.ReactNode[] = [];

  // 0. Render Background Mesh (All valid potential edges)
  for (let s = 0; s < totalSteps - 1; s++) {
      const sourceCities = orderedRowCities.filter(c => isCityVisibleAtStep(s, c));
      const targetCities = orderedRowCities.filter(c => isCityVisibleAtStep(s + 1, c));

      sourceCities.forEach(src => {
          targetCities.forEach(tgt => {
              // Usually no self-loops in TSP transitions unless staying put (not allowed here)
              if (src.id !== tgt.id) {
                  const cost = calculateDistance(src, tgt);
                  layerBackgroundEdges.push(
                      renderEdge(`bg-edge-${s}-${src.id}-${tgt.id}`, src, s, tgt, s + 1, 'background', cost)
                  );
              }
          });
      });
  }

  // 1. Render Structure (Ghost Nodes & Labels)
  for (let s = 0; s < totalSteps; s++) {
      // Column Header
      const headerX = PADDING_X + s * colWidth;
      let label = `Step ${s}`;
      if (s === 0) label = "START";
      else if (s === totalSteps - 1) label = "SINK";
      
      elements.push(
          <text 
            key={`header-${s}`} 
            x={headerX} y={PADDING_Y} textAnchor="middle"
            fontSize="12" fontWeight="bold" fill="#64748b"
          >
            {label}
          </text>
      );

      // Render Ghost Nodes
      orderedRowCities.forEach(city => {
          if (isCityVisibleAtStep(s, city)) {
              layerGhostNodes.push(renderNode(city, s, 'ghost'));
          }
      });
  }

  // 2. Render History (Visited Path)
  for (let i = 0; i < visitedIds.length; i++) {
    const cityId = visitedIds[i];
    const city = cities.find(c => c.id === cityId);
    if (!city) continue;

    // Node
    layerNodes.push(renderNode(city, i, 'history'));

    // Edge from previous
    if (i > 0) {
      const prevCityId = visitedIds[i - 1];
      const prevCity = cities.find(c => c.id === prevCityId);
      if (prevCity) {
        const cost = calculateDistance(prevCity, city);
        layerEdges.push(renderEdge(`edge-hist-${i}`, prevCity, i - 1, city, i, 'history', cost));
      }
    }
  }

  // 3. Render Candidates & Lookahead
  const currentStepIndex = visitedIds.length;
  const isTourComplete = visitedIds.length === cities.length;

  if (currentCity && !isTourComplete) {
      const unvisited = cities.filter(c => !visitedIds.includes(c.id));
      
      unvisited.forEach(candidate => {
          const isHovered = hoveredLookahead?.nextCity.id === candidate.id;
          const opacity = (hoveredLookahead && !isHovered) ? 0.2 : 1;

          // Candidate Node
          layerNodes.push(
              <g key={`cand-node-group-${candidate.id}`} opacity={opacity}>
                  {renderNode(candidate, currentStepIndex, 'candidate', isHovered)}
              </g>
          );

          // Edge from Current to Candidate
          const costToCandidate = calculateDistance(currentCity, candidate);
          layerEdges.push(
             <g key={`cand-edge-group-${candidate.id}`} opacity={opacity}>
                 {renderEdge(`edge-cand-${candidate.id}`, currentCity, currentStepIndex - 1, candidate, currentStepIndex, 'candidate', costToCandidate)}
             </g>
          );

          // Lookahead Path
          if (isHovered && hoveredLookahead) {
              let prevCity = candidate;
              let prevStep = currentStepIndex;

              const chain: City[] = [];
              if (hoveredLookahead.secondCity) chain.push(hoveredLookahead.secondCity);
              chain.push(...hoveredLookahead.greedyPath);

              chain.forEach((futureCity, idx) => {
                  const futureStep = prevStep + 1;
                  const cost = calculateDistance(prevCity, futureCity);

                  layerEdges.push(renderEdge(`edge-fut-${idx}`, prevCity, prevStep, futureCity, futureStep, 'future', cost));
                  
                  const isSink = futureCity.id === cities[0].id;
                  layerNodes.push(renderNode(futureCity, futureStep, isSink ? 'sink' : 'future'));

                  prevCity = futureCity;
                  prevStep = futureStep;
              });
          }
      });
  } else if (isTourComplete && currentCity) {
      // Draw Final Edge to Sink
      const startCity = cities[0];
      const cost = calculateDistance(currentCity, startCity);
      const finalStep = totalSteps - 1;
      
      layerEdges.push(renderEdge('edge-final', currentCity, finalStep - 1, startCity, finalStep, 'history', cost));
      layerNodes.push(renderNode(startCity, finalStep, 'sink'));
  }


  return (
    <div className="relative border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden" style={{ height }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="block font-sans">
        
        {/* Render Order: Background -> Ghost -> Edges -> Nodes */}
        {layerBackgroundEdges}
        {layerGhostNodes}
        {layerEdges}
        {layerNodes}

      </svg>
    </div>
  );
};

export default MapVisualization;