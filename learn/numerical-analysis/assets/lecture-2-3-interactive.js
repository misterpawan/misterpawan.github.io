const { useState, useEffect, useMemo } = React;
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } = Recharts;

const DerivativeDemo = () => {
    const [data, setData] = useState([]);

    // Slide 5 Function: f(x) = x^2 + exp(x) + log(x) + sin(x)
    // f'(x) = 2x + exp(x) + 1/x + cos(x)
    const x = 0.5;
    const exact = 2 * x + Math.exp(x) + 1 / x + Math.cos(x);

    useEffect(() => {
        const newData = [];
        for (let i = 1; i <= 15; i++) {
            const h = Math.pow(10, -i);
            // Function evaluation
            const f = (v) => Math.pow(v, 2) + Math.exp(v) + Math.log(v) + Math.sin(v);

            // Forward Diff
            const fwd = (f(x + h) - f(x)) / h;
            const fwdErr = Math.abs(fwd - exact);

            // Central Diff
            const cen = (f(x + h / 2) - f(x - h / 2)) / h;
            const cenErr = Math.abs(cen - exact);

            newData.push({
                logH: -i,
                h: h,
                fwdErr: Math.max(fwdErr, 1e-16),
                cenErr: Math.max(cenErr, 1e-16)
            });
        }
        setData(newData);
    }, []);

    return (
        <div className="bg-white p-4 rounded border shadow-sm mt-4">
            <h4 className="font-bold text-center mb-2">Interactive: Derivative Error V-Curve</h4>
            <p className="text-xs text-center text-slate-500 mb-4">Calculated for $f(x) = x^2 + e^x + \ln(x) + \sin(x)$ at $x=0.5$</p>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="logH" label={{ value: 'Log10(h)', position: 'insideBottom', offset: -5 }} />
                        <YAxis scale="log" domain={['auto', 'auto']} label={{ value: 'Error', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => value.toExponential(2)} labelFormatter={(v) => `h = 10^${v}`} />
                        <Legend />
                        <Line type="monotone" dataKey="fwdErr" stroke="#ef4444" name="Forward Diff" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="cenErr" stroke="#3b82f6" name="Central Diff" strokeWidth={2} dot={{ r: 3 }} />
                        <ReferenceLine x={-8} stroke="red" strokeDasharray="3 3" label="Fwd Limit" />
                        <ReferenceLine x={-5} stroke="blue" strokeDasharray="3 3" label="Cen Limit" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('derivative-demo'));
root.render(<DerivativeDemo />);



const FUNCTIONS = {
    sin: {
        label: "f(x) = sin(x)",
        fn: (x) => Math.sin(x),
        antiderivative: (x) => -Math.cos(x),
        defaultRange: [0, Math.PI]
    },
    x2: {
        label: "f(x) = x²",
        fn: (x) => x * x,
        antiderivative: (x) => (x * x * x) / 3,
        defaultRange: [0, 2]
    },
    exp: {
        label: "f(x) = exp(x/2)",
        fn: (x) => Math.exp(x / 2),
        antiderivative: (x) => 2 * Math.exp(x / 2),
        defaultRange: [0, 3]
    },
    xsinx: {
        label: "f(x) = x · sin(x)",
        fn: (x) => x * Math.sin(x),
        antiderivative: (x) => Math.sin(x) - x * Math.cos(x),
        defaultRange: [0, 4]
    },
    poly: {
        label: "f(x) = -x² + 4x",
        fn: (x) => -Math.pow(x, 2) + 4 * x,
        antiderivative: (x) => -Math.pow(x, 3) / 3 + 2 * Math.pow(x, 2),
        defaultRange: [0, 4]
    }
};

const TrapezoidalApp = () => {
    const [selectedFunc, setSelectedFunc] = useState('sin');
    const [a, setA] = useState(0);
    const [b, setB] = useState(Math.PI);
    const [n, setN] = useState(4);
    const containerRef = React.useRef(null);

    const currentFunc = FUNCTIONS[selectedFunc];
    const h = (b - a) / n;

    const exactValue = currentFunc.antiderivative(b) - currentFunc.antiderivative(a);

    let trapSum = currentFunc.fn(a) + currentFunc.fn(b);
    for (let i = 1; i < n; i++) {
        trapSum += 2 * currentFunc.fn(a + i * h);
    }
    const approxValue = (h / 2) * trapSum;

    const error = Math.abs(exactValue - approxValue);

    const width = 600;
    const height = 300;
    const padding = 40;

    const samplePoints = [];
    const steps = 100;
    let minY = Infinity, maxY = -Infinity;

    for (let i = 0; i <= steps; i++) {
        const x = a + (b - a) * (i / steps);
        const y = currentFunc.fn(x);
        samplePoints.push({ x, y });
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    const yRange = maxY - minY;
    const yMinGraph = Math.min(0, minY - yRange * 0.1);
    const yMaxGraph = maxY + yRange * 0.1;

    const mapX = (val) => padding + ((val - a) / (b - a)) * (width - 2 * padding);
    const mapY = (val) => height - padding - ((val - yMinGraph) / (yMaxGraph - yMinGraph)) * (height - 2 * padding);

    let curvePath = `M ${mapX(samplePoints[0].x)} ${mapY(samplePoints[0].y)}`;
    samplePoints.forEach(p => {
        curvePath += ` L ${mapX(p.x)} ${mapY(p.y)}`;
    });
    const areaPath = curvePath + ` L ${mapX(b)} ${mapY(0)} L ${mapX(a)} ${mapY(0)} Z`;

    const trapezoids = [];
    const errorShapes = [];

    for (let i = 0; i < n; i++) {
        const x1 = a + i * h;
        const x2 = a + (i + 1) * h;
        const y1 = currentFunc.fn(x1);
        const y2 = currentFunc.fn(x2);

        const mx1 = mapX(x1);
        const mx2 = mapX(x2);
        const my1 = mapY(y1);
        const my2 = mapY(y2);
        const mBase1 = mapY(0);
        const mBase2 = mapY(0);

        trapezoids.push(
            <polygon
                key={`trap-${i}`}
                points={`${mx1},${mBase1} ${mx1},${my1} ${mx2},${my2} ${mx2},${mBase2}`}
                fill="none"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4"
            />
        );

        let errPath = `M ${mx1} ${my1} L ${mx2} ${my2}`;

        const subSteps = 10;
        for (let j = subSteps; j >= 0; j--) {
            const subX = x1 + (x2 - x1) * (j / subSteps);
            const subY = currentFunc.fn(subX);
            errPath += ` L ${mapX(subX)} ${mapY(subY)}`;
        }
        errPath += " Z";

        errorShapes.push(
            <path
                key={`err-${i}`}
                d={errPath}
                fill="rgba(239, 68, 68, 0.6)"
                stroke="none"
            />
        );
    }

    const handleFuncChange = (e) => {
        const key = e.target.value;
        setSelectedFunc(key);
        setA(FUNCTIONS[key].defaultRange[0]);
        setB(FUNCTIONS[key].defaultRange[1]);
    };

    // Re-run MathJax/KaTeX when content updates
    useEffect(() => {
        if (window.renderMathInElement && containerRef.current) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ]
            });
        }
    }, [selectedFunc, n, a, b]);

    return (
        <div ref={containerRef} className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h1 className="text-xl font-bold text-slate-800 mb-2">Trapezoidal Rule Visualization</h1>
            <p className="text-sm text-slate-600 mb-6">
                Explore how the step size ($h$) affects the approximation error.
                <br />
                <span className="inline-block w-3 h-3 bg-blue-100 border border-blue-300 mr-1"></span> Actual Area
                <span className="inline-block w-3 h-3 bg-red-400 opacity-60 ml-3 mr-1"></span> Error
                <span className="inline-block w-3 h-3 border border-slate-600 border-dashed ml-3 mr-1"></span> Trapezoids
            </p>

            <div className="grid md:grid-cols-3 gap-6">

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-fit">
                    <h2 className="font-bold text-slate-700 mb-4 border-b pb-2 text-sm">Controls</h2>

                    <div className="mb-4">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Function</label>
                        <select
                            value={selectedFunc}
                            onChange={handleFuncChange}
                            className="w-full p-2 border rounded bg-white text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {Object.entries(FUNCTIONS).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Step Size (h) Control
                        </label>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>N = {n}</span>
                            <span>h ≈ {h.toFixed(4)}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            step="1"
                            value={n}
                            onChange={(e) => setN(parseInt(e.target.value))}
                            className="slider w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-500">Start (a)</label>
                            <input type="number" value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="w-full p-1 border rounded text-xs" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500">End (b)</label>
                            <input type="number" value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="w-full p-1 border rounded text-xs" />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="canvas-container bg-white border rounded-lg overflow-hidden relative">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                            <line x1={padding} y1={mapY(0)} x2={width - padding} y2={mapY(0)} stroke="#cbd5e1" strokeWidth="2" />
                            <line x1={mapX(0)} y1={height - padding} x2={mapX(0)} y2={padding} stroke="#cbd5e1" strokeWidth="2" />

                            <path d={areaPath} fill="#dbeafe" stroke="none" />
                            {errorShapes}
                            <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2" />
                            {trapezoids}

                            {Array.from({ length: n + 1 }).map((_, i) => {
                                const px = mapX(a + i * h);
                                const py = mapY(currentFunc.fn(a + i * h));
                                return <circle key={i} cx={px} cy={py} r="3" fill="#1e293b" />
                            })}

                            <text x={mapX(a)} y={height - 10} textAnchor="middle" className="text-xs fill-slate-500">a</text>
                            <text x={mapX(b)} y={height - 10} textAnchor="middle" className="text-xs fill-slate-500">b</text>
                        </svg>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                            <div className="text-[10px] text-blue-600 uppercase font-bold">Actual</div>
                            <div className="text-sm font-mono text-slate-800">{exactValue.toFixed(5)}</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                            <div className="text-[10px] text-slate-600 uppercase font-bold">Trapz</div>
                            <div className="text-sm font-mono text-slate-800">{approxValue.toFixed(5)}</div>
                        </div>
                        <div className="bg-red-50 p-2 rounded border border-red-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                            <div className="text-[10px] text-red-600 uppercase font-bold">Error</div>
                            <div className="text-sm font-mono text-red-700">{error.toFixed(5)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const rootTrap = ReactDOM.createRoot(document.getElementById('trapezoidal-root'));
rootTrap.render(<TrapezoidalApp />);



// --- Math Functions for Simpson ---
const SIMPSON_FUNCTIONS = {
    sin: {
        label: "f(x) = sin(x)",
        fn: (x) => Math.sin(x),
        antiderivative: (x) => -Math.cos(x),
        defaultRange: [0, Math.PI],
        desc: "Sine wave (smooth, periodic)"
    },
    x3: {
        label: "f(x) = x³ (Cubic)",
        fn: (x) => x * x * x,
        antiderivative: (x) => (x * x * x * x) / 4,
        defaultRange: [-2, 2],
        desc: "Simpson's rule is exact for polynomials up to degree 3!"
    },
    exp: {
        label: "f(x) = exp(x/2)",
        fn: (x) => Math.exp(x / 2),
        antiderivative: (x) => 2 * Math.exp(x / 2),
        defaultRange: [0, 4],
        desc: "Exponential growth"
    },
    humps: {
        label: "f(x) = sin(x) + sin(3x)/2",
        fn: (x) => Math.sin(x) + Math.sin(3 * x) / 2,
        antiderivative: (x) => -Math.cos(x) - Math.cos(3 * x) / 6,
        defaultRange: [0, 2 * Math.PI],
        desc: "Complex wave with multiple inflections"
    },
    poly: {
        label: "f(x) = (x-2)² + 1",
        fn: (x) => Math.pow(x - 2, 2) + 1,
        antiderivative: (x) => Math.pow(x - 2, 3) / 3 + x,
        defaultRange: [0, 4],
        desc: "Parabola (Simpson's should be perfect)"
    }
};

const SimpsonsApp = () => {
    const [selectedFunc, setSelectedFunc] = useState('sin');
    const [a, setA] = useState(0);
    const [b, setB] = useState(Math.PI);
    const [n, setN] = useState(4);
    const containerRef = React.useRef(null);

    const currentFunc = SIMPSON_FUNCTIONS[selectedFunc];
    const h = (b - a) / n;

    const exactValue = currentFunc.antiderivative(b) - currentFunc.antiderivative(a);

    let simpsonSum = currentFunc.fn(a) + currentFunc.fn(b);

    for (let i = 1; i < n; i++) {
        const x = a + i * h;
        const coeff = (i % 2 === 0) ? 2 : 4;
        simpsonSum += coeff * currentFunc.fn(x);
    }
    const approxValue = (h / 3) * simpsonSum;
    const error = Math.abs(exactValue - approxValue);

    const width = 800;
    const height = 400;
    const padding = 50;

    const steps = 200;
    let minY = Infinity, maxY = -Infinity;
    const points = [];
    for (let i = 0; i <= steps; i++) {
        const x = a + (b - a) * (i / steps);
        const y = currentFunc.fn(x);
        points.push({ x, y });
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    const yRange = maxY - minY;
    const yMinGraph = Math.min(0, minY - yRange * 0.1);
    const yMaxGraph = maxY + yRange * 0.1;

    const mapX = (val) => padding + ((val - a) / (b - a)) * (width - 2 * padding);
    const mapY = (val) => height - padding - ((val - yMinGraph) / (yMaxGraph - yMinGraph)) * (height - 2 * padding);

    let curvePath = `M ${mapX(points[0].x)} ${mapY(points[0].y)}`;
    points.forEach(p => curvePath += ` L ${mapX(p.x)} ${mapY(p.y)}`);

    const areaPath = curvePath + ` L ${mapX(b)} ${mapY(0)} L ${mapX(a)} ${mapY(0)} Z`;

    const parabolaPaths = [];
    const errorPaths = [];
    const segments = n / 2;

    for (let i = 0; i < segments; i++) {
        const idx = i * 2;
        const x0 = a + idx * h;
        const x1 = a + (idx + 1) * h;
        const x2 = a + (idx + 2) * h;
        const y0 = currentFunc.fn(x0);
        const y1 = currentFunc.fn(x1);
        const y2 = currentFunc.fn(x2);

        const C = y0;
        const A = (y2 - 2 * y1 + y0) / (2 * h * h);
        const B = (y1 - y0 - A * h * h) / h;

        const segSteps = 20;
        let segPathD = "";

        const startX = mapX(x0);
        const startY = mapY(y0);
        segPathD += `M ${startX} ${startY}`;

        let errPointsCurve = [];
        let errPointsPara = [];

        for (let j = 0; j <= segSteps; j++) {
            const localX = (j / segSteps) * (2 * h);
            const realX = x0 + localX;
            const paraY = A * localX * localX + B * localX + C;
            const curveY = currentFunc.fn(realX);

            const screenX = mapX(realX);
            const screenYPara = mapY(paraY);
            const screenYCurve = mapY(curveY);

            segPathD += ` L ${screenX} ${screenYPara}`;

            errPointsCurve.push({ x: screenX, y: screenYCurve });
            errPointsPara.push({ x: screenX, y: screenYPara });
        }

        const polyPath = segPathD + ` L ${mapX(x2)} ${mapY(0)} L ${mapX(x0)} ${mapY(0)} Z`;

        parabolaPaths.push(
            <path key={`para-${i}`} d={polyPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />
        );

        let dErr = `M ${errPointsCurve[0].x} ${errPointsCurve[0].y}`;
        errPointsCurve.forEach(p => dErr += ` L ${p.x} ${p.y}`);
        for (let k = errPointsPara.length - 1; k >= 0; k--) {
            dErr += ` L ${errPointsPara[k].x} ${errPointsPara[k].y}`;
        }
        dErr += " Z";

        errorPaths.push(
            <path key={`err-${i}`} d={dErr} fill="rgba(239, 68, 68, 0.5)" stroke="none" />
        );
    }

    const handleNChange = (e) => {
        let val = parseInt(e.target.value);
        if (val % 2 !== 0) val += 1;
        setN(val);
    };

    // MathJax Effect
    useEffect(() => {
        if (window.renderMathInElement && containerRef.current) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ]
            });
        }
    }, [selectedFunc, n, a, b]);

    return (
        <div ref={containerRef} className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden mb-8 border border-slate-200">
            <div className="bg-slate-900 text-white p-6">
                <h1 className="text-3xl font-bold mb-2">Simpson's Rule Visualizer</h1>
                <p className="text-slate-300 text-sm font-mono">
                    {'$\\int f(x) dx \\approx \\frac{h}{3} [f(a) + 4f(a+h) + 2f(a+2h) + \\dots + f(b)]$'}
                </p>
            </div>

            <div className="grid lg:grid-cols-3">
                <div className="p-6 bg-slate-50 border-r border-slate-200">
                    <h2 className="font-bold text-slate-700 mb-4 border-b pb-2 text-sm">Settings</h2>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-600 mb-2">Target Function</label>
                        <div className="space-y-2">
                            {Object.entries(SIMPSON_FUNCTIONS).map(([key, obj]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setSelectedFunc(key);
                                        setA(obj.defaultRange[0]);
                                        setB(obj.defaultRange[1]);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${selectedFunc === key
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
                                        }`}
                                >
                                    <div className="font-bold">{obj.label}</div>
                                    <div className={`text-xs ${selectedFunc === key ? 'text-blue-200' : 'text-slate-400'}`}>{obj.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Intervals (N): <span className="text-blue-600 text-lg">{n}</span>
                        </label>
                        <p className="text-[10px] text-slate-400 mb-3">*Must be even for Simpson's 1/3 Rule</p>
                        <input
                            type="range" min="2" max="30" step="2"
                            value={n} onChange={handleNChange}
                            className="slider w-full mb-2"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>2 (1 parabola)</span>
                            <span>30 (15 parabolas)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Start (a)</label>
                            <input type="number" value={a} onChange={e => setA(parseFloat(e.target.value))}
                                className="w-full p-2 border rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">End (b)</label>
                            <input type="number" value={b} onChange={e => setB(parseFloat(e.target.value))}
                                className="w-full p-2 border rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 p-6">
                    <div className="flex flex-wrap gap-4 mb-4 text-xs justify-center">
                        <div className="flex items-center"><span className="w-3 h-3 bg-blue-100 border border-blue-400 mr-2"></span> Exact Area</div>
                        <div className="flex items-center"><span className="w-3 h-3 border-b-2 border-amber-500 border-dashed mr-2"></span> Parabolic Approx</div>
                        <div className="flex items-center"><span className="w-3 h-3 bg-red-500 opacity-50 mr-2"></span> Error Region</div>
                    </div>

                    <div className="canvas-container bg-white border border-slate-200 rounded-lg relative mb-6">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                            <line x1={padding} y1={mapY(0)} x2={width - padding} y2={mapY(0)} stroke="#e2e8f0" strokeWidth="2" />
                            <line x1={mapX(0)} y1={height - padding} x2={mapX(0)} y2={padding} stroke="#e2e8f0" strokeWidth="2" />

                            <path d={areaPath} fill="#eff6ff" stroke="none" />
                            {errorPaths}
                            {parabolaPaths}
                            <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2" />

                            {Array.from({ length: n + 1 }).map((_, i) => {
                                const px = mapX(a + i * h);
                                const py = mapY(currentFunc.fn(a + i * h));
                                return <circle key={i} cx={px} cy={py} r="3" fill="#1e293b" />
                            })}

                            <text x={mapX(a)} y={height - 10} textAnchor="middle" className="text-xs fill-slate-500">a</text>
                            <text x={mapX(b)} y={height - 10} textAnchor="middle" className="text-xs fill-slate-500">b</text>
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Exact Value</div>
                            <div className="text-sm font-mono text-slate-800">{exactValue.toFixed(8)}</div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-center">
                            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Simpson's Approx</div>
                            <div className="text-sm font-mono text-slate-800">{approxValue.toFixed(8)}</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                            <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Abs Error</div>
                            <div className="text-sm font-mono text-red-700">{error.toExponential(4)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const rootSimp = ReactDOM.createRoot(document.getElementById('simpson-root'));
rootSimp.render(<SimpsonsApp />);



// --- Math Functions ---
const GAUSS_FUNCTIONS = {
    poly3: {
        label: "f(x) = x³ - x + 1",
        fn: (x) => Math.pow(x, 3) - x + 1,
        antiderivative: (x) => Math.pow(x, 4) / 4 - Math.pow(x, 2) / 2 + x,
        defaultRange: [-1, 2],
        desc: "Polynomial degree 3 (Exact for 2-point rule)"
    },
    poly5: {
        label: "f(x) = x⁵ - 2x³ + x",
        fn: (x) => Math.pow(x, 5) - 2 * Math.pow(x, 3) + x,
        antiderivative: (x) => Math.pow(x, 6) / 6 - 2 * Math.pow(x, 4) / 4 + Math.pow(x, 2) / 2,
        defaultRange: [-1.5, 1.5],
        desc: "Polynomial degree 5 (Exact for 3-point rule)"
    },
    exp: {
        label: "f(x) = e^x",
        fn: (x) => Math.exp(x),
        antiderivative: (x) => Math.exp(x),
        defaultRange: [0, 2],
        desc: "Exponential (Not a polynomial, approximate)"
    },
    cos: {
        label: "f(x) = cos(x) + 1.5",
        fn: (x) => Math.cos(x) + 1.5,
        antiderivative: (x) => Math.sin(x) + 1.5 * x,
        defaultRange: [0, Math.PI],
        desc: "Trigonometric"
    }
};

// --- Gauss-Legendre Constants ---
const GAUSS_DATA = {
    2: {
        points: [-1 / Math.sqrt(3), 1 / Math.sqrt(3)],
        weights: [1, 1],
        exactDegree: 3
    },
    3: {
        points: [-Math.sqrt(3 / 5), 0, Math.sqrt(3 / 5)],
        weights: [5 / 9, 8 / 9, 5 / 9],
        exactDegree: 5
    }
};

const GaussApp = () => {
    const [selectedFunc, setSelectedFunc] = useState('poly3');
    const [a, setA] = useState(-1);
    const [b, setB] = useState(2);
    const [pointsN, setPointsN] = useState(2); // 2 or 3
    const containerRef = React.useRef(null);

    const currentFunc = GAUSS_FUNCTIONS[selectedFunc];
    const gaussConfig = GAUSS_DATA[pointsN];

    // --- Numerical Calculations ---
    const exactValue = currentFunc.antiderivative(b) - currentFunc.antiderivative(a);

    const transformX = (xi) => ((b - a) / 2) * xi + (a + b) / 2;
    const jacobian = (b - a) / 2;

    let gaussSum = 0;
    const samplePoints = [];

    for (let i = 0; i < pointsN; i++) {
        const xi = gaussConfig.points[i];
        const wi = gaussConfig.weights[i];

        const realX = transformX(xi);
        const val = currentFunc.fn(realX);

        gaussSum += wi * val;

        samplePoints.push({
            xi: xi,
            realX: realX,
            weight: wi,
            val: val
        });
    }
    const approxValue = jacobian * gaussSum;
    const error = Math.abs(exactValue - approxValue);

    // --- Visualization Logic ---
    const width = 800;
    const height = 400;
    const padding = 60;

    const steps = 200;
    let minY = Infinity, maxY = -Infinity;
    const curvePoints = [];

    const plotMin = Math.min(a, a - (b - a) * 0.1);
    const plotMax = Math.max(b, b + (b - a) * 0.1);

    for (let i = 0; i <= steps; i++) {
        const x = plotMin + (plotMax - plotMin) * (i / steps);
        const y = currentFunc.fn(x);
        curvePoints.push({ x, y });
        if (x >= a && x <= b) {
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    const yRange = maxY - minY || 1;
    const yMinGraph = Math.min(0, minY - yRange * 0.2);
    const yMaxGraph = maxY + yRange * 0.2;

    const mapX = (val) => padding + ((val - plotMin) / (plotMax - plotMin)) * (width - 2 * padding);
    const mapY = (val) => height - padding - ((val - yMinGraph) / (yMaxGraph - yMinGraph)) * (height - 2 * padding);

    let curvePathD = `M ${mapX(curvePoints[0].x)} ${mapY(curvePoints[0].y)}`;
    curvePoints.forEach(p => curvePathD += ` L ${mapX(p.x)} ${mapY(p.y)}`);

    const areaPoints = curvePoints.filter(p => p.x >= a && p.x <= b);
    let areaPathD = "";
    if (areaPoints.length > 0) {
        areaPathD = `M ${mapX(areaPoints[0].x)} ${mapY(areaPoints[0].y)}`;
        areaPoints.forEach(p => areaPathD += ` L ${mapX(p.x)} ${mapY(p.y)}`);
        areaPathD += ` L ${mapX(areaPoints[areaPoints.length - 1].x)} ${mapY(0)} L ${mapX(areaPoints[0].x)} ${mapY(0)} Z`;
    }

    // MathJax Effect
    useEffect(() => {
        if (window.renderMathInElement && containerRef.current) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ]
            });
        }
    }, [selectedFunc, pointsN, a, b]);

    return (
        <div ref={containerRef} className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden font-sans border border-slate-200 mb-8">
            <div className="bg-emerald-900 text-white p-6">
                <h1 className="text-3xl font-bold mb-2">Gaussian Quadrature Visualizer</h1>
                <p className="text-emerald-100 text-sm font-mono opacity-90">
                    {'$\\int f(x) dx \\approx \\frac{b-a}{2} \\sum w_i f(x_i)$'}
                </p>
            </div>

            <div className="grid lg:grid-cols-3">

                <div className="p-6 bg-emerald-50 border-r border-emerald-100">

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-emerald-800 mb-2">Number of Points (n)</label>
                        <div className="flex gap-2">
                            {[2, 3].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setPointsN(num)}
                                    className={`flex-1 py-2 rounded font-bold transition-all ${pointsN === num
                                        ? 'bg-emerald-600 text-white shadow-lg transform scale-105'
                                        : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                                        }`}
                                >
                                    {num} Points
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-emerald-600 mt-2">
                            Exact for polynomials degree ≤ {gaussConfig.exactDegree}
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-emerald-800 mb-2">Function</label>
                        <div className="space-y-2">
                            {Object.entries(GAUSS_FUNCTIONS).map(([key, obj]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setSelectedFunc(key);
                                        setA(obj.defaultRange[0]);
                                        setB(obj.defaultRange[1]);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm border transition-all ${selectedFunc === key
                                        ? 'bg-white border-emerald-500 ring-2 ring-emerald-200'
                                        : 'bg-white border-emerald-100 hover:bg-emerald-100'
                                        }`}
                                >
                                    <div className="font-bold text-slate-700">{obj.label}</div>
                                    <div className="text-xs text-slate-500">{obj.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-emerald-800 mb-1">Start (a)</label>
                            <input type="number" value={a} onChange={e => setA(parseFloat(e.target.value))}
                                className="w-full p-2 border border-emerald-200 rounded text-xs focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-800 mb-1">End (b)</label>
                            <input type="number" value={b} onChange={e => setB(parseFloat(e.target.value))}
                                className="w-full p-2 border border-emerald-200 rounded text-xs focus:outline-none focus:border-emerald-500" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 p-6 bg-white">

                    <div className="flex justify-center gap-6 mb-4 text-xs font-semibold text-slate-600">
                        <div className="flex items-center"><span className="w-3 h-3 bg-emerald-100 border border-emerald-400 mr-2"></span> Exact Area</div>
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Gauss Point ($x_i$)</div>
                        <div className="flex items-center"><span className="w-3 h-3 border border-red-400 border-dashed mr-2"></span> Weighted Contrib</div>
                    </div>

                    <div className="canvas-container bg-white border border-slate-200 rounded-lg relative mb-6">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                            <line x1={padding} y1={mapY(0)} x2={width - padding} y2={mapY(0)} stroke="#e2e8f0" strokeWidth="2" />
                            <line x1={mapX(0)} y1={height - padding} x2={mapX(0)} y2={padding} stroke="#e2e8f0" strokeWidth="2" />

                            <path d={areaPathD} fill="#d1fae5" stroke="none" />
                            <path d={curvePathD} fill="none" stroke="#059669" strokeWidth="3" />

                            <line x1={mapX(a)} y1={mapY(0)} x2={mapX(a)} y2={mapY(currentFunc.fn(a))} stroke="#94a3b8" strokeDasharray="4" />
                            <line x1={mapX(b)} y1={mapY(0)} x2={mapX(b)} y2={mapY(currentFunc.fn(b))} stroke="#94a3b8" strokeDasharray="4" />

                            {samplePoints.map((pt, i) => {
                                const px = mapX(pt.realX);
                                const py = mapY(pt.val);
                                const pBase = mapY(0);

                                return (
                                    <g key={i}>
                                        <line x1={px} y1={py} x2={px} y2={pBase} stroke="#ef4444" strokeWidth="2" strokeDasharray="2,2" />
                                        <circle cx={px} cy={py} r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
                                        <text x={px} y={py - 10} textAnchor="middle" className="text-xs fill-red-600 font-bold">
                                            w={pt.weight.toFixed(2)}
                                        </text>
                                    </g>
                                );
                            })}

                            <text x={mapX(a)} y={height - 20} textAnchor="middle" className="text-xs fill-slate-500 font-bold">a={a}</text>
                            <text x={mapX(b)} y={height - 20} textAnchor="middle" className="text-xs fill-slate-500 font-bold">b={b}</text>
                        </svg>
                    </div>

                    <div className="bg-slate-50 p-4 rounded border border-slate-200 text-sm font-mono text-slate-700 mb-6 overflow-x-auto">
                        <p className="font-bold text-slate-500 mb-2">Coordinate Transformation:</p>
                        <p className="text-xs">x_real = {((b - a) / 2).toFixed(2)} * ξ + {((a + b) / 2).toFixed(2)}</p>
                        <p className="text-xs truncate">Area ≈ {((b - a) / 2).toFixed(2)} * [{" "}
                            {samplePoints.map((pt, i) => (
                                <span key={i} className="text-red-600">
                                    ({pt.weight.toFixed(2)} * {pt.val.toFixed(2)})
                                    {i < samplePoints.length - 1 ? " + " : ""}
                                </span>
                            ))}
                            {" "}]</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-50 p-4 rounded border border-emerald-100 text-center">
                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Exact</div>
                            <div className="text-sm font-bold text-slate-800">{exactValue.toFixed(8)}</div>
                        </div>
                        <div className="bg-white p-4 rounded border border-slate-200 text-center shadow-sm">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gaussian Approx</div>
                            <div className="text-sm font-bold text-slate-800">{approxValue.toFixed(8)}</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded border border-red-100 text-center relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                            <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Error</div>
                            <div className="text-sm font-bold text-red-700">{error.toExponential(4)}</div>
                        </div>
                    </div>

                    <p className="mt-4 text-[10px] text-center text-slate-400">
                        *Note: For polynomial functions of degree ≤ 2n-1, the error should be near zero (machine epsilon).
                    </p>

                </div>
            </div>
        </div>
    );
};

const rootGauss = ReactDOM.createRoot(document.getElementById('gaussian-root'));
rootGauss.render(<GaussApp />);
