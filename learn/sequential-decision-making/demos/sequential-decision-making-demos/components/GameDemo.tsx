import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { Play, RotateCcw, Timer, Gamepad2 } from 'lucide-react';

interface Props {
  onStateChange: (state: GameState) => void;
}

const GameDemo: React.FC<Props> = ({ onStateChange }) => {
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 200;
  const TARGET_DISTANCE = 1000;
  const MAX_TIME = 20; // seconds

  const [gameState, setGameState] = useState<GameState>({
    position: 0,
    velocity: 0,
    timeRemaining: MAX_TIME,
    distance: 0,
    obstacles: [300, 600, 900],
    status: 'idle'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  useEffect(() => {
    onStateChange(gameState);
  }, [gameState.status, gameState.timeRemaining]); // Throttle updates slightly

  const reset = () => {
    setGameState({
      position: 0, // Vertical position (0 is ground)
      velocity: 0, // Vertical velocity
      timeRemaining: MAX_TIME,
      distance: 0,
      obstacles: [300, 600, 900],
      status: 'idle'
    });
  };

  const jump = () => {
    if (gameState.status === 'playing' && gameState.position === 0) {
      // Increased velocity from 12 to 28 for higher jump height
      setGameState(prev => ({ ...prev, velocity: 28 }));
    } else if (gameState.status === 'idle') {
      startGame();
    }
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    setGameState(prev => {
      if (prev.status !== 'playing') return prev;

      // Physics constants
      const GRAVITY = -40;
      const SPEED = 150; // pixels per second horizontal

      let newPos = prev.position + prev.velocity * (deltaTime * 10); // Scale for feel
      let newVel = prev.velocity + GRAVITY * deltaTime;

      // Ground collision
      if (newPos <= 0) {
        newPos = 0;
        newVel = 0;
      }

      const newDistance = prev.distance + SPEED * deltaTime;
      const newTime = prev.timeRemaining - deltaTime;

      // Obstacle collision (simplified boxes)
      const playerBox = { x: 50, w: 20, y: newPos, h: 20 };
      const hitObstacle = prev.obstacles.some(obsX => {
        const relativeX = obsX - newDistance + 50; // Render position relative to player start
        // Check if obstacle is on screen and intersecting
        if (relativeX > 30 && relativeX < 70 && newPos < 30) return true;
        return false;
      });

      let newStatus = prev.status;
      if (hitObstacle) newStatus = 'lost';
      else if (newTime <= 0) newStatus = 'lost';
      else if (newDistance >= TARGET_DISTANCE) newStatus = 'won';

      return {
        ...prev,
        position: newPos,
        velocity: newVel,
        distance: newDistance,
        timeRemaining: newTime,
        status: newStatus
      };
    });

    if (gameState.status === 'playing') {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  // Sync ref with state for animation loop continuity
  useEffect(() => {
    if (gameState.status === 'playing') {
       // Loop handles updates, but we need to cancel on unmount or stop
       requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState.status]);


  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Floor
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Goal Line
    const goalX = (TARGET_DISTANCE - gameState.distance) + 50;
    if (goalX < CANVAS_WIDTH) {
        ctx.fillStyle = '#22c55e'; // Green
        ctx.fillRect(goalX, 0, 10, CANVAS_HEIGHT);
    }

    // Player
    const playerY = CANVAS_HEIGHT - 20 - gameState.position - 20;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(50, playerY, 20, 20);

    // Obstacles
    ctx.fillStyle = '#ef4444';
    gameState.obstacles.forEach(obsX => {
      const drawX = obsX - gameState.distance + 50;
      if (drawX > -50 && drawX < CANVAS_WIDTH + 50) {
        ctx.fillRect(drawX, CANVAS_HEIGHT - 50, 20, 30); // Tall blocks
      }
    });
    
  }, [gameState]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Gamepad2 /> Space Runner
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${gameState.timeRemaining < 5 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
          <Timer size={16} />
          {Math.max(0, gameState.timeRemaining).toFixed(1)}s
        </div>
      </div>

      <div className="relative mb-4 rounded-lg overflow-hidden border border-slate-300">
        <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
            className="w-full h-auto bg-slate-50"
        />
        {gameState.status === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <button onClick={startGame} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2">
                    <Play size={20} fill="currentColor" /> Start Run
                </button>
            </div>
        )}
        {gameState.status !== 'playing' && gameState.status !== 'idle' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <h3 className={`text-2xl font-bold mb-2 ${gameState.status === 'won' ? 'text-green-600' : 'text-red-600'}`}>
                    {gameState.status === 'won' ? 'Course Completed!' : 'Game Over'}
                </h3>
                <button onClick={reset} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-slate-900 transition-all flex items-center gap-2">
                    <RotateCcw size={16} /> Try Again
                </button>
            </div>
        )}
      </div>

      <div className="w-full flex justify-between items-center px-2">
        <p className="text-xs text-slate-500">
            Hold <strong>SPACE</strong> or Click "Jump" to avoid red obstacles. Reaching the end takes time, but obstacles end the run immediately.
        </p>
        <button 
            onMouseDown={jump}
            onTouchStart={jump}
            className="px-8 py-4 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded-lg font-bold text-slate-700 select-none touch-manipulation"
        >
            JUMP
        </button>
      </div>
      
      {/* Keyboard listener */}
      {useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [gameState.status, gameState.position]) as any}
    </div>
  );
};

export default GameDemo;