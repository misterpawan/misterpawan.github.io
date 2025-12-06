import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Node, SimulationState } from '../types';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLOR_ACTIVE, COLOR_EDGE_DEFAULT, COLOR_NODE_DEFAULT, COLOR_START } from '../constants';

interface GraphCanvasProps {
  simulation: SimulationState;
  currentStep: number; // 0 to stages.length * 2
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ simulation, currentStep }) => {
  const { nodes, stages } = simulation;

  // Helper to get node position
  const getNode = (id: string) => nodes.find((n) => n.id === id);

  // We render visible elements based on the current step
  // Step logic:
  // 0: Start Node Appears
  // 1: Stage 0 Edges Appear
  // 2: Stage 0 Selection Highlights -> Move to Stage 1 Node
  // 3: Stage 1 Edges Appear
  // 4: Stage 1 Selection Highlights -> Move to Stage 2 Node
  // ...

  // Calculate which nodes are "visited" or "active"
  const visitedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (currentStep >= 0) ids.add(stages[0].activeNodeId); // Start node

    stages.forEach((stage, index) => {
      // The destination node of a stage is visited if we have passed the "selection" step for that stage
      // Selection step for stage index `i` happens at global step `(i * 2) + 2`
      if (currentStep >= (index * 2) + 2) {
        ids.add(stage.nextNodeId);
      }
    });
    return ids;
  }, [currentStep, stages]);

  const activeNodeId = useMemo(() => {
    if (currentStep === 0) return stages[0].activeNodeId;
    
    // Find the most recently visited node
    // If step is odd (edges appearing), the active node is the source of those edges
    // If step is even (moved to next), the active node is the destination
    
    // Logic:
    // Step 0: Start (s)
    // Step 1: Start (s) showing arrows
    // Step 2: Destination (s->next) reached. Active is now Next.
    
    const stageIndex = Math.floor((currentStep - 1) / 2);
    if (stageIndex < 0) return stages[0].activeNodeId;
    if (stageIndex >= stages.length) return stages[stages.length - 1].nextNodeId;

    if (currentStep % 2 !== 0) {
        // Odd step: We are deciding FROM the current source
        return stages[stageIndex].activeNodeId;
    } else {
        // Even step: We have arrived AT the destination of the *previous* decision
        // (Step 2 corresponds to finishing stage 0)
        return stages[stageIndex].nextNodeId;
    }
  }, [currentStep, stages]);


  return (
    <div className="w-full h-full flex justify-center items-center overflow-hidden bg-white rounded-xl shadow-2xl border border-slate-200 relative">
      <svg
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        className="w-full h-full max-w-5xl select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrowhead-gray"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={COLOR_EDGE_DEFAULT} opacity={0.5} />
          </marker>
          <marker
            id="arrowhead-blue"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={COLOR_ACTIVE} />
          </marker>
        </defs>

        {/* --- Render Layers/Grid Lines (Optional background context) --- */}
        {Array.from({ length: simulation.totalLayers }).map((_, i) => {
             // Only show stage lines if we have started
             if(currentStep < 0) return null;
             
             const xPos = nodes.find(n => n.layerIndex === i)?.x || 0;
             return (
                <motion.g key={`layer-line-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                     <text x={xPos} y={40} textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold" fontFamily="monospace">
                        {i === 0 ? "Start" : `Stage ${i}`}
                     </text>
                     <line x1={xPos} y1={60} x2={xPos} y2={CANVAS_HEIGHT - 20} stroke="#e2e8f0" strokeDasharray="4" />
                </motion.g>
             )
        })}


        {/* --- Render Edges --- */}
        <AnimatePresence>
          {stages.map((stage, stageIndex) => {
            const showEdgesStep = (stageIndex * 2) + 1;
            const selectEdgeStep = (stageIndex * 2) + 2;
            
            // Only render this stage's edges if we've reached the "show edges" step
            if (currentStep < showEdgesStep) return null;

            const source = getNode(stage.activeNodeId)!;

            return (
              <g key={`stage-edges-${stageIndex}`}>
                {stage.outgoingEdges.map((edge) => {
                  const target = getNode(edge.targetId)!;
                  const isSelected = edge.id === stage.selectedEdgeId;
                  const isChosenAndActive = isSelected && currentStep >= selectEdgeStep;

                  return (
                    <g key={edge.id}>
                      {/* Gray Candidate Edge */}
                      <motion.path
                        d={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                        stroke={COLOR_EDGE_DEFAULT}
                        strokeWidth={2}
                        fill="none"
                        markerEnd="url(#arrowhead-gray)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.3 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                      
                      {/* Cost Label for candidate (faded) */}
                      <motion.text
                         x={(source.x + target.x) / 2}
                         y={(source.y + target.y) / 2 - 5}
                         fill={COLOR_EDGE_DEFAULT}
                         fontSize="10"
                         textAnchor="middle"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 0.5 }}
                      >
                          {edge.cost}
                      </motion.text>

                      {/* Blue Selected Edge Overlay */}
                      {isChosenAndActive && (
                        <>
                            <motion.path
                            d={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                            stroke={COLOR_ACTIVE}
                            strokeWidth={4}
                            fill="none"
                            markerEnd="url(#arrowhead-blue)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            />
                            {/* Decision Label (u0, u1...) */}
                            <motion.rect
                                x={(source.x + target.x) / 2 - 10}
                                y={(source.y + target.y) / 2 - 20}
                                width="20"
                                height="16"
                                rx="4"
                                fill="#ffffff"
                                stroke="#e2e8f0"
                                strokeWidth="1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            />
                            <motion.text
                                x={(source.x + target.x) / 2}
                                y={(source.y + target.y) / 2 - 8}
                                fill="#ef4444" // Red color for u0, u1 like in diagram
                                fontSize="14"
                                fontWeight="bold"
                                textAnchor="middle"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                            >
                                {stage.stepLabel}
                            </motion.text>
                        </>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </AnimatePresence>

        {/* --- Render Nodes --- */}
        {nodes.map((node) => {
          const isStart = node.isStart;
          const isVisited = visitedNodeIds.has(node.id);
          const isActive = activeNodeId === node.id;

          // Only show nodes if they belong to a layer that has been reached
          let isVisible = false;
          if (isStart && currentStep >= 0) isVisible = true;
          else {
              // Find if this node is a target in any active stage
              const relevantStageIndex = node.layerIndex - 1;
              if (relevantStageIndex >= 0 && currentStep >= (relevantStageIndex * 2) + 1) {
                  isVisible = true;
              }
          }
          
          if (!isVisible) return null;

          return (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={isStart ? 20 : 12}
                fill={isStart ? COLOR_START : isVisited ? COLOR_ACTIVE : '#f1f5f9'} // Light background for unvisited
                stroke={isStart ? '#166534' : isVisited ? '#60a5fa' : COLOR_NODE_DEFAULT}
                strokeWidth={isActive ? 4 : 2}
              />
              
              {/* Highlight Ring for Active Node */}
              {isActive && (
                 <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={isStart ? 30 : 20}
                    stroke={isStart ? COLOR_START : COLOR_ACTIVE}
                    strokeWidth={2}
                    fill="none"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                 />
              )}

              {/* Node Label */}
              <text
                x={node.x}
                y={node.y}
                dy={isStart ? 6 : 4}
                textAnchor="middle"
                fill={isStart ? 'white' : isVisited ? 'white' : '#475569'}
                fontSize={isStart ? 16 : 10}
                fontWeight="bold"
                className="pointer-events-none"
              >
                {isStart ? 'S' : ''}
              </text>
            </motion.g>
          );
        })}
      </svg>
      
      {/* Overlay: Artificial Initial State Label */}
      {currentStep >= 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-1/4 left-10 pointer-events-none"
          >
             <div className="text-red-500 font-serif text-2xl">Artificial</div>
             <div className="text-red-500 font-serif text-2xl">Initial State</div>
          </motion.div>
      )}

      {/* Overlay: States labels for bottom */}
      <div className="absolute bottom-5 w-full flex justify-around px-20 pointer-events-none text-slate-500 font-mono text-sm">
           {simulation.stages.map((stage, idx) => {
               if(currentStep > (idx * 2)) {
                   return (
                       <motion.div 
                        key={idx} 
                        initial={{opacity: 0, y: 10}} 
                        animate={{opacity: 1, y: 0}}
                        className="flex flex-col items-center"
                        style={{ position: 'absolute', left: `${((idx + 1) / (simulation.totalLayers - 1)) * 80 + 10}%`}}
                       >
                           <span>State {idx + 1}</span>
                           <span className="text-xs">({stage.stepLabel})</span>
                       </motion.div>
                   )
               }
               return null;
           })}
      </div>

    </div>
  );
};