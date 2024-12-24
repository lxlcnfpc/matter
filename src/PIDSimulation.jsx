import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Slider } from './components/ui/slider';

const PIDSimulation = () => {
  // PID Parameters
  const [kp, setKp] = useState(1.0);
  const [ki, setKi] = useState(0.1);
  const [kd, setKd] = useState(0.05);
  
  // Simulation state
  const [setpoint, setSetpoint] = useState(15);
  const [processValue, setProcessValue] = useState(25);
  const [integral, setIntegral] = useState(0);
  const [lastError, setLastError] = useState(0);
  const [time, setTime] = useState(0);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Process model parameters
  const timeStep = 0.1;
  const processTimeConstant = 5;
  const processGain = 0.8;
  
  // PID calculation
  const calculatePID = (pv) => {
    const error = setpoint - pv;
    const p = kp * error;
    const newIntegral = integral + (ki * error * timeStep);
    setIntegral(newIntegral);
    const derivative = (error - lastError) / timeStep;
    setLastError(error);
    return p + newIntegral + (kd * derivative);
  };

  // Process model simulation
  const updateProcess = (controlSignal) => {
    const natureCooling = (25 - processValue) * 0.1;
    const heatingEffect = controlSignal * processGain;
    return processValue + ((heatingEffect + natureCooling) / processTimeConstant) * timeStep;
  };

  useEffect(() => {
    let intervalId;
    
    if (isRunning) {
      intervalId = setInterval(() => {
        const pidOutput = calculatePID(processValue);
        const newPV = updateProcess(pidOutput);
        
        setProcessValue(newPV);
        setTime(t => t + timeStep);
        
        setHistory(prev => [...prev, {
          time: time.toFixed(1),
          setpoint: setpoint,
          temperature: newPV.toFixed(2),
          controlSignal: pidOutput.toFixed(2)
        }].slice(-100));
      }, timeStep * 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [isRunning, processValue, time, setpoint, kp, ki, kd]);

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Iced Tea Plant PID Control Simulation</CardTitle>
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
                  max={5}
                  step={0.1}
                  onValueChange={([value]) => setKp(value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Integral (Ki): {ki.toFixed(2)}
                </label>
                <Slider
                  defaultValue={[ki]}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => setKi(value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Derivative (Kd): {kd.toFixed(2)}
                </label>
                <Slider
                  defaultValue={[kd]}
                  max={0.5}
                  step={0.01}
                  onValueChange={([value]) => setKd(value)}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium mb-2">
                  Setpoint Temperature (°C): {setpoint}°C
                </label>
                <Slider
                  defaultValue={[setpoint]}
                  min={5}
                  max={25}
                  step={1}
                  onValueChange={([value]) => setSetpoint(value)}
                />
              </div>
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
                    setProcessValue(25);
                    setIntegral(0);
                    setLastError(0);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

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
                    name="Process Temperature" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="controlSignal" 
                    stroke="#ff7300" 
                    name="Control Signal" 
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
