import React, { useState, useEffect } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { TreeViz } from './components/TreeViz';
import { SCENARIOS } from './constants';
import { Scenario, MoveNode, LookaheadMode, BoardState } from './types';
import { BrainCircuit, RotateCcw, ChevronRight, Eye, Layers } from 'lucide-react';

const App: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [selectedMove, setSelectedMove] = useState<MoveNode | null>(null);
  const [lookaheadMode, setLookaheadMode] = useState<LookaheadMode>('none');
  
  // This state is just for rendering the board after the user makes a "Simulated" move
  const [simulatedFen, setSimulatedFen] = useState<string | null>(null);

  const handleScenarioChange = (id: string) => {
    const sc = SCENARIOS.find(s => s.id === id);
    if (sc) {
        setActiveScenario(sc);
        resetState();
    }
  };

  const resetState = () => {
      setSelectedMove(null);
      setLookaheadMode('none');
      setSimulatedFen(null);
  };

  const handleMoveSelect = (move: MoveNode) => {
      setSelectedMove(move);
      setSimulatedFen(move.fen);
      // Auto-advance lookahead for better UX
      setTimeout(() => setLookaheadMode('one-step'), 500);
  };

  // Helper to parse fen just to pass correct type if needed, mostly handled in component
  const getSimulatedBoardState = (): BoardState | undefined => {
      // Logic handled inside ChessBoard via FEN parsing
      return undefined; 
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">
                    RL Lookahead Viz
                </h1>
                <p className="text-xs text-slate-500">Reinforcement Learning Concept Demo</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                 {SCENARIOS.map(sc => (
                     <button
                        key={sc.id}
                        onClick={() => handleScenarioChange(sc.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeScenario.id === sc.id ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
                     >
                         {sc.title}
                     </button>
                 ))}
             </div>
             <button 
                onClick={resetState}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
                title="Reset Scenario"
             >
                 <RotateCcw className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Board & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900 mb-1">{activeScenario.title}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">{activeScenario.description}</p>
                </div>

                <div className="flex justify-center mb-6">
                    <ChessBoard 
                        fen={simulatedFen || activeScenario.initialFen}
                        validMoves={activeScenario.moveTree}
                        onMoveSelect={handleMoveSelect}
                        selectedMove={selectedMove}
                        lookaheadMode={lookaheadMode}
                    />
                </div>

                {/* Simulation Controls */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                        <span>Simulation Depth</span>
                        <span className={`font-mono font-bold ${lookaheadMode === 'none' ? 'text-gray-500' : lookaheadMode === 'one-step' ? 'text-red-500' : 'text-blue-500'}`}>
                            {lookaheadMode === 'none' ? 'Current State' : lookaheadMode === 'one-step' ? 'Depth: 1 (Opponent)' : 'Depth: 2 (My Response)'}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            disabled={!selectedMove}
                            onClick={() => setLookaheadMode('none')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all shadow-sm
                                ${lookaheadMode === 'none' 
                                    ? 'bg-slate-800 border-slate-900 text-white shadow-md' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                ${!selectedMove ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
                            `}
                        >
                            <Eye className="w-5 h-5 mb-1" />
                            <span className="text-xs">Result</span>
                        </button>
                        <button
                            disabled={!selectedMove}
                            onClick={() => setLookaheadMode('one-step')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all shadow-sm
                                ${lookaheadMode === 'one-step' 
                                    ? 'bg-red-50 border-red-300 text-red-700 shadow-md ring-1 ring-red-200' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                ${!selectedMove ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
                            `}
                        >
                            <ChevronRight className="w-5 h-5 mb-1" />
                            <span className="text-xs">1-Step</span>
                        </button>
                        <button
                            disabled={!selectedMove}
                            onClick={() => setLookaheadMode('multi-step')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all shadow-sm
                                ${lookaheadMode === 'multi-step' 
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-md ring-1 ring-blue-200' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                ${!selectedMove ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
                            `}
                        >
                            <Layers className="w-5 h-5 mb-1" />
                            <span className="text-xs">Multi-Step</span>
                        </button>
                    </div>
                    {!selectedMove && (
                         <div className="text-center text-xs text-amber-600 bg-amber-50 py-2 rounded-lg border border-amber-100 animate-pulse">
                             Click a valid target (green dot) to simulate a move
                         </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Col: Tree Visualization */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl h-full flex flex-col p-6">
                 <div className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">Search Tree Visualization</h2>
                    <p className="text-sm text-slate-500">
                        Reinforcement learning agents (like AlphaZero) build a search tree to evaluate moves. 
                        They simulate the opponent's best responses (Minimax) to determine the value of the current state.
                    </p>
                 </div>
                 
                 <div className="flex-1 overflow-auto rounded-xl bg-slate-50 border border-slate-200 shadow-inner">
                     <TreeViz userMove={selectedMove} lookaheadMode={lookaheadMode} />
                 </div>

                 <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
                     <div className="flex items-start gap-2">
                         <div className="w-2 h-2 mt-1 rounded-full bg-emerald-500 shrink-0" />
                         <p>High Score (&gt;0.6): Lead to winning positions or checkmate.</p>
                     </div>
                     <div className="flex items-start gap-2">
                         <div className="w-2 h-2 mt-1 rounded-full bg-amber-500 shrink-0" />
                         <p>Neutral Score (~0.0): Unclear or drawish positions.</p>
                     </div>
                     <div className="flex items-start gap-2">
                         <div className="w-2 h-2 mt-1 rounded-full bg-red-500 shrink-0" />
                         <p>Low Score (&lt;0.0): Risky moves, likely leading to loss.</p>
                     </div>
                 </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;