import React, { useState } from 'react';
import { DemoType } from './types';
import RobotDemo from './components/RobotDemo';
import PortfolioDemo from './components/PortfolioDemo';
import GameDemo from './components/GameDemo';
import AITutor from './components/AITutor';
import Quiz from './components/Quiz';
import { Bot, LineChart, Gamepad2, Info } from 'lucide-react';

export default function App() {
  const [activeDemo, setActiveDemo] = useState<DemoType>(DemoType.ROBOT);
  const [gameState, setGameState] = useState<any>(null);

  // Helper to update state from children, used for AI context
  const handleStateChange = (newState: any) => {
    // Only update if significantly changed to avoid re-renders loop if we were doing deep compares
    // For now, simple set is fine as children throttle their own callbacks
    setGameState(newState);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Sequential Decision Labs
          </h1>
          <a 
            href="https://misterpawan.github.io/learn/sequential-decision-making/sequential-decision-problems.html" 
            target="_blank" 
            rel="noreferrer"
            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <Info size={16} /> Back to Course
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* API Key Warning (Hidden if env var exists, usually handled by server/build time) */}
        {!process.env.API_KEY && (
             <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
                <strong>Note:</strong> Gemini API Key not found. The AI Tutor feature will be disabled. 
                Deploy with <code>REACT_APP_API_KEY</code> or similar to enable.
             </div>
        )}

        <div className="mb-8 text-center max-w-2xl mx-auto">
          <p className="text-slate-600 text-lg">
            Explore <strong>Finite Horizon</strong> problems. In these scenarios, you have a limited amount of time or steps to achieve a goal. 
            How does the looming deadline change your strategy?
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-2 md:gap-4 flex-wrap">
          <button
            onClick={() => setActiveDemo(DemoType.ROBOT)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              activeDemo === DemoType.ROBOT
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Bot size={20} /> Robot Nav
          </button>
          <button
            onClick={() => setActiveDemo(DemoType.GAME)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              activeDemo === DemoType.GAME
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Gamepad2 size={20} /> Video Game
          </button>
          <button
            onClick={() => setActiveDemo(DemoType.PORTFOLIO)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              activeDemo === DemoType.PORTFOLIO
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <LineChart size={20} /> Portfolio
          </button>
        </div>

        {/* Active Component Area */}
        <div className="animate-in fade-in zoom-in-95 duration-300">
          {activeDemo === DemoType.ROBOT && <RobotDemo onStateChange={handleStateChange} />}
          {activeDemo === DemoType.GAME && <GameDemo onStateChange={handleStateChange} />}
          {activeDemo === DemoType.PORTFOLIO && <PortfolioDemo onStateChange={handleStateChange} />}
        </div>
        
        {/* Interactive Quiz Section */}
        <Quiz activeDemo={activeDemo} />

      </main>

      {/* AI Tutor Integration */}
      <AITutor activeDemo={activeDemo} gameState={gameState} />
    </div>
  );
}