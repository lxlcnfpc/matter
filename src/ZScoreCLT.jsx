import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Plotly from 'plotly.js-dist';

const ZScoreCLT = () => {
  // Z-Score Section State
  const [selectedValue, setSelectedValue] = useState(null);
  const [zScore, setZScore] = useState(null);
  const [percentile, setPercentile] = useState(null);
  
  // CLT Section State
  const [populationDist, setPopulationDist] = useState('uniform');
  const [sampleSize, setSampleSize] = useState(30);
  const [numSamples, setNumSamples] = useState(500);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sampleMeans, setSampleMeans] = useState([]);
  const [currentSample, setCurrentSample] = useState(0);
  
  // Quality Inspector State
  const [inspectorValue, setInspectorValue] = useState(100);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  
  // Refs for Plotly charts
  const zScoreHistRef = useRef(null);
  const populationRef = useRef(null);
  const samplingDistRef = useRef(null);
  const inspectorRef = useRef(null);
  
  // Parameters for the main distribution
  const MEAN = 100;
  const STD = 2;
  
  // Generate population data based on distribution type
  const generatePopulation = (type, size = 10000) => {
    const data = [];
    
    switch(type) {
      case 'uniform':
        for (let i = 0; i < size; i++) {
          data.push(MEAN + (Math.random() - 0.5) * STD * Math.sqrt(12));
        }
        break;
        
      case 'exponential':
        const lambda = 1 / STD;
        for (let i = 0; i < size; i++) {
          data.push(MEAN + (-Math.log(1 - Math.random()) / lambda) - (1/lambda));
        }
        break;
        
      case 'bimodal':
        for (let i = 0; i < size; i++) {
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          const mode = Math.random() > 0.5 ? 1 : -1;
          data.push(MEAN + mode * 2 * STD + STD * 0.5 * z0);
        }
        break;
        
      case 'normal':
      default:
        for (let i = 0; i < size; i++) {
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          data.push(MEAN + STD * z0);
        }
        break;
    }
    
    return data;
  };
  
  // Calculate cumulative normal distribution (for percentiles)
  const normalCDF = (z) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - prob : prob;
  };
  
  // Calculate Z-Score
  const calculateZScore = (value) => {
    const z = (value - MEAN) / STD;
    const p = normalCDF(z) * 100;
    setZScore(z);
    setPercentile(p);
  };
  
  // Generate sample means for CLT demonstration
  const generateSampleMeans = (popData, n, numSamples) => {
    const means = [];
    for (let i = 0; i < numSamples; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        const randomIndex = Math.floor(Math.random() * popData.length);
        sum += popData[randomIndex];
      }
      means.push(sum / n);
    }
    return means;
  };
  
  // Animate CLT demonstration
  const startCLTAnimation = () => {
    setIsAnimating(true);
    setCurrentSample(0);
    setSampleMeans([]);
    
    const popData = generatePopulation(populationDist, 10000);
    let animatedMeans = [];
    let sample = 0;
    
    const interval = setInterval(() => {
      if (sample >= numSamples) {
        setIsAnimating(false);
        clearInterval(interval);
        return;
      }
      
      // Generate one sample mean
      let sum = 0;
      for (let j = 0; j < sampleSize; j++) {
        const randomIndex = Math.floor(Math.random() * popData.length);
        sum += popData[randomIndex];
      }
      animatedMeans.push(sum / sampleSize);
      
      setSampleMeans([...animatedMeans]);
      setCurrentSample(sample + 1);
      sample++;
    }, 20);
  };
  
  // Get Z-Score color
  const getZScoreColor = (z) => {
    const absZ = Math.abs(z);
    if (absZ < 1) return 'bg-green-100 text-green-800 border-green-300';
    if (absZ < 2) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (absZ < 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };
  
  // Get inspector recommendation based on selected confidence level
  const getInspectorRecommendation = () => {
    const z = (inspectorValue - MEAN) / STD;
    const absZ = Math.abs(z);
    
    // Specification limits
    const LSL = 95;
    const USL = 105;
    const withinSpec = inspectorValue >= LSL && inspectorValue <= USL;
    
    // Get Z-critical value based on confidence level
    const zCritical = confidenceLevel === 95 ? 1.96 : confidenceLevel === 99 ? 2.576 : 1.645;
    
    // Check both specification limits AND confidence interval
    if (!withinSpec) {
      return { 
        status: 'REJECT', 
        color: 'text-red-600', 
        icon: '✗',
        explanation: `Outside specification limits (${LSL}-${USL}mm) - Part is unusable!`
      };
    }
    
    // Within spec, now check confidence interval for process control
    if (absZ <= zCritical) {
      return { 
        status: 'ACCEPT', 
        color: 'text-green-600', 
        icon: '✓',
        explanation: `Within specs AND ${confidenceLevel}% CI (|Z| ≤ ${zCritical}) - Normal process variation`
      };
    } else if (absZ <= zCritical * 1.5) {
      return { 
        status: 'REVIEW', 
        color: 'text-yellow-600', 
        icon: '⚠',
        explanation: `Within specs but outside ${confidenceLevel}% CI - Process may need attention`
      };
    } else {
      return { 
        status: 'REVIEW', 
        color: 'text-orange-600', 
        icon: '⚠',
        explanation: `Within specs but far outside ${confidenceLevel}% CI - Investigate process immediately!`
      };
    }
  };
  
  // Update Z-Score visualization
  useEffect(() => {
    if (!zScoreHistRef.current) return;
    
    const data = generatePopulation('normal', 1000);
    
    const histTrace = {
      x: data,
      type: 'histogram',
      nbinsx: 40,
      marker: { color: 'rgba(66, 153, 225, 0.6)' },
      name: 'Distribution'
    };
    
    const traces = [histTrace];
    
    // Add mean line
    traces.push({
      x: [MEAN, MEAN],
      y: [0, 150],
      mode: 'lines',
      name: 'Mean (μ)',
      line: { color: 'red', width: 3, dash: 'dash' }
    });
    
    // Add std dev lines
    for (let i = 1; i <= 3; i++) {
      traces.push({
        x: [MEAN - i * STD, MEAN - i * STD],
        y: [0, 150],
        mode: 'lines',
        name: `μ - ${i}σ`,
        line: { color: 'purple', width: 2, dash: 'dot' },
        showlegend: i === 1
      });
      traces.push({
        x: [MEAN + i * STD, MEAN + i * STD],
        y: [0, 150],
        mode: 'lines',
        name: `μ + ${i}σ`,
        line: { color: 'purple', width: 2, dash: 'dot' },
        showlegend: false
      });
    }
    
    // Add selected value marker
    if (selectedValue !== null) {
      traces.push({
        x: [selectedValue, selectedValue],
        y: [0, 150],
        mode: 'lines',
        name: 'Selected Value',
        line: { color: 'green', width: 4 }
      });
    }
    
    const layout = {
      title: 'Click on the chart to select a value and calculate its Z-Score',
      xaxis: { title: 'Value (mm)', range: [90, 110] },
      yaxis: { title: 'Frequency' },
      height: 400,
      showlegend: true
    };
    
    Plotly.newPlot(zScoreHistRef.current, traces, layout).then(() => {
      zScoreHistRef.current.on('plotly_click', (data) => {
        const point = data.points[0];
        const value = point.x;
        setSelectedValue(value);
        calculateZScore(value);
      });
    });
  }, [selectedValue]);
  
  // Update CLT visualization
  useEffect(() => {
    // Update population distribution
    if (populationRef.current) {
      const popData = generatePopulation(populationDist, 5000);
      const popMean = popData.reduce((a, b) => a + b, 0) / popData.length;
      const popStd = Math.sqrt(popData.reduce((sum, val) => sum + Math.pow(val - popMean, 2), 0) / popData.length);
      
      const popTrace = {
        x: popData,
        type: 'histogram',
        nbinsx: 50,
        marker: { color: 'rgba(255, 127, 14, 0.7)' },
        name: 'Population'
      };
      
      const popLayout = {
        title: `Population Distribution: ${populationDist.charAt(0).toUpperCase() + populationDist.slice(1)}<br>μ=${popMean.toFixed(2)}, σ=${popStd.toFixed(2)}`,
        xaxis: { title: 'Value' },
        yaxis: { title: 'Frequency' },
        height: 300,
        showlegend: false
      };
      
      Plotly.newPlot(populationRef.current, [popTrace], popLayout);
    }
    
    // Update sampling distribution
    if (samplingDistRef.current && sampleMeans.length > 0) {
      const meanOfMeans = sampleMeans.reduce((a, b) => a + b, 0) / sampleMeans.length;
      const stdOfMeans = Math.sqrt(sampleMeans.reduce((sum, val) => sum + Math.pow(val - meanOfMeans, 2), 0) / sampleMeans.length);
      const theoreticalSE = STD / Math.sqrt(sampleSize);
      
      const samplingTrace = {
        x: sampleMeans,
        type: 'histogram',
        nbinsx: 40,
        marker: { color: 'rgba(44, 160, 44, 0.7)' },
        name: 'Sample Means'
      };
      
      const samplingLayout = {
        title: `Sampling Distribution of Means (n=${sampleSize}, samples=${currentSample})<br>Mean=${meanOfMeans.toFixed(2)}, SE=${stdOfMeans.toFixed(3)} (theoretical: ${theoreticalSE.toFixed(3)})`,
        xaxis: { title: 'Sample Mean', range: [95, 105] },
        yaxis: { title: 'Frequency' },
        height: 300,
        showlegend: false
      };
      
      Plotly.newPlot(samplingDistRef.current, [samplingTrace], samplingLayout);
    }
  }, [populationDist, sampleSize, sampleMeans, currentSample]);
  
  // Update inspector chart
  useEffect(() => {
    if (!inspectorRef.current) return;
    
    const z = (inspectorValue - MEAN) / STD;
    const marginOfError = (confidenceLevel === 95 ? 1.96 : confidenceLevel === 99 ? 2.576 : 1.645) * STD;
    
    // Specification limits
    const LSL = 95;
    const USL = 105;
    
    // Create normal distribution curve
    const x = [];
    const y = [];
    for (let i = 90; i <= 110; i += 0.1) {
      x.push(i);
      const z = (i - MEAN) / STD;
      y.push(Math.exp(-0.5 * z * z) / (STD * Math.sqrt(2 * Math.PI)));
    }
    
    const curveTrace = {
      x: x,
      y: y,
      type: 'scatter',
      mode: 'lines',
      fill: 'tozeroy',
      fillcolor: 'rgba(66, 153, 225, 0.3)',
      line: { color: 'rgb(66, 153, 225)', width: 2 },
      name: 'Normal Distribution'
    };
    
    const valueMarker = {
      x: [inspectorValue, inspectorValue],
      y: [0, Math.max(...y)],
      mode: 'lines',
      name: 'Measured Value',
      line: { color: 'red', width: 4 }
    };
    
    const lowerCI = {
      x: [MEAN - marginOfError, MEAN - marginOfError],
      y: [0, Math.max(...y)],
      mode: 'lines',
      name: `${confidenceLevel}% CI Limits`,
      line: { color: 'green', width: 2, dash: 'dash' }
    };
    
    const upperCI = {
      x: [MEAN + marginOfError, MEAN + marginOfError],
      y: [0, Math.max(...y)],
      mode: 'lines',
      showlegend: false,
      line: { color: 'green', width: 2, dash: 'dash' }
    };
    
    // Add specification limits
    const lslLine = {
      x: [LSL, LSL],
      y: [0, Math.max(...y)],
      mode: 'lines',
      name: 'Specification Limits',
      line: { color: 'orange', width: 3 }
    };
    
    const uslLine = {
      x: [USL, USL],
      y: [0, Math.max(...y)],
      mode: 'lines',
      showlegend: false,
      line: { color: 'orange', width: 3 }
    };
    
    const layout = {
      title: 'Quality Inspector Decision Tool',
      xaxis: { title: 'Value (mm)', range: [90, 110] },
      yaxis: { title: 'Probability Density' },
      height: 350,
      showlegend: true
    };
    
    Plotly.newPlot(inspectorRef.current, [curveTrace, valueMarker, lowerCI, upperCI, lslLine, uslLine], layout);
  }, [inspectorValue, confidenceLevel]);
  
  const recommendation = getInspectorRecommendation();
  const inspectorZ = (inspectorValue - MEAN) / STD;
  
  return (
    <div className="space-y-8">
      {/* Section 1: Understanding Z-Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📊 Understanding Z-Score</CardTitle>
          <p className="text-gray-600 mt-2">
            A Z-score tells you how many standard deviations a value is from the mean
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">What is a Z-Score?</h4>
            <p className="text-gray-700 mb-2">
              The Z-score standardizes values so we can compare them across different distributions.
              Formula: <strong>Z = (X - μ) / σ</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Z = 0 means the value is exactly at the mean</li>
              <li>• Z = 1 means the value is 1 standard deviation above the mean</li>
              <li>• Z = -2 means the value is 2 standard deviations below the mean</li>
            </ul>
          </div>
          
          <div ref={zScoreHistRef}></div>
          
          {selectedValue !== null && zScore !== null && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`border-2 ${getZScoreColor(zScore)}`}>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Selected Value</h4>
                  <div className="text-3xl font-bold">{selectedValue.toFixed(2)} mm</div>
                </CardContent>
              </Card>
              
              <Card className={`border-2 ${getZScoreColor(zScore)}`}>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Z-Score</h4>
                  <div className="text-3xl font-bold">{zScore.toFixed(3)}</div>
                  <p className="text-sm mt-2">
                    {Math.abs(zScore).toFixed(2)} std dev {zScore > 0 ? 'above' : 'below'} mean
                  </p>
                </CardContent>
              </Card>
              
              <Card className={`border-2 ${getZScoreColor(zScore)}`}>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Percentile</h4>
                  <div className="text-3xl font-bold">{percentile.toFixed(1)}%</div>
                  <p className="text-sm mt-2">
                    Better than {percentile.toFixed(1)}% of values
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {selectedValue === null && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">👆 Click anywhere on the histogram above to calculate a Z-score</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Section 2: Central Limit Theorem */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🎲 Central Limit Theorem (CLT) Demonstration</CardTitle>
          <p className="text-gray-600 mt-2">
            Watch how sample means become normally distributed, regardless of the population distribution!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <h4 className="font-semibold text-purple-800 mb-2">The Central Limit Theorem</h4>
            <p className="text-gray-700">
              The CLT states that when you take many samples from a population and calculate their means, 
              those sample means will form a normal distribution - even if the original population isn't normal!
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Key insight: As sample size (n) increases, the sampling distribution becomes more normal, 
              and its standard error decreases by σ/√n
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Population Distribution Type</label>
              <select
                value={populationDist}
                onChange={(e) => setPopulationDist(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={isAnimating}
              >
                <option value="uniform">Uniform (Flat)</option>
                <option value="exponential">Exponential (Highly Skewed)</option>
                <option value="bimodal">Bimodal (Two Peaks)</option>
                <option value="normal">Normal (For Comparison)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">
                Sample Size (n): {sampleSize}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={sampleSize}
                onChange={(e) => setSampleSize(parseInt(e.target.value))}
                className="w-full"
                disabled={isAnimating}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>n=1</span>
                <span>n=50</span>
                <span>n=100</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">
              Number of Samples: {numSamples}
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={numSamples}
              onChange={(e) => setNumSamples(parseInt(e.target.value))}
              className="w-full"
              disabled={isAnimating}
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={startCLTAnimation}
              disabled={isAnimating}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isAnimating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isAnimating ? `Sampling... (${currentSample}/${numSamples})` : 'Start CLT Demonstration'}
            </button>
            
            {sampleMeans.length > 0 && !isAnimating && (
              <button
                onClick={() => {
                  setSampleMeans([]);
                  setCurrentSample(0);
                }}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
              >
                Reset
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-center text-orange-700">Population Distribution</h4>
              <div ref={populationRef}></div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-center text-green-700">
                Distribution of Sample Means {sampleMeans.length > 0 && '(Approaching Normal!)'}
              </h4>
              <div ref={samplingDistRef}></div>
              {sampleMeans.length === 0 && (
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">Click "Start CLT Demonstration" to begin</p>
                </div>
              )}
            </div>
          </div>
          
          {sampleMeans.length > 0 && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h4 className="font-semibold text-green-800 mb-2">✨ Observe the Magic!</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Even though the population is {populationDist}, the sample means form a bell curve!</li>
                <li>• The larger the sample size (n), the narrower and more normal the distribution</li>
                <li>• Standard Error = σ/√n = {(STD / Math.sqrt(sampleSize)).toFixed(3)} mm</li>
                <li>• This is why we can use normal distribution for many statistical tests</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
{/* Section 3: Understanding and Interpreting Confidence Intervals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📐 Understanding and Interpreting Confidence Intervals</CardTitle>
          <p className="text-gray-600 mt-2">
            Learn what confidence intervals are, how they're calculated, and what measurements tell us about our process
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Introduction to Confidence Intervals */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">What is a Confidence Interval?</h4>
            <div className="text-gray-700 space-y-2 text-sm">
              <p>
                A <strong>confidence interval</strong> is a range of values where we expect most measurements from 
                a properly functioning process to fall. It's calculated from the process mean (μ) and standard deviation (σ).
              </p>
              
              <div className="bg-white p-3 rounded mt-2 border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">The Formula:</p>
                <p className="font-mono text-center text-lg">
                  CI = μ ± (Z × σ)
                </p>
                <div className="mt-2 text-xs space-y-1">
                  <p>• <strong>μ</strong> = Process mean (target value, e.g., 100mm)</p>
                  <p>• <strong>σ</strong> = Standard deviation (process variation, e.g., 2mm)</p>
                  <p>• <strong>Z</strong> = Z-critical value (determines confidence level)</p>
                </div>
              </div>

              <div className="mt-3 bg-indigo-50 p-3 rounded border border-indigo-200">
                <p className="font-semibold text-indigo-900 mb-2">Common Z-Critical Values:</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2 rounded text-center">
                    <strong>90% CI</strong><br/>
                    Z = ±1.645<br/>
                    90% of data falls here
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <strong>95% CI</strong><br/>
                    Z = ±1.96<br/>
                    95% of data falls here
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <strong>99% CI</strong><br/>
                    Z = ±2.576<br/>
                    99% of data falls here
                  </div>
                </div>
              </div>

              <p className="mt-3">
                <strong>Example for our bolts:</strong> With μ = 100mm, σ = 2mm, and 95% confidence:
              </p>
              <p className="font-mono text-sm bg-white p-2 rounded border">
                95% CI = 100 ± (1.96 × 2) = 100 ± 3.92 = [96.08, 103.92] mm
              </p>
              <p className="mt-1 text-xs">
                This means: <strong>95% of bolts</strong> from our process should measure between 96.08mm and 103.92mm 
                if the process is working normally.
              </p>
            </div>
          </div>

          {/* Interactive Measurement Tool */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <h4 className="font-semibold text-purple-800 mb-2">Interactive: What Does a Single Measurement Tell Us?</h4>
            <p className="text-gray-700 text-sm mb-3">
              Measure a bolt and see what its value reveals about your manufacturing process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Bolt Measurement: {inspectorValue.toFixed(2)} mm
              </label>
              <input
                type="range"
                min="90"
                max="110"
                step="0.1"
                value={inspectorValue}
                onChange={(e) => setInspectorValue(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-600 mt-1">
                Adjust the slider to simulate different measurements
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">
                Confidence Level: {confidenceLevel}%
              </label>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="90">90% Confidence (±1.645σ)</option>
                <option value="95">95% Confidence (±1.96σ)</option>
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Common industry standard is 95%
              </p>
            </div>
          </div>
          
          <div ref={inspectorRef}></div>

          {/* Interpretation Guide */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h4 className="font-semibold text-green-800 mb-3">🔍 How to Interpret Your Measurement</h4>
            <div className="text-gray-700 text-sm space-y-3">
              <p className="font-semibold">
                Your measurement: <span className="text-green-900">{inspectorValue.toFixed(2)} mm</span>
                <br/>
                Z-score: <span className="text-green-900">{inspectorZ.toFixed(3)}</span> (
                {Math.abs(inspectorZ).toFixed(2)}σ {inspectorZ > 0 ? 'above' : 'below'} target)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-white p-3 rounded border-2 border-orange-300">
                  <p className="font-semibold text-orange-800 mb-1">📏 Specification Check:</p>
                  <p className={`text-lg font-bold ${inspectorValue >= 95 && inspectorValue <= 105 ? 'text-green-700' : 'text-red-700'}`}>
                    {inspectorValue >= 95 && inspectorValue <= 105 ? '✓ Within Specifications' : '✗ Outside Specifications'}
                  </p>
                  <p className="text-xs mt-1">
                    Customer requires: 95mm - 105mm
                  </p>
                </div>

                <div className="bg-white p-3 rounded border-2 border-green-300">
                  <p className="font-semibold text-green-800 mb-1">📊 Process Control Check:</p>
                  <p className={`text-lg font-bold ${
                    Math.abs(inspectorZ) <= (confidenceLevel === 95 ? 1.96 : confidenceLevel === 99 ? 2.576 : 1.645) 
                      ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {Math.abs(inspectorZ) <= (confidenceLevel === 95 ? 1.96 : confidenceLevel === 99 ? 2.576 : 1.645)
                      ? '✓ Within Confidence Interval' : '⚠ Outside Confidence Interval'}
                  </p>
                  <p className="text-xs mt-1">
                    {confidenceLevel}% CI: {(MEAN - (confidenceLevel === 95 ? 1.96 : confidenceLevel === 99 ? 2.576 : 1.645) * STD).toFixed(2)}mm - {(MEAN + (confidenceLevel === 95 ? 1.96 : confidenceLevel === 99 ? 2.576 : 1.645) * STD).toFixed(2)}mm
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded border-2 border-blue-300">
                <p className="font-semibold text-blue-900 mb-2">💡 What This Means:</p>
                {(() => {
                  const withinSpec = inspectorValue >= 95 && inspectorValue <= 105;
                  const zCritical = confidenceLevel === 95 ? 1.96 : confidenceLevel === 99 ? 2.576 : 1.645;
                  const withinCI = Math.abs(inspectorZ) <= zCritical;
                  
                  if (withinSpec && withinCI) {
                    return (
                      <div className="text-green-900">
                        <p className="font-semibold">✓ Excellent - Normal Process Behavior</p>
                        <ul className="list-disc pl-5 mt-1 text-xs space-y-1">
                          <li>The bolt meets customer specifications</li>
                          <li>The measurement is within expected process variation</li>
                          <li>This is normal, expected behavior - no action needed</li>
                          <li>The process is operating as designed</li>
                        </ul>
                      </div>
                    );
                  } else if (withinSpec && !withinCI) {
                    return (
                      <div className="text-yellow-900">
                        <p className="font-semibold">⚠ Caution - Unusual Process Behavior</p>
                        <ul className="list-disc pl-5 mt-1 text-xs space-y-1">
                          <li>The bolt meets specifications (it's usable)</li>
                          <li>BUT the measurement is outside the {confidenceLevel}% confidence interval</li>
                          <li>This is statistically unusual - only {100-confidenceLevel}% of measurements should be here</li>
                          <li><strong>Action:</strong> Investigate the process - has something changed?</li>
                          <li>Possible causes: tool wear, material variation, temperature shift, operator change</li>
                          <li>If this becomes common, the process may be drifting toward making bad parts</li>
                        </ul>
                      </div>
                    );
                  } else if (!withinSpec && withinCI) {
                    return (
                      <div className="text-red-900">
                        <p className="font-semibold">✗ Critical - Process is Off-Target</p>
                        <ul className="list-disc pl-5 mt-1 text-xs space-y-1">
                          <li>The bolt does NOT meet customer specifications (reject this part)</li>
                          <li>The measurement is within normal process variation</li>
                          <li>This means the entire process has shifted away from the target!</li>
                          <li><strong>Action:</strong> Stop production and recenter the process immediately</li>
                          <li>The process mean (μ) has likely shifted from 100mm</li>
                          <li>All parts being produced right now are likely out of spec</li>
                        </ul>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-red-900">
                        <p className="font-semibold">✗ Critical - Reject Part & Investigate Process</p>
                        <ul className="list-disc pl-5 mt-1 text-xs space-y-1">
                          <li>The bolt does NOT meet specifications (reject immediately)</li>
                          <li>The measurement is also outside normal process variation</li>
                          <li>This is a rare event that should almost never happen</li>
                          <li><strong>Action:</strong> Stop production and investigate immediately</li>
                          <li>Possible causes: equipment malfunction, wrong material, measurement error</li>
                          <li>This represents a significant process failure</li>
                        </ul>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Specification Limits vs CI */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <h4 className="font-semibold text-orange-800 mb-2">📏 Two Types of Limits - Understanding the Difference</h4>
            <div className="text-gray-700 space-y-2 text-sm">
              <p>
                The chart above shows TWO different types of limits. Understanding both is crucial:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-white p-3 rounded border-2 border-orange-300">
                  <p className="font-semibold text-orange-800 mb-1">
                    🟧 Orange Lines: Specification Limits
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• LSL = 95mm, USL = 105mm</li>
                    <li>• Set by <strong>customer requirements</strong></li>
                    <li>• These are <strong>FIXED</strong> - you can't change them</li>
                    <li>• Define what's <strong>acceptable to the customer</strong></li>
                    <li>• Parts outside this range won't work</li>
                  </ul>
                </div>

                <div className="bg-white p-3 rounded border-2 border-green-300">
                  <p className="font-semibold text-green-800 mb-1">
                    🟩 Green Dashed Lines: Confidence Interval
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• Based on your process: μ ± (Z × σ)</li>
                    <li>• Set by <strong>your process capability</strong></li>
                    <li>• Changes if you improve/worsen the process</li>
                    <li>• Define what's <strong>normal for your process</strong></li>
                    <li>• Helps detect when process is misbehaving</li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-300">
                <p className="font-semibold text-yellow-900 mb-2">🎯 The Goal:</p>
                <p className="text-xs">
                  Your <strong>confidence interval (green)</strong> should fit comfortably <strong>inside</strong> the 
                  <strong> specification limits (orange)</strong>. If your ±3σ (99.7% CI) extends beyond the specs, 
                  you're producing defects even when the process is centered!
                </p>
                <p className="text-xs mt-2">
                  <strong>Current situation:</strong> Our ±3σ range (94-106mm) exceeds specs (95-105mm). 
                  We need to reduce σ from 2mm to at most 1.67mm to achieve minimum capability!
                </p>
              </div>
            </div>
          </div>

          {/* Six Sigma Section */}
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
            <h4 className="font-semibold text-indigo-800 mb-2">🎯 Process Capability & Six Sigma</h4>
            <div className="text-gray-700 space-y-3 text-sm">
              <p>
                <strong>Process Capability</strong> measures how well your process meets specifications. 
                The key metric is <strong>Cpk</strong> (Process Capability Index).
              </p>

              <div className="bg-white p-3 rounded border border-indigo-200 mt-2">
                <p className="font-semibold text-indigo-900 mb-2">Cpk Formula:</p>
                <p className="font-mono text-center text-lg">
                  Cpk = (Specification Tolerance) / (6 × σ)
                </p>
                <p className="text-center mt-2 text-sm">
                  For our process: Cpk = 5mm / (6 × 2mm) = <strong className="text-red-600">0.417</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                <div className="bg-red-100 p-2 rounded border-2 border-red-300">
                  <strong>Cpk &lt; 1.0</strong><br/>
                  Not Capable<br/>
                  <span className="text-red-700">(We are here: 0.417)</span>
                </div>
                <div className="bg-yellow-100 p-2 rounded border-2 border-yellow-300">
                  <strong>Cpk = 1.0</strong><br/>
                  Barely Capable<br/>
                  ~2,700 ppm defects
                </div>
                <div className="bg-blue-100 p-2 rounded border-2 border-blue-300">
                  <strong>Cpk = 1.33</strong><br/>
                  Good Process<br/>
                  ~63 ppm defects
                </div>
                <div className="bg-green-100 p-2 rounded border-2 border-green-300">
                  <strong>Cpk = 2.0</strong><br/>
                  Six Sigma<br/>
                  ~3.4 ppm defects
                </div>
              </div>

              <div className="mt-3 p-3 bg-green-50 rounded border border-green-300">
                <p className="font-semibold text-green-900 mb-2">✅ What You Should Strive For:</p>
                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2 rounded">
                    <strong>Minimum Acceptable (Cpk = 1.0):</strong> Reduce σ to ≤1.67mm
                    <br/>±3σ fits inside specs, but no safety margin
                  </div>
                  <div className="bg-white p-2 rounded">
                    <strong>Good Process (Cpk = 1.33):</strong> Reduce σ to ≤1.25mm
                    <br/>±4σ fits inside specs with safety margin
                  </div>
                  <div className="bg-white p-2 rounded">
                    <strong>Six Sigma (Cpk = 2.0):</strong> Reduce σ to ≤0.833mm
                    <br/>±6σ fits inside specs - world-class quality!
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs italic">
                <strong>Key Insight:</strong> You can't "choose" a confidence interval to meet specifications. 
                You must <strong>improve your process</strong> to reduce σ until your natural variation 
                fits inside customer requirements.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ZScoreCLT;
