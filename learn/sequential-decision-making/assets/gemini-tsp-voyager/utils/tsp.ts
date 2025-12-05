import { City } from '../types';

// Calculate Euclidean distance between two cities (0-100 scale)
export const calculateDistance = (cityA: City, cityB: City): number => {
  const dx = cityA.x - cityB.x;
  const dy = cityA.y - cityB.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Calculate total path length
export const calculatePathDistance = (pathIds: string[], cities: City[]): number => {
  if (pathIds.length < 2) return 0;
  
  let totalDist = 0;
  for (let i = 0; i < pathIds.length - 1; i++) {
    const c1 = cities.find(c => c.id === pathIds[i]);
    const c2 = cities.find(c => c.id === pathIds[i + 1]);
    if (c1 && c2) {
      totalDist += calculateDistance(c1, c2);
    }
  }
  
  // Close the loop for TSP (return to start)
  if (pathIds.length === cities.length && pathIds.length > 1) {
      const first = cities.find(c => c.id === pathIds[0]);
      const last = cities.find(c => c.id === pathIds[pathIds.length - 1]);
      if (first && last) {
        totalDist += calculateDistance(last, first);
      }
  }
  
  return totalDist;
};

// A simple permutation solver for small N (N <= 9). 
// For N > 9, this will block the thread, so we'd need a heuristic, 
// but for this game let's keep N reasonable or use a greedy approach if N is large.
export const solveTSP = (cities: City[]): { distance: number, path: string[] } => {
  if (cities.length === 0) return { distance: 0, path: [] };
  if (cities.length === 1) return { distance: 0, path: [cities[0].id] };

  // Heuristic: Nearest Neighbor (Greedy) approach for better performance with React state
  // This is not always optimal but good enough for a "game" comparison if N is large.
  // However, for N < 9 we can try brute force.
  
  if (cities.length <= 9) {
    return bruteForceTSP(cities);
  } else {
    return nearestNeighborTSP(cities);
  }
};

const bruteForceTSP = (cities: City[]): { distance: number, path: string[] } => {
  const startCity = cities[0];
  const otherCities = cities.slice(1);
  const permutations = permute(otherCities);
  
  let minDistance = Infinity;
  let bestPath: string[] = [];

  for (const perm of permutations) {
    // Construct full path: Start -> Permutation -> Start
    const currentPathSequence = [startCity, ...perm, startCity];
    let currentDist = 0;
    
    for (let i = 0; i < currentPathSequence.length - 1; i++) {
      currentDist += calculateDistance(currentPathSequence[i], currentPathSequence[i+1]);
    }
    
    if (currentDist < minDistance) {
      minDistance = currentDist;
      bestPath = [startCity.id, ...perm.map(c => c.id)];
    }
  }
  
  return { distance: minDistance, path: bestPath };
};

const nearestNeighborTSP = (cities: City[]): { distance: number, path: string[] } => {
    // Basic greedy algo
    // Try starting from each city to find the best local greedy path
    let globalBestDist = Infinity;
    let globalBestPath: string[] = [];

    for(let startIdx = 0; startIdx < cities.length; startIdx++) {
        const unvisited = new Set(cities.map(c => c.id));
        let currentCity = cities[startIdx];
        const path = [currentCity.id];
        unvisited.delete(currentCity.id);
        let currentTotalDist = 0;

        while(unvisited.size > 0) {
            let nearestCity: City | null = null;
            let nearestDist = Infinity;

            for(const candidateId of Array.from(unvisited)) {
                const candidate = cities.find(c => c.id === candidateId)!;
                const dist = calculateDistance(currentCity, candidate);
                if(dist < nearestDist) {
                    nearestDist = dist;
                    nearestCity = candidate;
                }
            }

            if(nearestCity) {
                currentTotalDist += nearestDist;
                path.push(nearestCity.id);
                unvisited.delete(nearestCity.id);
                currentCity = nearestCity;
            } else {
                break;
            }
        }

        // Return to start
        const start = cities.find(c => c.id === path[0])!;
        const end = cities.find(c => c.id === path[path.length - 1])!;
        currentTotalDist += calculateDistance(end, start);

        if(currentTotalDist < globalBestDist) {
            globalBestDist = currentTotalDist;
            globalBestPath = path;
        }
    }

    return { distance: globalBestDist, path: globalBestPath };
}

function permute<T>(permutation: T[]): T[][] {
  const length = permutation.length;
  const result = [permutation.slice()];
  const c = new Array(length).fill(0);
  let i = 1;
  let k;
  let p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
}
