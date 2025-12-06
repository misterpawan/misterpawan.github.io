export interface Point {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  layerIndex: number; // The vertical stage (0 = Start, 1 = Stage 1, etc.)
  nodeIndex: number; // The vertical position within the layer
  x: number; // Normalized coordinate (0-1000)
  y: number; // Normalized coordinate (0-600)
  isStart?: boolean;
}

export interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  cost: number;
  isOptimal: boolean; // Is this part of the selected path?
}

export interface OptimizationStage {
  activeNodeId: string;
  outgoingEdges: Edge[];
  selectedEdgeId: string;
  nextNodeId: string;
  cumulativeCost: number;
  stepLabel: string; // e.g., u0, u1
}

export interface SimulationState {
  nodes: Node[];
  allEdges: Edge[]; // Used for visual reference if we wanted to show full mesh, but we'll likely generate on fly
  stages: OptimizationStage[]; // The pre-calculated optimal path sequence
  totalLayers: number;
}