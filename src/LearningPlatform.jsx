import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import PIDSimulation from './components/control/PIDSimulation';
import PSimulation from './components/control/PSimulation';
import ManualSimulation from './components/control/ManualSimulation';
import MatchingGame from './components/control/MatchingGame.jsx';

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

      <Tabs defaultValue="basics" className="space-y-8">
        <div className="min-h-[88px]">
          <TabsList className="grid w-full grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              Metrics
              {completedSections.has('metrics') && <Check className="h-4 w-4" />}
            </TabsTrigger>
            <TabsTrigger value="challenge" className="flex items-center gap-2">
              Control Challenge 
              {completedSections.has('challenge') && <Check className="h-4 w-4" />}
            </TabsTrigger>
          </TabsList>
        </div>

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
                Our goal is to find the best valve position at each moment, so that the desired temperature is reached quickly and remains stable during the process.</p>

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
                <h3 className="text-xl font-semibold mt-6">Introduction to P-Control</h3>
                <p>The simplest form of automated control is proportional (P) control. Let's understand how it works using our brewing system as an example.</p>

                <div className="bg-gray-100 p-4 rounded-lg my-4">
                <h4 className="font-semibold">Basic Principle</h4>
                <p>In P-control, we adjust the control variable (valve position) proportionally to the error:</p>
                <div className="mt-2 p-2 bg-white rounded border">
                  <code>Valve Position = Kp × (Setpoint Temperature - Current Temperature)</code>
                </div>
                <p className="mt-2">Where:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Kp is the proportional gain (our tuning parameter)</li>
                  <li>Error is the difference between where we want to be (setpoint) and where we are (current temperature)</li>
                </ul>
                </div>

                <h4 className="font-semibold mt-6">How P-Control Works</h4>
                <div className="space-y-3">
                <p>Let's break down how P-control operates in our brewing system:</p>

                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Large Error:</strong> When the temperature is far below the setpoint, we have a large error:
                    <ul className="list-disc pl-6 mt-1">
                      <li>For example, if we want 75°C but we're at 25°C, error = 50°C</li>
                      <li>With Kp = 2, valve position = 2 × 50 = 100% (fully open)</li>
                    </ul>
                  </li>
                  
                  <li>
                    <strong>Medium Error:</strong> As we get closer to the setpoint, the error decreases:
                    <ul className="list-disc pl-6 mt-1">
                      <li>If we're at 65°C wanting 75°C, error = 10°C</li>
                      <li>With Kp = 2, valve position = 2 × 10 = 20% open</li>
                    </ul>
                  </li>
                  
                  <li>
                    <strong>Small Error:</strong> Near the setpoint, we make small adjustments:
                    <ul className="list-disc pl-6 mt-1">
                      <li>At 73°C wanting 75°C, error = 2°C</li>
                      <li>With Kp = 2, valve position = 2 × 2 = 4% open</li>
                    </ul>
                  </li>
                </ol>
                </div>

                <h4 className="font-semibold mt-6">Limitations of P-Control</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="border p-4 rounded">
                  <h5 className="font-semibold text-purple-700">The Challenge of Steady State</h5>
                  <p>P-control often can't reach the exact setpoint because:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Some valve opening is needed just to maintain temperature</li>
                    <li>If we reach setpoint, error = 0, so valve closes completely</li>
                    <li>This leads to a persistent offset (steady-state error)</li>
                  </ul>
                </div>

                <div className="border p-4 rounded">
                  <h5 className="font-semibold text-purple-700">The Stability Trade-off</h5>
                  <p>Choosing Kp involves a balance:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Higher Kp = Faster response but more oscillation</li>
                    <li>Lower Kp = Stable but slow response</li>
                    <li>No single value solves both problems</li>
                  </ul>
                </div>
                </div>

                <h3 className="text-xl font-semibold mt-6">Try it for yourself</h3>
                <div className="bg-yellow-50 p-4 rounded-lg my-6">
                <h4 className="text-lg font-semibold text-yellow-800">Think About It</h4>
                <p>Before moving to the simulation, consider:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>What happens if we make changes to Kp?</li>
                  <li>Why can't we solve the steady-state error by just increasing Kp?</li>
                  <li>How might the system behave differently if we're cooling instead of heating?</li>
                </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg my-6">
                  <h4 className="text-lg font-semibold text-blue-800">Feedback Exercise</h4>
                  <p>Below is a simulation of P-control in action.
                    The model had been adapted to simulate the actual behavior of the brewing station in our plant. 
                    To make the simulation usable, you can increase the simulation speed.
                    Try to answer the following questions: </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>What happens if we adjust the setpoint during the simulation?</li>
                    <li>What happens if we make Kp very small (e.g., Kp = 0.1)?</li>
                    <li>What happens if we make Kp very large (e.g., Kp = 10)?</li>
                    <li>Why can't we solve the steady-state error by just increasing Kp?</li>
                  </ul>
                  <PSimulation />
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg my-6">
                <h4 className="text-lg font-semibold text-yellow-800">Test it</h4>
                <p>Try to find a setting for Kp which makes sense to you. Note how long it takes with this setting for the temperature to be within 2°C of the target tempertaure.
                  Note the duration, the Kp value and setpoint. 
                  We will try to improve this during the next sections.</p>
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
                <h3 className="text-xl font-semibold mt-6">Mathematical Foundation</h3>
                <p>The PID controller combines three terms to generate the control signal. Let's examine each component mathematically:</p>
 
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold">The Complete PID Equation</h4>
                    <p className="mb-2">The control signal u(t) is calculated as:</p>
                    <div className="text-center my-2">
                      <BlockMath math={`u(t) = K_p e(t) + K_i \\int_0^t e(\\tau) d\\tau + K_d \\frac{d}{dt}e(t)`} />
                    </div>
                    <p className="mt-2">Where <InlineMath math="e(t)" /> is the error at time t, defined as <InlineMath math="e(t) = \text{setpoint} - \text{measured value}" /></p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border p-4 rounded">
                      <h4 className="font-semibold">Proportional Term</h4>
                      <div className="text-center my-2">
                        <BlockMath math="u_P(t) = K_p e(t)" />
                      </div>
                      <p className="mt-2">This term creates an immediate response proportional to the current error. Think of it as a spring: the further from setpoint, the stronger the correction.</p>
                    </div>

                    <div className="border p-4 rounded">
                      <h4 className="font-semibold">Integral Term</h4>
                      <div className="text-center my-2">
                        <BlockMath math="u_I(t) = K_i \int_0^t e(\tau) d\tau" />
                      </div>
                      <p className="mt-2">This term sums up all past errors. It's like having a memory of past deviations, ensuring we eventually reach our target.</p>
                    </div>

                    <div className="border p-4 rounded">
                      <h4 className="font-semibold">Derivative Term</h4>
                      <div className="text-center my-2">
                        <BlockMath math="u_D(t) = K_d \frac{d}{dt}e(t)" />
                      </div>
                      <p className="mt-2">This term responds to the rate of change. It's like having a brake that activates when we're changing too quickly.</p>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold">Digital Implementation</h4>
                    <p>In practice, we use discrete approximations:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>The integral becomes a sum: <InlineMath math="\sum_{k=0}^n e(k)\cdot dt" /></li>
                      <li>The derivative becomes a difference: <InlineMath math="\frac{e(t) - e(t-dt)}{dt}" /></li>
                      <li>Where <InlineMath math="dt" /> is our sampling time interval</li>
                    </ul>
                  </div>                 
                 
                  <div className="bg-gray-100 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold">Practical Considerations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="border p-4 rounded bg-white">
                        <h5 className="font-semibold">Integral Windup</h5>
                        <p>When actuators saturate (like our valve being fully open), the integral term can grow excessively large. Solutions include:</p>
                        <ul className="list-disc pl-6">
                          <li>Clamping the integral term</li>
                          <li>Back-calculation methods</li>
                          <li>Conditional integration</li>
                        </ul>
                      </div>
                      <div className="border p-4 rounded bg-white">
                        <h5 className="font-semibold">Derivative Kick</h5>
                        <p>Large setpoint changes can cause derivative spikes. Common fixes:</p>
                        <ul className="list-disc pl-6">
                          <li>Derivative on measurement</li>
                          <li>Setpoint filtering</li>
                          <li>Two-degree-of-freedom control</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold">Real-World Effects</h4>
                    <p>The theoretical equations assume ideal conditions. In reality, we must consider:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Measurement Noise:</strong> Can be amplified by derivative action, requiring filtering
                      </li>
                      <li>
                        <strong>Process Delays:</strong> Time between control action and observable effect
                      </li>
                      <li>
                        <strong>System Dynamics:</strong> Non-linear behavior, especially at operation limits
                      </li>
                    </ul>
                  </div>
                <h3 className="text-xl font-semibold mt-6">Try it for yourself</h3>
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

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mt-6">Understanding Performance</h3>
                <div className="bg-yellow-50 p-4 rounded-lg my-6">
                  <h4 className="text-lg font-semibold text-yellow-800">Think About It</h4>
                  <p>Before continuing with this section note down your thoughts to the following questions:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Would it be advantageous, reaching the setpoint fast in the beginnig? Why or why not?</li>
                    <li>What could be the consequences of an overshoot of the brewing temperature with regards to quality and cost?</li>
                    <li>What difference of setpoint and output could be tolerable? What would be the implications of a larger error?</li>
                  </ul>
                </div>
                <h3 className="text-xl font-semibold">Performance Metrics</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Rise Time: Time to reach near setpoint</li>
                  <li>Overshoot: Maximum peak above setpoint</li>
                  <li>Settling Time: Time to stay within error band</li>
                  <li>Steady-State Error: Persistent offset from setpoint</li>
                </ul>
                <div className="bg-white p-4 rounded-lg border my-6">
                <h4 className="font-semibold">Why performance metrics matter</h4>
                <p className="mt-2">
                  In tea production, the way our temperature control system performs directly impacts both product quality and operational costs. Let's understand these connections:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-700">Product Quality Impact</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Rise Time:</strong> Slow heating means longer batch times and inconsistent tea strength between batches.
                        Too fast can lead to temperature overshooting and bitter taste.
                      </li>
                      <li>
                        <strong>Overshoot:</strong> Temperature spikes above target can release unwanted bitter compounds from tea leaves, affecting taste and aroma.
                      </li>
                      <li>
                        <strong>Settling Time:</strong> Long settling times create temperature fluctuations during the critical brewing phase, leading to inconsistent extraction and varying product quality.
                      </li>
                      <li>
                        <strong>Steady-State Error:</strong> Constant temperature offset means every batch is brewed slightly off-recipe, creating product inconsistency across production runs.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-700">Production Cost Impact</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Energy Usage:</strong> Poor control can lead to:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Excessive steam consumption during overshoots</li>
                          <li>Energy waste from constant corrections</li>
                          <li>Higher utility costs per batch</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Production Time:</strong> Impact on throughput:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Longer rise times reduce daily production capacity</li>
                          <li>Extended settling times increase batch duration</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Product Waste:</strong> Poor control can result in:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Off-spec batches requiring rework or disposal</li>
                          <li>Raw material waste</li>
                          <li>Higher wear of actuators and increased maintenance requirements</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold">Finding the Right Balance</h4>
                  <p className="mt-2">
                    Optimizing controller performance requires balancing multiple factors:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="border p-3 rounded bg-white">
                      <h5 className="font-semibold text-purple-700">Speed vs. Stability</h5>
                      <p className="text-sm mt-1">
                        Faster response typically means more aggressive control, risking overshoots and oscillations. Too conservative means longer production times.
                      </p>
                    </div>
                    <div className="border p-3 rounded bg-white">
                      <h5 className="font-semibold text-purple-700">Precision vs. Energy</h5>
                      <p className="text-sm mt-1">
                        Maintaining very tight temperature control requires more frequent valve adjustments, potentially increasing steam consumption and valve wear.
                      </p>
                    </div>
                    <div className="border p-3 rounded bg-white">
                      <h5 className="font-semibold text-purple-700">Robustness vs. Performance</h5>
                      <p className="text-sm mt-1">
                        More robust control handles disturbances better but might be slower to reach targets. Aggressive tuning improves performance but risks instability.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold">Real-World Considerations</h4>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>
                      <strong>Different Products, Different Needs:</strong> Green tea might require more precise temperature control than black tea due to its sensitivity to temperature variations.
                    </li>
                    <li>
                      <strong>Seasonal Variations:</strong> Controller performance might need adjustment based on incoming water temperature or ambient conditions.
                    </li>
                    <li>
                      <strong>Equipment Aging:</strong> Valve response characteristics can change over time, requiring periodic retuning.
                    </li>
                    <li>
                      <strong>Production Schedule:</strong> Different performance priorities might apply during peak production versus low-demand periods.
                    </li>
                  </ul>
                </div>
                </div>
                <h3 className="text-xl font-semibold mt-6">Measuring the performance of our system</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>Since our goal is to improve the temperature control of the brewing tank, we first need to evaluate the current base performance.
                  For this, we will use real recorded process data and assess it with regards to the metrics from the beginning of this section. 
                  You can find the data here:</p>
                  <div className="bg-blue-50 p-4 rounded-lg mt-6">
                    <h4 className="font-semibold">How to determine the performance values:</h4>
                    <p> The data represents the so-called step-response of our system. This enables us to calculate the values for our 4 metrics: </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        <strong>Rise Time:</strong> The time taken to first reach 90% of the final value from 10% of the final value.
                      </li>
                      <li>
                        <strong>Settling Time:</strong> The time required for the system to settle within ±2% of the final value.
                      </li>
                      <li>
                        <strong>Overshoot:</strong> The maximum peak value minus the final steady-state value, expressed as a percentage.
                      </li>
                      <li>
                        <strong>steady-State Error:</strong> The difference between the final stable value and the desired setpoint.
                      </li>
                    </ul>
                  </div>
                  <p> You can open the CSV file in your favorite spreadsheet software (e.g. Excel) or follow along this Jupyter Notebook if you prefer doing it in Python.</p>
                </div>

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
                onClick={() => markSectionComplete('metrics')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark Section Complete
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenge">
          <Card>
            <CardHeader>
              <CardTitle>Control Challenge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
              </div>
              <button 
                onClick={() => markSectionComplete('challenge')}
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
