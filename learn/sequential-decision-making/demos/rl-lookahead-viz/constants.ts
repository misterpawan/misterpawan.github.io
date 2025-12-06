import { Scenario, MoveNode } from './types';

// Helper to generate IDs
const id = () => Math.random().toString(36).substr(2, 9);

// Scenario 1: King & Queen vs King (Mating Net)
// White to move.
// FEN: 8/8/8/3k4/8/3K4/3Q4/8 w - - 0 1
const scenario1Tree: MoveNode[] = [
  {
    id: id(),
    from: 'd2',
    to: 'g5',
    san: 'Qg5',
    player: 'user',
    fen: '8/8/8/3k2Q1/8/3K4/8/8 b - - 1 1',
    score: 0.4,
    annotation: 'Checks, but allows escape.',
    children: [
      {
        id: id(),
        from: 'd5',
        to: 'd6',
        san: 'Kd6',
        player: 'opponent',
        fen: '8/8/3k4/6Q1/8/3K4/8/8 w - - 2 2',
        score: -0.2,
        children: [
            {
                id: id(),
                from: 'g5',
                to: 'g6',
                san: 'Qg6+',
                player: 'user',
                fen: '8/8/3k2Q1/8/8/3K4/8/8 b - - 3 3',
                score: 0.1
            }
        ]
      },
      {
        id: id(),
        from: 'd5',
        to: 'c6',
        san: 'Kc6',
        player: 'opponent',
        fen: '8/8/2k5/6Q1/8/3K4/8/8 w - - 2 2',
        score: -0.1,
        children: [
            {
                id: id(),
                from: 'g5',
                to: 'e5',
                san: 'Qe5',
                player: 'user',
                fen: '8/8/2k5/4Q3/8/3K4/8/8 b - - 3 3',
                score: 0.5
            }
        ]
      }
    ]
  },
  {
    id: id(),
    from: 'd2',
    to: 'f4',
    san: 'Qf4',
    player: 'user',
    fen: '8/8/8/3k4/5Q2/3K4/8/8 b - - 1 1',
    score: 0.9, // Very good move, restricts king
    annotation: 'Excellent! Cuts off the King.',
    children: [
      {
        id: id(),
        from: 'd5',
        to: 'c6',
        san: 'Kc6',
        player: 'opponent',
        fen: '8/8/2k5/8/5Q2/3K4/8/8 w - - 2 2',
        score: 0.95,
        annotation: 'King tries to run to corner.',
        children: [
          {
            id: id(),
            from: 'd3',
            to: 'c4',
            san: 'Kc4',
            player: 'user',
            fen: '8/8/2k5/8/2K2Q2/8/8/8 b - - 3 3',
            score: 0.99,
            annotation: 'Closing the net.'
          },
          {
            id: id(),
            from: 'f4',
            to: 'e5',
            san: 'Qe5',
            player: 'user',
            fen: '8/8/2k5/4Q3/8/3K4/8/8 b - - 3 3',
            score: 0.98,
            annotation: 'Centralizing.'
          }
        ]
      },
      {
        id: id(),
        from: 'd5',
        to: 'e6',
        san: 'Ke6',
        player: 'opponent',
        fen: '8/8/4k3/8/5Q2/3K4/8/8 w - - 2 2',
        score: 0.9,
        children: [
            {
                id: id(),
                from: 'f4',
                to: 'd4',
                san: 'Qd4',
                player: 'user',
                fen: '8/8/4k3/8/3Q4/3K4/8/8 b - - 3 3',
                score: 0.95
            }
        ]
      }
    ]
  }
];

// Scenario 2: Simple Rook Mate
// FEN: 8/8/8/8/8/4k3/4R3/4K3 w - - 0 1
const scenario2Tree: MoveNode[] = [
  {
    id: id(),
    from: 'e2',
    to: 'f2',
    san: 'Rf2',
    player: 'user',
    fen: '8/8/8/8/8/4k3/5R2/4K3 b - - 1 1',
    score: 0.2,
    annotation: 'Passive. King can approach.',
    children: [
      {
        id: id(),
        from: 'e3',
        to: 'd3',
        san: 'Kd3',
        player: 'opponent',
        fen: '8/8/8/8/8/3k4/5R2/4K3 w - - 2 2',
        score: 0.1,
        children: [
            {
                id: id(),
                from: 'f2',
                to: 'e2',
                san: 'Re2+',
                player: 'user',
                fen: '8/8/8/8/8/3k4/4R3/4K3 b - - 3 3',
                score: 0.1
            }
        ]
      }
    ]
  },
  {
    id: id(),
    from: 'e1',
    to: 'f1',
    san: 'Kf1',
    player: 'user',
    fen: '8/8/8/8/8/4k3/4R3/5K2 b - - 1 1',
    score: 0.8,
    annotation: 'Good waiting move.',
    children: [
      {
        id: id(),
        from: 'e3',
        to: 'd3',
        san: 'Kd3',
        player: 'opponent',
        fen: '8/8/8/8/8/3k4/4R3/5K2 w - - 2 2',
        score: 0.85,
        children: [
            {
                id: id(),
                from: 'e2',
                to: 'e8',
                san: 'Re8',
                player: 'user',
                fen: '8/8/4R3/8/8/3k4/8/5K2 b - - 3 3',
                score: 0.9
            }
        ]
      },
      {
        id: id(),
        from: 'e3',
        to: 'f3',
        san: 'Kf3',
        player: 'opponent',
        fen: '8/8/8/8/8/5k2/4R3/5K2 w - - 2 2',
        score: -1.0,
        annotation: 'King captures Rook! Blunder by opponent? No, R is protected? No.',
        children: [] // End of line
      }
    ]
  }
];


export const SCENARIOS: Scenario[] = [
  {
    id: 'sc1',
    title: 'Restricting the King',
    description: 'Use your Queen to cut off the enemy King. The goal is to force the King to the edge.',
    initialFen: '8/8/8/3k4/8/3K4/3Q4/8 w - - 0 1',
    playerColor: 'w',
    moveTree: scenario1Tree
  },
  {
    id: 'sc2',
    title: 'Rook Endgame Safety',
    description: 'Find a safe square for your Rook while maintaining the cutoff.',
    initialFen: '8/8/8/8/8/4k3/4R3/4K3 w - - 0 1',
    playerColor: 'w',
    moveTree: scenario2Tree
  }
];
