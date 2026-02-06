
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { FunctionSelector } from './components/FunctionSelector';
import { AnimationControls } from './components/AnimationControls';
import { FunctionPlot } from './components/FunctionPlot';
import { ConjugatePlot } from './components/ConjugatePlot';
import { FUNCTIONS } from './lib/functions';
import type { FunctionDefinition } from './types';

const App: React.FC = () => {
  const [selectedFuncKey, setSelectedFuncKey] = useState<string>(Object.keys(FUNCTIONS)[0]);
  const [slope, setSlope] = useState<number>(FUNCTIONS[selectedFuncKey].conjugateDomain[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const animationFrameId = useRef<number | null>(null);

  const selectedFunc = FUNCTIONS[selectedFuncKey];
  const slopeRange = selectedFunc.conjugateDomain;
  const slopeStep = (slopeRange[1] - slopeRange[0]) / 300;

  const animate = useCallback(() => {
    setSlope(prevSlope => {
      let nextSlope = prevSlope + slopeStep;
      if (nextSlope > slopeRange[1]) {
        nextSlope = slopeRange[0];
      }
      return nextSlope;
    });
    animationFrameId.current = requestAnimationFrame(animate);
  }, [slopeRange, slopeStep]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, animate]);
  
  useEffect(() => {
    // Reset slope when function changes
    setSlope(FUNCTIONS[selectedFuncKey].conjugateDomain[0]);
  }, [selectedFuncKey]);

  const x0 = selectedFunc.invDerivative(slope);
  const f_x0 = isFinite(x0) ? selectedFunc.func(x0) : NaN;
  const conjugateValue = isFinite(x0) && isFinite(f_x0) ? slope * x0 - f_x0 : selectedFunc.conjugate(slope);
  const yIntercept = -conjugateValue;

  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 flex flex-col gap-6">
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Select a Function</h2>
              <FunctionSelector
                functions={FUNCTIONS}
                selectedKey={selectedFuncKey}
                onSelect={(key) => {
                  setSelectedFuncKey(key);
                  setIsPlaying(true);
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Animation Controls</h2>
              <AnimationControls
                slope={slope}
                setSlope={setSlope}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                slopeRange={slopeRange}
              />
            </div>
          </div>
          <p className="mt-4 text-slate-400">{selectedFunc.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-4 rounded-xl shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold text-center mb-2">Original Function: <span className="font-mono text-lime-400">f(x)</span></h3>
            <div className="flex-grow">
                <FunctionPlot
                funcDef={selectedFunc}
                slope={slope}
                tangentPointX={x0}
                yIntercept={yIntercept}
                />
            </div>
             <div className="text-center mt-2 text-sm text-slate-400 h-12">
                <p>Tangent point <span className="font-mono text-cyan-400">x₀ ≈ {isFinite(x0) ? x0.toFixed(2) : 'N/A'}</span></p>
                <p>Tangent line: <span className="font-mono text-cyan-400">y = {slope.toFixed(2)}x - {conjugateValue.toFixed(2)}</span></p>
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold text-center mb-2">Conjugate Function: <span className="font-mono text-lime-400">f*(y) = sup(yx - f(x))</span></h3>
            <div className="flex-grow">
                <ConjugatePlot
                funcDef={selectedFunc}
                currentSlope={slope}
                conjugateValue={conjugateValue}
                />
            </div>
            <div className="text-center mt-2 text-sm text-slate-400 h-12">
                <p>Current slope <span className="font-mono text-cyan-400">y ≈ {slope.toFixed(2)}</span></p>
                <p>Conjugate value <span className="font-mono text-cyan-400">f*(y) ≈ {isFinite(conjugateValue) ? conjugateValue.toFixed(2) : '∞'}</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
