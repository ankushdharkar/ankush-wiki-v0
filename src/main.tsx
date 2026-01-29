import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import {
  initAnalytics,
  trackPageLoadTime,
  initScrollDepthTracking,
  initErrorTracking,
} from './services/analytics'

// Initialize analytics
initAnalytics()

// Track page load performance
trackPageLoadTime()

// Initialize scroll depth tracking
initScrollDepthTracking()

// Initialize error tracking
initErrorTracking()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
