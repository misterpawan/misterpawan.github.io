import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';

const OneToOneMappingGame = () => {
    // Game Configuration
    const SET_SIZE = 4;

    // State
    const [stage, setStage] = useState(1); // 1: Create One-to-One, 2: Create Not One-to-One
    const [mappings, setMappings] = useState({}); // { sourceId: targetId }
    const [selectedSource, setSelectedSource] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Generate elements for Set A and Set B
    const setA = Array.from({ length: SET_SIZE }, (_, i) => ({ id: `a-${i}`, label: `A${i + 1}` }));
    const setB = Array.from({ length: SET_SIZE }, (_, i) => ({ id: `b-${i}`, label: `B${i + 1}` }));

    const handleSourceClick = (id) => {
        // If clicking same source, deselect
        if (selectedSource === id) {
            setSelectedSource(null);
            return;
        }
        // If clicking a source that already has a mapping, clear that mapping first
        if (mappings[id]) {
            const newMappings = { ...mappings };
            delete newMappings[id];
            setMappings(newMappings);
        }
        setSelectedSource(id);
        setFeedback(null);
    };

    const handleTargetClick = (targetId) => {
        if (!selectedSource) {
            setFeedback({ type: 'info', message: 'Select an element from Set A first!' });
            return;
        }

        setMappings(prev => ({
            ...prev,
            [selectedSource]: targetId
        }));
        setSelectedSource(null);
        setFeedback(null);
    };

    const resetGame = () => {
        setMappings({});
        setSelectedSource(null);
        setFeedback(null);
        setIsSuccess(false);
    };

    const checkSolution = () => {
        const sourceIds = Object.keys(mappings);
        const targetIds = Object.values(mappings);

        // Check 1: Is it a valid function? (All elements in A must map to something)
        if (sourceIds.length < SET_SIZE) {
            setFeedback({ type: 'error', message: 'In a valid function, every element in Set A must have an arrow!' });
            return;
        }

        // Check 2: Is it One-to-One? (Unique targets)
        const uniqueTargets = new Set(targetIds);
        const isOneToOne = uniqueTargets.size === targetIds.length;

        if (stage === 1) {
            // Goal: Create One-to-One
            if (isOneToOne) {
                setFeedback({ type: 'success', message: 'Correct! Every element in A maps to a unique element in B.' });
                setIsSuccess(true);
            } else {
                setFeedback({ type: 'error', message: 'Incorrect. Multiple elements in A point to the same element in B.' });
            }
        } else {
            // Goal: Create NOT One-to-One
            if (!isOneToOne) {
                setFeedback({ type: 'success', message: 'Correct! You successfully created a "many-to-one" map.' });
                setIsSuccess(true);
            } else {
                setFeedback({ type: 'error', message: 'Incorrect. This is still a one-to-one map. Try making two arrows point to the same target.' });
            }
        }
    };

    const nextStage = () => {
        setStage(2);
        resetGame();
    };

    // SVG Helper to draw lines
    const getLineCoordinates = (sourceIndex, targetId) => {
        if (!targetId) return null;
        const targetIndex = parseInt(targetId.split('-')[1]);

        // Coordinates based on layout
        const startX = 60; // Center of Source Node
        const startY = 40 + (sourceIndex * 60);
        const endX = 240; // Center of Target Node
        const endY = 40 + (targetIndex * 60);

        return { startX, startY, endX, endY };
    };

    return (
        <div className="flex flex-col items-center p-8 bg-slate-50 rounded-xl shadow-lg max-w-2xl mx-auto font-sans">

            {/* Header Section */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Function Mapping Challenge</h2>
                <div className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    Stage {stage}: {stage === 1 ? 'Create a One-to-One Map' : 'Create a Map that is NOT One-to-One'}
                </div>
                <p className="text-slate-600 mt-2 text-sm">
                    {stage === 1
                        ? "Connect every element in Set A to a unique element in Set B."
                        : "Connect every element in A, but make sure at least two point to the same target."}
                </p>
            </div>

            {/* Game Area */}
            <div className="relative flex justify-between w-full max-w-md mb-8">

                {/* SVG Layer for Arrows */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '240px' }}>
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                        </marker>
                    </defs>
                    {setA.map((node, index) => {
                        const targetId = mappings[node.id];
                        if (!targetId) return null;
                        const coords = getLineCoordinates(index, targetId);
                        return (
                            <line
                                key={node.id}
                                x1={coords.startX}
                                y1={coords.startY}
                                x2={coords.endX}
                                y2={coords.endY}
                                stroke="#64748b"
                                strokeWidth="2"
                                markerEnd="url(#arrowhead)"
                            />
                        );
                    })}
                </svg>

                {/* Set A Column */}
                <div className="flex flex-col gap-8 z-10">
                    <h3 className="text-center font-bold text-slate-700">Set A</h3>
                    {setA.map((node) => (
                        <button
                            key={node.id}
                            onClick={() => handleSourceClick(node.id)}
                            className={`
                w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all
                ${selectedSource === node.id ? 'bg-blue-600 ring-4 ring-blue-200 scale-110' : 'bg-blue-500 hover:bg-blue-600'}
                ${mappings[node.id] ? 'opacity-50' : 'opacity-100'}
              `}
                        >
                            {node.label}
                        </button>
                    ))}
                </div>

                {/* Set B Column */}
                <div className="flex flex-col gap-8 z-10">
                    <h3 className="text-center font-bold text-slate-700">Set B</h3>
                    {setB.map((node) => (
                        <button
                            key={node.id}
                            onClick={() => handleTargetClick(node.id)}
                            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white font-bold transition-all"
                        >
                            {node.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Controls & Feedback */}
            <div className="w-full max-w-md space-y-4">
                {feedback && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-100 text-green-800' :
                            feedback.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {feedback.type === 'success' ? <CheckCircle size={20} /> :
                            feedback.type === 'error' ? <XCircle size={20} /> : <ArrowRight size={20} />}
                        <span className="text-sm font-medium">{feedback.message}</span>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={resetGame}
                        className="flex-1 px-4 py-2 border-2 border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={18} /> Reset
                    </button>

                    {!isSuccess ? (
                        <button
                            onClick={checkSolution}
                            className="flex-2 w-full px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold"
                        >
                            Check Answer
                        </button>
                    ) : stage === 1 ? (
                        <button
                            onClick={nextStage}
                            className="flex-2 w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold animate-pulse"
                        >
                            Next Challenge →
                        </button>
                    ) : (
                        <div className="flex-2 w-full text-center px-6 py-2 font-bold text-green-600">
                            Lesson Complete! 🎉
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default OneToOneMappingGame;
