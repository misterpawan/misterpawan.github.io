export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface BoardState {
  [square: string]: Piece | null;
}

export interface Move {
  from: string;
  to: string;
  san: string; // Standard Algebraic Notation (e.g. "Nf3")
  fen: string; // Resulting FEN
  annotation?: string;
}

export interface MoveNode extends Move {
  id: string;
  player: 'user' | 'opponent'; // Who made this move
  score?: number; // Simulated RL value (-1 to 1)
  children?: MoveNode[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  initialFen: string;
  playerColor: PieceColor;
  moveTree: MoveNode[]; // Root moves (User's possible moves)
}

export type SimulationStep = 'idle' | 'selected' | 'simulating';
export type LookaheadMode = 'none' | 'one-step' | 'multi-step';
