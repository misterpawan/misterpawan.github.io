import React from 'react';
import { LookaheadResult, LookaheadMode, City } from '../types';
import { ArrowRight, RotateCcw, Play, Footprints } from 'lucide-react';

interface ControlPanelProps {
  mode: LookaheadMode;
  setMode: (mode: LookaheadMode) => void;
  lookaheadResults: LookaheadResult[];
  onHoverResult: (result: LookaheadResult | null) => void;
  onSelectResult: (result: LookaheadResult) => void;
  onReset: () => void;
  totalCostSoFar: number;
  currentCity: City | null;
  isFinished: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  setMode,
  lookaheadResults,
  onHoverResult,
  onSelectResult,
  onReset,
  totalCostSoFar,
  currentCity,
  isFinished,
}) => {
  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-96 shadow-xl z-10">
      
      {/* Header / Stats */}
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Travel Planning</h2>
        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
          <span>Current Location:</span>
          <span className="font-mono font-bold text-indigo-600">
            {currentCity ? currentCity.name : 'Start'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Total Cost Incurred:</span>
          <span className="font-mono font-bold text-slate-900">{Math.round(totalCostSoFar)}</span>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="p-4 border-b border-slate-100 grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode(LookaheadMode.OneStep)}
          disabled={isFinished}
          className={`flex items-center justify-center gap-2 p-2 rounded-md text-sm font-medium transition-colors ${
            mode === LookaheadMode.OneStep
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-50'
          }`}
        >
          <ArrowRight size={16} />
          1-Step Lookahead
        </button>
        <button
          onClick={() => setMode(LookaheadMode.TwoStep)}
          disabled={isFinished}
          className={`flex items-center justify-center gap-2 p-2 rounded-md text-sm font-medium transition-colors ${
            mode === LookaheadMode.TwoStep
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-50'
          }`}
        >
          <Footprints size={16} />
          2-Step Lookahead
        </button>
      </div>

      {/* Lookahead List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isFinished ? (
          <div className="text-center py-10 text-slate-500">
            <p className="mb-2">🎉 Tour Completed!</p>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors font-medium text-sm"
            >
              <RotateCcw size={16} /> Restart
            </button>
          </div>
        ) : lookaheadResults.length === 0 ? (
           <div className="text-center py-10 text-slate-400 text-sm">
            Select a mode to analyze possible next moves.
           </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                <span>Next Move</span>
                <span>Total Est. Cost</span>
            </div>
            {lookaheadResults.map((result, idx) => {
               const isBest = idx === 0;
               return (
                <div
                    key={idx}
                    className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isBest
                        ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                    onMouseEnter={() => onHoverResult(result)}
                    onMouseLeave={() => onHoverResult(null)}
                    onClick={() => onSelectResult(result)}
                >
                    {isBest && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            BEST
                        </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isBest ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                {result.nextCity.name}
                            </div>
                            {result.secondCity && (
                                <>
                                    <ArrowRight size={12} className="text-slate-400" />
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isBest ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                        {result.secondCity.name}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-slate-800">
                                {Math.round(result.totalCost)}
                            </div>
                        </div>
                    </div>
                    
                    {/* Cost Breakdown */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1 pt-2 border-t border-slate-100/50">
                        <span>Immediate: <span className="font-medium">{Math.round(result.stepCost)}</span></span>
                        <span>+</span>
                        <span>Rest (Greedy): <span className="font-medium">{Math.round(result.greedyRestCost)}</span></span>
                    </div>

                    {/* Highlight Effect Bar */}
                    <div className={`absolute bottom-0 left-0 h-1 rounded-b-lg transition-all duration-300 ${isBest ? 'bg-emerald-400 w-full' : 'bg-indigo-400 w-0 group-hover:w-full'}`}></div>
                </div>
               )
            })}
          </>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 p-2 text-slate-500 hover:text-slate-800 transition-colors text-sm"
        >
            <RotateCcw size={14} /> Reset Simulation
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
