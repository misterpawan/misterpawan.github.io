import React, { useState, useEffect, useCallback } from 'react';
import { GridState } from '../types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Flag, RotateCcw, Battery } from 'lucide-react';

interface Props {
  onStateChange: (state: GridState) => void;
}

const INITIAL_STEPS = 12;
const GRID_SIZE = 6;

const RobotDemo: React.FC<Props> = ({ onStateChange }) => {
  const [state, setState] = useState<GridState>({
    robot: { x: 0, y: 0 },
    goal: { x: 5, y: 5 },
    obstacles: [
      { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
      { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 4 }
    ],
    gridSize: GRID_SIZE,
    stepsTaken: 0,
    maxSteps: INITIAL_STEPS,
    status: 'playing'
  });

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  const move = useCallback((dx: number, dy: number) => {
    if (state.status !== 'playing') return;

    setState(prev => {
      const newX = prev.robot.x + dx;
      const newY = prev.robot.y + dy;

      // Boundary check
      if (newX < 0 || newX >= prev.gridSize || newY < 0 || newY >= prev.gridSize) {
        return prev;
      }

      // Obstacle check
      if (prev.obstacles.some(obs => obs.x === newX && obs.y === newY)) {
        return prev;
      }

      const newSteps = prev.stepsTaken + 1;
      let newStatus = prev.status;

      if (newX === prev.goal.x && newY === prev.goal.y) {
        newStatus = 'won';
      } else if (newSteps >= prev.maxSteps) {
        newStatus = 'lost';
      }

      return {
        ...prev,
        robot: { x: newX, y: newY },
        stepsTaken: newSteps,
        status: newStatus
      };
    });
  }, [state.status]);

  const reset = () => {
    setState({
      robot: { x: 0, y: 0 },
      goal: { x: 5, y: 5 },
      obstacles: [
        { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
        { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 4 }
      ],
      gridSize: GRID_SIZE,
      stepsTaken: 0,
      maxSteps: INITIAL_STEPS,
      status: 'playing'
    });
  };

  const stepsRemaining = state.maxSteps - state.stepsTaken;

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>🤖</span> Robot Navigation
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${stepsRemaining <= 3 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          <Battery size={16} />
          {stepsRemaining} Steps Left
        </div>
      </div>

      <div className="relative bg-slate-100 p-1 rounded-lg mb-6" style={{ width: 'fit-content' }}>
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isRobot = x === state.robot.x && y === state.robot.y;
            const isGoal = x === state.goal.x && y === state.goal.y;
            const isObstacle = state.obstacles.some(obs => obs.x === x && obs.y === y);

            return (
              <div 
                key={i} 
                className={`w-12 h-12 flex items-center justify-center rounded-md text-xl transition-all duration-200
                  ${isRobot ? 'bg-blue-500 shadow-lg scale-110 z-10' : ''}
                  ${isGoal ? 'bg-green-100 border-2 border-green-500' : ''}
                  ${isObstacle ? 'bg-slate-700' : 'bg-white'}
                `}
              >
                {isRobot && <span className="text-white">🤖</span>}
                {isGoal && !isRobot && <Flag className="text-green-600" size={20} />}
                {isObstacle && <span className="text-slate-500">🧱</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div />
        <button onClick={() => move(0, -1)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all"><ArrowUp /></button>
        <div />
        <button onClick={() => move(-1, 0)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all"><ArrowLeft /></button>
        <button onClick={() => move(0, 1)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all"><ArrowDown /></button>
        <button onClick={() => move(1, 0)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all"><ArrowRight /></button>
      </div>

      {state.status !== 'playing' && (
        <div className={`w-full p-4 rounded-lg mb-4 text-center ${state.status === 'won' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-bold text-lg mb-2">{state.status === 'won' ? 'Goal Reached!' : 'Out of Battery!'}</p>
          <button 
            onClick={reset}
            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow transition-all font-medium text-sm"
          >
            <RotateCcw size={16} /> Try Again
          </button>
        </div>
      )}
      
      <p className="text-xs text-slate-500 text-center max-w-xs">
        Finite Horizon Problem: You must reach the goal state (Green Flag) within a fixed number of steps (battery). Every move consumes 1 unit of resource.
      </p>
    </div>
  );
};

export default RobotDemo;
