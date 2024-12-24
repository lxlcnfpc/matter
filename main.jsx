import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './src/index.css'  // Update path
import App from './src/App.jsx'  // Update path

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
