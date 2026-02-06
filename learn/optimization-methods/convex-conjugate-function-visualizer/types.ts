
export interface FunctionDefinition {
  label: string;
  func: (x: number) => number;
  derivative: (x: number) => number;
  invDerivative: (y: number) => number; // x such that f'(x) = y
  conjugate: (y: number) => number;
  domain: [number, number];
  range: [number, number];
  conjugateDomain: [number, number];
  conjugateRange: [number, number];
  description: string;
}

export type FunctionDict = {
  [key: string]: FunctionDefinition;
};
