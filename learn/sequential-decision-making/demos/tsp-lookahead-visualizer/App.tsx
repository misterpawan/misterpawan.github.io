import React, { useState, useEffect, useCallback } from 'react';
import { City, LookaheadMode, LookaheadResult } from './types';
import { generateCities, calculateOneStepLookahead, calculateTwoStepLookahead, calculateDistance } from './services/tspUtils';
import MapVisualization from './components/MapVisualization';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [visitedIds, setVisitedIds] = useState<number[]>([]);
  const [mode, setMode] = useState<LookaheadMode>(LookaheadMode.OneStep);
  const [hoveredLookahead, setHoveredLookahead] = useState<LookaheadResult | null>(null);
  
  // Stats
  const [totalCostSoFar, setTotalCostSoFar] = useState(0);

  // Initialize
  useEffect(() => {
    resetSimulation();
  }, []);

  const resetSimulation = useCallback(() => {
    const newCities = generateCities(6, 800, 600); // Reduced to 6 cities as requested
    // Always start at first generated city (City A, ID 0)
    const startCity = newCities[0];
    setCities(newCities);
    setVisitedIds([startCity.id]);
    setTotalCostSoFar(0);
    setHoveredLookahead(null);
  }, []);

  const currentCity = visitedIds.length > 0 
    ? cities.find(c => c.id === visitedIds[visitedIds.length - 1]) || null
    : null;
  
  // The global start city (Sink)
  const startCity = cities.length > 0 ? cities[0] : null;

  const unvisitedCities = cities.filter(c => !visitedIds.includes(c.id));
  const isFinished = unvisitedCities.length === 0;

  // Compute candidates based on current mode
  const lookaheadResults = React.useMemo(() => {
    if (!currentCity || !startCity || isFinished) return [];
    
    if (mode === LookaheadMode.OneStep) {
      return calculateOneStepLookahead(currentCity, unvisitedCities, startCity);
    } else if (mode === LookaheadMode.TwoStep) {
      return calculateTwoStepLookahead(currentCity, unvisitedCities, startCity);
    }
    return [];
  }, [currentCity, unvisitedCities, mode, isFinished, startCity]);

  const handleSelectResult = (result: LookaheadResult) => {
    if (!currentCity) return;

    // Determine new visited list and cost
    let newVisited = [...visitedIds];
    let addedCost = 0;

    newVisited.push(result.nextCity.id);
    addedCost += calculateDistance(currentCity, result.nextCity);

    if (mode === LookaheadMode.TwoStep && result.secondCity) {
      newVisited.push(result.secondCity.id);
      addedCost += calculateDistance(result.nextCity, result.secondCity);
    }

    setVisitedIds(newVisited);
    setTotalCostSoFar(prev => prev + addedCost);
    setHoveredLookahead(null);
  };
  
  // Effect to add final return cost when tour is finished
  useEffect(() => {
      if (isFinished && currentCity && startCity && visitedIds.length === cities.length) {
          // Logic for handling completion if needed
      }
  }, [isFinished, currentCity, startCity, visitedIds, cities.length]);


  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      
      {/* Main Visualization Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">TSP Lookahead Graph</h1>
          <p className="text-slate-500 mt-1">
            Visualizing decision costs from <strong>{currentCity?.name}</strong>. 
            Hover over a candidate to see the greedy path to the Sink (A).
          </p>
        </header>

        <div className="flex-1 flex justify-center items-center min-h-0 bg-white rounded-xl shadow-sm border border-slate-200">
           {isFinished ? (
               <div className="text-center">
                   <h2 className="text-2xl font-bold text-emerald-600 mb-2">Tour Completed!</h2>
                   <p className="text-slate-600">Total Distance: {Math.round(totalCostSoFar + (currentCity && startCity ? calculateDistance(currentCity, startCity) : 0))}</p>
                   <p className="text-sm text-slate-400 mt-2">Returned to Sink (A)</p>
               </div>
           ) : (
            <MapVisualization
                cities={cities}
                visitedIds={visitedIds}
                currentCity={currentCity}
                hoveredLookahead={hoveredLookahead}
                width={800}
                height={600}
            />
           )}
        </div>
      </div>

      {/* Right Sidebar Controls */}
      <ControlPanel
        mode={mode}
        setMode={setMode}
        lookaheadResults={lookaheadResults}
        onHoverResult={setHoveredLookahead}
        onSelectResult={handleSelectResult}
        onReset={resetSimulation}
        totalCostSoFar={totalCostSoFar}
        currentCity={currentCity}
        isFinished={isFinished}
      />

    </div>
  );
};

export default App;