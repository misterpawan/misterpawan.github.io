import React from 'react';
import { GameStatus } from '../types';
import { User } from 'lucide-react';

interface StaircaseProps {
  n: number;
  currentStep: number;
  status: GameStatus;
  onJump: (steps: 1 | 2) => void;
  onReset: () => void;
}

const Staircase: React.FC<StaircaseProps> = ({ n, currentStep, status, onJump, onReset }) => {
  // Calculate staircase dimensions
  // We'll use a grid or relative positioning.
  // Let's use a flexible container where each step has a set height/width.
  
  const stepHeight = 40;
  const stepWidth = 60;
  
  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-slate-200 min-h-[400px]">
      <div 
        className="relative"
        style={{ 
          height: `${(n + 1) * stepHeight + 100}px`, 
          width: `${(n + 1) * stepWidth + 100}px` 
        }}
      >
        {/* Stairs */}
        {Array.from({ length: n + 1 }).map((_, index) => (
          <div
            key={index}
            className={`absolute border-t border-l border-slate-300 transition-colors duration-300
              ${index === 0 ? 'bg-slate-100' : 'bg-slate-200'}
              ${index === n ? 'bg-green-100 border-green-300' : ''}
            `}
            style={{
              bottom: `${index * stepHeight}px`,
              left: `${index * stepWidth}px`,
              width: `${stepWidth}px`,
              height: `${stepHeight}px`,
            }}
          >
            <span className="absolute -left-6 top-2 text-xs text-slate-400 font-mono">{index}</span>
            {index === n && (
              <span className="absolute -top-6 left-2 text-xs font-bold text-green-600 uppercase">Goal</span>
            )}
          </div>
        ))}

        {/* Player */}
        <div
          className={`absolute transition-all duration-500 ease-out z-10 flex items-center justify-center`}
          style={{
            bottom: `${currentStep * stepHeight + stepHeight}px`,
            left: `${currentStep * stepWidth + (stepWidth / 2) - 16}px`, // Centered on step
            width: '32px',
            height: '32px',
          }}
        >
           <div className={`p-2 rounded-full shadow-md transition-colors ${
             status === GameStatus.OVERSHOT ? 'bg-red-500 text-white' : 
             status === GameStatus.SUCCESS ? 'bg-green-500 text-white' : 
             'bg-indigo-600 text-white'
           }`}>
             <User size={16} />
           </div>
        </div>
        
        {/* Helper Lines for last jump visual (optional, but cool) */}
        
      </div>

      {/* In-Game Controls */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => onJump(1)}
          disabled={status !== GameStatus.PLAYING}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 font-medium"
        >
          +1 Step
        </button>
        <button
          onClick={() => onJump(2)}
          disabled={status !== GameStatus.PLAYING}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 font-medium"
        >
          +2 Steps
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all active:scale-95 font-medium"
        >
          Reset Person
        </button>
      </div>

      {status === GameStatus.OVERSHOT && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-xl animate-bounce border border-red-200">
          Too high! Try again.
        </div>
      )}
    </div>
  );
};

export default Staircase;
