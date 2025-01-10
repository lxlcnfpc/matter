import { useState } from 'react'
import './styles/globals.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './HomePage'
import LearningPlatform from './LearningPlatform'

function App() {
  return (
    <Router basename="/matter">
      <div className="min-h-screen bg-background">
        <main className="w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/control-theory" element={<LearningPlatform />} />
            {/* Add more routes here as new lessons are created */}
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
