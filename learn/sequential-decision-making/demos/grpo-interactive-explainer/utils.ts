import { Candidate, CalculatedStats } from './types';

export const calculateReward = (candidate: Candidate): number => {
  let r = 0;
  // Uniform rule requested: 0.5 for Correct, 0.5 for Format
  if (candidate.isCorrect) r += 0.5;
  if (candidate.hasFormat) r += 0.5;
  return r;
};

export const calculateGroupStats = (candidates: Candidate[]): CalculatedStats => {
  const rewards = candidates.map(c => calculateReward(c));
  
  const sum = rewards.reduce((acc, val) => acc + val, 0);
  const mean = sum / rewards.length;
  
  // Standard Deviation (Population)
  // sigma = sqrt( sum((x - mu)^2) / N )
  const squaredDiffs = rewards.map(r => Math.pow(r - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / rewards.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  // Advantage Calculation
  // A = (r - mu) / sigma
  // Guard against divide by zero if stdDev is 0 (all rewards equal) -> Advantage is usually 0
  const advantages = rewards.map(r => {
    if (stdDev === 0) return 0;
    return (r - mean) / stdDev;
  });

  return {
    rewards,
    mean,
    stdDev,
    advantages
  };
};

export const formatNumber = (num: number): string => {
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
};