import React, { useState, useCallback, useMemo } from 'react';
import { INITIAL_CITIES, ALL_CITIES } from './constants';
import { City } from './types';
import MapCanvas from './components/MapCanvas';
import { calculatePathDistance, solveTSP } from './utils/tsp';
import { getTspHint } from './services/geminiService';
import { Plus, RotateCcw, CheckCircle, MapPin, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [cities, setCities] = useState<City[]>(INITIAL_CITIES);
  const [userPath, setUserPath] = useState<string[]>([]);
  const [optimalPath, setOptimalPath] = useState<string[] | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [hint, setHint] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'completed'>('playing');

  // --- Calculations ---
  
  const availableCities = useMemo(() => {
    return ALL_CITIES.filter(c => !cities.some(existing => existing.id === c.id));
  }, [cities]);

  // User distance: Current path segments + return to start if path is complete
  const userDistance = useMemo(() => {
    return calculatePathDistance(userPath, cities);
  }, [userPath, cities]);

  const bestPossible = useMemo(() => {
    const { distance, path } = solveTSP(cities);
    return { distance, path };
  }, [cities]);

  // --- Handlers ---

  const handleCityClick = useCallback((cityId: string) => {
    if (gameStatus === 'completed') return;

    setUserPath(prev => {
      // If clicking the first city again and we have visited all others, close the loop
      if (prev.length === cities.length && cityId === prev[0]) {
         setGameStatus('completed');
         return prev; // Visual closing is handled in MapCanvas logic by checking status, but here we just lock state
      }

      // If already in path, ignore (unless implementing undo, but keep simple for now)
      if (prev.includes(cityId)) return prev;

      return [...prev, cityId];
    });
  }, [cities.length, gameStatus]);

  const handleReset = () => {
    setUserPath([]);
    setOptimalPath(null);
    setGameStatus('playing');
    setHint(null);
  };

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId) return;

    const cityToAdd = ALL_CITIES.find(c => c.id === selectedCityId);
    if (cityToAdd) {
      setCities(prev => [...prev, cityToAdd]);
      handleReset(); // Reset path when map changes
      setSelectedCityId('');
    }
  };

  const handleShowOptimal = () => {
    setOptimalPath(bestPossible.path);
    setGameStatus('completed');
  };
  
  const handleGetHint = async () => {
      setHint("Thinking...");
      try {
          const names = cities.map(c => c.name);
          const text = await getTspHint(names);
          setHint(text);
      } catch (e) {
          setHint("The oracle is silent (Check API Key).");
      }
  };

  // Score calculation for display
  const scorePercent = gameStatus === 'completed' && userDistance > 0
    ? Math.max(0, 100 - ((userDistance - bestPossible.distance) / bestPossible.distance) * 100).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* HEADER & INFO */}
        <div className="lg:col-span-3 flex flex-col md:flex-row justify-between items-center border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Gemini TSP Voyager
            </h1>
            <p className="text-slate-500 mt-2">
              Connect all cities with the shortest possible route. Return to the start to finish!
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-slate-500 uppercase tracking-wider">Current Distance</div>
              <div className="text-2xl font-mono text-slate-800">{Math.round(userDistance)} km*</div>
            </div>
             {gameStatus === 'completed' && (
                <div className="text-right">
                  <div className="text-sm text-slate-500 uppercase tracking-wider">Optimal Distance</div>
                  <div className="text-2xl font-mono text-emerald-600">{Math.round(bestPossible.distance)} km*</div>
                </div>
             )}
          </div>
        </div>

        {/* MAIN GAME AREA */}
        <div className="lg:col-span-2 space-y-4">
          <MapCanvas 
            cities={cities} 
            userPath={userPath} 
            optimalPath={optimalPath}
            onCityClick={handleCityClick} 
          />
          
          {/* Action Bar */}
          <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
             <div className="flex gap-2">
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-300"
                >
                  <RotateCcw size={18} /> Reset Path
                </button>
                <button 
                  onClick={handleShowOptimal}
                  disabled={userPath.length < 2}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200"
                >
                  <BrainCircuit size={18} /> Reveal Solution
                </button>
                 <button 
                  onClick={handleGetHint}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors"
                >
                  Ask AI for Hint
                </button>
             </div>
             
             <div className="text-slate-500 text-sm">
               {userPath.length} / {cities.length} Cities visited
             </div>
          </div>
          
          {hint && (
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg text-purple-800 italic animate-pulse shadow-sm">
                  🤖 Gemini says: "{hint}"
              </div>
          )}
        </div>

        {/* SIDEBAR: CONTROLS & LIST */}
        <div className="space-y-6">
          
          {/* Status Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
               <CheckCircle size={20} className={gameStatus === 'completed' ? "text-emerald-500" : "text-slate-400"} />
               Mission Status
             </h2>
             
             {gameStatus === 'completed' ? (
               <div className="text-center py-4">
                 <div className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-600">
                   {scorePercent}%
                 </div>
                 <p className="text-slate-500">Efficiency Rating</p>
                 {Number(scorePercent) === 100 && <p className="text-emerald-600 mt-2 font-bold">PERFECT ROUTE!</p>}
               </div>
             ) : (
               <div className="text-slate-500 text-sm leading-relaxed">
                  Select your starting city, then visit every other city exactly once before returning to the start.
                  <br/><br/>
                  <span className="text-slate-800 font-medium">Next Step:</span> {userPath.length === 0 ? "Choose a starting point" : (userPath.length === cities.length ? "Click start node to finish!" : "Visit next city")}
               </div>
             )}
          </div>

          {/* Add City Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
              <MapPin size={20} className="text-blue-500" />
              Expand Map
            </h2>
            <form onSubmit={handleAddCity} className="flex gap-2">
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                disabled={availableCities.length === 0}
              >
                <option value="" disabled>
                  {availableCities.length === 0 ? "All cities added" : "Select a city..."}
                </option>
                {availableCities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.emoji} {city.name}
                  </option>
                ))}
              </select>
              <button 
                type="submit"
                disabled={!selectedCityId}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Plus size={20} />
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-2">
              Add more destinations to increase the difficulty.
            </p>
          </div>

          {/* City List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden flex flex-col max-h-[400px]">
             <div className="p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
               <h3 className="font-semibold text-slate-700">Destinations ({cities.length})</h3>
             </div>
             <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {cities.map(city => (
                  <div 
                    key={city.id} 
                    className={`group p-3 rounded-lg flex items-center gap-3 transition-colors ${userPath.includes(city.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <span className="text-2xl" role="img" aria-label={city.name}>{city.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 truncate">{city.name}</div>
                      <div className="text-xs text-slate-500 truncate group-hover:text-slate-700 transition-colors">
                        {city.description}
                      </div>
                    </div>
                    {userPath.includes(city.id) && (
                      <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        #{userPath.indexOf(city.id) + 1}
                      </span>
                    )}
                  </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;