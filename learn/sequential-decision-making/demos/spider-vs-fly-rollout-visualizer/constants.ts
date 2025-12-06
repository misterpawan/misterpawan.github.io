export const GRID_SIZE = 10;
export const MAX_SIMULATION_DEPTH = 20; // To prevent infinite loops in heuristic calculation

export const SPIDER_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#a855f7', // Purple
];

export const DIRECTIONS = [
  { dx: 0, dy: -1, label: 'UP' },
  { dx: 0, dy: 1, label: 'DOWN' },
  { dx: -1, dy: 0, label: 'LEFT' },
  { dx: 1, dy: 0, label: 'RIGHT' },
  // We generally enforce movement in this problem, but stay can be implicit if blocked (though grid is open here)
];