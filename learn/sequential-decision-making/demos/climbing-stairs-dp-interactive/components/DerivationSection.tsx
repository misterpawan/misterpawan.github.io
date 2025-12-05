import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface DerivationSectionProps {
  n: number;
}

const DerivationSection: React.FC<DerivationSectionProps> = ({ n }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    lastStep: '',
    disjoint: '',
    formula: ''
  });

  const handleOption = (key: keyof typeof answers, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-yellow-100 p-2 rounded-lg">
          <ArrowRight className="text-yellow-700" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Solve the Principle</h2>
          <p className="text-sm text-slate-500">Let's turn this game into mathematics.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Last Move Analysis */}
        <div className={`transition-opacity duration-500 ${step >= 0 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <h3 className="font-semibold text-indigo-900 mb-2">1. Analyze the Last Move</h3>
          <p className="text-slate-600 mb-3 text-sm">
            To reach step <strong>N</strong>, where must the person have been immediately before?
          </p>
          <div className="flex gap-2">
             {['Only N-1', 'Only N-2', 'Either N-1 or N-2'].map((opt) => (
               <button
                 key={opt}
                 onClick={() => {
                   handleOption('lastStep', opt);
                   if (opt === 'Either N-1 or N-2') setStep(Math.max(step, 1));
                 }}
                 className={`px-3 py-2 text-sm rounded border ${
                   answers.lastStep === opt 
                     ? (opt === 'Either N-1 or N-2' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-300 text-red-800')
                     : 'bg-white border-slate-300 hover:bg-slate-50'
                 }`}
               >
                 {opt}
               </button>
             ))}
          </div>
          {answers.lastStep === 'Either N-1 or N-2' && (
            <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 size={12}/> Correct! You can jump 1 step from (N-1) or 2 steps from (N-2).
            </p>
          )}
        </div>

        {/* Step 2: Disjoint Sets */}
        {step >= 1 && (
          <div className="border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="font-semibold text-indigo-900 mb-2">2. Counting the Ways</h3>
            <p className="text-slate-600 mb-3 text-sm">
              If we know all ways to reach <strong>N-1</strong>, and all ways to reach <strong>N-2</strong>, can we just add them up? Are there any duplicate paths?
            </p>
            <div className="flex gap-2">
               <button
                 onClick={() => { handleOption('disjoint', 'Overlap'); }}
                 className={`px-3 py-2 text-sm rounded border ${answers.disjoint === 'Overlap' ? 'bg-red-100 border-red-300 text-red-800' : 'bg-white border-slate-300'}`}
               >
                 They might overlap
               </button>
               <button
                 onClick={() => { 
                   handleOption('disjoint', 'No Overlap'); 
                   setStep(Math.max(step, 2));
                 }}
                 className={`px-3 py-2 text-sm rounded border ${answers.disjoint === 'No Overlap' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-slate-300'}`}
               >
                 No, they are distinct sets
               </button>
            </div>
            {answers.disjoint === 'No Overlap' && (
              <p className="mt-2 text-xs text-green-600">
                <CheckCircle2 size={12} className="inline mr-1"/> 
                Correct! A path ending with a 1-jump is fundamentally different from a path ending with a 2-jump.
              </p>
            )}
          </div>
        )}

        {/* Step 3: The Formula */}
        {step >= 2 && (
          <div className="border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="font-semibold text-indigo-900 mb-2">3. The Recurrence Relation</h3>
            <p className="text-slate-600 mb-3 text-sm">
              Based on the above, which formula represents the total ways to reach step N?
            </p>
            <div className="flex flex-col gap-2">
               {[
                 'ways(n) = ways(n-1) * ways(n-2)',
                 'ways(n) = ways(n-1) + ways(n-2)',
                 'ways(n) = 1 + ways(n-1)'
               ].map((opt) => (
                 <button
                   key={opt}
                   onClick={() => {
                     handleOption('formula', opt);
                     if (opt === 'ways(n) = ways(n-1) + ways(n-2)') setStep(Math.max(step, 3));
                   }}
                   className={`px-4 py-3 text-left text-sm rounded border font-mono ${
                     answers.formula === opt 
                       ? (opt.includes('+') ? 'bg-indigo-100 border-indigo-500 text-indigo-900' : 'bg-red-50 border-red-200')
                       : 'bg-white border-slate-300 hover:bg-slate-50'
                   }`}
                 >
                   {opt}
                 </button>
               ))}
            </div>
            {step === 3 && (
               <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                 <h4 className="font-bold text-green-800 flex items-center gap-2">
                   <CheckCircle2 /> Principle Mastered!
                 </h4>
                 <p className="text-green-700 text-sm mt-1">
                   This is the core of <strong>Dynamic Programming</strong>. We solve the complex problem (N) by combining the solutions of its sub-problems (N-1 and N-2).
                 </p>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DerivationSection;
