import React, { useState, useMemo } from 'react';
import { INITIAL_SCENARIOS } from './data';
import { ProblemScenario } from './types';
import { calculateGroupStats, formatNumber } from './utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Calculator,
  BrainCircuit,
  Target,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sigma,
  Info
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs z-50">
        <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">Candidate {data.name}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-6 items-center">
            <span className="text-slate-500 font-medium">Reward:</span>
            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{data.reward.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-6 items-center">
            <span className="text-slate-500 font-medium">Group Mean:</span>
            <span className="font-mono text-slate-500">{data.mean?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-6 items-center pt-1 border-t border-slate-100">
            <span className="text-slate-700 font-bold">Advantage:</span>
            <span className={`font-mono font-bold ${data.advantage >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {data.advantage > 0 ? '+' : ''}{data.advantage.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const App: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<number>(1);
  const [scenarios, setScenarios] = useState<ProblemScenario[]>(INITIAL_SCENARIOS);

  const activeScenario = useMemo(() =>
    scenarios.find(s => s.id === activeScenarioId) || scenarios[0],
    [activeScenarioId, scenarios]);

  const stats = useMemo(() =>
    calculateGroupStats(activeScenario.candidates),
    [activeScenario]);

  const handleCandidateToggle = (candidateId: string, field: 'isCorrect' | 'hasFormat') => {
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id !== activeScenarioId) return scenario;
      return {
        ...scenario,
        candidates: scenario.candidates.map(c => {
          if (c.id !== candidateId) return c;
          return { ...c, [field]: !c[field] };
        })
      };
    }));
  };

  const chartData = activeScenario.candidates.map((c, idx) => {
    const adv = stats.advantages[idx];
    return {
      name: c.id,
      reward: stats.rewards[idx],
      advantage: adv,
      mean: stats.mean,
      // Split into positive and negative for better bar styling
      posAdv: adv > 0 ? adv : 0,
      negAdv: adv < 0 ? adv : 0,
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">GRPO Explorer</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Group Relative Policy Optimization</p>
            </div>
            <div className="ml-auto hidden md:block">
              <span className="text-sm bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200">
                DeepSeek R1 / Math Technique
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Intro */}
        <section className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Target size={20} className="text-blue-600" />
                The Core Concept: Relative over Absolute
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                In traditional RL (like PPO), a separate "Critic" model judges an answer. In <strong>GRPO</strong>, we generate a group of answers and compare them <em>against each other</em>.
                Answers better than the group average get a <span className="text-green-600 font-bold">positive advantage</span>.
                Answers worse than average get a <span className="text-red-500 font-bold">negative advantage</span>.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2 font-mono bg-slate-100 p-2 rounded border border-slate-200">
                  <span className="font-bold text-blue-700">Advantage (A)</span>
                  <span>=</span>
                  <span className="flex flex-col items-center justify-center leading-none px-1">
                    <span className="border-b border-slate-400 pb-0.5">Reward - Mean</span>
                    <span className="pt-0.5">StdDev</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-100 text-blue-800">
                  <span className="font-bold">Total Reward</span>
                  <span>=</span>
                  <span>Format (0.5) + Correct (0.5)</span>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 mb-2">Why is this powerful?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <span><strong>No Critic Model:</strong> Saves ~50% memory (no extra neural network needed).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <span><strong>Self-Correction:</strong> The model learns purely by seeing which of its own variations performed best relative to the others.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-2 mb-6 scrollbar-hide">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenarioId(s.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                ${activeScenarioId === s.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}
              `}
            >
              Problem {s.id}: {s.title}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">

          {/* Left Column: Problem & Inputs */}
          <div className="md:col-span-2 space-y-6">

            {/* Question Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator size={100} />
              </div>
              <div className="relative z-0">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Current Problem</h3>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{activeScenario.question}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-slate-500">True Answer:</span>
                  <span className="text-sm font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-200">
                    {activeScenario.trueAnswer}
                  </span>
                </div>
                <p className="text-slate-600 text-sm italic border-l-4 border-blue-400 pl-3">
                  {activeScenario.description}
                </p>
              </div>
            </div>

            {/* Candidates List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">G</div>
                  Generated Group Samples
                </h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  Max Reward: 1.0 (0.5 + 0.5)
                </span>
              </div>

              {activeScenario.candidates.map((candidate, index) => {
                const reward = stats.rewards[index];
                const adv = stats.advantages[index];
                const isPositive = adv > 0;

                return (
                  <div
                    key={candidate.id}
                    className={`
                      relative group rounded-xl border transition-all duration-300 overflow-hidden
                      ${isPositive ? 'bg-white border-green-200 shadow-sm ring-1 ring-green-100' : 'bg-slate-50 border-slate-200 opacity-90'}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Left: Content */}
                      <div className="p-4 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${isPositive ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-600'}
                          `}>
                            {candidate.id}
                          </span>
                          <span className="text-xs font-mono text-slate-400">Sample #{index + 1}</span>
                        </div>
                        <p className="text-slate-800 font-medium mb-3 pl-8 text-sm sm:text-base">
                          {/* Parse <think> tags for simple styling */}
                          {candidate.solutionText.split(/(<think>.*?<\/think>)/g).map((part, i) => {
                            if (part.startsWith('<think>')) {
                              return (
                                <span key={i} className="block mb-1 text-slate-500 text-xs italic border-l-2 border-slate-300 pl-2 py-1 bg-slate-100/50 rounded-r">
                                  {part.replace(/<\/?think>/g, '')}
                                </span>
                              );
                            }
                            return <span key={i}>{part}</span>;
                          })}
                        </p>

                        {/* Controls */}
                        <div className="pl-8 flex flex-wrap gap-x-6 gap-y-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={candidate.hasFormat}
                              onChange={() => handleCandidateToggle(candidate.id, 'hasFormat')}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                            />
                            <span className={`text-xs font-medium ${candidate.hasFormat ? 'text-purple-700' : 'text-slate-500'}`}>
                              Format? (+0.5)
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={candidate.isCorrect}
                              onChange={() => handleCandidateToggle(candidate.id, 'isCorrect')}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className={`text-xs font-medium ${candidate.isCorrect ? 'text-green-700' : 'text-slate-500'}`}>
                              Correct? (+0.5)
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Right: Score Panel */}
                      <div className="bg-slate-100/50 sm:w-32 border-t sm:border-t-0 sm:border-l border-slate-200 p-4 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2">
                        <div className="text-center">
                          <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Reward</div>
                          <div className="text-lg font-mono font-semibold text-slate-700">{reward.toFixed(1)}</div>
                        </div>
                        <ArrowRight className="text-slate-300 hidden sm:block rotate-90 sm:rotate-0" size={16} />
                        <div className="text-center">
                          <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Advantage</div>
                          <div className={`text-xl font-mono font-bold ${adv > 0 ? 'text-green-600' : adv < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {adv > 0 ? '+' : ''}{formatNumber(adv)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Stats & Viz */}
          <div className="md:col-span-1 space-y-6 sticky top-24">

            {/* Stats Card */}
            <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sigma size={14} /> Group Statistics
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="text-xs text-slate-400 mb-1">Mean (μ)</div>
                  <div className="text-2xl font-mono font-bold text-blue-400">{formatNumber(stats.mean)}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="text-xs text-slate-400 mb-1">Std Dev (σ)</div>
                  <div className="text-2xl font-mono font-bold text-purple-400">{formatNumber(stats.stdDev)}</div>
                </div>
              </div>

              <div className="text-xs text-slate-400 border-t border-slate-800 pt-4">
                <p className="mb-2 flex items-center gap-2">
                  <Info size={12} />
                  Calculation:
                </p>
                <code className="block bg-black/30 p-2 rounded text-slate-300 font-mono text-[10px]">
                  Advantage[i] = (Reward[i] - {formatNumber(stats.mean)}) / {formatNumber(stats.stdDev)}
                </code>
              </div>
            </div>

            {/* Visualization */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-[340px]">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <TrendingUp size={16} /> Advantage Distribution
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      fontSize={11}
                      width={40}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      content={<CustomTooltip />}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" />
                    {/* Split bars to handle border radius correctly for positive vs negative values */}
                    <Bar
                      dataKey="posAdv"
                      name="Positive"
                      stackId="a"
                      fill="#16a34a"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                    <Bar
                      dataKey="negAdv"
                      name="Negative"
                      stackId="a"
                      fill="#ef4444"
                      radius={[0, 0, 4, 4]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-400 mt-2">
                Hover over bars to see raw Reward and Mean
              </div>
            </div>

            {/* Context Helper */}
            <div className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl border border-slate-100">
              {stats.stdDev === 0 ? (
                <p className="text-amber-600 font-medium flex gap-2">
                  <Info size={16} className="shrink-0" />
                  <span>Since all rewards are equal, the Standard Deviation is 0. This makes the Advantage 0 for everyone (no relative difference to learn from).</span>
                </p>
              ) : (
                <p>Notice how high positive advantages (green) strongly encourage the model to repeat that behavior, while negative advantages (red) suppress it.</p>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;