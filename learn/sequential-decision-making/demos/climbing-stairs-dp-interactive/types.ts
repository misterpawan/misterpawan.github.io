export interface Path {
  steps: number[]; // Array of 1s and 2s
  id: string; // Unique ID for keying
}

export enum JumpType {
  ONE = 1,
  TWO = 2
}

export interface GameState {
  currentStep: number;
  currentPath: number[];
  foundPaths: Path[];
  n: number;
  isComplete: boolean;
}

export enum GameStatus {
  PLAYING,
  OVERSHOT,
  SUCCESS, // Reached N, but maybe not all paths found yet
  WON // All paths found
}
