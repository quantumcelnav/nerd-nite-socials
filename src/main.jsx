import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const rootEl = document.getElementById('root')

// Skip-to-content link for keyboard accessibility
const skip = document.createElement('a')
skip.href = '#main-content'
skip.className = 'skip-link'
skip.textContent = 'Skip to content'
document.body.prepend(skip)

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
