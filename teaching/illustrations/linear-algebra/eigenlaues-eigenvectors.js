import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calculator, ArrowRight, Check, RefreshCw, Plus } from 'lucide-react';

// The Matrix A
// [ 4  1 ]
// [ 2  3 ]
// Eigenvalues: 5, 2
// Eigenvectors: [1, 1] corresponding to 5, [1, -2] corresponding to 2

const STEPS = [
    {
        id: 'intro',
        title: "The Mission",
        description: "We have a transformation matrix A. We want to find vectors (eigenvectors) that don't change direction when A is applied to them, they only stretch by a factor (eigenvalue).",
        matrix: [[4, 1], [2, 3]],
        hint: "Formula: A v = λ v",
        type: 'info'
    },
    {
        id: 'char_eq_setup',
        title: "Step 1: The Characteristic Matrix",
        description: "To find the eigenvalues (λ), we first need to set the determinant of (A - λI) to zero. This means subtracting λ from the diagonal elements.",
        hint: "Enter the diagonal expressions. You can type 'L' for λ or use the buttons.",
        matrix: [[4, 1], [2, 3]],
        type: 'input_diagonal',
        correctValues: { d1: '4-λ', d2: '3-λ' }
    },
    {
        id: 'char_eq_det',
        title: "Step 2: The Characteristic Polynomial",
        description: "Now we calculate the determinant: (ad - bc).",
        equation: "(4-λ)(3-λ) - (2)(1) = 0",
        hint: "Expand the algebra: 12 - 7λ + λ² - 2 = 0",
        simplified: "λ² - 7λ + 10 = 0",
        type: 'choice',
        choices: [
            { label: "(λ - 5)(λ - 2) = 0", correct: true },
            { label: "(λ - 7)(λ - 1) = 0", correct: false },
            { label: "(λ + 5)(λ + 2) = 0", correct: false }
        ]
    },
    {
        id: 'roots',
        title: "Step 3: Identify Eigenvalues",
        description: "Solve (λ - 5)(λ - 2) = 0. What are the two eigenvalues?",
        type: 'multi_select',
        options: [2, 3, 4, 5, 7, 10],
        correctOptions: [2, 5],
        hint: "Select the two roots."
    },
    {
        id: 'eigenvector_1_setup',
        title: "Step 4: Eigenvector for λ = 5",
        description: "Let's find the vector for λ = 5. We substitute λ=5 back into (A - λI)v = 0.",
        hint: "Calculate: 4-5 and 3-5",
        matrixState: 'subtraction', // [[4-5, 1], [2, 3-5]]
        lambda: 5,
        type: 'verify_matrix',
        targetMatrix: [[-1, 1], [2, -2]]
    },
    {
        id: 'eigenvector_1_rref',
        title: "Step 5: RREF for λ = 5",
        description: "Now we row reduce the matrix to find the relationship between x and y.",
        initialMatrix: [[-1, 1], [2, -2]],
        targetMatrix: [[1, -1], [0, 0]],
        hint: "Row 2 is just -2 times Row 1. We can eliminate Row 2 and divide Row 1 by -1.",
        type: 'rref_interactive',
        solution: { x: 1, y: 1 }
    },
    {
        id: 'eigenvector_2_setup',
        title: "Step 6: Eigenvector for λ = 2",
        description: "Now for the second eigenvalue λ = 2. Substitute λ=2 into (A - λI).",
        hint: "Calculate: 4-2 and 3-2",
        matrixState: 'subtraction',
        lambda: 2,
        type: 'verify_matrix',
        targetMatrix: [[2, 1], [2, 1]]
    },
    {
        id: 'eigenvector_2_rref',
        title: "Step 7: RREF for λ = 2",
        description: "Row reduce this matrix to solve the system.",
        initialMatrix: [[2, 1], [2, 1]],
        targetMatrix: [[2, 1], [0, 0]], // Or [[1, 0.5], [0,0]] but keeping integers is usually friendlier for tutorials
        hint: "Row 2 is identical to Row 1. Subtract R1 from R2.",
        type: 'rref_interactive',
        solution: { x: 1, y: -2 }
    },
    {
        id: 'visualization',
        title: "Verification",
        description: "See the magic! The standard grid is transformed by A. Watch how our Eigenvectors (Red and Blue) stick to their lines (spans) while other vectors rotate.",
        type: 'visual'
    }
];

export default function EigenTutor() {
    const [currentStep, setCurrentStep] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [inputs, setInputs] = useState({});
    const [selectedOptions, setSelectedOptions] = useState([]);

    // RREF State
    const [rrefMatrix, setRrefMatrix] = useState([[0, 0], [0, 0]]);

    const stepData = STEPS[currentStep];

    useEffect(() => {
        setFeedback("");
        setInputs({});
        setSelectedOptions([]);
        if (stepData.type === 'rref_interactive') {
            setRrefMatrix(stepData.initialMatrix);
        }
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    // --- Interaction Handlers ---

    const checkDiagonalInput = () => {
        // Normalize input: remove spaces, lowercase
        const d1 = inputs.d1?.replace(/\s/g, '').toLowerCase();
        const d2 = inputs.d2?.replace(/\s/g, '').toLowerCase();

        // Validation logic accepting 'lambda' symbol, word, or just 'l'
        const isValid = (val, num) => {
            return val === `${num}-λ` || val === `${num}-lambda` || val === `${num}-l`;
        };

        if (isValid(d1, 4) && isValid(d2, 3)) {
            setFeedback("Correct! We subtract λ from the diagonal.");
            setTimeout(handleNext, 1500);
        } else {
            setFeedback("Not quite. Remember (A - λI). You can use 'L' for λ.");
        }
    };

    const checkChoice = (choice) => {
        if (choice.correct) {
            setFeedback("Correct! Now we can solve for λ.");
            setTimeout(handleNext, 1500);
        } else {
            setFeedback("Incorrect factorization. Try expanding them to see which matches λ² - 7λ + 10.");
        }
    };

    const toggleOption = (val) => {
        let newSel = selectedOptions.includes(val)
            ? selectedOptions.filter(v => v !== val)
            : [...selectedOptions, val];
        setSelectedOptions(newSel);

        if (newSel.length === 2) {
            const correct = stepData.correctOptions;
            const isMatch = newSel.sort().join(',') === correct.sort().join(',');
            if (isMatch) {
                setFeedback("Perfect! The eigenvalues are 2 and 5.");
                setTimeout(handleNext, 1500);
            } else {
                setFeedback("Those aren't the roots. Look at (λ - 5)(λ - 2) again.");
            }
        }
    };

    const checkMatrixValues = () => {
        // Simplified check for the specific numeric steps
        const v1 = parseInt(inputs['0-0']);
        const v2 = parseInt(inputs['1-1']);
        const t = stepData.targetMatrix;

        if (v1 === t[0][0] && v2 === t[1][1]) {
            setFeedback("Correct matrix construction!");
            setTimeout(handleNext, 1500);
        } else {
            setFeedback(`Check your math: 4 - ${stepData.lambda} and 3 - ${stepData.lambda}`);
        }
    };

    const performRREFAction = (action) => {
        // Hardcoded "Interactive" logic to simulate the feeling of solving without complex logic
        if (action === 'reduce') {
            setRrefMatrix(stepData.targetMatrix);
            setFeedback("Row Operations applied! Now we have a clear equation.");
        }
    };

    const checkVectorInput = () => {
        const x = parseFloat(inputs.vx);
        const y = parseFloat(inputs.vy);
        const sol = stepData.solution;

        // Check collinearity roughly
        const ratio = sol.x / sol.y;
        const inputRatio = x / y;

        if (Math.abs(ratio - inputRatio) < 0.1 || (x === 0 && y === 0)) { // 0,0 is technically a solution but trivial, we want non-trivial
            if (x === 0 && y === 0) {
                setFeedback("The zero vector is trivial. Find a non-zero vector!");
            } else {
                setFeedback("Correct! This vector satisfies the system.");
                setTimeout(handleNext, 1500);
            }
        } else {
            setFeedback("That vector doesn't satisfy the equation derived from the RREF.");
        }
    };

    const appendLambda = (field) => {
        setInputs(prev => ({
            ...prev,
            [field]: (prev[field] || '') + 'λ'
        }));
    };


    // --- Render Helpers ---

    const renderMatrix = (matrix, highlightDiag = false) => (
        <div className="flex relative mx-auto w-max text-2xl font-mono font-bold">
            <div className="absolute top-0 bottom-0 left-0 w-2 border-l-2 border-t-2 border-b-2 border-slate-800"></div>
            <div className="absolute top-0 bottom-0 right-0 w-2 border-r-2 border-t-2 border-b-2 border-slate-800"></div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4">
                {matrix.map((row, r) => row.map((val, c) => (
                    <div key={`${r}-${c}`} className={`${highlightDiag && r === c ? 'text-blue-600' : 'text-slate-700'}`}>
                        {val}
                    </div>
                )))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Header */}
            <header className="bg-slate-900 text-white p-4 shadow-md">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-500 p-1.5 rounded">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-bold">EigenFlow</h1>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">Step {currentStep + 1} / {STEPS.length}</div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Panel: Context & Visuals */}
                    <div className="order-2 md:order-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col items-center justify-center min-h-[300px]">

                            {stepData.type === 'info' && (
                                <div className="text-center">
                                    <div className="text-sm text-slate-400 mb-4 uppercase tracking-widest font-bold">Matrix A</div>
                                    {renderMatrix(STEPS[0].matrix)}
                                    <div className="mt-8 text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg">
                                        "Eigen" comes from German meaning "own" or "characteristic".
                                    </div>
                                </div>
                            )}

                            {(stepData.type === 'input_diagonal' || stepData.type === 'choice' || stepData.type === 'multi_select') && (
                                <div className="text-center">
                                    <div className="text-sm text-blue-600 mb-2 font-bold">A - λI</div>
                                    <div className="flex relative mx-auto w-max text-xl font-mono font-bold mb-6">
                                        <div className="absolute top-0 bottom-0 left-0 w-2 border-l-2 border-t-2 border-b-2 border-slate-800"></div>
                                        <div className="absolute top-0 bottom-0 right-0 w-2 border-r-2 border-t-2 border-b-2 border-slate-800"></div>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4">
                                            <div className="flex flex-col items-center gap-2">
                                                {stepData.type === 'input_diagonal' ? (
                                                    <>
                                                        <input
                                                            value={inputs.d1 || ''}
                                                            onChange={e => setInputs({ ...inputs, d1: e.target.value })}
                                                            className="w-20 text-center border-b-2 border-blue-400 outline-none bg-transparent"
                                                            placeholder="4 - ?"
                                                        />
                                                        <button
                                                            onClick={() => appendLambda('d1')}
                                                            className="text-[10px] flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition border border-blue-200"
                                                        >
                                                            <Plus className="w-3 h-3" /> λ
                                                        </button>
                                                    </>
                                                ) : "4 - λ"}
                                            </div>
                                            <div className="pt-2">1</div>
                                            <div className="pt-2">2</div>
                                            <div className="flex flex-col items-center gap-2">
                                                {stepData.type === 'input_diagonal' ? (
                                                    <>
                                                        <input
                                                            value={inputs.d2 || ''}
                                                            onChange={e => setInputs({ ...inputs, d2: e.target.value })}
                                                            className="w-20 text-center border-b-2 border-blue-400 outline-none bg-transparent"
                                                            placeholder="3 - ?"
                                                        />
                                                        <button
                                                            onClick={() => appendLambda('d2')}
                                                            className="text-[10px] flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition border border-blue-200"
                                                        >
                                                            <Plus className="w-3 h-3" /> λ
                                                        </button>
                                                    </>
                                                ) : "3 - λ"}
                                            </div>
                                        </div>
                                    </div>
                                    {stepData.type === 'choice' && (
                                        <div className="text-lg font-mono text-slate-600 animate-fade-in">
                                            Det = (4-λ)(3-λ) - 2 = 0 <br />
                                            λ² - 7λ + 12 - 2 = 0 <br />
                                            <span className="font-bold text-slate-900">λ² - 7λ + 10 = 0</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {stepData.type === 'verify_matrix' && (
                                <div className="text-center">
                                    <div className="mb-4 font-bold text-slate-400">λ = {stepData.lambda}</div>
                                    <div className="flex relative mx-auto w-max text-2xl font-mono font-bold">
                                        <div className="absolute top-0 bottom-0 left-0 w-2 border-l-2 border-t-2 border-b-2 border-slate-800"></div>
                                        <div className="absolute top-0 bottom-0 right-0 w-2 border-r-2 border-t-2 border-b-2 border-slate-800"></div>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4">
                                            <div className="bg-slate-50 rounded px-2 flex items-center justify-center">
                                                <input
                                                    type="number"
                                                    className="w-12 text-center bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none"
                                                    value={inputs['0-0'] || ''}
                                                    onChange={(e) => setInputs({ ...inputs, '0-0': e.target.value })}
                                                />
                                            </div>
                                            <div>1</div>
                                            <div>2</div>
                                            <div className="bg-slate-50 rounded px-2 flex items-center justify-center">
                                                <input
                                                    type="number"
                                                    className="w-12 text-center bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none"
                                                    value={inputs['1-1'] || ''}
                                                    onChange={(e) => setInputs({ ...inputs, '1-1': e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {stepData.type === 'rref_interactive' && (
                                <div className="w-full">
                                    <div className="flex justify-center items-center gap-4 mb-6">
                                        {/* Matrix Visualization */}
                                        <div className="relative">
                                            <div className="absolute top-0 bottom-0 left-0 w-3 border-l-2 border-t-2 border-b-2 border-slate-800 rounded-l"></div>
                                            <div className="absolute top-0 bottom-0 right-0 w-3 border-r-2 border-t-2 border-b-2 border-slate-800 rounded-r"></div>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4 font-mono text-2xl font-bold">
                                                {rrefMatrix.map((row, r) => row.map((val, c) => <div key={r + c} className="text-center">{val}</div>))}
                                            </div>
                                        </div>
                                        <div className="font-mono text-2xl flex flex-col gap-4">
                                            <div>x</div>
                                            <div>y</div>
                                        </div>
                                        <div className="font-mono text-2xl flex flex-col gap-4">
                                            <div>= 0</div>
                                            <div>= 0</div>
                                        </div>
                                    </div>

                                    {/* If matrix is not reduced, show reduce button */}
                                    {JSON.stringify(rrefMatrix) !== JSON.stringify(stepData.targetMatrix) ? (
                                        <button
                                            onClick={() => performRREFAction('reduce')}
                                            className="w-full py-3 bg-indigo-100 text-indigo-700 font-bold rounded-lg hover:bg-indigo-200 transition"
                                        >
                                            Apply RREF (Row Operations)
                                        </button>
                                    ) : (
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 animate-fade-in">
                                            <p className="text-sm font-bold text-green-800 mb-2">System Reduced:</p>
                                            <div className="font-mono text-slate-700 text-center mb-4">
                                                {stepData.targetMatrix[0][0]}x {stepData.targetMatrix[0][1] < 0 ? '-' : '+'} {Math.abs(stepData.targetMatrix[0][1])}y = 0
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                <span>If x = </span>
                                                <input
                                                    className="w-12 p-1 border rounded text-center font-bold"
                                                    placeholder="1"
                                                    value={inputs.vx || ''}
                                                    onChange={e => setInputs({ ...inputs, vx: e.target.value })}
                                                />
                                                <span>, then y = </span>
                                                <input
                                                    className="w-12 p-1 border rounded text-center font-bold"
                                                    placeholder="?"
                                                    value={inputs.vy || ''}
                                                    onChange={e => setInputs({ ...inputs, vy: e.target.value })}
                                                />
                                                <button onClick={checkVectorInput} className="ml-2 bg-green-500 text-white p-1.5 rounded hover:bg-green-600">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {stepData.type === 'visual' && (
                                <div className="relative w-64 h-64 bg-slate-50 border border-slate-200 rounded-full overflow-hidden">
                                    <svg viewBox="-10 -10 20 20" className="w-full h-full">
                                        {/* Grid */}
                                        <defs>
                                            <pattern id="grid" width="2" height="2" patternUnits="userSpaceOnUse">
                                                <path d="M 2 0 L 0 0 0 2" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.1" />
                                            </pattern>
                                        </defs>
                                        <rect x="-10" y="-10" width="20" height="20" fill="url(#grid)" />
                                        <line x1="-10" y1="0" x2="10" y2="0" stroke="black" strokeWidth="0.1" />
                                        <line x1="0" y1="-10" x2="0" y2="10" stroke="black" strokeWidth="0.1" />

                                        {/* Eigenvector 1 Line (y=x) */}
                                        <line x1="-8" y1="-8" x2="8" y2="8" stroke="red" strokeWidth="0.1" strokeDasharray="0.5" opacity="0.5" />
                                        {/* Eigenvector 2 Line (y=-2x) */}
                                        <line x1="-4" y1="8" x2="4" y2="-8" stroke="blue" strokeWidth="0.1" strokeDasharray="0.5" opacity="0.5" />

                                        {/* Animated vectors */}
                                        <circle cx="2" cy="2" r="0.3" fill="red">
                                            <animate attributeName="cx" values="1;5;1" dur="4s" repeatCount="indefinite" />
                                            <animate attributeName="cy" values="1;5;1" dur="4s" repeatCount="indefinite" />
                                        </circle>
                                        <line x1="0" y1="0" x2="1" y2="1" stroke="red" strokeWidth="0.3">
                                            <animate attributeName="x2" values="1;5;1" dur="4s" repeatCount="indefinite" />
                                            <animate attributeName="y2" values="1;5;1" dur="4s" repeatCount="indefinite" />
                                        </line>

                                        <circle cx="1" cy="-2" r="0.3" fill="blue">
                                            <animate attributeName="cx" values="1;2;1" dur="4s" repeatCount="indefinite" />
                                            <animate attributeName="cy" values="-2;-4;-2" dur="4s" repeatCount="indefinite" />
                                        </circle>
                                        <line x1="0" y1="0" x2="1" y2="-2" stroke="blue" strokeWidth="0.3">
                                            <animate attributeName="x2" values="1;2;1" dur="4s" repeatCount="indefinite" />
                                            <animate attributeName="y2" values="-2;-4;-2" dur="4s" repeatCount="indefinite" />
                                        </line>

                                        {/* Random vector showing rotation */}
                                        <line x1="0" y1="0" x2="0" y2="3" stroke="gray" strokeWidth="0.2" opacity="0.5">
                                            <animate attributeName="x2" values="0;3;0" dur="4s" repeatCount="indefinite" />
                                            <animate attributeName="y2" values="3;9;3" dur="4s" repeatCount="indefinite" />
                                        </line>

                                    </svg>
                                    <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] bg-white/80 py-1">
                                        <span className="text-red-500 font-bold">λ=5 (Stretch)</span> • <span className="text-blue-600 font-bold">λ=2 (Stretch)</span>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Panel: Instructions & Interactions */}
                    <div className="order-1 md:order-2 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-600">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">{stepData.title}</h2>
                            <p className="text-slate-600 leading-relaxed mb-6">{stepData.description}</p>

                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 font-medium mb-6 flex items-start gap-2">
                                <span className="text-blue-400">💡</span> {stepData.hint}
                            </div>

                            {/* Interaction Areas based on Step Type */}

                            {stepData.type === 'input_diagonal' && (
                                <button onClick={checkDiagonalInput} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition">
                                    Check Equation
                                </button>
                            )}

                            {stepData.type === 'choice' && (
                                <div className="space-y-3">
                                    {stepData.choices.map((choice, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => checkChoice(choice)}
                                            className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition group"
                                        >
                                            <span className="font-mono font-bold text-lg text-slate-700 group-hover:text-blue-700">{choice.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {stepData.type === 'multi_select' && (
                                <div className="grid grid-cols-3 gap-3">
                                    {stepData.options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => toggleOption(opt)}
                                            className={`p-4 rounded-lg border font-bold text-xl transition ${selectedOptions.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {stepData.type === 'verify_matrix' && (
                                <button onClick={checkMatrixValues} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition">
                                    Verify Matrix
                                </button>
                            )}

                            {stepData.type === 'info' && (
                                <button onClick={handleNext} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition">
                                    Start <ArrowRight className="w-4 h-4" />
                                </button>
                            )}

                            {stepData.type === 'visual' && (
                                <button onClick={() => setCurrentStep(0)} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg transition">
                                    <RefreshCw className="w-4 h-4" /> Replay Tutorial
                                </button>
                            )}

                            {feedback && (
                                <div className={`mt-4 p-3 rounded text-sm font-bold animate-pulse ${feedback.includes("Correct") || feedback.includes("Perfect") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {feedback}
                                </div>
                            )}

                        </div>

                        {/* Navigation Controls */}
                        <div className="flex justify-between items-center text-sm text-slate-400">
                            <button onClick={handlePrev} disabled={currentStep === 0} className="flex items-center gap-1 hover:text-slate-600 disabled:opacity-30">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            {/* Forward button usually hidden to enforce interaction, but could be added for debug */}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}