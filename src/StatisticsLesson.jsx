import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import Plotly from 'plotly.js-dist';
import ZScoreCLT from './ZScoreCLT';

const StatisticsLesson = () => {
  const [mean, setMean] = useState(100);
  const [std, setStd] = useState(2);
  const [shape, setShape] = useState('normal');
  const [sampleSize, setSampleSize] = useState(1000);
  const [bins, setBins] = useState(30);
  const [currentData, setCurrentData] = useState([]);
  const [showDataTable, setShowDataTable] = useState(false);
  
  const histogramRef = useRef(null);
  const processARef = useRef(null);
  const processBRef = useRef(null);

  // Generate data based on distribution shape
  const generateData = (mean, std, shape, size) => {
    const data = [];
    
    if (shape === 'normal') {
      for (let i = 0; i < size; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        data.push(mean + std * z0);
      }
    } else if (shape === 'rightSkew') {
      for (let i = 0; i < size; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const skewedValue = mean + std * (z0 + Math.abs(z0) * 0.5);
        data.push(skewedValue);
      }
    } else if (shape === 'leftSkew') {
      for (let i = 0; i < size; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const skewedValue = mean + std * (z0 - Math.abs(z0) * 0.5);
        data.push(skewedValue);
      }
    } else if (shape === 'bimodal') {
      for (let i = 0; i < size; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const mode = Math.random() > 0.5 ? 1 : -1;
        data.push(mean + mode * 2 * std + std * 0.5 * z0);
      }
    }
    
    return data;
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;
    
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const median = n % 2 === 0 
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
      : sorted[Math.floor(n/2)];
    
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    
    const range = sorted[n - 1] - sorted[0];
    
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    
    const skewness = data.reduce((sum, val) => 
      sum + Math.pow((val - mean) / std, 3), 0) / n;
    
    const LSL = 95;
    const USL = 105;
    const withinSpec = (data.filter(d => d >= LSL && d <= USL).length / n) * 100;
    
    return { mean, median, std, range, iqr, skewness, withinSpec };
  };

  // Update visualization
  useEffect(() => {
    const data = generateData(mean, std, shape, sampleSize);
    setCurrentData(data);
    const stats = calculateStats(data);
    
    // Update histogram
    if (histogramRef.current) {
      const std1Lower = stats.mean - stats.std;
      const std1Upper = stats.mean + stats.std;
      const std2Lower = stats.mean - 2 * stats.std;
      const std2Upper = stats.mean + 2 * stats.std;
      const std3Lower = stats.mean - 3 * stats.std;
      const std3Upper = stats.mean + 3 * stats.std;
      
      const histogramTrace = {
        x: data,
        type: 'histogram',
        nbinsx: bins,
        marker: {
          color: 'rgba(66, 153, 225, 0.7)',
          line: { color: 'rgba(66, 153, 225, 1)', width: 1 }
        },
        name: 'Frequency'
      };
      
      const std3Region = {
        x: [std3Lower, std3Lower, std3Upper, std3Upper],
        y: [0, 300, 300, 0],
        fill: 'toself',
        fillcolor: 'rgba(138, 43, 226, 0.08)',
        line: { width: 0 },
        name: '±3σ (99.7%)',
        showlegend: true,
        hoverinfo: 'name'
      };
      
      const std2Region = {
        x: [std2Lower, std2Lower, std2Upper, std2Upper],
        y: [0, 300, 300, 0],
        fill: 'toself',
        fillcolor: 'rgba(138, 43, 226, 0.15)',
        line: { width: 0 },
        name: '±2σ (95%)',
        showlegend: true,
        hoverinfo: 'name'
      };
      
      const std1Region = {
        x: [std1Lower, std1Lower, std1Upper, std1Upper],
        y: [0, 300, 300, 0],
        fill: 'toself',
        fillcolor: 'rgba(138, 43, 226, 0.3)',
        line: { width: 0 },
        name: '±1σ (68%)',
        showlegend: true,
        hoverinfo: 'name'
      };
      
      const meanLine = {
        x: [stats.mean, stats.mean],
        y: [0, 300],
        mode: 'lines',
        name: 'Mean',
        line: { color: 'red', width: 3, dash: 'dash' }
      };
      
      const lsl = {
        x: [95, 95],
        y: [0, 300],
        mode: 'lines',
        name: 'LSL (95mm)',
        line: { color: 'orange', width: 2 }
      };
      
      const usl = {
        x: [105, 105],
        y: [0, 300],
        mode: 'lines',
        name: 'USL (105mm)',
        line: { color: 'orange', width: 2 }
      };
      
      const layout = {
        title: 'Distribution of Bolt Lengths with Standard Deviation Ranges',
        xaxis: { title: 'Length (mm)', range: [80, 120] },
        yaxis: { title: 'Frequency' },
        showlegend: true,
        height: 500,
        legend: { x: 1.02, y: 1, xanchor: 'left', yanchor: 'top' }
      };
      
      Plotly.newPlot(histogramRef.current, 
        [std3Region, std2Region, std1Region, histogramTrace, meanLine, lsl, usl], 
        layout
      );
    }
    
    // Update comparison charts
    if (processARef.current) {
      const dataA = generateData(100, 1, 'normal', 500);
      const traceA = {
        x: dataA,
        type: 'histogram',
        nbinsx: 30,
        marker: { color: 'rgba(72, 187, 120, 0.7)' }
      };
      
      Plotly.newPlot(processARef.current, [traceA], {
        xaxis: { title: 'Length (mm)', range: [90, 110] },
        yaxis: { title: 'Frequency' },
        height: 250,
        margin: { t: 20, b: 40 },
        showlegend: false
      });
    }
    
    if (processBRef.current) {
      const dataB = generateData(100, 5, 'normal', 500);
      const traceB = {
        x: dataB,
        type: 'histogram',
        nbinsx: 30,
        marker: { color: 'rgba(245, 101, 101, 0.7)' }
      };
      
      Plotly.newPlot(processBRef.current, [traceB], {
        xaxis: { title: 'Length (mm)', range: [90, 110] },
        yaxis: { title: 'Frequency' },
        height: 250,
        margin: { t: 20, b: 40 },
        showlegend: false
      });
    }
  }, [mean, std, shape, sampleSize, bins]);

  const stats = currentData.length > 0 ? calculateStats(currentData) : null;
  
  const shapeNames = {
    normal: 'Normal',
    rightSkew: 'Right Skewed',
    leftSkew: 'Left Skewed',
    bimodal: 'Bimodal'
  };

  const downloadCSV = () => {
    let csv = 'Index,Length (mm),Status,Deviation from Target\n';
    const LSL = 95;
    const USL = 105;
    const target = 100;
    
    currentData.forEach((value, index) => {
      const isInSpec = value >= LSL && value <= USL;
      const status = isInSpec ? 'In Spec' : 'Out of Spec';
      const deviation = value - target;
      csv += `${index + 1},${value.toFixed(3)},${status},${deviation.toFixed(3)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bolt_Length_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Link to="/" className="inline-block mb-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Descriptive Statistics</CardTitle>
          <p className="text-gray-600 mt-2">Learn about distributions, Z-scores, and the Central Limit Theorem</p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="distributions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="distributions">Location, Dispersion & Distribution</TabsTrigger>
          <TabsTrigger value="zscore-clt">Z-Score & Central Limit Theorem</TabsTrigger>
        </TabsList>

        <TabsContent value="distributions">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Interactive Manufacturing Quality Control Example</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Controls */}
              <div className="bg-gray-50 p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Mean (μ): {mean} mm</label>
                  <input
                    type="range"
                    min="90"
                    max="110"
                    step="0.5"
                    value={mean}
                    onChange={(e) => setMean(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Standard Deviation (σ): {std} mm</label>
                  <input
                    type="range"
                    min="0.5"
                    max="8"
                    step="0.1"
                    value={std}
                    onChange={(e) => setStd(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Distribution Shape</label>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="normal">Normal</option>
                    <option value="rightSkew">Right Skewed</option>
                    <option value="leftSkew">Left Skewed</option>
                    <option value="bimodal">Bimodal</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Sample Size: {sampleSize}</label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={sampleSize}
                    onChange={(e) => setSampleSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Number of Bins: {bins}</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={bins}
                    onChange={(e) => setBins(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={downloadCSV}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                  >
                    Download Data (CSV)
                  </button>
                </div>
              </div>

              {/* Main Chart */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div ref={histogramRef}></div>
              </div>

              {/* Statistics Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-bold mb-2">📍 Location (Central Tendency)</h3>
                      <div className="text-3xl font-bold my-3">{stats.mean.toFixed(2)} mm</div>
                      <div className="space-y-1 text-sm">
                        <p>Mean: {stats.mean.toFixed(2)} mm</p>
                        <p>Median: {stats.median.toFixed(2)} mm</p>
                        <p>Mode: ~{stats.mean.toFixed(0)} mm</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-bold mb-2">📊 Dispersion (Spread)</h3>
                      <div className="text-3xl font-bold my-3">{stats.std.toFixed(2)} mm</div>
                      <div className="space-y-1 text-sm">
                        <p>Std Dev: {stats.std.toFixed(2)} mm</p>
                        <p>Range: {stats.range.toFixed(2)} mm</p>
                        <p>IQR: {stats.iqr.toFixed(2)} mm</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-bold mb-2">📈 Distribution Shape</h3>
                      <div className="text-3xl font-bold my-3">{shapeNames[shape]}</div>
                      <div className="space-y-1 text-sm">
                        <p>Shape: {shapeNames[shape]}</p>
                        <p>Skewness: {stats.skewness.toFixed(2)}</p>
                        <p>Within Spec: {stats.withinSpec.toFixed(1)}%</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Key Insights */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-800 mb-4">💡 Key Insights</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>68%</strong> of data falls within ±1 standard deviation</li>
                  <li>• <strong>95%</strong> of data falls within ±2 standard deviations</li>
                  <li>• <strong>99.7%</strong> of data falls within ±3 standard deviations</li>
                  <li>• Lower standard deviation = more consistent manufacturing process</li>
                  <li>• Target specification: 95mm to 105mm (±5mm tolerance)</li>
                </ul>
              </div>

              {/* Process Comparison */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Comparing Two Manufacturing Processes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center text-green-700">Process A - Highly Controlled (σ = 1mm)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div ref={processARef}></div>
                      <p className="text-center mt-2 text-sm text-gray-600">Tight distribution, minimal variation</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center text-red-700">Process B - Poor Control (σ = 5mm)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div ref={processBRef}></div>
                      <p className="text-center mt-2 text-sm text-gray-600">Wide distribution, high variation</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Data Table Section */}
              <Card>
                <CardHeader>
                  <button
                    onClick={() => setShowDataTable(!showDataTable)}
                    className="w-full flex justify-between items-center bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 rounded-lg hover:from-purple-700 hover:to-purple-900"
                  >
                    <h3 className="text-xl font-bold">📋 View Raw Data Table</h3>
                    <span className={`text-2xl transition-transform ${showDataTable ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                </CardHeader>
                {showDataTable && (
                  <CardContent>
                    <div className="overflow-auto max-h-96">
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="border p-2">Index</th>
                            <th className="border p-2">Length (mm)</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Deviation from Target</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentData.slice(0, 100).map((value, index) => {
                            const isInSpec = value >= 95 && value <= 105;
                            const deviation = value - 100;
                            return (
                              <tr key={index} className={isInSpec ? 'bg-green-50' : 'bg-red-50'}>
                                <td className="border p-2 text-center">{index + 1}</td>
                                <td className="border p-2 text-center">{value.toFixed(3)}</td>
                                <td className={`border p-2 text-center font-semibold ${isInSpec ? 'text-green-700' : 'text-red-700'}`}>
                                  {isInSpec ? 'In Spec' : 'Out of Spec'}
                                </td>
                                <td className="border p-2 text-center">{deviation > 0 ? '+' : ''}{deviation.toFixed(3)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {currentData.length > 100 && (
                        <p className="text-center text-gray-600 mt-4">Showing first 100 of {currentData.length} samples</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zscore-clt">
          <ZScoreCLT />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsLesson;
