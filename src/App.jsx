import { useState } from 'react'
import './styles/globals.css'
import PIDSimulation from './PIDSimulation'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-10">
        <PIDSimulation />
      </main>
    </div>
  )
}

export default App
