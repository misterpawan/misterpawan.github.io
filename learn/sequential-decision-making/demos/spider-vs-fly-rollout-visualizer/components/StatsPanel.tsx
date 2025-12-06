import React from 'react';
import { AlgorithmType, GameState, InteractionState, Spider } from '../types';
import { Play, Pause, RotateCcw, SkipForward, Users, Zap, BrainCircuit, Hand, CheckCircle2, ArrowRight } from 'lucide-react';

interface StatsPanelProps {
  gameState: GameState;
  algorithm: AlgorithmType;
  setAlgorithm: (algo: AlgorithmType) => void;
  onNextStep: () => void;
  onReset: () => void;
  onToggleAuto: () => void;
  isAutoPlaying: boolean;
  interactionState: InteractionState | null;
  startInteraction: () => void;
  onCommitSimultaneous?: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  gameState,
  algorithm,
  setAlgorithm,
  onNextStep,
  onReset,
  onToggleAuto,
  isAutoPlaying,
  interactionState,
  startInteraction,
  onCommitSimultaneous
}) => {
  const activeFlies = gameState.flies.filter(f => !f.isCaught).length;
  
  const getComplexityText = () => {
    const m = gameState.spiders.length;
    if (algorithm === 'SEQUENTIAL') {
      return `Linear: ~4 × ${m} = ${4 * m} ops`;
    } else if (algorithm === 'SIMULTANEOUS') {
      return `Exponential: 4^${m} = ${Math.pow(4, m).toLocaleString()} ops`;
    }
    return 'Fast: 1 op per agent';
  };

  const isInteractive = algorithm === 'SEQUENTIAL' || algorithm === 'SIMULTANEOUS';

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      
      {/* Control Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-500" />
            Agent Control
          </h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            gameState.isGameOver ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
          }`}>
            {gameState.isGameOver ? 'COMPLETE' : 'RUNNING'}
          </span>
        </div>

        {/* Algorithm Selection */}
        <div className="mb-6 space-y-3">
          <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Select Policy</label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setAlgorithm('SEQUENTIAL')}
              className={`p-3 rounded-lg text-left transition-all border-2 relative ${
                algorithm === 'SEQUENTIAL' 
                  ? 'bg-blue-50 border-blue-500 text-blue-900' 
                  : 'bg-white border-slate-100 hover:border-blue-200 text-slate-500'
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                <BrainCircuit size={18} className={algorithm==='SEQUENTIAL'?'text-blue-600':''} /> 
                Multiagent Rollout
                {algorithm === 'SEQUENTIAL' && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full ml-auto">Interactive</span>}
              </div>
              <div className="text-xs opacity-70 mt-1 pl-6">
                Optimize one agent at a time sequentially.
              </div>
            </button>

            <button
              onClick={() => setAlgorithm('SIMULTANEOUS')}
              className={`p-3 rounded-lg text-left transition-all border-2 ${
                algorithm === 'SIMULTANEOUS' 
                  ? 'bg-purple-50 border-purple-500 text-purple-900' 
                  : 'bg-white border-slate-100 hover:border-purple-200 text-slate-500'
              }`}
              disabled={gameState.spiders.length > 5}
            >
              <div className="font-bold flex items-center gap-2">
                <Zap size={18} className={algorithm==='SIMULTANEOUS'?'text-purple-600':''} /> 
                Simultaneous Rollout
                {algorithm === 'SIMULTANEOUS' && <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full ml-auto">Interactive</span>}
              </div>
              <div className="text-xs opacity-70 mt-1 pl-6">
                 Evaluate joint moves. Draft moves for all agents to see total cost.
              </div>
            </button>
            
             <button
              onClick={() => setAlgorithm('GREEDY')}
              className={`p-2 rounded-lg text-left transition-all border-2 ${
                algorithm === 'GREEDY' 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                  : 'bg-white border-slate-100 hover:border-emerald-200 text-slate-500'
              }`}
            >
              <div className="font-bold text-sm pl-6">Base Policy (Pure Greedy)</div>
            </button>
          </div>
        </div>

        {/* Interaction / Comparison Zone */}
        {interactionState ? (
             <div className={`border rounded-lg p-4 mb-6 animate-pulse-slow ${interactionState.mode === 'SEQUENTIAL' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{color: interactionState.mode === 'SEQUENTIAL' ? '#1e40af' : '#6b21a8'}}>
                    <Hand size={16}/> {interactionState.mode === 'SEQUENTIAL' ? 'Sequential Decision' : 'Joint Decision Draft'}
                </h3>
                
                {interactionState.mode === 'SEQUENTIAL' && interactionState.activeSpiderIndex !== undefined && (
                    <>
                        <p className="text-xs text-slate-700 mb-2">
                            Agent <span className="font-bold text-lg mx-1" style={{color: gameState.spiders[interactionState.activeSpiderIndex].color}}>#{interactionState.activeSpiderIndex + 1}</span> is deciding.
                        </p>
                        <p className="text-xs text-slate-600">
                            Select the best move. Lower numbers = better estimated cost.
                        </p>
                    </>
                )}

                {interactionState.mode === 'SIMULTANEOUS' && (
                    <>
                         <p className="text-xs text-slate-700 mb-3">
                            Click adjacent squares to change moves for any agent.
                        </p>
                        <div className="flex items-center justify-between bg-white/50 p-2 rounded">
                            <span className="text-xs font-bold text-slate-500">Total Joint Cost:</span>
                            <span className="text-xl font-black text-purple-600">{interactionState.currentJointCost}</span>
                        </div>
                    </>
                )}
             </div>
        ) : (
            <div className="bg-slate-50 rounded-lg p-3 mb-6 text-xs font-mono border border-slate-100 text-slate-600">
                <div className="flex justify-between mb-1">
                    <span>Search Space:</span>
                    <span className="font-bold">{getComplexityText()}</span>
                </div>
            </div>
        )}

        {/* Playback Controls */}
        <div className="grid grid-cols-4 gap-2">
          {isInteractive ? (
              // Interactive Controls
              <>
                 {!interactionState ? (
                    <button
                        onClick={startInteraction}
                        disabled={gameState.isGameOver || isAutoPlaying}
                        className={`col-span-3 hover:opacity-90 disabled:opacity-50 disabled:bg-slate-300 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all ${algorithm === 'SEQUENTIAL' ? 'bg-blue-600' : 'bg-purple-600'}`}
                    >
                        Start Decision Phase
                    </button>
                 ) : (
                    // In Interaction
                     interactionState.mode === 'SIMULTANEOUS' ? (
                        <button
                            onClick={onCommitSimultaneous}
                            className="col-span-3 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                        >
                            Execute Joint Move <ArrowRight size={16}/>
                        </button>
                     ) : (
                        <div className="col-span-3 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center text-xs font-bold">
                            Select move on grid...
                        </div>
                     )
                 )}
                  
                  <button
                    onClick={onReset}
                    className="bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-500 p-3 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <RotateCcw size={20} />
                  </button>
              </>
          ) : (
              // Auto Controls (Greedy)
              <>
                <button
                    onClick={onToggleAuto}
                    className={`col-span-2 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                    isAutoPlaying 
                        ? 'bg-red-50 text-red-600 border-2 border-red-200' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                    }`}
                    disabled={gameState.isGameOver}
                >
                    {isAutoPlaying ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Auto Play</>}
                </button>

                <button
                    onClick={onNextStep}
                    className="col-span-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold flex items-center justify-center disabled:opacity-50"
                    disabled={isAutoPlaying || gameState.isGameOver}
                >
                    <SkipForward size={20} />
                </button>

                <button
                    onClick={onReset}
                    className="col-span-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center"
                >
                    <RotateCcw size={20} />
                </button>
              </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Total Steps</span>
            <span className="text-3xl font-black text-slate-800">{gameState.stepCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Flies Left</span>
            <span className={`text-3xl font-black ${activeFlies === 0 ? 'text-green-500' : 'text-amber-500'}`}>
                {activeFlies}
            </span>
        </div>
      </div>

    </div>
  );
};

export default StatsPanel;