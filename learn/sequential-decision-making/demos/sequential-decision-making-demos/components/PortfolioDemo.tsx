import React, { useState, useEffect } from 'react';
import { PortfolioState } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';

interface Props {
  onStateChange: (state: PortfolioState) => void;
}

const PortfolioDemo: React.FC<Props> = ({ onStateChange }) => {
  const MAX_YEARS = 10;
  const TARGET = 100000;
  const START = 50000;

  const [state, setState] = useState<PortfolioState>({
    year: 0,
    maxYears: MAX_YEARS,
    currentWealth: START,
    targetWealth: TARGET,
    history: [{ year: 0, wealth: START, allocation: 0 }],
    status: 'playing'
  });

  const [allocation, setAllocation] = useState(50); // % in Stocks

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  const simulateYear = () => {
    if (state.status !== 'playing') return;

    const safeRate = 0.02; // 2% guaranteed
    const riskyRateMean = 0.08; // 8% avg
    const riskyRateStd = 0.20; // 20% vol

    // Simple geometric brownian motion approx for one year step
    const stockReturn = riskyRateMean + riskyRateStd * (Math.random() + Math.random() + Math.random() - 1.5); // approx normal dist
    
    const stockFraction = allocation / 100;
    const bondFraction = 1 - stockFraction;

    const blendedReturn = (stockFraction * stockReturn) + (bondFraction * safeRate);
    const newWealth = state.currentWealth * (1 + blendedReturn);
    const nextYear = state.year + 1;

    let newStatus: PortfolioState['status'] = 'playing';
    if (nextYear >= state.maxYears) {
      newStatus = newWealth >= state.targetWealth ? 'won' : 'lost';
    }

    setState(prev => ({
      ...prev,
      year: nextYear,
      currentWealth: newWealth,
      history: [...prev.history, { year: nextYear, wealth: newWealth, allocation: allocation }],
      status: newStatus
    }));
  };

  const reset = () => {
    setState({
      year: 0,
      maxYears: MAX_YEARS,
      currentWealth: START,
      targetWealth: TARGET,
      history: [{ year: 0, wealth: START, allocation: 0 }],
      status: 'playing'
    });
    setAllocation(50);
  };

  const formatCurrency = (val: number) => `$${Math.round(val / 1000)}k`;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Portfolio Management
          </h2>
          <p className="text-sm text-slate-500">Goal: Reach $100k in 10 years.</p>
        </div>
       
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-slate-900">
            {formatCurrency(state.currentWealth)}
          </div>
          <div className="text-xs text-slate-500">Current Wealth</div>
        </div>
      </div>

      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={state.history}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" domain={[0, MAX_YEARS]} type="number" label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} />
            <YAxis domain={[START * 0.5, TARGET * 1.5]} tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <ReferenceLine y={TARGET} label="Goal" stroke="green" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="wealth" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-slate-700">Stock Allocation (Risk)</span>
          <span className="font-bold text-blue-600">{allocation}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={allocation} 
          onChange={(e) => setAllocation(Number(e.target.value))}
          disabled={state.status !== 'playing'}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-4"
        />
        
        <div className="flex justify-between items-center">
             <div className="text-sm text-slate-600">
                Year: <span className="font-mono font-bold">{state.year}</span> / {state.maxYears}
            </div>
            {state.status === 'playing' ? (
                <button 
                onClick={simulateYear}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-all active:scale-95"
                >
                Simulate Next Year
                </button>
            ) : (
                <button 
                onClick={reset}
                className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-sm transition-all"
                >
                <RefreshCw size={16} /> Reset
                </button>
            )}
        </div>
      </div>

      {state.status === 'lost' && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
            <AlertTriangle size={20} />
            <span>You failed to reach the target wealth by year 10.</span>
        </div>
      )}
       {state.status === 'won' && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-3">
            <TrendingUp size={20} />
            <span>Success! You reached the target wealth.</span>
        </div>
      )}
    </div>
  );
};

export default PortfolioDemo;
