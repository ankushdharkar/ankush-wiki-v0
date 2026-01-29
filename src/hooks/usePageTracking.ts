import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  trackPageView,
  resetScrollDepthTracking,
  initSectionVisibilityTracking,
} from '../services/analytics'

/**
 * Hook to track page views on route changes in React Router SPA
 */
export function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    // Track page view
    trackPageView(location.pathname)

    // Reset scroll depth tracking for new page
    resetScrollDepthTracking()

    // Initialize section visibility tracking after DOM updates
    // Small delay to ensure sections are rendered
    const timeout = setTimeout(() => {
      initSectionVisibilityTracking()
    }, 100)

    return () => clearTimeout(timeout)
  }, [location.pathname])
}
