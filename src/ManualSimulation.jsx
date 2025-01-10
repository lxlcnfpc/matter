import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
const ManualSimulation = () => {
  // Physical constants (simplified from PID simulation)
  const WATER_MASS = 1; // kg
  const WATER_SPECIFIC_HEAT = 4.186; // kJ/kg·°C
  const STEAM_TEMPERATURE = 80; // °C
  const AMBIENT_TEMPERATURE = 25; // °C
  const MAX_STEAM_FLOW = 0.2; // kg/s
  const HEAT_TRANSFER_COEFFICIENT = 0.8; // Heat loss coefficient
  const STEAM_LATENT_HEAT = 2257; // kJ/kg
  const STEAM_SPECIFIC_HEAT = 2.08; // kJ/kg·°C

  // State
  const [valvePosition, setValvePosition] = useState(0);
  const [temperature, setTemperature] = useState(AMBIENT_TEMPERATURE);
  const [targetTemp] = useState(72); // Fixed target temperature
  const [time, setTime] = useState(0);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(100);
  const [feedback, setFeedback] = useState('');

  // Score tracking
  const updateScore = (currentTemp) => {
    const error = Math.abs(targetTemp - currentTemp);
    if (error > 5) {
      setScore(prev => Math.max(0, prev - 0.1)); // Lose points faster when far from target
      setFeedback('Temperature is far from target - adjust the valve!');
    } else if (error > 2) {
      setScore(prev => Math.max(0, prev - 0.05));
      setFeedback('Getting closer, but needs fine-tuning');
    } else {
      setFeedback('Good control! Maintaining temperature well');
    }
  };

  useEffect(() => {
    let intervalId;
    
    if (isRunning) {
      const timeStep = 0.1; // seconds
      
      intervalId = setInterval(() => {
        // Calculate heat transfer
        const steamFlow = (valvePosition / 100) * MAX_STEAM_FLOW;
        const heatTransferSteam = steamFlow * (
          STEAM_LATENT_HEAT +
          STEAM_SPECIFIC_HEAT * (STEAM_TEMPERATURE - temperature)
        );
        
        const heatLoss = HEAT_TRANSFER_COEFFICIENT * (temperature - AMBIENT_TEMPERATURE);
        const netHeatTransfer = heatTransferSteam - heatLoss;
        
        // Update temperature
        const temperatureChange = (netHeatTransfer / (WATER_MASS * WATER_SPECIFIC_HEAT)) * timeStep;
        const newTemp = temperature + temperatureChange;
        
        setTemperature(newTemp);
        setTime(prev => prev + timeStep);
        
        // Update history and score
        setHistory(prev => [...prev, {
          time: time.toFixed(1),
          temperature: newTemp.toFixed(2),
          target: targetTemp,
          valvePosition: valvePosition
        }].slice(-300)); // Keep last 30 seconds

        updateScore(newTemp);
        
      }, 100); // Update every 100ms for smooth animation
    }
    
    return () => clearInterval(intervalId);
  }, [isRunning, valvePosition, temperature, time]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Challenge</h3>
        <p className="text-blue-700">
          Try to maintain a temperature of {targetTemp}°C by manually adjusting the valve position.
          Your score starts at 100 and decreases when the temperature deviates from the target.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Valve Position: {valvePosition}%
          </label>
          <Slider
            value={[valvePosition]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => setValvePosition(value)}
            className="mb-4"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-lg font-semibold">Score: {Math.round(score)}</div>
          <div className="text-sm text-gray-600">{feedback}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Pause' : 'Start'} Simulation
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => {
            setHistory([]);
            setTime(0);
            setTemperature(AMBIENT_TEMPERATURE);
            setValvePosition(0);
            setScore(100);
          }}
        >
          Reset
        </button>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer>
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
              wrapperStyle={{ paddingTop: "20px"}}/>
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#8884d8" 
              name="Target Temperature"
              strokeDasharray="5 5"
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
  );
};

export default ManualSimulation;
