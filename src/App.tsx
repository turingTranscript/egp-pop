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
  const [popSize, setPopSize] = useState(50); // Affects drift
  const [generationTime, setGenerationTime] = useState(50); // Affects speed
  const [pathogenType, setPathogenType] = useState('influenza');
  
  // Simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [alleleFreq, setAlleleFreq] = useState(0.5);
  const [time, setTime] = useState(0);
  const [history, setHistory] = useState([0.5]);
  
  // View mode
  const [viewMode, setViewMode] = useState('color'); // 'color', 'frequency', 'both'

  // Pathogen presets
  const pathogenPresets = {
    influenza: {
      name: 'Influenza A (Antigenic Drift)',
      mutation: 60,
      selection: 70,
      geneFlow: 65,
      drift: 35,
      recombination: 80, // Reassortment
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

  // Calculate color from forces (RGB color mixing analogy)
  const calculateColor = () => {
    // Map forces to RGB channels
    const r = Math.round((mutation / 100) * 255); // Red = Mutation (creates variation)
    const g = Math.round((selection / 100) * 255); // Green = Selection (drives adaptation)
    const b = Math.round((geneFlow / 100) * 255); // Blue = Gene flow (spreads alleles)
    
    // Opacity affected by drift and recombination
    const alpha = 1 - (drift / 200); // More drift = more transparency (randomness)
    
    return { r, g, b, alpha };
  };

  // Calculate evolutionary trajectory
  const calculateDeltaP = (p) => {
    // Normalize forces to -0.1 to 0.1 range
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
        newFreq = Math.max(0.01, Math.min(0.99, newFreq)); // Keep bounded
        
        setHistory(h => {
          const newHistory = [...h, newFreq];
          return newHistory.slice(-100); // Keep last 100 points
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

  // Calculate 2NeS for selection vs drift comparison
  const effectivePopSize = (popSize / 50) * 10000; // Scale to realistic Ne
  const selectionCoeff = (selection / 100 - 0.5) * 0.3; // -0.15 to +0.15
  const twoNeS = Math.abs(2 * effectivePopSize * selectionCoeff);
  const selectionRegime = twoNeS > 10 ? 'Selection dominates' : twoNeS > 1 ? 'Both matter' : 'Drift dominates';

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-900">
          Pathogen Evolution: Interactive Force Mixer
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Visualize how evolutionary forces combine like colors mixing on a palette
        </p>

        {/* Pathogen Presets */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Droplet className="w-5 h-5" />
            Select Pathogen System
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {Object.entries(pathogenPresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  pathogenType === key
                    ? 'border-blue-500 bg-blue-100 font-semibold'
                    : 'border-gray-300 hover:border-blue-300 bg-white'
                }`}
              >
                {preset.name.split('(')[0]}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 italic">
            {pathogenPresets[pathogenType].description}
          </p>
        </div>

        {/* Main Visualization Area */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Color Mixer Display */}
          {(viewMode === 'color' || viewMode === 'both') && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Force Color Mixing</h3>
              <div className="relative">
                <div 
                  className="w-full h-64 rounded-lg border-4 border-gray-300 shadow-inner transition-all duration-300"
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/90 p-4 rounded-lg shadow-lg">
                      <div className="text-4xl font-bold mb-2" style={{ 
                        color: `rgb(${255-color.r}, ${255-color.g}, ${255-color.b})`
                      }}>
                        p = {alleleFreq.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-600">Resistant Allele Frequency</div>
                      <div className="text-xs text-gray-500 mt-2">Generation {time}</div>
                    </div>
                  </div>
                </div>
                
                {/* Color legend */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Red = Mutation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Green = Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Blue = Gene Flow</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Transparency = Drift effect | Swirls = Recombination
                </div>
              </div>
            </div>
          )}

          {/* Frequency Plot */}
          {(viewMode === 'frequency' || viewMode === 'both') && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Allele Frequency Over Time</h3>
              <div className="w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 relative">
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75].map(y => (
                    <line
                      key={y}
                      x1="0"
                      y1={`${(1-y)*100}%`}
                      x2="100%"
                      y2={`${(1-y)*100}%`}
                      stroke="#e5e7eb"
                      strokeDasharray="4"
                    />
                  ))}
                  
                  {/* Plot line */}
                  {history.length > 1 && (
                    <polyline
                      points={history.map((freq, i) => 
                        `${(i / (history.length - 1)) * 100},${(1 - freq) * 100}`
                      ).join(' ')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                  )}
                  
                  {/* Y-axis labels */}
                  <text x="5" y="20" fontSize="12" fill="#666">1.0</text>
                  <text x="5" y="135" fontSize="12" fill="#666">0.5</text>
                  <text x="5" y="250" fontSize="12" fill="#666">0.0</text>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? 'Pause' : 'Start Evolution'}
          </button>
          
          <button
            onClick={reset}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>

          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg"
          >
            <option value="both">Both Views</option>
            <option value="color">Color Only</option>
            <option value="frequency">Graph Only</option>
          </select>
        </div>

        {/* Force Sliders */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-3">Evolutionary Forces</h3>
            
            {/* Mutation */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  Mutation
                </label>
                <span className="text-sm text-gray-600">{forcePercentages.mutation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mutation}
                onChange={(e) => setMutation(Number(e.target.value))}
                className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${mutation}%, #fee2e2 ${mutation}%, #fee2e2 100%)`
                }}
              />
              <div className="text-xs text-gray-500 mt-1">Creates new variants (μ)</div>
            </div>

            {/* Selection */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  Selection
                </label>
                <span className="text-sm text-gray-600">{forcePercentages.selection}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selection}
                onChange={(e) => setSelection(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${selection}%, #dcfce7 ${selection}%, #dcfce7 100%)`
                }}
              />
              <div className="text-xs text-gray-500 mt-1">Fitness differences (s)</div>
            </div>

            {/* Gene Flow */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  Gene Flow
                </label>
                <span className="text-sm text-gray-600">{forcePercentages.geneFlow}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={geneFlow}
                onChange={(e) => setGeneFlow(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${geneFlow}%, #dbeafe ${geneFlow}%, #dbeafe 100%)`
                }}
              />
              <div className="text-xs text-gray-500 mt-1">Migration between populations (m)</div>
            </div>

            {/* Drift */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  Genetic Drift
                </label>
                <span className="text-sm text-gray-600">{forcePercentages.drift}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={drift}
                onChange={(e) => setDrift(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #6b7280 0%, #6b7280 ${drift}%, #e5e7eb ${drift}%, #e5e7eb 100%)`
                }}
              />
              <div className="text-xs text-gray-500 mt-1">Random sampling (∝ 1/2Nₑ)</div>
            </div>

            {/* Recombination */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  Recombination
                </label>
                <span className="text-sm text-gray-600">{forcePercentages.recombination}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={recombination}
                onChange={(e) => setRecombination(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${recombination}%, #f3e8ff ${recombination}%, #f3e8ff 100%)`
                }}
              />
              <div className="text-xs text-gray-500 mt-1">Sexual reproduction / reassortment</div>
            </div>
          </div>

          {/* Population Parameters */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-3">Population Parameters</h3>
            
            {/* Population Size */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Effective Population Size (Nₑ)</label>
                <span className="text-sm text-gray-600">{(effectivePopSize/1000).toFixed(1)}k</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={popSize}
                onChange={(e) => setPopSize(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-orange-200 to-orange-500 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">Affects drift strength (smaller Nₑ = more drift)</div>
            </div>

            {/* Generation Time */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Replication Speed</label>
                <span className="text-sm text-gray-600">{generationTime}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={generationTime}
                onChange={(e) => setGenerationTime(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-teal-200 to-teal-500 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">Affects evolutionary speed (higher = faster evolution)</div>
            </div>

            {/* Force Balance Analysis */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Selection vs. Drift Analysis
              </h4>
              <div className="text-sm space-y-1">
                <div>2Nₑs = {twoNeS.toFixed(1)}</div>
                <div className="font-semibold text-amber-900">{selectionRegime}</div>
                {twoNeS > 10 && (
                  <div className="text-xs text-gray-600 mt-2">
                    Evolution is deterministic - beneficial alleles will spread
                  </div>
                )}
                {twoNeS <= 10 && twoNeS > 1 && (
                  <div className="text-xs text-gray-600 mt-2">
                    Both selection and drift influence outcome - stochastic evolution
                  </div>
                )}
                {twoNeS <= 1 && (
                  <div className="text-xs text-gray-600 mt-2">
                    Drift dominates - allele fate is random regardless of fitness
                  </div>
                )}
              </div>
            </div>

            {/* Current Allele Frequency */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm mb-2">Current State</h4>
              <div className="space-y-1 text-sm">
                <div>Resistant allele: {(alleleFreq * 100).toFixed(1)}%</div>
                <div>Wild-type allele: {((1-alleleFreq) * 100).toFixed(1)}%</div>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${alleleFreq * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Panel */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Understanding the Color Analogy
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1 text-red-700">🔴 Mutation (Red)</h4>
              <p className="text-gray-700">Creates new genetic variants like adding red paint. Higher mutation = more variation (redder color). For RNA viruses: μ ~ 10⁻⁴</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 text-green-700">🟢 Selection (Green)</h4>
              <p className="text-gray-700">Drives adaptation like adding green paint. Strong selection pushes allele frequency toward beneficial variants. s > 0 = advantage</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 text-blue-700">🔵 Gene Flow (Blue)</h4>
              <p className="text-gray-700">Spreads alleles between populations like mixing blue paint. High flow = homogenizes frequencies across populations</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm mt-3">
            <div>
              <h4 className="font-semibold mb-1 text-gray-700">⚪ Drift (Transparency)</h4>
              <p className="text-gray-700">Random changes make evolution unpredictable (more transparent = more random). Stronger in small populations (∝ 1/2Nₑ)</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 text-purple-700">🟣 Recombination (Swirls)</h4>
              <p className="text-gray-700">Shuffles genetic combinations creating new patterns. Critical for influenza (reassortment) and sexual pathogens</p>
            </div>
          </div>
        </div>

        {/* Formula Display */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-300">
          <h4 className="font-semibold text-sm mb-2">Population Genetics Equation</h4>
          <div className="font-mono text-sm bg-white p-3 rounded border overflow-x-auto">
            Δp = μ(1-p) - μp + [p(1-p)s]/2 + m(pₘ-p) + ξₜ
          </div>
          <div className="text-xs text-gray-600 mt-2 grid grid-cols-5 gap-2">
            <div>μ: mutation</div>
            <div>s: selection</div>
            <div>m: migration</div>
            <div>ξₜ: drift</div>
            <div>p: allele freq</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathogenEvolutionVisualizer;
