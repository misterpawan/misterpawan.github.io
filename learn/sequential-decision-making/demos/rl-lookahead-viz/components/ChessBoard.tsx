import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoardState, Piece, MoveNode, LookaheadMode } from '../types';

interface ChessBoardProps {
  fen: string;
  validMoves?: MoveNode[];
  onMoveSelect: (move: MoveNode) => void;
  selectedMove: MoveNode | null;
  lookaheadMode: LookaheadMode;
  simulatedBoardState?: BoardState;
}

// Simple FEN parser
const parseFen = (fen: string): BoardState => {
  const board: BoardState = {};
  const [position] = fen.split(' ');
  const rows = position.split('/');
  
  rows.forEach((row, rowIndex) => {
    let colIndex = 0;
    for (const char of row) {
      if (/\d/.test(char)) {
        colIndex += parseInt(char, 10);
      } else {
        const file = String.fromCharCode(97 + colIndex); // a, b, c...
        const rank = 8 - rowIndex; // 8, 7, 6...
        const square = `${file}${rank}`;
        board[square] = {
          type: char.toLowerCase() as any,
          color: char === char.toUpperCase() ? 'w' : 'b'
        };
        colIndex++;
      }
    }
  });
  return board;
};

const PIECE_SYMBOLS: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

export const ChessBoard: React.FC<ChessBoardProps> = ({ 
    fen, 
    validMoves = [], 
    onMoveSelect, 
    selectedMove,
    lookaheadMode,
    simulatedBoardState 
}) => {
  const boardState = useMemo(() => parseFen(fen), [fen]);
  
  // If we are simulating (selectedMove is not null), show the simulated state, otherwise real state
  const displayState = simulatedBoardState || boardState;

  // Flatten logic for arrows
  const getArrows = () => {
      const arrows: { from: string, to: string, color: string, label?: string }[] = [];
      
      // 1. The User's selected move (Green)
      if (selectedMove) {
          arrows.push({ 
              from: selectedMove.from, 
              to: selectedMove.to, 
              color: '#10b981', // emerald-500
              label: 'You'
            });

          // 2. Lookahead: Opponent Moves (Red)
          if (lookaheadMode !== 'none' && selectedMove.children) {
              selectedMove.children.forEach(child => {
                  arrows.push({
                      from: child.from,
                      to: child.to,
                      color: '#ef4444', // red-500
                      label: 'Opponent'
                  });

                  // 3. Lookahead: Multi-step User Moves (Blue)
                  if (lookaheadMode === 'multi-step' && child.children) {
                      child.children.forEach(grandChild => {
                          arrows.push({
                              from: grandChild.from,
                              to: grandChild.to,
                              color: '#3b82f6', // blue-500
                              label: 'Response'
                          });
                      });
                  }
              });
          }
      }
      return arrows;
  };

  const arrows = getArrows();

  // Helper to get coordinates for arrows
  const getSquareCenter = (square: string) => {
     const colIndex = FILES.indexOf(square[0]);
     const rowIndex = RANKS.indexOf(parseInt(square[1]));
     // Assuming 100% width/height board, percentages
     return { x: (colIndex * 12.5) + 6.25, y: (rowIndex * 12.5) + 6.25 };
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-square bg-white rounded-lg shadow-2xl overflow-hidden select-none border-4 border-slate-300">
      {/* Board Grid */}
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
        {RANKS.map((rank) => (
          FILES.map((file, colIndex) => {
            const square = `${file}${rank}`;
            const isDark = (colIndex + rank) % 2 === 0;
            const piece = displayState[square];
            
            // Check if this square is a valid start for a move
            const isValidStart = !selectedMove && validMoves.some(m => m.from === square);
            
            // Highlight source of selected move
            const isSource = selectedMove?.from === square;
            const isDest = selectedMove?.to === square;

            return (
              <div 
                key={square}
                onClick={() => {
                    const move = validMoves.find(m => m.from === square || m.to === square);
                    if (move && !selectedMove && move.from === square) {
                         const movesFromSquare = validMoves.filter(m => m.from === square);
                         if (movesFromSquare.length === 1) onMoveSelect(movesFromSquare[0]);
                    }
                }}
                className={`
                  relative flex items-center justify-center
                  ${isDark ? 'bg-slate-400' : 'bg-slate-200'}
                  ${isValidStart ? 'cursor-pointer hover:ring-inset hover:ring-4 hover:ring-blue-400/50' : ''}
                  ${isSource ? 'bg-yellow-400/50' : ''}
                  ${isDest ? 'bg-yellow-400/50' : ''}
                `}
              >
                {/* Coordinate Labels */}
                {file === 'a' && <span className={`absolute left-0.5 top-0.5 text-[0.6rem] font-bold ${isDark ? 'text-slate-200' : 'text-slate-400'}`}>{rank}</span>}
                {rank === 1 && <span className={`absolute right-0.5 bottom-0 text-[0.6rem] font-bold ${isDark ? 'text-slate-200' : 'text-slate-400'}`}>{file}</span>}
                
                {piece && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-4xl sm:text-5xl select-none ${piece.color === 'w' ? 'text-white' : 'text-black'}`}
                    style={{ 
                        // Drop shadow to ensure white pieces pop on light squares
                        filter: piece.color === 'w' ? 'drop-shadow(0px 1.5px 1px rgba(0,0,0,0.6))' : 'drop-shadow(0px 1px 1px rgba(255,255,255,0.3))' 
                    }}
                  >
                    {PIECE_SYMBOLS[`${piece.color}${piece.type.toUpperCase()}`]}
                  </motion.span>
                )}

                {/* Valid Move Indicator (if no move selected yet) */}
                {isValidStart && !selectedMove && (
                    <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                )}
              </div>
            );
          })
        ))}
      </div>

      {/* Valid Move Destinations Overlay (Pre-selection) */}
      {!selectedMove && validMoves.map(move => {
          const pos = getSquareCenter(move.to);
          return (
              <div 
                key={move.id}
                onClick={() => onMoveSelect(move)}
                className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-green-500/50 cursor-pointer hover:bg-green-600/70 border-2 border-green-400 z-20"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              />
          );
      })}

      {/* SVG Overlay for Arrows */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
        <defs>
          <marker id="arrowhead-g" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#10b981" />
          </marker>
          <marker id="arrowhead-r" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#ef4444" />
          </marker>
          <marker id="arrowhead-b" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
          </marker>
        </defs>
        <AnimatePresence>
            {arrows.map((arrow, i) => {
                const start = getSquareCenter(arrow.from);
                const end = getSquareCenter(arrow.to);
                const markerId = arrow.color === '#10b981' ? 'url(#arrowhead-g)' : arrow.color === '#ef4444' ? 'url(#arrowhead-r)' : 'url(#arrowhead-b)';
                
                return (
                    <motion.g 
                        key={`${arrow.from}-${arrow.to}`}
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: 1, pathLength: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                        <line 
                            x1={`${start.x}%`} y1={`${start.y}%`} 
                            x2={`${end.x}%`} y2={`${end.y}%`} 
                            stroke={arrow.color} 
                            strokeWidth="3" // Thicker stroke
                            markerEnd={markerId}
                            strokeDasharray={arrow.color === '#10b981' ? '0' : '4 4'} // Solid for user, dashed for lookahead
                            opacity="0.8"
                        />
                    </motion.g>
                );
            })}
        </AnimatePresence>
      </svg>
    </div>
  );
};