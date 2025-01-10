import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Slider } from './components/ui/slider';
import { Input } from './components/ui/input';

const PIDSimulation = () => {
  // Physical constants remain unchanged
  const WATER_MASS = 60; // kg
  const WATER_SPECIFIC_HEAT = 4.186; // kJ/kg·°C
  const STEAM_TEMPERATURE = 80; // °C
  const AMBIENT_TEMPERATURE = 25; // °C
  const MAX_STEAM_FLOW = 0.02; // kg/s - maximum steam flow rate
  const HEAT_TRANSFER_COEFFICIENT = 0.05; // Heat loss coefficient to environment
  const STEAM_LATENT_HEAT = 2257; // kJ/kg - latent heat of vaporization at 100°C
  const STEAM_SPECIFIC_HEAT = 2.08; // kJ/kg·°C - specific heat of steam

  // PID Parameters
  const [kp, setKp] = useState(2.0);  // Increased for faster response
  const [ki, setKi] = useState(0.15); // Increased for better steady-state
  const [kd, setKd] = useState(0.05);
  
  // Simulation state
  const [setpoint, setSetpoint] = useState(72);
  const [processValue, setProcessValue] = useState(AMBIENT_TEMPERATURE);
  const [integral, setIntegral] = useState(0);
  const [lastError, setLastError] = useState(0);
  const [time, setTime] = useState(0);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // New state for simulation speed
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const timeStep = 0.1; // Base time step in seconds

  // Function to export data as CSV
  const exportToCSV = () => {
    // Create CSV header
    const csvHeader = 'Time (s),Setpoint (°C),Temperature (°C),Valve Position (%)\n';
    
    // Convert data to CSV rows
    const csvRows = history.map(record => 
      `${record.time},${record.setpoint},${record.temperature},${record.valvePosition}`
    ).join('\n');
    
    // Combine header and rows
    const csvString = csvHeader + csvRows;
    
    // Create blob and download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Set up and trigger download
    link.setAttribute('href', url);
    link.setAttribute('download', `temperature_control_data_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PID calculation with proper anti-windup
  const calculatePID = (pv) => {
    const error = setpoint - pv;
    
    // Calculate individual PID terms
    const p = kp * error;
    const i = integral + (ki * error * timeStep);
    const d = kd * (error - lastError) / timeStep;
    
    // Calculate preliminary output without new integral term
    const prelimOutput = p + integral + d;
    
    // Anti-windup: Only update integral if not saturated
    if (prelimOutput > 0 && prelimOutput < 100) {
      setIntegral(i);
    }
    
    setLastError(error);
    
    // Clamp final control output to 0-100%
    return Math.max(0, Math.min(100, p + i + d));
  };

  // Process model simulation
  const updateProcess = (valvePosition) => {
    // Steam flow based on valve position (0-100%)
    const steamFlow = (valvePosition / 100) * MAX_STEAM_FLOW;

    // Heat transfer calculations
    const heatTransferSteam = steamFlow * (
      STEAM_LATENT_HEAT + // Latent heat of condensation
      (STEAM_SPECIFIC_HEAT * (STEAM_TEMPERATURE - processValue)) // Sensible heat
    );
    
    const heatLoss = HEAT_TRANSFER_COEFFICIENT * (processValue - AMBIENT_TEMPERATURE);

    // Net temperature change (ΔT = Q/(m*c))
    const netHeatTransfer = heatTransferSteam - heatLoss;
    const temperatureChange = (netHeatTransfer / (WATER_MASS * WATER_SPECIFIC_HEAT)) * timeStep;
    
    return processValue + temperatureChange;
  };

  useEffect(() => {
    let intervalId;
    
    if (isRunning) {
      // Fixed display update interval (50ms)
      const displayInterval = 50;
      
      intervalId = setInterval(() => {
        // Calculate number of physics steps to maintain accuracy
        const numSteps = Math.max(1, Math.round(simulationSpeed));
        
        // Run multiple small steps for physics accuracy
        let currentPV = processValue;
        let currentTime = time;
        let integralValue = integral;
        let lastErrorValue = lastError;
        let newValvePosition = 0;
        
        for (let i = 0; i < numSteps; i++) {
          const error = setpoint - currentPV;
          
          // PID calculations
          const p = kp * error;
          const d = kd * (error - lastErrorValue) / timeStep;
          
          // Anti-windup logic
          if ((p + d) > 0 && (p + d) < 100) {
            integralValue += ki * error * timeStep;
          }
          lastErrorValue = error;
          
          // Calculate valve position
          newValvePosition = Math.max(0, Math.min(100, p + integralValue + d));
          
          // Update process with original timestep
          const steamFlow = (newValvePosition / 100) * MAX_STEAM_FLOW;
          const heatTransferSteam = steamFlow * (
            STEAM_LATENT_HEAT +
            (STEAM_SPECIFIC_HEAT * (STEAM_TEMPERATURE - currentPV))
          );
          const heatLoss = HEAT_TRANSFER_COEFFICIENT * (currentPV - AMBIENT_TEMPERATURE);
          const netHeatTransfer = heatTransferSteam - heatLoss;
          const temperatureChange = (netHeatTransfer / (WATER_MASS * WATER_SPECIFIC_HEAT)) * timeStep;
          
          currentPV += temperatureChange;
          currentTime += timeStep;
        }
        
        // Batch state updates after all steps
        setProcessValue(currentPV);
        setTime(currentTime);
        setIntegral(integralValue);
        setLastError(lastErrorValue);
        
        // Update history
        setHistory(prev => [...prev, {
          time: currentTime.toFixed(1),
          setpoint: setpoint,
          temperature: currentPV.toFixed(2),
          valvePosition: newValvePosition.toFixed(2)
        }].slice(-600));
        
      }, displayInterval);
    }
    
    return () => clearInterval(intervalId);
  }, [isRunning, processValue, time, setpoint, kp, ki, kd, simulationSpeed, integral, lastError]);

  return (
    <div className="space-y-6 w-full p-4">
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Tea Brewing Temperature Control Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 w-full p-4">
            {/* PID Controls - unchanged */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Proportional Gain (Kp)
                </label>
                <div className="flex gap-4">
                  <Slider
                    className="flex-1"
                    value={[kp]}
                    max={10}
                    step={0.1}
                    onValueChange={([value]) => setKp(value)}
                  />
                  <Input
                    type="number"
                    value={kp}
                    onChange={(e) => setKp(Number(e.target.value))}
                    className="w-20"
                    min={0}
                    max={10}
                    step={0.1}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Integral Gain (Ki): {ki.toFixed(2)}
                </label>
                <div className="flex gap-4">
                  <Slider
                    className="flex-1"
                    defaultValue={[ki]}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) => setKi(value)}
                  />
                  <Input
                    type="number"
                    value={ki}
                    onChange={(e) => setKi(Number(e.target.value))}
                    className="w-40"
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Derivative Gain (Kd): {kd.toFixed(2)}
                </label>
                <div className="flex gap-4">
                  <Slider
                    className="flex-1"
                    defaultValue={[kd]}
                    max={0.4}
                    step={0.01}
                    onValueChange={([value]) => setKd(value)}
                  />
                   <Input
                    type="number"
                    value={kd}
                    onChange={(e) => setKd(Number(e.target.value))}
                    className="w-40"
                    min={0}
                    max={0.4}
                    step={0.01}
                  />
                </div>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Temperature (°C): {setpoint}°C
                </label>
                <Slider
                  defaultValue={[setpoint]}
                  min={25}
                  max={80}
                  step={1}
                  onValueChange={([value]) => setSetpoint(value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Simulation Speed (x{simulationSpeed})
                </label>
                <Slider
                  defaultValue={[simulationSpeed]}
                  min={0.1}
                  max={30}
                  step={0.1}
                  onValueChange={([value]) => setSimulationSpeed(value)}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? 'Stop' : 'Start'} Simulation
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => {
                  setHistory([]);
                  setTime(0);
                  setProcessValue(AMBIENT_TEMPERATURE);
                  setIntegral(0);
                  setLastError(0);
                }}
              >
                Reset
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={exportToCSV}
                disabled={history.length === 0}
              >
                Export Data
              </button>
            </div>

            {/* Chart */}
            <div className="h-96 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    label={{ value: 'Time (s)', position: 'bottom' }} 
                  />
                  <YAxis 
                    label={{ 
                      value: 'Temperature (°C)', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }} 
                    domain={[0, 100]}
                  />
                  <Tooltip />
                  <Legend 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px"}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="setpoint" 
                    stroke="#8884d8" 
                    name="Target Temperature" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#82ca9d" 
                    name="Current Temperature" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="valvePosition" 
                    stroke="#ff7300" 
                    name="Valve Position (%)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PIDSimulation;
