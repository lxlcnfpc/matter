import { useState } from 'react'
import './styles/globals.css'
import PIDSimulation from './PIDSimulation'

const getBaseUrl = () => {
  return import.meta.env.BASE_URL || '/'
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <PIDSimulation />
      </main>
    </div>
  )
}

export default App
