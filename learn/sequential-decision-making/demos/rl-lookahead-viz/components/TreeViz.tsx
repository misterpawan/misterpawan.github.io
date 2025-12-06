import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoveNode } from '../types';
import { Network, ArrowRight } from 'lucide-react';

interface TreeVizProps {
  userMove: MoveNode | null;
  lookaheadMode: 'none' | 'one-step' | 'multi-step';
}

const Node: React.FC<{ 
    move: MoveNode; 
    depth: number; 
    isActive: boolean;
    isLast: boolean;
}> = ({ move, depth, isActive, isLast }) => {
  const isOpponent = move.player === 'opponent';
  
  // Colors based on RL score/value
  const getScoreColor = (score?: number) => {
      if (score === undefined) return 'bg-gray-400';
      if (score > 0.6) return 'bg-emerald-500';
      if (score < 0) return 'bg-red-500';
      return 'bg-amber-500';
  };

  return (
    <div className="flex flex-col items-center">
        <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: depth * 0.2 }}
            className={`
                relative z-10 flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm
                ${isActive ? 'border-blue-400 ring-2 ring-blue-500/20 bg-white' : 'border-slate-200'}
                ${isOpponent ? 'bg-slate-100' : 'bg-white'}
            `}
        >
            <div className={`w-3 h-3 rounded-full ${getScoreColor(move.score)}`} />
            <span className="font-mono font-bold text-sm text-slate-800">{move.san}</span>
            {move.annotation && (
                <span className="text-xs text-slate-400 hidden lg:inline max-w-[100px] truncate">
                    {move.annotation}
                </span>
            )}
        </motion.div>
        
        {/* Connector Line */}
        {!isLast && <div className="h-6 w-0.5 bg-slate-300 my-1"></div>}
    </div>
  );
};

export const TreeViz: React.FC<TreeVizProps> = ({ userMove, lookaheadMode }) => {
  if (!userMove) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <Network className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-center text-slate-500">Select a move on the board to visualize the decision tree.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-500" />
            Decision Tree
        </h3>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Good
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-2"></span> OK
            <span className="w-2 h-2 rounded-full bg-red-500 ml-2"></span> Bad
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        {/* Level 0: User Selected Move */}
        <div className="relative">
             <div className="absolute -left-24 top-2 text-xs font-bold text-blue-500 uppercase tracking-wider">Current Action</div>
             <Node move={userMove} depth={0} isActive={true} isLast={lookaheadMode === 'none'} />
        </div>

        {/* Level 1: Opponent Responses (One Step Lookahead) */}
        <AnimatePresence>
            {lookaheadMode !== 'none' && userMove.children && (
                <div className="mt-2 w-full">
                    <div className="relative border-t-2 border-slate-200 w-full flex justify-center pt-6 gap-8">
                        <div className="absolute left-4 -top-3 text-xs font-bold text-red-500 uppercase tracking-wider bg-white px-2">Opponent Response</div>
                        {userMove.children.map((child, idx) => (
                            <div key={child.id} className="flex flex-col items-center relative">
                                {/* Branch Lines would be SVG here for perfect curves, but simple border works for strict tree */}
                                <Node move={child} depth={1} isActive={false} isLast={lookaheadMode === 'one-step'} />
                                
                                {/* Level 2: My Next Moves (Multi Step Lookahead) */}
                                {lookaheadMode === 'multi-step' && child.children && (
                                    <div className="mt-2 flex flex-col items-center w-full pt-4 relative">
                                        <div className="h-4 w-0.5 bg-slate-300 absolute -top-2"></div>
                                        <div className="flex gap-4">
                                             {child.children.map((grandChild) => (
                                                <div key={grandChild.id} className="relative">
                                                     <Node move={grandChild} depth={2} isActive={false} isLast={true} />
                                                </div>
                                             ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AnimatePresence>
      </div>
      
      {lookaheadMode === 'multi-step' && (
           <div className="mt-8 text-center">
               <span className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded border border-blue-200">
                   My Counter-Response
               </span>
           </div>
      )}
    </div>
  );
};