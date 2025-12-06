import { CANVAS_HEIGHT, CANVAS_WIDTH, LAYERS_COUNT, NODES_PER_LAYER, PADDING_X, PADDING_Y } from '../constants';
import { Edge, Node, OptimizationStage, SimulationState } from '../types';

export const generateSimulation = (): SimulationState => {
  const nodes: Node[] = [];
  const stages: OptimizationStage[] = [];
  
  // 1. Generate Nodes
  // Layer 0: Start Node
  const startNode: Node = {
    id: 's',
    layerIndex: 0,
    nodeIndex: 0,
    x: PADDING_X,
    y: CANVAS_HEIGHT / 2,
    isStart: true,
  };
  nodes.push(startNode);

  // Layers 1 to N
  for (let l = 1; l < LAYERS_COUNT; l++) {
    // Determine how many nodes in this layer (randomize slightly for variety, or keep fixed)
    const count = NODES_PER_LAYER;
    const layerX = PADDING_X + (l * (CANVAS_WIDTH - 2 * PADDING_X)) / (LAYERS_COUNT - 1);
    
    for (let i = 0; i < count; i++) {
      // Distribute vertically
      const layerHeight = CANVAS_HEIGHT - 2 * PADDING_Y;
      const spacing = layerHeight / (count - 1 || 1);
      const layerY = PADDING_Y + i * spacing;

      nodes.push({
        id: `l${l}-n${i}`,
        layerIndex: l,
        nodeIndex: i,
        x: layerX,
        y: layerY,
      });
    }
  }

  // 2. Build the Optimal Path (Sequential Decision Process)
  let currentInfo: { node: Node; totalCost: number } = { node: startNode, totalCost: 0 };
  
  for (let l = 0; l < LAYERS_COUNT - 1; l++) {
    const nextLayerIndex = l + 1;
    const nextLayerNodes = nodes.filter(n => n.layerIndex === nextLayerIndex);
    
    // Create edges to ALL nodes in next layer (representing possible choices)
    const layerEdges: Edge[] = nextLayerNodes.map((targetNode) => {
      const cost = Math.floor(Math.random() * 10) + 1; // Random cost 1-10
      return {
        id: `e-${currentInfo.node.id}-${targetNode.id}`,
        sourceId: currentInfo.node.id,
        targetId: targetNode.id,
        cost: cost,
        isOptimal: false, // Will set true for the chosen one
      };
    });

    // Select one "Optimal" decision randomly
    const selectedEdgeIndex = Math.floor(Math.random() * layerEdges.length);
    layerEdges[selectedEdgeIndex].isOptimal = true;
    
    const selectedEdge = layerEdges[selectedEdgeIndex];
    const nextNode = nextLayerNodes.find(n => n.id === selectedEdge.targetId)!;
    
    const newCost = currentInfo.totalCost + selectedEdge.cost;

    stages.push({
      activeNodeId: currentInfo.node.id,
      outgoingEdges: layerEdges,
      selectedEdgeId: selectedEdge.id,
      nextNodeId: nextNode.id,
      cumulativeCost: newCost,
      stepLabel: `u${l}`,
    });

    // Advance
    currentInfo = { node: nextNode, totalCost: newCost };
  }

  return {
    nodes,
    allEdges: [], // We generate them per stage dynamically in this model
    stages,
    totalLayers: LAYERS_COUNT,
  };
};