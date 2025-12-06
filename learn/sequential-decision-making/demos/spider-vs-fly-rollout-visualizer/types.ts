export type Position = {
  x: number;
  y: number;
};

export type Spider = {
  id: number;
  pos: Position;
  color: string;
};

export type Fly = {
  id: number;
  pos: Position;
  isCaught: boolean;
};

export enum MoveDirection {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  STAY = 'STAY'
}

export type AlgorithmType = 'SEQUENTIAL' | 'SIMULTANEOUS' | 'GREEDY';

export interface GameState {
  spiders: Spider[];
  flies: Fly[];
  stepCount: number;
  isGameOver: boolean;
}

export interface SimulationResult {
  nextMoves: Map<number, Position>; // spiderId -> newPosition
  estimatedCost: number;
}

export interface MoveOption {
  direction: string;
  position: Position;
  cost: number;
}

export type InteractionMode = 'SEQUENTIAL' | 'SIMULTANEOUS';

export interface InteractionState {
  mode: InteractionMode;
  
  // For Sequential
  activeSpiderIndex?: number; // 0 to spiders.length - 1
  committedMoves?: Map<number, Position>; // Moves decided for 0..activeSpiderIndex-1
  
  // For Simultaneous
  draftMoves?: Map<number, Position>; // The currently selected move for each spider
  simultaneousOptions?: Map<number, MoveOption[]>; // The costs for each spider's options GIVEN the other drafts
  currentJointCost?: number; // Cost of the current draft configuration

  // Shared
  currentOptions: MoveOption[]; // The options to display for the active context
}