import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Slider } from './components/ui/slider';

const PIDSimulation = () => {

    // Physical constants
  const WATER_MASS = 60; // kg
  const WATER_SPECIFIC_HEAT = 4.186; // kJ/kg·°C
  const STEAM_TEMPERATURE = 80; // °C
  const AMBIENT_TEMPERATURE = 25; // °C
  const MAX_STEAM_FLOW = 0.02; // kg/s - maximum steam flow rate
  const HEAT_TRANSFER_COEFFICIENT = 0.05; // Heat loss coefficient to environment
  const STEAM_LATENT_HEAT = 2257; // kJ/kg - latent heat of vaporization at 100°C
  const STEAM_SPECIFIC_HEAT = 2.08; // kJ/kg*°C - specific heat of steam

  // PID Parameters
  const [kp, setKp] = useState(1.0);
  const [ki, setKi] = useState(0.1);
  const [kd, setKd] = useState(0.05);
  
  // Simulation state
  const [setpoint, setSetpoint] = useState(72);
  const [processValue, setProcessValue] = useState(AMBIENT_TEMPERATURE);
  const [integral, setIntegral] = useState(0);
  const [lastError, setLastError] = useState(0);
  const [time, setTime] = useState(0);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Process model parameters
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const timeStep = 0.2; // seconds
  

  //Function to export data as CSV
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
  
  // PID calculation
  const calculatePID = (pv) => {
    const error = setpoint - pv;

    // Calculate PID terms
    const p = kp * error;
    const d = kd * (error - lastError) / timeStep;
    const i = integral + (ki * error * timeStep);

    // Calculate preliminary control output without integral term
    const prelimOutput = p + integral + d;

    // Anti-windup: Only integrate if value is not saturated
    if (prelimOutput > 0 && prelimOutput < 100) {
      setIntegral(i);
    }

    setLastError(error);

    // Clamp control output to 0-100%
    return Math.max(0, Math.min(100, p + i + d));
  };

  // Process model simulation
  const updateProcess = (valvePosition) => {
    // Steam flow based on valve position (0-100%)
    const steamFlow = (valvePosition / 100) * MAX_STEAM_FLOW;

    // Heat transfer from steam includes:
    // 1. Latent heat from steam condensation
    // 2. Sensible heat from the temperature difference
    const heatTransferSteam = steamFlow * (
      STEAM_LATENT_HEAT + // Latent heat of condensation
      (STEAM_SPECIFIC_HEAT * (STEAM_TEMPERATURE - processValue)) // Sensible heat
    );
    
    // Heat Loss to environment (Assuming Newton's law of cooling can be applied)
    const heatLoss = HEAT_TRANSFER_COEFFICIENT * (processValue - AMBIENT_TEMPERATURE);

    // Net temperature change (DELTAT = Q/(m*c))
    const netHeatTransfer = heatTransferSteam - heatLoss;
    const temperatureChange = (netHeatTransfer / (WATER_MASS * WATER_SPECIFIC_HEAT)) * timeStep;

    return processValue + temperatureChange;
  };

  useEffect(() => {
    let intervalId;
    
    if (isRunning) {
      // Adjust interval based on simulation speed
      const interval = Math.max(100, (timeStep * 1000) / simulationSpeed); // Minimum 100ms interval
      
      intervalId = setInterval(() => {
        const valvePosition = calculatePID(processValue);
        const newPV = updateProcess(valvePosition);
        
        setProcessValue(newPV);
        setTime(t => t + timeStep * simulationSpeed);
        
        setHistory(prev => [...prev, {
          time: time.toFixed(1),
          setpoint: setpoint,
          temperature: newPV.toFixed(2),
          valvePosition: valvePosition.toFixed(2)
        }].slice(-600)); // Keep last 60 seconds of data
      }, interval);
    }
    
    return () => clearInterval(intervalId);
  }, [isRunning, processValue, time, setpoint, kp, ki, kd, simulationSpeed, integral, lastError]);

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Tea Brewing Temperature Control Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Proportional (Kp): {kp.toFixed(2)}
                </label>
                <Slider
                  defaultValue={[kp]}
                  max={10}
                  step={0.1}
                  onValueChange={([value]) => setKp(value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Integral Gain (Ki): {ki.toFixed(2)}
                </label>
                <Slider
                  defaultValue={[ki]}
                  max={0.5}
                  step={0.01}
                  onValueChange={([value]) => setKi(value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Derivative Gain (Kd): {kd.toFixed(2)}
                </label>
                <Slider
                  defaultValue={[kd]}
                  max={0.2}
                  step={0.01}
                  onValueChange={([value]) => setKd(value)}
                />
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
                  max={100}
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
            <div className="h-96">
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
                    domain ={[0,90]}
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="setpoint" 
                    stroke="#8884d8" 
                    name="Setpoint" 
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
