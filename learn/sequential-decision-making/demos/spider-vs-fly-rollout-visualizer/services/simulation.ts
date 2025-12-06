import { Position, Spider, Fly, GameState, SimulationResult, MoveOption } from '../types';
import { GRID_SIZE, MAX_SIMULATION_DEPTH, DIRECTIONS } from '../constants';

// Helper: Calculate Manhattan Distance
const getDistance = (p1: Position, p2: Position): number => {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
};

// Helper: Deep copy state for simulation
const cloneState = (spiders: Spider[], flies: Fly[]): { spiders: Spider[], flies: Fly[] } => {
  return {
    spiders: spiders.map(s => ({ ...s, pos: { ...s.pos } })),
    flies: flies.map(f => ({ ...f, pos: { ...f.pos } })), // Flies are deep copied too
  };
};

// Base Policy: Greedy
// Each spider moves towards the closest active fly.
const applyGreedyPolicy = (spiders: Spider[], flies: Fly[]): void => {
  spiders.forEach(spider => {
    let closestFly: Fly | null = null;
    let minDist = Infinity;

    // Find nearest uncaught fly
    flies.forEach(fly => {
      if (!fly.isCaught) {
        const dist = getDistance(spider.pos, fly.pos);
        if (dist < minDist) {
          minDist = dist;
          closestFly = fly;
        }
      }
    });

    if (closestFly) {
      // Determine best step towards this fly
      const target = (closestFly as Fly).pos;
      const dx = target.x - spider.pos.x;
      const dy = target.y - spider.pos.y;

      // Simple greedy logic
      if (Math.abs(dx) >= Math.abs(dy)) {
        spider.pos.x += Math.sign(dx);
      } else {
        spider.pos.y += Math.sign(dy);
      }
    }
  });
};

// Check for captures and update fly status
const updateCaptures = (spiders: Spider[], flies: Fly[]): void => {
  flies.forEach(fly => {
    if (!fly.isCaught) {
      for (const spider of spiders) {
        if (spider.pos.x === fly.pos.x && spider.pos.y === fly.pos.y) {
          fly.isCaught = true;
          break;
        }
      }
    }
  });
};

// Heuristic Function: Simulate game to completion (or max depth) using Base Policy
// Returns the cost (number of steps)
const simulateCost = (initialSpiders: Spider[], initialFlies: Fly[]): number => {
  let steps = 0;
  const { spiders, flies } = cloneState(initialSpiders, initialFlies);

  // Check initial capture state (if move landed on fly immediately)
  updateCaptures(spiders, flies);

  while (flies.some(f => !f.isCaught) && steps < MAX_SIMULATION_DEPTH) {
    applyGreedyPolicy(spiders, flies);
    updateCaptures(spiders, flies);
    steps++;
  }
  
  // If we hit max depth, add a penalty
  if (steps === MAX_SIMULATION_DEPTH) {
    let penalty = 0;
    flies.forEach(f => {
        if(!f.isCaught) {
            let minDist = Infinity;
            spiders.forEach(s => {
                const d = getDistance(s.pos, f.pos);
                if (d < minDist) minDist = d;
            });
            penalty += minDist;
        }
    });
    return steps + penalty; 
  }

  return steps;
};

// ----------------------------------------------------------------------
// SEQUENTIAL ROLLOUT HELPERS (Interactive)
// ----------------------------------------------------------------------

export const calculateMoveOptions = (
    spiderIdx: number,
    currentState: GameState,
    committedMoves: Map<number, Position>
): MoveOption[] => {
    const { spiders, flies } = currentState;
    const spider = spiders[spiderIdx];
    
    // 1. Identify Candidate Moves
    const candidates = DIRECTIONS.map(d => ({
        x: Math.max(0, Math.min(GRID_SIZE - 1, spider.pos.x + d.dx)),
        y: Math.max(0, Math.min(GRID_SIZE - 1, spider.pos.y + d.dy)),
        label: d.label
    }));

    // Deduplicate logic
    const uniqueCandidates = new Map<string, typeof candidates[0]>();
    candidates.forEach(c => uniqueCandidates.set(`${c.x},${c.y}`, c));
    
    const options: MoveOption[] = [];

    // 2. Evaluate Each Candidate
    for (const move of uniqueCandidates.values()) {
        const tempSpiders = cloneState(spiders, flies).spiders;

        // A. Apply Committed Moves (0 to i-1)
        for (let prev = 0; prev < spiderIdx; prev++) {
            if (committedMoves.has(prev)) {
                tempSpiders[prev].pos = committedMoves.get(prev)!;
            }
        }

        // B. Apply Candidate Move (i)
        tempSpiders[spiderIdx].pos = { x: move.x, y: move.y };

        // C. Apply Greedy Base Policy for Future Agents (i+1 to m)
        // This simulates what the *current* agent thinks the *others* will do in this step
        for (let next = spiderIdx + 1; next < spiders.length; next++) {
            let closestFly: Fly | null = null;
            let minDist = Infinity;
            flies.forEach(f => {
                if (!f.isCaught) {
                    const dist = getDistance(spiders[next].pos, f.pos);
                    if (dist < minDist) {
                        minDist = dist;
                        closestFly = f;
                    }
                }
            });
            
            if (closestFly) {
                const target = (closestFly as Fly).pos;
                const curr = spiders[next].pos;
                const dx = target.x - curr.x;
                const dy = target.y - curr.y;
                if (Math.abs(dx) >= Math.abs(dy)) tempSpiders[next].pos.x += Math.sign(dx);
                else tempSpiders[next].pos.y += Math.sign(dy);
            }
        }

        // D. Calculate Cost (1 step taken + heuristic cost-to-go)
        const cost = 1 + simulateCost(tempSpiders, flies);
        
        options.push({
            direction: move.label,
            position: { x: move.x, y: move.y },
            cost: cost
        });
    }
    
    return options.sort((a, b) => a.cost - b.cost);
};


// ----------------------------------------------------------------------
// SIMULTANEOUS ROLLOUT HELPERS (Interactive)
// ----------------------------------------------------------------------

/**
 * Calculates the cost of a specific joint configuration of moves.
 */
export const calculateJointCost = (currentState: GameState, jointMoves: Map<number, Position>): number => {
    const { spiders, flies } = currentState;
    const tempSpiders = cloneState(spiders, flies).spiders;
    
    // Apply all joint moves
    jointMoves.forEach((pos, id) => {
        const spider = tempSpiders.find(s => s.id === id);
        if (spider) spider.pos = pos;
    });

    return 1 + simulateCost(tempSpiders, flies);
};

/**
 * Calculates the options for ALL spiders, assuming the *other* spiders stick to the `currentDrafts`.
 * This allows the user to see "If I change Spider X to Left, how does it affect total cost?"
 */
export const calculateSimultaneousOptions = (
    currentState: GameState, 
    currentDrafts: Map<number, Position>
): Map<number, MoveOption[]> => {
    const { spiders } = currentState;
    const allOptions = new Map<number, MoveOption[]>();

    spiders.forEach(spider => {
        // For this spider, test all directions while holding others constant
        const candidates = DIRECTIONS.map(d => ({
            x: Math.max(0, Math.min(GRID_SIZE - 1, spider.pos.x + d.dx)),
            y: Math.max(0, Math.min(GRID_SIZE - 1, spider.pos.y + d.dy)),
            label: d.label
        }));

        const uniqueCandidates = new Map<string, typeof candidates[0]>();
        candidates.forEach(c => uniqueCandidates.set(`${c.x},${c.y}`, c));

        const spiderOptions: MoveOption[] = [];

        for (const move of uniqueCandidates.values()) {
            // Create a temporary joint move set for evaluation
            const tempJointMoves = new Map(currentDrafts);
            tempJointMoves.set(spider.id, { x: move.x, y: move.y });

            const cost = calculateJointCost(currentState, tempJointMoves);
            
            spiderOptions.push({
                direction: move.label,
                position: { x: move.x, y: move.y },
                cost: cost
            });
        }
        allOptions.set(spider.id, spiderOptions.sort((a,b) => a.cost - b.cost));
    });

    return allOptions;
};


// ----------------------------------------------------------------------
// AUTOMATED ROLLOUTS
// ----------------------------------------------------------------------

export const getSequentialRolloutMoves = (currentState: GameState): SimulationResult => {
  const { spiders } = currentState;
  const committedMoves = new Map<number, Position>();
  
  for (let i = 0; i < spiders.length; i++) {
    const options = calculateMoveOptions(i, currentState, committedMoves);
    // Pick best (lowest cost)
    committedMoves.set(spiders[i].id, options[0].position);
  }

  return {
    nextMoves: committedMoves,
    estimatedCost: 0 
  };
};

export const getSimultaneousRolloutMoves = (currentState: GameState): SimulationResult => {
  const { spiders, flies } = currentState;
  
  const generateJointMoves = (agentIdx: number, currentJoint: Position[]): Position[][] => {
    if (agentIdx === spiders.length) {
      return [currentJoint];
    }

    const spider = spiders[agentIdx];
    const candidates = DIRECTIONS.map(d => ({
        x: Math.max(0, Math.min(GRID_SIZE - 1, spider.pos.x + d.dx)),
        y: Math.max(0, Math.min(GRID_SIZE - 1, spider.pos.y + d.dy))
    }));
    
    // De-dupe
    const uniqueCandidates = Array.from(new Set(candidates.map(p => `${p.x},${p.y}`)))
        .map(s => {
             const [x, y] = s.split(',').map(Number);
             return { x, y };
        });

    let allPaths: Position[][] = [];
    for (const move of uniqueCandidates) {
      const branches = generateJointMoves(agentIdx + 1, [...currentJoint, move]);
      allPaths = allPaths.concat(branches);
    }
    return allPaths;
  };

  const jointMoves = generateJointMoves(0, []);
  
  let bestJointMove: Position[] = [];
  let minCost = Infinity;

  for (const jointMove of jointMoves) {
    const tempSpiders = cloneState(spiders, flies).spiders;
    jointMove.forEach((pos, idx) => {
      tempSpiders[idx].pos = pos;
    });

    const cost = 1 + simulateCost(tempSpiders, flies);
    if (cost < minCost) {
      minCost = cost;
      bestJointMove = jointMove;
    }
  }

  const result = new Map<number, Position>();
  spiders.forEach((s, idx) => result.set(s.id, bestJointMove[idx]));

  return {
    nextMoves: result,
    estimatedCost: minCost
  };
};

export const getGreedyMoves = (currentState: GameState): SimulationResult => {
     const { spiders, flies } = currentState;
     const result = new Map<number, Position>();
     
     const tempSpiders = cloneState(spiders, flies).spiders;
     applyGreedyPolicy(tempSpiders, flies);
     
     tempSpiders.forEach((s, idx) => {
         result.set(spiders[idx].id, s.pos);
     });

     return { nextMoves: result, estimatedCost: 0 };
}