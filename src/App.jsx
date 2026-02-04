import React, { useState, useEffect } from 'react';
import { Info, Play, Pause, RotateCcw, Droplet } from 'lucide-react';

const PathogenEvolutionVisualizer = () => {
  // Force sliders (0-100 scale)
  const [mutation, setMutation] = useState(30);
  const [selection, setSelection] = useState(40);
  const [geneFlow, setGeneFlow] = useState(20);
  const [drift, setDrift] = useState(25);
  const [recombination, setRecombination] = useState(15);
  
  // Pathogen-specific parameters
  const [popSize, setPopSize] = useState(50);
  const [generationTime, setGenerationTime] = useState(50);
  const [pathogenType, setPathogenType] = useState('influenza');
  
  // Simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [alleleFreq, setAlleleFreq] = useState(0.5);
  const [time, setTime] = useState(0);
  const [history, setHistory] = useState([0.5]);
  
  // View mode
  const [viewMode, setViewMode] = useState('color');

  // Pathogen presets
  const pathogenPresets = {
    influenza: {
      name: 'Influenza A (Antigenic Drift)',
      mutation: 60,
      selection: 70,
      geneFlow: 65,
      drift: 35,
      recombination: 80,
      popSize: 40,
      generationTime: 60,
      description: 'High mutation, strong selection, global gene flow, reassortment'
    },
    hiv: {
      name: 'HIV (Within-Host)',
      mutation: 70,
      selection: 85,
      geneFlow: 10,
      drift: 20,
      recombination: 30,
      popSize: 80,
      generationTime: 90,
      description: 'Very high mutation, strong selection, large Ne, bottlenecks at transmission'
    },
    bacteria: {
      name: 'Bacterial Pathogen',
      mutation: 20,
      selection: 50,
      geneFlow: 40,
      drift: 40,
      recombination: 60,
      popSize: 60,
      generationTime: 40,
      description: 'Moderate mutation, horizontal gene transfer, variable recombination'
    },
    fungal: {
      name: 'Fungal Pathogen (Mixed)',
      mutation: 25,
      selection: 55,
      geneFlow: 50,
      drift: 45,
      recombination: 70,
      popSize: 50,
      generationTime: 30,
      description: 'Mixed sexual/asexual, spore dispersal, seasonal cycles'
    }
  };

  // Apply pathogen preset
  const applyPreset = (type) => {
    const preset = pathogenPresets[type];
    setMutation(preset.mutation);
    setSelection(preset.selection);
    setGeneFlow(preset.geneFlow);
    setDrift(preset.drift);
    setRecombination(preset.recombination);
    setPopSize(preset.popSize);
    setGenerationTime(preset.generationTime);
    setPathogenType(type);
  };

  // Calculate color from forces
  const calculateColor = () => {
    const r = Math.round((mutation / 100) * 255);
    const g = Math.round((selection / 100) * 255);
    const b = Math.round((geneFlow / 100) * 255);
    const alpha = 1 - (drift / 200);
    
    return { r, g, b, alpha };
  };

  // Calculate evolutionary trajectory
  const calculateDeltaP = (p) => {
    const mutationEffect = (mutation / 100 - 0.5) * 0.05;
    const selectionEffect = (selection / 100 - 0.5) * 0.15 * p * (1 - p);
    const geneFlowEffect = (geneFlow / 100 - p) * 0.08;
    const driftEffect = (Math.random() - 0.5) * (drift / 100) * Math.sqrt(p * (1 - p)) * (1 / Math.sqrt(popSize / 50));
    const recombEffect = (recombination / 100) * 0.03 * (Math.random() - 0.5);
    
    return mutationEffect + selectionEffect + geneFlowEffect + driftEffect + recombEffect;
  };

  // Simulation loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const speed = generationTime / 50;
    const interval = setInterval(() => {
      setAlleleFreq(prev => {
        let newFreq = prev + calculateDeltaP(prev);
        newFreq = Math.max(0.01, Math.min(0.99, newFreq));
        
        setHistory(h => {
          const newHistory = [...h, newFreq];
          return newHistory.slice(-100);
        });
        
        return newFreq;
      });
      
      setTime(t => t + 1);
    }, 100 / speed);
    
    return () => clearInterval(interval);
  }, [isPlaying, mutation, selection, geneFlow, drift, recombination, popSize, generationTime]);

  const reset = () => {
    setAlleleFreq(0.5);
    setTime(0);
    setHistory([0.5]);
    setIsPlaying(false);
  };

  const color = calculateColor();
  const bgColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.alpha})`;
  
  // Calculate relative force strengths
  const totalForce = mutation + selection + geneFlow + drift + recombination;
  const forcePercentages = {
    mutation: (mutation / totalForce * 100).toFixed(1),
    selection: (selection / totalForce * 100).toFixed(1),
    geneFlow: (geneFlow / totalForce * 100).toFixed(1),
    drift: (drift / totalForce * 100).toFixed(1),
    recombination: (recombination / totalForce * 100).toFixed(1)
  };

  // Calculate 2NeS
  const effectivePopSize = (popSize / 50) * 10000;
  const selectionCoeff = (selection / 100 - 0.5) * 0.3;
  const twoNeS = Math.abs(2 * effectivePopSize * selectionCoeff);
  const selectionRegime = twoNeS > 10 ? 'Selection dominates' : twoNeS > 1 ? 'Both matter' : 'Drift dominates';

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
              Pathogen Evolution Simulator
            </h1>
            <p className="text-blue-100 text-center text-lg">
              Visualize evolutionary forces through interactive color mixing
            </p>
          </div>

          <div className="p-6 md:p-8">
            {/* Pathogen Presets */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Droplet className="w-6 h-6 text-blue-600" />
                Choose a Pathogen System
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(pathogenPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                      pathogenType === key
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102'
                    }`}
                  >
                    <div className="font-bold text-lg text-gray-800 mb-2">
                      {preset.name.split('(')[0].trim()}
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      {preset.description.split(',')[0]}
                    </div>
                    {pathogenType === key && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Visualization Area */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Color Mixer Display */}
              {(viewMode === 'color' || viewMode === 'both') && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800">Evolutionary Force Palette</h3>
                  <div className="relative">
                    <div 
                      className="w-full h-80 rounded-2xl shadow-2xl transition-all duration-500 ease-out border-4 border-white"
                      style={{ backgroundColor: bgColor }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="text-center bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-200">
                          <div className="text-5xl font-extrabold mb-3" style={{ 
                            color: `rgb(${Math.min(255, 255-color.r+50)}, ${Math.min(255, 255-color.g+50)}, ${Math.min(255, 255-color.b+50)})`
                          }}>
                            {alleleFreq.toFixed(3)}
                          </div>
                          <div className="text-sm font-semibold text-gray-700 mb-1">Resistance Allele Frequency</div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                            Generation {time}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Color legend */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="grid grid-cols-3 gap-3 text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-red-500 rounded-lg shadow-sm"></div>
                          <span className="text-gray-700">Mutation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-500 rounded-lg shadow-sm"></div>
                          <span className="text-gray-700">Selection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-500 rounded-lg shadow-sm"></div>
                          <span className="text-gray-700">Gene Flow</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 text-center pt-2 border-t border-gray-300">
                        Transparency = Drift • Purple tints = Recombination
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Frequency Plot */}
              {(viewMode === 'frequency' || viewMode === 'both') && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800">Evolutionary Trajectory</h3>
                  <div className="w-full h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-300 shadow-inner relative overflow-hidden">
                    <svg width="100%" height="100%" className="absolute inset-0">
                      {/* Grid lines */}
                      {[0.25, 0.5, 0.75].map(y => (
                        <g key={y}>
                          <line
                            x1="0"
                            y1={`${(1-y)*100}%`}
                            x2="100%"
                            y2={`${(1-y)*100}%`}
                            stroke="#d1d5db"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                          />
                          <text x="10" y={`${(1-y)*100}%`} dy="4" fontSize="11" fill="#6b7280" fontWeight="500">
                            {y.toFixed(2)}
                          </text>
                        </g>
                      ))}
                      
                      {/* Plot line */}
                      {history.length > 1 && (
                        <>
                          <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                            </linearGradient>
                          </defs>
                          <polygon
                            points={`0,100 ${history.map((freq, i) => 
                              `${(i / (history.length - 1)) * 100},${(1 - freq) * 100}`
                            ).join(' ')} 100,100`}
                            fill="url(#lineGradient)"
                          />
                          <polyline
                            points={history.map((freq, i) => 
                              `${(i / (history.length - 1)) * 100},${(1 - freq) * 100}`
                            ).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </>
                      )}
                      
                      {/* Axis labels */}
                      <text x="10" y="20" fontSize="12" fill="#374151" fontWeight="600">1.0</text>
                      <text x="10" y="260" fontSize="12" fill="#374151" fontWeight="600">0.0</text>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isPlaying 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6" />
                    <span>Pause Evolution</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    <span>Start Evolution</span>
                  </>
                )}
              </button>
              
              <button
                onClick={reset}
                className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-bold flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RotateCcw className="w-6 h-6" />
                <span>Reset</span>
              </button>

              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-6 py-4 border-2 border-gray-300 rounded-xl font-semibold bg-white hover:border-blue-400 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="both">📊 Both Views</option>
                <option value="color">🎨 Color Only</option>
                <option value="frequency">📈 Graph Only</option>
              </select>
            </div>

            {/* Force Sliders */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Evolutionary Forces</h3>
                
                {/* Mutation */}
                <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold flex items-center gap-2 text-red-700">
                      <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                      MUTATION
                    </label>
                    <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                      {forcePercentages.mutation}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mutation}
                    onChange={(e) => setMutation(Number(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${mutation}%, #fecaca ${mutation}%, #fecaca 100%)`
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2 italic">Creates new variants (μ)</div>
                </div>

                {/* Selection */}
                <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold flex items-center gap-2 text-green-700">
                      <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                      SELECTION
                    </label>
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      {forcePercentages.selection}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selection}
                    onChange={(e) => setSelection(Number(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #22c55e 0%, #22c55e ${selection}%, #bbf7d0 ${selection}%, #bbf7d0 100%)`
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2 italic">Fitness differences (s)</div>
                </div>

                {/* Gene Flow */}
                <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold flex items-center gap-2 text-blue-700">
                      <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
                      GENE FLOW
                    </label>
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {forcePercentages.geneFlow}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={geneFlow}
                    onChange={(e) => setGeneFlow(Number(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${geneFlow}%, #bfdbfe ${geneFlow}%, #bfdbfe 100%)`
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2 italic">Migration between populations (m)</div>
                </div>

                {/* Drift */}
                <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-gray-500">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold flex items-center gap-2 text-gray-700">
                      <div className="w-4 h-4 bg-gray-500 rounded-full shadow-sm"></div>
                      GENETIC DRIFT
                    </label>
                    <span className="text-sm font-bold text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                      {forcePercentages.drift}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={drift}
                    onChange={(e) => setDrift(Number(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #6b7280 0%, #6b7280 ${drift}%, #e5e7eb ${drift}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2 italic">Random sampling (∝ 1/2Nₑ)</div>
                </div>

                {/* Recombination */}
                <div className="bg-purple-50 p-4 rounded-xl border-l-4 border-purple-500">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold flex items-center gap-2 text-purple-700">
                      <div className="w-4 h-4 bg-purple-500 rounded-full shadow-sm"></div>
                      RECOMBINATION
                    </label>
                    <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      {forcePercentages.recombination}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={recombination}
                    onChange={(e) => setRecombination(Number(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${recombination}%, #e9d5ff ${recombination}%, #e9d5ff 100%)`
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2 italic">Sexual reproduction / reassortment</div>
                </div>
              </div>

              {/* Population Parameters */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Population Parameters</h3>
                
                {/* Population Size */}
                <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-orange-700">EFFECTIVE POPULATION SIZE (Nₑ)</label>
                    <span className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                      {(effectivePopSize/1000).toFixed(1)}k
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={popSize}
                    onChange={(e) => setPopSize(Number(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f97316 ${popSize}%, #fed7aa ${popSize}%, #fed7aa 100%)`
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2 italic">Smaller Nₑ → stronger drift effect</div>
                </div>

                {/* Generation Time */}
                <div className="bg-teal-50 p-4 rounded-xl border-l-4 border-teal-500">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-teal-700">REPLICATION SPEED</label>
                    <span className="text-sm font-bold text-teal-600 bg-teal-100 px-3 py-1 rounded-full">
                      {generationTime}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={generationTime}
                    onChange={(e) => setGenerationTime(Number(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${generationTime}%, #99f6e4 ${generationTime}%, #99f6e4 100%)`
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2 italic">Higher speed → faster evolution</div>
                </div>

                {/* Force Balance Analysis */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-300 shadow-md">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-amber-900">
                    <Info className="w-5 h-5" />
                    Selection vs. Drift Analysis
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-sm font-medium text-gray-600">2Nₑs value:</span>
                      <span className="text-lg font-bold text-amber-900">{twoNeS.toFixed(1)}</span>
                    </div>
                    <div className="p-4 bg-amber-100 rounded-lg border-l-4 border-amber-500">
                      <div className="font-bold text-amber-900 mb-1">{selectionRegime}</div>
                      {twoNeS > 10 && (
                        <div className="text-sm text-gray-700">
                          Evolution is <strong>deterministic</strong> — beneficial alleles will spread predictably
                        </div>
                      )}
                      {twoNeS <= 10 && twoNeS > 1 && (
                        <div className="text-sm text-gray-700">
                          Both forces influence outcome — <strong>stochastic</strong> evolution with selection bias
                        </div>
                      )}
                      {twoNeS <= 1 && (
                        <div className="text-sm text-gray-700">
                          Drift dominates — allele fate is <strong>random</strong> regardless of fitness advantage
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Current Allele Frequency */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-300 shadow-md">
                  <h4 className="font-bold text-lg mb-3 text-blue-900">Population State</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Resistant allele:</span>
                      <span className="text-xl font-bold text-blue-600">{(alleleFreq * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Wild-type allele:</span>
                      <span className="text-xl font-bold text-green-600">{((1-alleleFreq) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 mt-3 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${alleleFreq * 100}%` }}
                      >
                        {alleleFreq > 0.15 && (
                          <span className="text-xs font-bold text-white">{(alleleFreq * 100).toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Panel */}
            <div className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border-2 border-indigo-300 shadow-xl">
              <h3 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
                <Info className="w-7 h-7" />
                Understanding the Color Mixing Analogy
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur rounded-xl p-5 border-l-4 border-red-500 shadow-md">
                  <h4 className="font-bold text-lg mb-2 text-red-700 flex items-center gap-2">
                    <span className="text-2xl">🔴</span> Mutation
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Creates new genetic variants like adding red paint to the palette. Higher mutation rates generate more variation, making the evolutionary "color" redder. For RNA viruses: μ ~ 10⁻⁴ per site.
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-5 border-l-4 border-green-500 shadow-md">
                  <h4 className="font-bold text-lg mb-2 text-green-700 flex items-center gap-2">
                    <span className="text-2xl">🟢</span> Selection
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Drives adaptation toward beneficial variants like adding green paint. Strong positive selection (s &gt; 0) pushes allele frequencies toward fixation. The "greenest" variants have the highest fitness.
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-5 border-l-4 border-blue-500 shadow-md">
                  <h4 className="font-bold text-lg mb-2 text-blue-700 flex items-center gap-2">
                    <span className="text-2xl">🔵</span> Gene Flow
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Spreads alleles between populations like mixing blue paint from different palettes. High gene flow homogenizes frequencies across geographic regions and populations.
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white/80 backdrop-blur rounded-xl p-5 border-l-4 border-gray-500 shadow-md">
                  <h4 className="font-bold text-lg mb-2 text-gray-700 flex items-center gap-2">
                    <span className="text-2xl">⚪</span> Genetic Drift
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Random sampling makes evolution unpredictable, shown by transparency in our palette. Stronger in small populations (∝ 1/2Nₑ). More transparent = more randomness and uncertainty.
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-5 border-l-4 border-purple-500 shadow-md">
                  <h4 className="font-bold text-lg mb-2 text-purple-700 flex items-center gap-2">
                    <span className="text-2xl">🟣</span> Recombination
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Shuffles genetic combinations creating new patterns like swirling paints together. Critical for influenza reassortment and sexual reproduction in fungal pathogens.
                  </p>
                </div>
              </div>
            </div>

            {/* Formula Display */}
            <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
              <h4 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                <span className="text-xl">📐</span> Population Genetics Equation
              </h4>
              <div className="bg-black/30 p-4 rounded-xl border border-gray-600 mb-4">
                <div className="font-mono text-lg text-green-400 text-center">
                  Δp = μ(1-p) - μp + [p(1-p)s]/2 + m(p<sub>m</sub>-p) + ξ<sub>t</sub>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-3 text-sm">
                <div className="bg-red-900/30 p-3 rounded-lg border border-red-700">
                  <div className="font-bold text-red-300 mb-1">μ</div>
                  <div className="text-gray-300 text-xs">mutation rate</div>
                </div>
                <div className="bg-green-900/30 p-3 rounded-lg border border-green-700">
                  <div className="font-bold text-green-300 mb-1">s</div>
                  <div className="text-gray-300 text-xs">selection coeff.</div>
                </div>
                <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700">
                  <div className="font-bold text-blue-300 mb-1">m</div>
                  <div className="text-gray-300 text-xs">migration rate</div>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                  <div className="font-bold text-gray-300 mb-1">ξ<sub>t</sub></div>
                  <div className="text-gray-300 text-xs">drift (random)</div>
                </div>
                <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-700">
                  <div className="font-bold text-purple-300 mb-1">p</div>
                  <div className="text-gray-300 text-xs">allele frequency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathogenEvolutionVisualizer;
