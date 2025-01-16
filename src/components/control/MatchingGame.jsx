import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MatchingGame = () => {
  const [matches, setMatches] = useState({
    x: '',
    w: '',
    y: '',
    e: ''
  });
  
  const [showResult, setShowResult] = useState(false);
  
  const theoreticalVariables = [
    { id: 'x', name: 'Process Variable (x)', description: 'The quantity we want to control' },
    { id: 'w', name: 'Setpoint (w)', description: 'The desired value' },
    { id: 'y', name: 'Control Variable (y)', description: 'The quantity we can adjust' },
    { id: 'e', name: 'Error (e)', description: 'The difference between setpoint and process variable' }
  ];

  const practicalVariables = [
    { id: 'temperature', name: 'Current Water Temperature', correct: 'x' },
    { id: 'target', name: 'Target Brewing Temperature', correct: 'w' },
    { id: 'valve', name: 'Steam Valve Position', correct: 'y' },
    { id: 'deviation', name: 'Temperature Deviation', correct: 'e' }
  ];

  const handleMatch = (theoreticalId, practicalId) => {
    setMatches(prev => ({
      ...prev,
      [theoreticalId]: practicalId
    }));
  };

  const checkAnswers = () => {
    setShowResult(true);
  };

  const resetGame = () => {
    setMatches({
      x: '',
      w: '',
      y: '',
      e: ''
    });
    setShowResult(false);
  };

  const isCorrect = () => {
    return practicalVariables.every(practical => 
      matches[practical.correct] === practical.id
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {theoreticalVariables.map(variable => (
          <Card key={variable.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold">
                  {variable.id}
                </div>
                <div>
                  <h4 className="font-medium">{variable.name}</h4>
                  <p className="text-sm text-gray-600">{variable.description}</p>
                </div>
              </div>
              <select 
                value={matches[variable.id]}
                onChange={(e) => handleMatch(variable.id, e.target.value)}
                className="mt-2 w-full p-2 border rounded"
                disabled={showResult}
              >
                <option value="">Select matching variable...</option>
                {practicalVariables.map(practical => (
                  <option 
                    key={practical.id} 
                    value={practical.id}
                    disabled={Object.values(matches).includes(practical.id)}
                  >
                    {practical.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={checkAnswers}
          disabled={Object.values(matches).some(m => !m) || showResult}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Answers
        </button>
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>

      {showResult && (
        <Alert variant={isCorrect() ? "default" : "destructive"}>
          <AlertTitle>
            {isCorrect() ? "Congratulations!" : "Keep trying!"}
          </AlertTitle>
          <AlertDescription>
            {isCorrect() 
              ? "You've correctly matched all the control variables to their brewing process equivalents!"
              : "Some matches are incorrect. Try again to find the right connections between theoretical and practical variables."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MatchingGame;
