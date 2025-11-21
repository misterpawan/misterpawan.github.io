import React, { useState, useRef } from 'react';
import { Calculator, BookOpen, Play, RotateCcw, ChevronRight, ChevronLeft, Settings2, CheckCircle2 } from 'lucide-react';

// Utility to deep copy matrix
const copyMatrix = (m) => m.map(row => [...row]);

// Initial System:
// 1x + 2y + 1z = 8
// 2x + 5y + 3z = 19
// 1x + 1y + 4z = 9
// Solution: x=3, y=2, z=1
const INITIAL_MATRIX = [
    [1, 2, 1, 8],
    [2, 5, 3, 19],
    [1, 1, 4, 9]
];

const TUTORIAL_STEPS = [
    {
        title: "Intro to RREF (Gauss-Jordan)",
        description: "Welcome! In RREF, we go further than Gaussian Elimination. Our goal is to turn the left side into the 'Identity Matrix'—a diagonal of 1s with 0s everywhere else. This immediately tells us the answer: x=?, y=?, z=?.",
        hint: "Click 'Next' to start transforming.",
        targetState: null
    },
    {
        title: "Step 1: Clear Column 1",
        description: "We have a '1' at the top left (our first Pivot). Perfect. Now we need to eliminate the '2' below it in Row 2.",
        hint: "Set R2 = R2 - 2 * R1.",
        mode: 'add',
        targetOperation: { targetRow: 1, sourceRow: 0, multiplier: -2 },
        highlightIndices: [[1, 0]]
    },
    {
        title: "Step 2: Finish Column 1",
        description: "Good! Now eliminate the '1' in Row 3, Column 1, using our Pivot in Row 1.",
        hint: "Set R3 = R3 - 1 * R1.",
        mode: 'add',
        targetOperation: { targetRow: 2, sourceRow: 0, multiplier: -1 },
        highlightIndices: [[2, 0]]
    },
    {
        title: "Step 3: Clear Column 2 (Below)",
        description: "Column 1 is done [1, 0, 0]. Now look at Row 2, Column 2. It's a '1'. That's our second Pivot! Let's use it to clear the '-1' below it in Row 3.",
        hint: "Add Row 2 to Row 3. Set R3 = R3 + 1 * R2.",
        mode: 'add',
        targetOperation: { targetRow: 2, sourceRow: 1, multiplier: 1 },
        highlightIndices: [[2, 1]]
    },
    {
        title: "Step 4: Normalize the Pivot",
        description: "Look at Row 3: [0, 0, 4, 4]. To get RREF, our pivots must be '1'. We need to turn that '4' into a '1'.",
        hint: "Switch to 'Scale Row' mode. Multiply R3 by 0.25 (or 1/4).",
        mode: 'scale',
        targetOperation: { targetRow: 2, multiplier: 0.25 },
        highlightIndices: [[2, 2]]
    },
    {
        title: "Step 5: work Upwards (Column 3)",
        description: "We have zeros below. Now we work UP. Let's eliminate the '1' in Row 2, Column 3 using our new Pivot in Row 3.",
        hint: "Switch back to 'Add Rows'. Set R2 = R2 - 1 * R3.",
        mode: 'add',
        targetOperation: { targetRow: 1, sourceRow: 2, multiplier: -1 },
        highlightIndices: [[1, 2]]
    },
    {
        title: "Step 6: Finish Column 3",
        description: "Now eliminate the '1' in Row 1, Column 3 using Row 3.",
        hint: "Set R1 = R1 - 1 * R3.",
        mode: 'add',
        targetOperation: { targetRow: 0, sourceRow: 2, multiplier: -1 },
        highlightIndices: [[0, 2]]
    },
    {
        title: "Step 7: Final Polish",
        description: "Almost done! Row 1 still has a '2' in the middle. We need to eliminate it using the Pivot in Row 2.",
        hint: "Set R1 = R1 - 2 * R2.",
        mode: 'add',
        targetOperation: { targetRow: 0, sourceRow: 1, multiplier: -2 },
        highlightIndices: [[0, 1]]
    },
    {
        title: "RREF Achieved!",
        description: "Look at the matrix! The left side is the Identity Matrix. The right column is your solution: x=3, y=2, z=1.",
        hint: "You are a linear algebra master.",
        isComplete: true
    }
];

export default function RREFApp() {
    const [matrix, setMatrix] = useState(copyMatrix(INITIAL_MATRIX));
    const [step, setStep] = useState(0);
    const [feedback, setFeedback] = useState("");

    // Operation State
    const [mode, setMode] = useState('add'); // 'add' or 'scale'
    const [targetRow, setTargetRow] = useState(1);
    const [sourceRow, setSourceRow] = useState(0);
    const [multiplier, setMultiplier] = useState(-2);

    const currentTutorial = TUTORIAL_STEPS[step];

    const resetMatrix = () => {
        setMatrix(copyMatrix(INITIAL_MATRIX));
        setStep(0);
        setFeedback("");
        setMode('add');
        setTargetRow(1);
        setSourceRow(0);
        setMultiplier(-2);
    };

    const performOperation = () => {
        const newMatrix = copyMatrix(matrix);
        const targetR = parseInt(targetRow);
        const mult = parseFloat(multiplier);

        if (mode === 'add') {
            const sourceR = parseInt(sourceRow);
            if (targetR === sourceR) {
                setFeedback("Target and Source rows cannot be the same.");
                return;
            }
            for (let i = 0; i < 4; i++) {
                newMatrix[targetR][i] = newMatrix[targetR][i] + (mult * newMatrix[sourceR][i]);
            }
        } else {
            // Scale Mode
            for (let i = 0; i < 4; i++) {
                newMatrix[targetR][i] = newMatrix[targetR][i] * mult;
            }
        }

        setMatrix(newMatrix);

        // Validation Logic
        if (currentTutorial.targetOperation) {
            const op = currentTutorial.targetOperation;
            let isCorrect = false;

            if (mode === 'add' && currentTutorial.mode === 'add') {
                isCorrect = targetR === op.targetRow && parseInt(sourceRow) === op.sourceRow && mult === op.multiplier;
            } else if (mode === 'scale' && currentTutorial.mode === 'scale') {
                isCorrect = targetR === op.targetRow && mult === op.multiplier;
            }

            if (isCorrect) {
                setFeedback("Correct! Moving to next step...");
                setTimeout(() => {
                    advanceStep(step + 1);
                }, 1200);
            } else {
                setFeedback("Mathematically valid, but not the step requested. Try resetting if stuck!");
            }
        }
    };

    const advanceStep = (nextStepIdx) => {
        if (nextStepIdx >= TUTORIAL_STEPS.length) return;

        setStep(nextStepIdx);
        setFeedback("");

        const nextTutorial = TUTORIAL_STEPS[nextStepIdx];
        if (nextTutorial && nextTutorial.targetOperation) {
            // Auto-set inputs to help user
            setMode(nextTutorial.mode || 'add');
            setTargetRow(nextTutorial.targetOperation.targetRow);
            setMultiplier(nextTutorial.targetOperation.multiplier);
            if (nextTutorial.mode === 'add') {
                setSourceRow(nextTutorial.targetOperation.sourceRow);
            }
        }
    };

    const formatNumber = (num) => {
        // Handle practically zero values (floating point errors)
        if (Math.abs(num) < 0.000001) return 0;
        if (Number.isInteger(num)) return num;
        return parseFloat(num.toFixed(2));
    };

    const isHighlighted = (r, c) => {
        if (!currentTutorial.highlightIndices) return false;
        return currentTutorial.highlightIndices.some(([hr, hc]) => hr === r && hc === c);
    };

    return (
        <div className="min-h-screen bg-indigo-50 text-slate-800 font-sans selection:bg-indigo-200">

            {/* Header */}
            <header className="bg-indigo-900 text-white p-4 shadow-lg border-b border-indigo-800">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-500 p-2 rounded-lg">
                            <Settings2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">RREF Interactive Tutor</h1>
                            <p className="text-xs text-indigo-300">Gauss-Jordan Elimination Method</p>
                        </div>
                    </div>
                    <button
                        onClick={resetMatrix}
                        className="flex items-center space-x-2 bg-indigo-800 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-indigo-700"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">

                {/* Left Panel: Matrix */}
                <div className="flex-1 lg:flex-[1.4] order-2 lg:order-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="font-semibold text-slate-700">Matrix State</h2>
                            <div className="flex gap-2 text-xs font-mono">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Pivots = 1</span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded">Others = 0</span>
                            </div>
                        </div>

                        <div className="flex-1 p-8 flex flex-col justify-center items-center bg-slate-50 relative min-h-[400px]">

                            {/* Visualization of Goal (Identity) faintly in background */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                <div className="text-[12rem] font-bold text-slate-900">I</div>
                            </div>

                            {/* Brackets */}
                            <div className="relative p-6">
                                <div className="absolute top-0 bottom-0 left-0 w-6 border-l-4 border-t-4 border-b-4 border-slate-800 rounded-l-2xl"></div>
                                <div className="absolute top-0 bottom-0 right-0 w-6 border-r-4 border-t-4 border-b-4 border-slate-800 rounded-r-2xl"></div>

                                <div className="grid grid-cols-4 gap-x-4 gap-y-6 relative z-10">
                                    {/* Headers */}
                                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">x</div>
                                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">y</div>
                                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">z</div>
                                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest border-l border-dashed border-slate-300 pl-2">RHS</div>

                                    {matrix.map((row, rIndex) => (
                                        <React.Fragment key={rIndex}>
                                            {row.map((val, cIndex) => {
                                                const highlight = isHighlighted(rIndex, cIndex);
                                                const isPivot = rIndex === cIndex && cIndex < 3; // Main diagonal
                                                const isResult = cIndex === 3;

                                                // Determining cell style based on its "RREF status"
                                                let bgClass = "bg-white";
                                                let textClass = "text-slate-700";

                                                if (highlight) {
                                                    bgClass = "bg-pink-500 shadow-pink-200";
                                                    textClass = "text-white";
                                                } else if (isPivot && Math.abs(val - 1) < 0.01) {
                                                    bgClass = "bg-green-50 border-green-200";
                                                    textClass = "text-green-700";
                                                } else if (!isResult && !isPivot && Math.abs(val) < 0.01) {
                                                    bgClass = "bg-slate-100";
                                                    textClass = "text-slate-300";
                                                }

                                                return (
                                                    <div
                                                        key={`${rIndex}-${cIndex}`}
                                                        className={`
                              w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-xl md:text-2xl font-mono font-medium rounded-lg shadow-sm border transition-all duration-500
                              ${bgClass} ${textClass}
                              ${isResult ? 'border-l-2 border-l-slate-300 ml-2' : 'border-slate-100'}
                              ${highlight ? 'scale-110 ring-4 ring-pink-200 z-20 border-transparent' : ''}
                            `}
                                                    >
                                                        {formatNumber(val)}
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Equations Footer */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <div className="flex justify-around text-sm font-mono text-slate-500">
                                {matrix.map((row, i) => (
                                    <span key={i} className={i === currentTutorial.targetOperation?.targetRow ? "text-indigo-600 font-bold" : ""}>
                                        {Math.abs(row[0]) < 0.01 ? "" : `${formatNumber(row[0])}x `}
                                        {Math.abs(row[1]) < 0.01 ? "" : `${row[1] > 0 && row[0] !== 0 ? "+" : ""}${formatNumber(row[1])}y `}
                                        {Math.abs(row[2]) < 0.01 ? "" : `${row[2] > 0 && (row[0] !== 0 || row[1] !== 0) ? "+" : ""}${formatNumber(row[2])}z `}
                                        = {formatNumber(row[3])}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Controls */}
                <div className="w-full lg:w-[24rem] flex flex-col gap-6 order-1 lg:order-2">

                    {/* Tutorial Step Card */}
                    <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <BookOpen className="w-32 h-32" />
                        </div>

                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <span className="bg-indigo-500 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                                Phase {step + 1}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => advanceStep(step - 1)} disabled={step === 0} className="p-1 hover:bg-white/10 rounded disabled:opacity-30"><ChevronLeft /></button>
                                <button onClick={() => advanceStep(step + 1)} disabled={step === TUTORIAL_STEPS.length - 1} className="p-1 hover:bg-white/10 rounded disabled:opacity-30"><ChevronRight /></button>
                            </div>
                        </div>

                        <h2 className="text-lg font-bold mb-2 relative z-10">{currentTutorial.title}</h2>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4 relative z-10">
                            {currentTutorial.description}
                        </p>

                        {!currentTutorial.isComplete && (
                            <div className="bg-indigo-900/50 border border-indigo-500/30 rounded-lg p-3 flex items-start gap-3 relative z-10">
                                <div className="mt-1 w-2 h-2 bg-indigo-400 rounded-full shrink-0 animate-pulse" />
                                <p className="text-xs font-medium text-indigo-200">
                                    Goal: {currentTutorial.hint}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Control Panel */}
                    {currentTutorial.targetOperation && !currentTutorial.isComplete && (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-1">
                            <div className="flex border-b border-slate-100">
                                <button
                                    onClick={() => setMode('add')}
                                    className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'add' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    Add Rows
                                </button>
                                <button
                                    onClick={() => setMode('scale')}
                                    className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'scale' ? 'text-pink-600 bg-pink-50' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    Scale Row
                                </button>
                            </div>

                            <div className="p-5">
                                {mode === 'add' ? (
                                    /* Add Row Interface */
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                                        <label className="text-xs font-bold text-slate-400 mb-4 block uppercase">Formula</label>
                                        <div className="flex items-center justify-center gap-2 mb-6 font-mono text-sm">
                                            <div className="bg-white px-3 py-2 rounded border border-slate-300 shadow-sm">R{parseInt(targetRow) + 1}</div>
                                            <span>=</span>
                                            <div className="bg-white px-3 py-2 rounded border border-slate-300 shadow-sm">R{parseInt(targetRow) + 1}</div>
                                            <span>+</span>
                                            <div className="bg-green-100 text-green-800 px-3 py-2 rounded border border-green-200 font-bold">k</div>
                                            <span>×</span>
                                            <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded border border-purple-200 font-bold">R{parseInt(sourceRow) + 1}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4 text-left">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Row</label>
                                                <select value={targetRow} onChange={(e) => setTargetRow(e.target.value)} className="w-full mt-1 bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold">
                                                    <option value={0}>Row 1</option>
                                                    <option value={1}>Row 2</option>
                                                    <option value={2}>Row 3</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Source Row</label>
                                                <select value={sourceRow} onChange={(e) => setSourceRow(e.target.value)} className="w-full mt-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg p-2 text-sm font-bold">
                                                    <option value={0}>Row 1</option>
                                                    <option value={1}>Row 2</option>
                                                    <option value={2}>Row 3</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 text-left">Multiplier (k)</label>
                                            <input type="number" step="0.1" value={multiplier} onChange={(e) => setMultiplier(e.target.value)} className="w-full bg-green-50 border border-green-200 text-green-700 rounded-lg p-2 font-mono font-bold text-center" />
                                        </div>
                                    </div>
                                ) : (
                                    /* Scale Row Interface */
                                    <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 text-center">
                                        <label className="text-xs font-bold text-pink-400 mb-4 block uppercase">Formula</label>
                                        <div className="flex items-center justify-center gap-2 mb-6 font-mono text-sm">
                                            <div className="bg-white px-3 py-2 rounded border border-pink-200 shadow-sm">R{parseInt(targetRow) + 1}</div>
                                            <span>=</span>
                                            <div className="bg-white px-3 py-2 rounded border border-pink-200 shadow-sm">R{parseInt(targetRow) + 1}</div>
                                            <span>×</span>
                                            <div className="bg-pink-200 text-pink-900 px-3 py-2 rounded border border-pink-300 font-bold">k</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4 text-left">
                                            <div>
                                                <label className="text-[10px] font-bold text-pink-400 uppercase">Target Row</label>
                                                <select value={targetRow} onChange={(e) => setTargetRow(e.target.value)} className="w-full mt-1 bg-white border border-pink-200 rounded-lg p-2 text-sm font-bold text-pink-900">
                                                    <option value={0}>Row 1</option>
                                                    <option value={1}>Row 2</option>
                                                    <option value={2}>Row 3</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-pink-400 uppercase">Scale Factor (k)</label>
                                                <input type="number" step="0.1" value={multiplier} onChange={(e) => setMultiplier(e.target.value)} className="w-full mt-1 bg-white border border-pink-200 text-pink-700 rounded-lg p-2 font-mono font-bold text-center" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={performOperation}
                                    className={`w-full mt-4 font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2
                    ${mode === 'add' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-pink-600 hover:bg-pink-500 text-white'}
                  `}
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    Execute
                                </button>

                                {feedback && (
                                    <div className={`mt-4 p-3 rounded-lg text-xs font-bold text-center animate-pulse ${feedback.includes("Correct") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {feedback}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentTutorial.isComplete && (
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg p-8 text-center">
                            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-white/90" />
                            <h3 className="text-2xl font-bold mb-2">Identity Matrix Achieved!</h3>
                            <p className="text-green-100 mb-6">The system is fully solved.</p>
                            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-md">
                                <div className="flex justify-between px-4 font-mono text-xl font-bold">
                                    <span>x = 3</span>
                                    <span>y = 2</span>
                                    <span>z = 1</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}