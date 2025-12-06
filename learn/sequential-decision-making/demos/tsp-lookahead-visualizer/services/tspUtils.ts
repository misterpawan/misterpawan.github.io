import { City, LookaheadResult } from '../types';

export const calculateDistance = (a: City, b: City): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const generateCities = (count: number, width: number, height: number): City[] => {
  const cities: City[] = [];
  // Ensure we have enough space for the graph visualization, 
  // though coordinates are mainly used for distance calc now.
  const padding = 50;
  for (let i = 0; i < count; i++) {
    cities.push({
      id: i,
      x: padding + Math.random() * (width - 2 * padding),
      y: padding + Math.random() * (height - 2 * padding),
      name: String.fromCharCode(65 + i), // A, B, C...
    });
  }
  return cities;
};

// Solves the rest of the path using Greedy (Nearest Neighbor)
// and returns to the 'returnToCity' (Start Node) at the end.
export const solveGreedy = (
  startCity: City,
  unvisitedCities: City[],
  returnToCity: City
): { path: City[]; cost: number } => {
  if (unvisitedCities.length === 0) {
    // Just return to start
    const dist = calculateDistance(startCity, returnToCity);
    return { path: [returnToCity], cost: dist };
  }

  let current = startCity;
  const remaining = [...unvisitedCities];
  const path: City[] = [];
  let totalCost = 0;

  while (remaining.length > 0) {
    let nearest: City | null = null;
    let minDist = Infinity;
    let nearestIndex = -1;

    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateDistance(current, remaining[i]);
      if (dist < minDist) {
        minDist = dist;
        nearest = remaining[i];
        nearestIndex = i;
      }
    }

    if (nearest && nearestIndex !== -1) {
      path.push(nearest);
      totalCost += minDist;
      current = nearest;
      remaining.splice(nearestIndex, 1);
    }
  }

  // Add final leg back to returnToCity (Sink)
  const returnCost = calculateDistance(current, returnToCity);
  totalCost += returnCost;
  path.push(returnToCity);

  return { path, cost: totalCost };
};

export const calculateOneStepLookahead = (
  currentCity: City,
  unvisitedCities: City[],
  returnToCity: City
): LookaheadResult[] => {
  const results: LookaheadResult[] = [];

  for (const candidate of unvisitedCities) {
    const stepCost = calculateDistance(currentCity, candidate);
    
    // Remaining cities after picking candidate
    const remainingAfter = unvisitedCities.filter((c) => c.id !== candidate.id);
    
    // Greedy rollout back to returnToCity
    const { path: greedyPath, cost: greedyRestCost } = solveGreedy(candidate, remainingAfter, returnToCity);

    results.push({
      nextCity: candidate,
      stepCost,
      greedyRestCost,
      totalCost: stepCost + greedyRestCost,
      greedyPath,
    });
  }

  // Sort by total cost (ascending)
  return results.sort((a, b) => a.totalCost - b.totalCost);
};

export const calculateTwoStepLookahead = (
  currentCity: City,
  unvisitedCities: City[],
  returnToCity: City
): LookaheadResult[] => {
  const results: LookaheadResult[] = [];

  // If only 1 city left, 2-step reduces to 1-step logic
  if (unvisitedCities.length === 1) {
    return calculateOneStepLookahead(currentCity, unvisitedCities, returnToCity);
  }

  for (const firstCandidate of unvisitedCities) {
    const firstStepCost = calculateDistance(currentCity, firstCandidate);
    const remainingAfterFirst = unvisitedCities.filter((c) => c.id !== firstCandidate.id);

    for (const secondCandidate of remainingAfterFirst) {
      const secondStepCost = calculateDistance(firstCandidate, secondCandidate);
      const remainingAfterSecond = remainingAfterFirst.filter((c) => c.id !== secondCandidate.id);

      const { path: greedyPath, cost: greedyRestCost } = solveGreedy(secondCandidate, remainingAfterSecond, returnToCity);

      const combinedStepCost = firstStepCost + secondStepCost;

      results.push({
        nextCity: firstCandidate,
        secondCity: secondCandidate,
        stepCost: combinedStepCost,
        greedyRestCost,
        totalCost: combinedStepCost + greedyRestCost,
        greedyPath: greedyPath, // Pure greedy path (does not include secondCandidate)
      });
    }
  }

  return results.sort((a, b) => a.totalCost - b.totalCost);
};