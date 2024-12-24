import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // Update path
import App from './App.jsx'  // Update path

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
