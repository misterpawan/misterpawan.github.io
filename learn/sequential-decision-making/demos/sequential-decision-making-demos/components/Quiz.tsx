import React, { useState, useEffect } from 'react';
import { DemoType } from '../types';
import { CheckCircle2, XCircle, HelpCircle, BrainCircuit } from 'lucide-react';

interface Props {
  activeDemo: DemoType;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_DATA: Record<DemoType, Question[]> = {
  [DemoType.ROBOT]: [
    {
      id: 1,
      text: "What represents the 'State' in this robot navigation problem?",
      options: [
        "The directional buttons (Up, Down, Left, Right)",
        "The Robot's current grid position (x, y) and Battery/Steps remaining",
        "The color of the goal flag"
      ],
      correctIndex: 1,
      explanation: "A State captures all the information needed to make a decision at a specific point in time. Here, the robot needs to know where it is and how much battery it has left to plan a path."
    },
    {
      id: 2,
      text: "What corresponds to the 'Actions' or 'Controls'?",
      options: [
        "Moving Up, Down, Left, or Right",
        "The obstacles on the grid",
        "The maximum number of steps allowed"
      ],
      correctIndex: 0,
      explanation: "Actions are the choices available to the decision maker. At each step, the robot can choose to move in one of the cardinal directions."
    }
  ],
  [DemoType.PORTFOLIO]: [
    {
      id: 1,
      text: "In the portfolio problem, what is the 'State' that changes over time?",
      options: [
        "The historical stock market returns",
        "The Current Wealth and the Current Year",
        "The 'Simulate Next Year' button"
      ],
      correctIndex: 1,
      explanation: "The State is your current situation. Your wealth determines how close you are to the goal, and the year tells you how much time you have left (Finite Horizon)."
    },
    {
      id: 2,
      text: "What is the 'Control' variable you can adjust?",
      options: [
        "The market return rate",
        "The target wealth ($100k)",
        "The Allocation % (Split between Stocks vs. Bonds)"
      ],
      correctIndex: 2,
      explanation: "The Control (or Action) is the decision you make. You can't control the market or the goal, but you can control how much risk you take by adjusting your portfolio allocation."
    }
  ],
  [DemoType.GAME]: [
    {
      id: 1,
      text: "For the Space Runner game, which variables define the system 'State'?",
      options: [
        "Position, Velocity, and Time Remaining",
        "The Space Bar key on your keyboard",
        "The background color"
      ],
      correctIndex: 0,
      explanation: "These variables fully describe the physical situation of the runner. Velocity determines future position, and Time Remaining is the finite horizon constraint."
    },
    {
      id: 2,
      text: "What is the 'Action' available to the player?",
      options: [
        "Gravity pulling the player down",
        "Jumping (Applying upward velocity)",
        "The speed of the obstacles"
      ],
      correctIndex: 1,
      explanation: "An Action is an input that alters the state dynamics. Jumping changes the vertical velocity, allowing the player to avoid obstacles."
    }
  ]
};

const Quiz: React.FC<Props> = ({ activeDemo }) => {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  // Reset quiz when demo changes
  useEffect(() => {
    setAnswers({});
    setShowFeedback({});
  }, [activeDemo]);

  const handleSelect = (questionId: number, optionIndex: number) => {
    if (showFeedback[questionId]) return; // Prevent changing after revealing
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const checkAnswer = (questionId: number) => {
    setShowFeedback(prev => ({ ...prev, [questionId]: true }));
  };

  const questions = QUIZ_DATA[activeDemo];

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 mb-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
          <BrainCircuit className="text-indigo-600" />
          <h3 className="font-bold text-slate-800">Concept Check: {activeDemo.charAt(0) + activeDemo.slice(1).toLowerCase()} Dynamics</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {questions.map((q, index) => {
            const selected = answers[q.id];
            const isRevealed = showFeedback[q.id];
            const isCorrect = selected === q.correctIndex;

            return (
              <div key={q.id} className="p-6">
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {index + 1}</span>
                  <p className="text-lg font-medium text-slate-800 mt-1">{q.text}</p>
                </div>

                <div className="space-y-3">
                  {q.options.map((option, idx) => {
                    let btnClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group ";
                    
                    if (isRevealed) {
                      if (idx === q.correctIndex) {
                        btnClass += "bg-green-50 border-green-200 text-green-800";
                      } else if (idx === selected && idx !== q.correctIndex) {
                        btnClass += "bg-red-50 border-red-200 text-red-800";
                      } else {
                        btnClass += "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                      }
                    } else {
                      if (idx === selected) {
                        btnClass += "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm ring-1 ring-indigo-200";
                      } else {
                        btnClass += "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(q.id, idx)}
                        disabled={isRevealed}
                        className={btnClass}
                      >
                        <span>{option}</span>
                        {isRevealed && idx === q.correctIndex && <CheckCircle2 size={20} className="text-green-600" />}
                        {isRevealed && idx === selected && idx !== q.correctIndex && <XCircle size={20} className="text-red-500" />}
                      </button>
                    );
                  })}
                </div>

                {!isRevealed ? (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => checkAnswer(q.id)}
                      disabled={selected === undefined}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Check Answer
                    </button>
                  </div>
                ) : (
                  <div className={`mt-4 p-4 rounded-lg flex gap-3 text-sm animate-in fade-in duration-300 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
                    <HelpCircle className="shrink-0 mt-0.5" size={18} />
                    <div>
                      <span className="font-bold block mb-1">{isCorrect ? 'Correct!' : 'Not quite.'}</span>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Quiz;