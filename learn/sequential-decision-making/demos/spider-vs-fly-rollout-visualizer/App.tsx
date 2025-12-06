import React, { useState, useEffect, useCallback, useRef } from 'react';
import GridBoard from './components/GridBoard';
import StatsPanel from './components/StatsPanel';
import { GameState, Spider, Fly, AlgorithmType, InteractionState, MoveOption, Position, InteractionMode } from './types';
import { GRID_SIZE, SPIDER_COLORS } from './constants';
import {
  getSequentialRolloutMoves,
  getSimultaneousRolloutMoves,
  getGreedyMoves,
  calculateMoveOptions,
  calculateSimultaneousOptions,
  calculateJointCost
} from './services/simulation';
import { Info, Plus, Minus, Move } from 'lucide-react';

// Initial Setup Helper
const createInitialState = (numSpiders: number, numFlies: number): GameState => {
  const spiders: Spider[] = [];
  const flies: Fly[] = [];

  const getUniquePos = (existing: { x: number, y: number }[]) => {
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
    } while (existing.some(p => p.x === x && p.y === y));
    return { x, y };
  };

  const occupied: { x: number, y: number }[] = [];

  for (let i = 0; i < numSpiders; i++) {
    const pos = getUniquePos(occupied);
    occupied.push(pos);
    spiders.push({
      id: i,
      pos,
      color: SPIDER_COLORS[i % SPIDER_COLORS.length]
    });
  }

  for (let i = 0; i < numFlies; i++) {
    const pos = getUniquePos(occupied);
    occupied.push(pos);
    flies.push({
      id: i + 100,
      pos,
      isCaught: false
    });
  }

  return {
    spiders,
    flies,
    stepCount: 0,
    isGameOver: false
  };
};

const App: React.FC = () => {
  // Config
  const [numSpiders, setNumSpiders] = useState(2);
  const [numFlies, setNumFlies] = useState(4);

  // Game & Algorithm State
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(2, 4));
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('SEQUENTIAL');

  // Interactive Rollout State
  const [interactionState, setInteractionState] = useState<InteractionState | null>(null);

  // Auto Playback
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayRef = useRef<number | null>(null);

  // Stop auto play if game over
  useEffect(() => {
    if (gameState.isGameOver) {
      setIsAutoPlaying(false);
      setInteractionState(null);
      if (autoPlayRef.current) window.clearInterval(autoPlayRef.current);
    }
  }, [gameState.isGameOver]);

  // Handle Auto Play Loop
  useEffect(() => {
    if (isAutoPlaying && !gameState.isGameOver) {
      autoPlayRef.current = window.setInterval(() => {
        handleNextStep();
      }, 600);
    } else {
      if (autoPlayRef.current) window.clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) window.clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, gameState.isGameOver, algorithm]);

  // --- AUTOMATED STEP (for Greedy or Fallback) ---
  const handleNextStep = useCallback(() => {
    // If in interactive modes, we don't auto-step the logic unless explicitly requested (e.g. Greedy Auto)
    // But since Sequential/Simultaneous are now both interactive, 'Auto' might just imply 'Run the algorithm automatically'

    setGameState(prev => {
      if (prev.isGameOver) return prev;

      let result;
      if (algorithm === 'SIMULTANEOUS') {
        result = getSimultaneousRolloutMoves(prev);
      } else if (algorithm === 'SEQUENTIAL') {
        result = getSequentialRolloutMoves(prev);
      } else {
        result = getGreedyMoves(prev);
      }

      const newSpiders = prev.spiders.map(s => ({
        ...s,
        pos: result.nextMoves.get(s.id) || s.pos
      }));

      const newFlies = prev.flies.map(f => {
        if (f.isCaught) return f;
        const isCaughtNow = newSpiders.some(s => s.pos.x === f.pos.x && s.pos.y === f.pos.y);
        return isCaughtNow ? { ...f, isCaught: true } : f;
      });

      return {
        spiders: newSpiders,
        flies: newFlies,
        stepCount: prev.stepCount + 1,
        isGameOver: newFlies.every(f => f.isCaught)
      };
    });
  }, [algorithm]);

  // --- INTERACTIVE FLOW START ---
  const startInteractiveTurn = () => {
    if (gameState.isGameOver) return;

    if (algorithm === 'SIMULTANEOUS') {
      // Initialize Drafts with current positions (STAY) or Greedy? 
      // Greedy is a better starting point for the user to optimize from.
      const greedyResult = getGreedyMoves(gameState);
      const initialDrafts = greedyResult.nextMoves;

      // Calculate options for all spiders based on this draft
      const optionsMap = calculateSimultaneousOptions(gameState, initialDrafts);
      const jointCost = calculateJointCost(gameState, initialDrafts);

      setInteractionState({
        mode: 'SIMULTANEOUS',
        draftMoves: initialDrafts,
        simultaneousOptions: optionsMap,
        currentJointCost: jointCost,
        currentOptions: [] // Not used in sim mode the same way
      });

    } else {
      // SEQUENTIAL
      const initialOptions = calculateMoveOptions(0, gameState, new Map());
      setInteractionState({
        mode: 'SEQUENTIAL',
        activeSpiderIndex: 0,
        currentOptions: initialOptions,
        committedMoves: new Map()
      });
    }
  };

  // --- HANDLE USER CHOICE ---
  const handleOptionSelect = (option: MoveOption, spiderId?: number) => {
    if (!interactionState) return;

    if (interactionState.mode === 'SEQUENTIAL') {
      handleSequentialSelect(option);
    } else if (interactionState.mode === 'SIMULTANEOUS' && spiderId !== undefined) {
      handleSimultaneousSelect(option, spiderId);
    }
  };

  const handleSequentialSelect = (option: MoveOption) => {
    if (!interactionState || interactionState.mode !== 'SEQUENTIAL') return;

    const { activeSpiderIndex, committedMoves } = interactionState;
    if (activeSpiderIndex === undefined) return;

    const spiderId = gameState.spiders[activeSpiderIndex].id;

    // Commit the move
    const newCommittedMoves = new Map(committedMoves);
    newCommittedMoves.set(spiderId, option.position);

    const nextSpiderIndex = activeSpiderIndex + 1;

    if (nextSpiderIndex < gameState.spiders.length) {
      // Prepare next spider
      const nextOptions = calculateMoveOptions(nextSpiderIndex, gameState, newCommittedMoves);
      setInteractionState({
        ...interactionState,
        activeSpiderIndex: nextSpiderIndex,
        currentOptions: nextOptions,
        committedMoves: newCommittedMoves
      });
    } else {
      // All spiders decided! Execute Turn.
      executeTurn(newCommittedMoves);
    }
  };

  const handleSimultaneousSelect = (option: MoveOption, spiderId: number) => {
    if (!interactionState || interactionState.mode !== 'SIMULTANEOUS') return;

    // Update draft for the specific spider
    const newDrafts = new Map(interactionState.draftMoves);
    newDrafts.set(spiderId, option.position);

    // Recalculate everything
    const jointCost = calculateJointCost(gameState, newDrafts);
    const optionsMap = calculateSimultaneousOptions(gameState, newDrafts);

    setInteractionState({
      ...interactionState,
      draftMoves: newDrafts,
      simultaneousOptions: optionsMap,
      currentJointCost: jointCost
    });
  };

  const handleSimultaneousCommit = () => {
    if (interactionState?.mode === 'SIMULTANEOUS' && interactionState.draftMoves) {
      executeTurn(interactionState.draftMoves);
    }
  };

  const executeTurn = (finalMoves: Map<number, Position>) => {
    setInteractionState(null); // Clear interaction overlay

    setGameState(prev => {
      const newSpiders = prev.spiders.map(s => ({
        ...s,
        pos: finalMoves.get(s.id) || s.pos
      }));

      const newFlies = prev.flies.map(f => {
        if (f.isCaught) return f;
        const isCaughtNow = newSpiders.some(s => s.pos.x === f.pos.x && s.pos.y === f.pos.y);
        return isCaughtNow ? { ...f, isCaught: true } : f;
      });

      return {
        spiders: newSpiders,
        flies: newFlies,
        stepCount: prev.stepCount + 1,
        isGameOver: newFlies.every(f => f.isCaught)
      };
    });
  };

  // --- UTILS ---
  const handleReset = () => {
    setIsAutoPlaying(false);
    setInteractionState(null);
    setGameState(createInitialState(numSpiders, numFlies));
  };

  const handleUpdateConfig = (spidersDelta: number, fliesDelta: number) => {
    const newS = Math.max(1, Math.min(5, numSpiders + spidersDelta));
    const newF = Math.max(1, Math.min(10, numFlies + fliesDelta));
    setNumSpiders(newS);
    setNumFlies(newF);
    setIsAutoPlaying(false);
    setInteractionState(null);
    setGameState(createInitialState(newS, newF));
  };

  // Switch algorithm reset
  const handleSetAlgorithm = (algo: AlgorithmType) => {
    setAlgorithm(algo);
    setInteractionState(null);
    setIsAutoPlaying(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 flex flex-col items-center font-sans">

      <header className="mb-8 text-center max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight text-slate-800">
          Spiders & Flies
        </h1>
        <p className="text-slate-500 text-sm md:text-base font-medium">
          Interactive visualization of <span className="text-blue-600 font-bold">Multiagent Rollout</span> strategies.
        </p>
      </header>

      <main className="flex flex-row flex-wrap justify-center gap-8 items-start w-full max-w-6xl">

        {/* Left: Board */}
        <div className="flex flex-col items-center gap-6 w-auto">
          <GridBoard
            gameState={gameState}
            interactionState={interactionState}
            onSelectOption={handleOptionSelect}
          />

          {/* Quick Config */}
          <div className="flex gap-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold mb-2 tracking-widest">SPIDERS</span>
              <div className="flex items-center gap-3">
                <button onClick={() => handleUpdateConfig(-1, 0)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><Minus size={14} /></button>
                <span className="w-6 text-center font-bold text-lg">{numSpiders}</span>
                <button onClick={() => handleUpdateConfig(1, 0)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><Plus size={14} /></button>
              </div>
            </div>
            <div className="w-px bg-slate-100"></div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold mb-2 tracking-widest">FLIES</span>
              <div className="flex items-center gap-3">
                <button onClick={() => handleUpdateConfig(0, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><Minus size={14} /></button>
                <span className="w-6 text-center font-bold text-lg">{numFlies}</span>
                <button onClick={() => handleUpdateConfig(0, 1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><Plus size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <StatsPanel
          gameState={gameState}
          algorithm={algorithm}
          setAlgorithm={handleSetAlgorithm}
          onNextStep={handleNextStep}
          onReset={handleReset}
          onToggleAuto={() => setIsAutoPlaying(!isAutoPlaying)}
          isAutoPlaying={isAutoPlaying}
          interactionState={interactionState}
          startInteraction={startInteractiveTurn}
          onCommitSimultaneous={handleSimultaneousCommit}
        />
      </main>

      <footer className="mt-16 max-w-4xl text-slate-400 text-sm border-t border-slate-200 pt-8 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
            <Info size={16} /> Multiagent Rollout (Sequential)
          </h3>
          <p className="leading-relaxed mb-4">
            A cooperative control scheme where agents optimize their moves one by one.
            When Agent 1 optimizes, it assumes all subsequent agents (2, 3...) will act according to a
            <span className="bg-slate-100 px-1 rounded mx-1 text-slate-600 font-mono text-xs">Base Policy</span> (Greedy).
            Once Agent 1 locks in a move, Agent 2 optimizes knowing Agent 1's choice, and so on.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
            <Info size={16} /> Simultaneous Rollout
          </h3>
          <p className="leading-relaxed">
            All agents optimize jointly. The algorithm considers combinations of moves.
            In interactive mode, you can <span className="font-bold text-slate-600">draft moves for all agents</span> simultaneously and see how the total cost changes dynamically before committing.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;