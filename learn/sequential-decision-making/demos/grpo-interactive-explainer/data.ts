import { ProblemScenario } from './types';

export const INITIAL_SCENARIOS: ProblemScenario[] = [
  {
    id: 1,
    title: "Arithmetic",
    question: "Calculate 7 + 3 × 2",
    trueAnswer: "13",
    description: "Basic order of operations (PEMDAS). We reward both correct format (reasoning) and correct answer.",
    candidates: [
      { id: 'A', solutionText: "<think>First I add 7 and 3 to get 10.</think> Then multiply by 2 to get 20.", isCorrect: false, hasFormat: true },
      { id: 'B', solutionText: "<think>Multiplication comes before addition.</think> 3 * 2 = 6, then 7 + 6 = 13.", isCorrect: true, hasFormat: true },
      { id: 'C', solutionText: "The answer is 13.", isCorrect: true, hasFormat: false },
      { id: 'D', solutionText: "13", isCorrect: true, hasFormat: false },
    ]
  },
  {
    id: 2,
    title: "Algebra",
    question: "Solve for x: 2x - 4 = 10",
    trueAnswer: "7",
    description: "Simple linear equation. Showing work via <think> tags earns the format reward.",
    candidates: [
      { id: 'A', solutionText: "<think>Add 4 to both sides: 2x = 14. Divide by 2.</think> x = 7", isCorrect: true, hasFormat: true },
      { id: 'B', solutionText: "<think>Subtract 4 from 10: 2x = 6. Divide by 2.</think> x = 3", isCorrect: false, hasFormat: true },
      { id: 'C', solutionText: "Move 4 to the right. 2x=14. x=7", isCorrect: true, hasFormat: false },
      { id: 'D', solutionText: "<think>Isolate x.</think> x = 7", isCorrect: true, hasFormat: true },
    ]
  },
  {
    id: 3,
    title: "Probability",
    question: "A coin is flipped twice. Probability of two heads?",
    trueAnswer: "0.25 (or 1/4)",
    description: "Model is struggling here. Even incorrect answers with reasoning get partial credit (0.5 format).",
    candidates: [
      { id: 'A', solutionText: "<think>Each flip is 50%, so sum them up.</think> 50%", isCorrect: false, hasFormat: true },
      { id: 'B', solutionText: "1/2 * 1/2 = 1/4.", isCorrect: true, hasFormat: false },
      { id: 'C', solutionText: "<think>Outcomes are HH, HT, TT.</think> 1/3", isCorrect: false, hasFormat: true },
      { id: 'D', solutionText: "<think>Independent events: 0.5 * 0.5.</think> 0.25", isCorrect: true, hasFormat: true },
    ]
  },
  {
    id: 4,
    title: "Calculus",
    question: "Derivative of sin(x²)?",
    trueAnswer: "2x·cos(x²)",
    description: "Chain rule application. Highlighting how 'lazy' correct answers differ from 'reasoned' ones.",
    candidates: [
      { id: 'A', solutionText: "<think>Chain rule: outer is sin, inner is x².</think> 2x cos(x²)", isCorrect: true, hasFormat: true },
      { id: 'B', solutionText: "Ans: 2x cos(x²)", isCorrect: true, hasFormat: false },
      { id: 'C', solutionText: "<think>Deriv of sin is cos.</think> cos(x²)", isCorrect: false, hasFormat: true },
      { id: 'D', solutionText: "cos(x) · 2x", isCorrect: false, hasFormat: false },
    ]
  },
  {
    id: 5,
    title: "Logic Trap",
    question: "5 machines, 5 mins, 5 widgets. 100 machines...?",
    trueAnswer: "5 minutes",
    description: "The correct answer is rare. Combined with format, it gets a massive advantage.",
    candidates: [
      { id: 'A', solutionText: "<think>It scales linearly with machines.</think> 100 minutes", isCorrect: false, hasFormat: true },
      { id: 'B', solutionText: "100 minutes", isCorrect: false, hasFormat: false },
      { id: 'C', solutionText: "<think>5 minutes for 5 widgets means 1 min per widget.</think> 100 minutes", isCorrect: false, hasFormat: true },
      { id: 'D', solutionText: "<think>Each machine works independently.</think> 5 minutes", isCorrect: true, hasFormat: true },
    ]
  }
];