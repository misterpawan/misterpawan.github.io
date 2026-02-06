
import React from 'react';

interface AnimationControlsProps {
  slope: number;
  setSlope: (slope: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  slopeRange: [number, number];
}

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PauseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const AnimationControls: React.FC<AnimationControlsProps> = ({
  slope,
  setSlope,
  isPlaying,
  setIsPlaying,
  slopeRange,
}) => {
  const step = (slopeRange[1] - slopeRange[0]) / 200;

  return (
    <div className="flex items-center gap-4 h-[42px]">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-2 rounded-full bg-slate-700 hover:bg-cyan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="flex-grow flex items-center gap-2">
        <span className="text-sm font-mono">{slopeRange[0].toFixed(1)}</span>
        <input
          type="range"
          min={slopeRange[0]}
          max={slopeRange[1]}
          step={step}
          value={slope}
          onChange={(e) => {
              setIsPlaying(false);
              setSlope(parseFloat(e.target.value));
            }}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <span className="text-sm font-mono">{slopeRange[1].toFixed(1)}</span>
      </div>
       <span className="font-mono text-cyan-400 w-24 text-center bg-slate-700 p-2 rounded-md">y = {slope.toFixed(2)}</span>
    </div>
  );
};
