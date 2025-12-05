import React, { useState, useEffect, useMemo } from 'react';
import Staircase from './components/Staircase';
import DerivationSection from './components/DerivationSection';
import AiTutor from './components/AiTutor';
import { GameState, GameStatus, Path } from './types';
import { RefreshCw, Trophy } from 'lucide-react';

const TOTAL_STAIRS = 5;

// Precompute total ways for N=5.
// F(0)=1, F(1)=1, F(2)=2, F(3)=3, F(4)=5, F(5)=8.
// Ways to climb n stairs is Fib(n+1) if we start F(1)=1 (1 way for 0 stairs, rest logic applies).
// Actually, standard problem: ways(0)=1 (do nothing), ways(1)=1, ways(2)=2...
// For N=5: 8 ways.
const MAX_WAYS = 8; 

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentStep: 0,
    currentPath: [],
    foundPaths: [],
    n: TOTAL_STAIRS,
    isComplete: false
  });

  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.PLAYING);

  // Helper to get array representation of path
  const pathToString = (path: number[]) => path.join(' → ');

  const handleJump = (jumpSize: 1 | 2) => {
    if (gameStatus !== GameStatus.PLAYING) return;

    const nextStep = gameState.currentStep + jumpSize;
    const nextPath = [...gameState.currentPath, jumpSize];

    if (nextStep > gameState.n) {
      setGameState(prev => ({
        ...prev,
        currentStep: nextStep
      }));
      setGameStatus(GameStatus.OVERSHOT);
    } else if (nextStep === gameState.n) {
      // Reached Goal
      const pathId = nextPath.join(',');
      const isNewPath = !gameState.foundPaths.some(p => p.id === pathId);
      
      const newFoundPaths = isNewPath 
        ? [...gameState.foundPaths, { steps: nextPath, id: pathId }] 
        : gameState.foundPaths;

      setGameState(prev => ({
        ...prev,
        currentStep: nextStep,
        currentPath: nextPath,
        foundPaths: newFoundPaths,
        isComplete: newFoundPaths.length === MAX_WAYS
      }));
      setGameStatus(newFoundPaths.length === MAX_WAYS ? GameStatus.WON : GameStatus.SUCCESS);
    } else {
      // Still climbing
      setGameState(prev => ({
        ...prev,
        currentStep: nextStep,
        currentPath: nextPath
      }));
    }
  };

  const resetPerson = () => {
    setGameState(prev => ({
      ...prev,
      currentStep: 0,
      currentPath: []
    }));
    setGameStatus(GameStatus.PLAYING);
  };
  
  const resetGame = () => {
      setGameState({
        currentStep: 0,
        currentPath: [],
        foundPaths: [],
        n: TOTAL_STAIRS,
        isComplete: false
      });
      setGameStatus(GameStatus.PLAYING);
  };

  const progressPercentage = (gameState.foundPaths.length / MAX_WAYS) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">DP</div>
             <h1 className="text-xl font-bold text-slate-800 hidden sm:block">The DP Principle: Climbing Stairs</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-sm font-medium text-slate-600">
               Total Ways Found: <span className="text-indigo-600 font-bold">{gameState.foundPaths.length} / {MAX_WAYS}</span>
             </div>
             <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                 style={{ width: `${progressPercentage}%` }}
               />
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Game & Visualization */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-700">Interactive Simulation</h2>
                <div className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                   Target: Step {gameState.n}
                </div>
              </div>
              
              <div className="flex justify-center">
                 <Staircase 
                   n={gameState.n}
                   currentStep={gameState.currentStep}
                   status={gameStatus}
                   onJump={handleJump}
                   onReset={resetPerson}
                 />
              </div>

              {/* Current Path Display */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[60px] flex items-center justify-between">
                 <div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Current Sequence</span>
                   <div className="flex items-center gap-2">
                      <span className="font-mono text-lg text-slate-700">Start</span>
                      {gameState.currentPath.length > 0 && <span className="text-slate-400">→</span>}
                      {gameState.currentPath.map((step, i) => (
                        <React.Fragment key={i}>
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${step === 1 ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                            {step}
                          </span>
                          {i < gameState.currentPath.length - 1 && <span className="text-slate-400">→</span>}
                        </React.Fragment>
                      ))}
                      {gameStatus === GameStatus.SUCCESS && (
                        <>
                           <span className="text-slate-400">→</span>
                           <span className="text-green-600 font-bold">Goal!</span>
                        </>
                      )}
                   </div>
                 </div>
                 
                 {gameStatus === GameStatus.SUCCESS && (
                   <button 
                     onClick={resetPerson}
                     className="text-sm bg-green-600 text-white px-3 py-1.5 rounded shadow hover:bg-green-700 transition"
                   >
                     Find Another Way
                   </button>
                 )}
              </div>
           </div>

           {/* Derivation Section - Shows up after finding all paths (or finding at least 3 to not block curious users) */}
           {gameState.foundPaths.length >= 3 && (
             <DerivationSection n={gameState.n} />
           )}
        </div>

        {/* Right Column: Found Paths List */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full max-h-[600px] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-semibold text-slate-700">Found Ways Log</h2>
                 <button onClick={resetGame} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Reset All Progress">
                   <RefreshCw size={16} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                 {gameState.foundPaths.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8 border-2 border-dashed border-slate-100 rounded-lg">
                      <p className="mb-2">No paths found yet.</p>
                      <p className="text-sm">Jump 1 or 2 steps to reach the top!</p>
                   </div>
                 ) : (
                   gameState.foundPaths.map((path, idx) => (
                     <div key={path.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between animate-in slide-in-from-left-4 fade-in duration-300">
                        <div className="flex items-center gap-2">
                           <span className="w-6 h-6 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs font-bold">
                             {idx + 1}
                           </span>
                           <div className="text-sm font-mono text-slate-600">
                             {path.steps.map(s => s === 1 ? '1' : '2').join(' + ')}
                           </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {path.steps.length} jumps
                        </div>
                     </div>
                   ))
                 )}
              </div>

              {gameState.isComplete && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center animate-bounce">
                   <Trophy className="mx-auto text-yellow-500 mb-2" size={32} />
                   <h3 className="font-bold text-green-800">All Ways Found!</h3>
                   <p className="text-xs text-green-700 mt-1">You have discovered all {MAX_WAYS} unique combinations.</p>
                </div>
              )}
           </div>
        </div>

      </main>

      <AiTutor 
        n={gameState.n} 
        foundCount={gameState.foundPaths.length} 
        totalCount={MAX_WAYS} 
      />
    </div>
  );
};

export default App;
