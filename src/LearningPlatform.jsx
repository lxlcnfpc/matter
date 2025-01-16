import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PIDSimulation from './components/control/PIDSimulation';
import ManualSimulation from './components/control/ManualSimulation';
import MatchingGame from './components/control/MatchingGame.jsx';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import ctrl_loop from './assets/ctrl_loop.png';
import brewing_pid from './assets/brewing_pid.png'; 
const LearningPlatform = () => {
  const [completedSections, setCompletedSections] = useState(new Set());

  const markSectionComplete = (sectionId) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
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
          <CardTitle>Control Theory and PID Control</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">
            Welcome to this interactive course on Control Theory and PID Control. 
            Work through each section to master the concepts and practice with our interactive simulator.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="basics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="basics" className="flex items-center gap-2">
            Fundamentals
            {completedSections.has('basics') && <Check className="h-4 w-4" />}
          </TabsTrigger>
          <TabsTrigger value="loops" className="flex items-center gap-2">
            Control Loops
            {completedSections.has('loops') && <Check className="h-4 w-4" />}
          </TabsTrigger>
          <TabsTrigger value="pid" className="flex items-center gap-2">
            PID Control
            {completedSections.has('pid') && <Check className="h-4 w-4" />}
          </TabsTrigger>
          <TabsTrigger value="tuning" className="flex items-center gap-2">
            Tuning & Metrics
            {completedSections.has('tuning') && <Check className="h-4 w-4" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <Card>
            <CardHeader>
              <CardTitle>Basic Control Theory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold">What is Control Theory?</h3>
                <p>Control theory is the study of dynamical systems and how to manipulate their behavior. 
                In our daily lives, we encounter control systems everywhere - from temperature control 
                in our homes to cruise control in cars.</p>
                
                <h3 className="text-xl font-semibold mt-6">Key Concepts</h3>
                <p>For a detailed explanation please refer to the course documents.
                On this page, we will only highlight the most relevant elements.
                Let's have a look at the basic control loop structure and its corresponding components. </p>
                <img className="mt-8 mb-8" src={ctrl_loop} alt="Control Loop Diagram"/>
                <p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Process Variable (or Output) [x]: The quantity we want to control (which is this output of our process)</li>
                  <li>Setpoint [w]: The desired value of the process variable</li>
                  <li>Control Variable (or Control Signal) [y]: The quantity we can adjust to affect the process</li>
                  <li>Error [e = w - x]: The difference between setpoint [w] and process variable [x]</li>
                </ul>
                </p>

                <h3 className="text-xl font-semibold mt-6">Brewing Process</h3>
                <p>Here you can see a simplified representation of the P&ID for the brewing stage in our ice tea production line</p>
                <img className="mt-8 mb-8" src={brewing_pid} alt="P&ID of Brewing Process"/>
                <p>The water in the brewing tank is heated with hot steam. 
                The steam flow can be controlled with the control valve 001.
                Depending on the receipe, the tea needs to be brewed with a different temperature.
                A temperature which is too high, can lead to a bitter taset.
                A temperature which is too low can lead to a diminished extraction, resulting in a lack of flavor.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg my-6">
                  <h4 className="text-lg font-semibold text-blue-800">Practice Exercise: Match the Variables</h4>
                  <p className="mb-4">Match each theoretical control variable with its corresponding element in our brewing process:</p>
                  <MatchingGame />
                </div>

                <p> In order to control the temperature, we can open or close the control valve for the steam.
                Our goal is to find the best valve position at each moment, so that the desired temperature is reached quickly and remains stable during the process.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg my-6">
                  <h4 className="text-lg font-semibold text-blue-800">Manual Control Exercise</h4>
                  <p>Try to maintain a constant temperature manually by adjusting the valve position.
                  Notice how challenging it is to maintain stability without automated control:</p>
                  <ManualSimulation />
                </div>
              </div>

              <button 
                onClick={() => markSectionComplete('basics')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark Section Complete
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loops">
          <Card>
            <CardHeader>
              <CardTitle>Understanding Control Loops</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold">Open vs. Closed Loop Control</h3>
                <p>Control systems can be categorized into two main types:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  <div className="border p-4 rounded">
                    <h4 className="font-semibold">Open Loop Control</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>No feedback from the process</li>
                      <li>Cannot compensate for disturbances</li>
                      <li>Simple but less accurate</li>
                      <li>Example: Traditional toaster</li>
                    </ul>
                  </div>
                  <div className="border p-4 rounded">
                    <h4 className="font-semibold">Closed Loop Control</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Uses feedback from the process</li>
                      <li>Can compensate for disturbances</li>
                      <li>More complex but more accurate</li>
                      <li>Example: Home thermostat</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg my-6">
                  <h4 className="text-lg font-semibold text-blue-800">Feedback Exercise</h4>
                  <p>Try adjusting the setpoint in our simulation. Notice how the system automatically 
                  responds to changes and disturbances - this is closed-loop control in action:</p>
                  <PIDSimulation />
                </div>
              </div>

              <button 
                onClick={() => markSectionComplete('loops')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark Section Complete
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pid">
          <Card>
            <CardHeader>
              <CardTitle>PID Control Fundamentals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold">Understanding PID Components</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                  <div className="border p-4 rounded">
                    <h4 className="font-semibold">Proportional (P)</h4>
                    <p>Responds proportionally to the current error</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Fast response</li>
                      <li>May have steady-state error</li>
                      <li>Higher values = faster response</li>
                      <li>Too high = oscillations</li>
                    </ul>
                  </div>
                  
                  <div className="border p-4 rounded">
                    <h4 className="font-semibold">Integral (I)</h4>
                    <p>Accumulates past errors</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Eliminates steady-state error</li>
                      <li>Slower to respond</li>
                      <li>Higher values = faster correction</li>
                      <li>Too high = overshoot</li>
                    </ul>
                  </div>
                  
                  <div className="border p-4 rounded">
                    <h4 className="font-semibold">Derivative (D)</h4>
                    <p>Responds to rate of change</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Reduces overshoot</li>
                      <li>Anticipates error changes</li>
                      <li>Sensitive to noise</li>
                      <li>Often kept small or zero</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg my-6">
                  <h4 className="text-lg font-semibold text-blue-800">Component Testing</h4>
                  <p>Experiment with each component individually:</p>
                  <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Set Ki and Kd to 0, adjust only Kp</li>
                    <li>Reset, then try only Ki (Kp=1, Kd=0)</li>
                    <li>Finally, add small amounts of Kd</li>
                  </ol>
                  <PIDSimulation />
                </div>
              </div>

              <button 
                onClick={() => markSectionComplete('pid')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark Section Complete
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tuning">
          <Card>
            <CardHeader>
              <CardTitle>Controller Performance & Tuning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold">Performance Metrics</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Rise Time: Time to reach near setpoint</li>
                  <li>Overshoot: Maximum peak above setpoint</li>
                  <li>Settling Time: Time to stay within error band</li>
                  <li>Steady-State Error: Persistent offset from setpoint</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">Basic Tuning Guidelines</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Start with P control only (Ki=Kd=0)</li>
                    <li>Increase Kp until acceptable response speed, but with tolerable oscillation</li>
                    <li>Add Ki to eliminate steady-state error</li>
                    <li>If needed, add small Kd to reduce overshoot</li>
                  </ol>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg my-6">
                  <h4 className="text-lg font-semibold text-blue-800">Tuning Challenge</h4>
                  <p>Try to achieve these targets using the simulator:</p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Rise time &lt; 10 seconds</li>
                    <li>Overshoot &lt; 10%</li>
                    <li>Settling time &lt; 30 seconds</li>
                    <li>No steady-state error</li>
                  </ul>
                  <p className="text-sm text-blue-700 mb-4">Hint: Start with Kp=2, Ki=0.1, Kd=0.05</p>
                  <PIDSimulation />
                </div>
              </div>

              <button 
                onClick={() => markSectionComplete('tuning')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark Section Complete
              </button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningPlatform;
