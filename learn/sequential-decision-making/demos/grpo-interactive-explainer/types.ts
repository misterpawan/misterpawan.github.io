export interface Candidate {
  id: string;
  solutionText: string;
  isCorrect: boolean;
  hasFormat: boolean; // For "Chain of Thought" reward
  customRewardValue?: number; // In case we want manual override, though we'll stick to logic usually
}

export interface ProblemScenario {
  id: number;
  title: string;
  question: string;
  trueAnswer: string;
  description: string;
  candidates: Candidate[];
}

export interface CalculatedStats {
  rewards: number[];
  mean: number;
  stdDev: number;
  advantages: number[];
}