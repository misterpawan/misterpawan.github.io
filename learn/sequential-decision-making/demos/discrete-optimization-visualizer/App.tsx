import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSimulation } from './utils/graphGenerator';
import { GraphCanvas } from './components/GraphCanvas';
import { SimulationState } from './types';
import { Play, Pause, RotateCcw, FastForward, Calculator } from 'lucide-react';

const App: React.FC = () => {
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [step, setStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const timerRef = useRef<number | null>(null);

  // Initialize simulation on mount
  useEffect(() => {
    resetSimulation();
  }, []);

  const resetSimulation = () => {
    stopAnimation();
    setSimulation(generateSimulation());
    setStep(-1);
    // Slight delay before auto-starting step 0
    setTimeout(() => setStep(0), 500);
  };

  const stopAnimation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAnimation();
    } else {
      setIsPlaying(true);
    }
  };

  // Animation Loop
  useEffect(() => {
    if (isPlaying && simulation) {
      const maxSteps = (simulation.stages.length * 2) + 1; // 2 steps per stage (edges, move) + final arrival
      
      timerRef.current = window.setInterval(() => {
        setStep((prev) => {
          if (prev >= maxSteps) {
            stopAnimation();
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / speedMultiplier);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, simulation, speedMultiplier]);


  // Calculate Current Cost
  const currentCost = simulation?.stages.reduce((acc, stage, idx) => {
      // Step logic mapping:
      // Stage 0 selection happens at step 2.
      // Stage 1 selection happens at step 4.
      const selectionStep = (idx * 2) + 2;
      if (step >= selectionStep) {
          const edge = stage.outgoingEdges.find(e => e.id === stage.selectedEdgeId);
          return acc + (edge ? edge.cost : 0);
      }
      return acc;
  }, 0) || 0;

  const currentStageIndex = Math.max(0, Math.floor((step - 1) / 2));
  const isFinished = simulation && step >= (simulation.stages.length * 2) + 1;

  if (!simulation) return <div className="bg-slate-50 h-screen w-screen flex items-center justify-center text-slate-900">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <header className="p-6 border-b border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Discrete Optimization Visualizer
            </h1>
            <p className="text-slate-500 text-sm mt-1">Modeling sequential decision making & cost minimization</p>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Cost G(u)</span>
                <div className="text-3xl font-mono font-bold text-green-600 flex items-center gap-2">
                    <Calculator size={20} className="text-slate-400"/>
                    {currentCost}
                </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        
        {/* Graph Container */}
        <div className="w-full max-w-6xl aspect-[16/9] relative">
            <GraphCanvas simulation={simulation} currentStep={step} />
            
            {/* Overlay Status */}
            <div className="absolute top-4 right-4 bg-white/90 border border-slate-200 px-4 py-2 rounded-lg text-sm font-mono shadow-lg backdrop-blur-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {isFinished ? 'OPTIMIZATION COMPLETE' : isPlaying ? 'OPTIMIZING...' : 'PAUSED'}
                </div>
                <div className="mt-1 text-slate-500 text-xs">
                    Step: {step} / {(simulation.stages.length * 2) + 1}
                </div>
            </div>
        </div>

        {/* Controls Bar */}
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={resetSimulation}
                    className="p-3 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors tooltip-trigger"
                    title="Reset Simulation"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={togglePlay}
                    disabled={isFinished}
                    className={`
                        w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95
                        ${isFinished ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'}
                    `}
                >
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1"/>}
                </button>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Speed</span>
                <div className="flex bg-slate-100 rounded-lg p-1">
                    {[1, 2, 4].map((s) => (
                        <button
                            key={s}
                            onClick={() => setSpeedMultiplier(s)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${speedMultiplier === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {s}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </main>

    </div>
  );
};

export default App;