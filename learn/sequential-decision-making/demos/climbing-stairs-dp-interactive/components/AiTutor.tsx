import React, { useState } from 'react';
import { getAiAssistance } from '../services/geminiService';
import { MessageCircle, Sparkles, X } from 'lucide-react';

interface AiTutorProps {
  n: number;
  foundCount: number;
  totalCount: number;
}

const AiTutor: React.FC<AiTutorProps> = ({ n, foundCount, totalCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);
    
    const context = `
      The user is solving the Climbing Stairs problem for N=${n}.
      They have found ${foundCount} distinct ways out of ${totalCount} possible ways.
    `;
    
    const ans = await getAiAssistance(context, query);
    setResponse(ans);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-transform hover:scale-105 flex items-center gap-2 z-50"
      >
        <Sparkles size={20} />
        <span className="font-semibold">Ask AI Tutor</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <h3 className="font-bold">AI DP Tutor</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded">
          <X size={18} />
        </button>
      </div>
      
      <div className="p-4 bg-slate-50 h-64 overflow-y-auto flex flex-col gap-3">
        {response ? (
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm text-slate-800">
            {response}
          </div>
        ) : (
          <div className="text-center text-slate-400 text-sm mt-10">
            Ask me anything about the Climbing Stairs problem or Dynamic Programming!
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Why N-1 and N-2?"
          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Simple ArrowRight icon helper since we used it in input but didn't import locally in this component
const ArrowRight = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default AiTutor;
