export enum DemoType {
  ROBOT = 'ROBOT',
  PORTFOLIO = 'PORTFOLIO',
  GAME = 'GAME'
}

export interface GridState {
  robot: { x: number; y: number };
  goal: { x: number; y: number };
  obstacles: Array<{ x: number; y: number }>;
  gridSize: number;
  stepsTaken: number;
  maxSteps: number;
  status: 'playing' | 'won' | 'lost';
}

export interface PortfolioState {
  year: number;
  maxYears: number;
  currentWealth: number;
  targetWealth: number;
  history: Array<{ year: number; wealth: number; allocation: number }>;
  status: 'playing' | 'won' | 'lost';
}

export interface GameState {
  position: number;
  velocity: number;
  timeRemaining: number;
  distance: number;
  obstacles: number[]; // x-positions of obstacles
  status: 'idle' | 'playing' | 'won' | 'lost';
}
