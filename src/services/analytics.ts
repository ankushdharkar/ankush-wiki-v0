import posthog from 'posthog-js'
import { isPrivateAnalyticsPath, isPrivateAnalyticsUrl } from './analyticsPrivacy'
export { isPrivateAnalyticsPath } from './analyticsPrivacy'

// PostHog configuration
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

let initialized = false
let routeSuspended = isPrivateAnalyticsPath(window.location.pathname)
let lifecycleInitialized = false

function canCapture() {
  return !!POSTHOG_KEY && initialized && !routeSuspended && !isPrivateAnalyticsPath(window.location.pathname)
}
function capture(eventName: string, properties?: Record<string, unknown>) {
  if (canCapture()) posthog.capture(eventName, properties)
}
function suspendPrivateRoute() {
  routeSuspended = true
  if (!initialized) return
  posthog.stopSessionRecording()
  posthog.set_config({ autocapture: false, disable_session_recording: true, capture_pageleave: false })
  sectionObserver?.disconnect()
}
// Install before React Router. Entering a private route stops recording before its DOM mounts.
export function installAnalyticsPrivacyGuard() {
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = window.history[method].bind(window.history)
    window.history[method] = (data, unused, url) => {
      if (url != null && isPrivateAnalyticsUrl(String(url))) suspendPrivateRoute()
      original(data, unused, url)
    }
  }
  window.addEventListener('popstate', () => {
    if (isPrivateAnalyticsPath(window.location.pathname)) suspendPrivateRoute()
  })
  window.addEventListener('pageshow', () => {
    if (isPrivateAnalyticsPath(window.location.pathname)) suspendPrivateRoute()
  })
}
// Called after the public page has committed, so private DOM is gone before recording resumes.
export function syncAnalyticsRoute() {
  if (isPrivateAnalyticsPath(window.location.pathname)) { suspendPrivateRoute(); return }
  routeSuspended = false
  if (initialized) posthog.set_config({ autocapture: true, disable_session_recording: false, capture_pageleave: true })
  else initAnalytics()
  if (!lifecycleInitialized && initialized) {
    lifecycleInitialized = true
    trackPageLoadTime(); initScrollDepthTracking(); initErrorTracking()
  }
}

export function initAnalytics() {
  if (routeSuspended || isPrivateAnalyticsPath(window.location.pathname) || initialized) return
  if (!POSTHOG_KEY) {
    console.warn('[Analytics] PostHog key not found. Set VITE_PUBLIC_POSTHOG_KEY in .env')
    return
  }

  initialized = true
  posthog.init(POSTHOG_KEY, {
    before_send: (event) => {
      if (!canCapture() || isPrivateAnalyticsUrl(event?.properties?.$current_url) || isPrivateAnalyticsUrl(event?.properties?.path)) return null
      return event
    },
    session_recording: {
      blockSelector: '[data-private-round]', maskTextSelector: '[data-private-round]', maskAllInputs: true,
      // Drop financial request/response capture even if it completes after leaving this route.
      maskCapturedNetworkRequestFn: (request) => isPrivateAnalyticsUrl(request.name) ? null : request,
    },
    api_host: POSTHOG_HOST,
    // Capture pageviews manually via usePageTracking hook for SPA
    capture_pageview: false,
    capture_pageleave: true,
    // Privacy settings
    persistence: 'localStorage',
    mask_all_text: false,
    mask_all_element_attributes: false,
    // Session recording (disabled by default - enable in PostHog dashboard)
    disable_session_recording: false,
    // Autocapture clicks, inputs, etc.
    autocapture: true,
  })
}

// Track page views (called by usePageTracking hook)
export function trackPageView(path: string) {
  if (!canCapture()) return
  capture('$pageview', {
    $current_url: window.location.href,
    path,
  })
}

// Track custom events
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!canCapture()) return
  capture(eventName, properties)
}

// Track external link clicks
export function trackExternalLink(url: string, label?: string) {
  trackEvent('external_link_click', {
    url,
    label,
    referrer: window.location.pathname,
  })
}

// Track navigation clicks
export function trackNavigation(destination: string, source?: string) {
  trackEvent('navigation_click', {
    destination,
    source: source || window.location.pathname,
  })
}

// Identify user (optional - for future use)
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!canCapture()) return
  posthog.identify(userId, properties)
}

// Reset user identity (on logout)
export function resetUser() {
  if (!initialized) return
  posthog.reset()
}

// Track page load performance
export function trackPageLoadTime() {
  if (!canCapture()) return

  // Wait for the page to fully load
  if (document.readyState === 'complete') {
    capturePerformanceMetrics()
  } else {
    window.addEventListener('load', capturePerformanceMetrics)
  }
}

function capturePerformanceMetrics() {
  // Use Performance API to get timing data
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  if (!navigation) return

  const metrics = {
    // Total page load time (from navigation start to load complete)
    pageLoadTime: Math.round(navigation.loadEventEnd - navigation.startTime),
    // DNS lookup time
    dnsTime: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
    // TCP connection time
    connectTime: Math.round(navigation.connectEnd - navigation.connectStart),
    // Time to first byte
    ttfb: Math.round(navigation.responseStart - navigation.requestStart),
    // DOM content loaded
    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.startTime),
    // DOM interactive (when HTML is parsed)
    domInteractive: Math.round(navigation.domInteractive - navigation.startTime),
  }

  // Only track if we have valid data
  if (metrics.pageLoadTime > 0) {
    capture('page_load_performance', metrics)
  }

  // Track Core Web Vitals if available
  trackWebVitals()
}

function trackWebVitals() {
  // Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    capture('web_vital_lcp', {
      value: Math.round(lastEntry.startTime),
      rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor',
    })
  })

  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {
    // LCP not supported
  }

  // First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      const fidEntry = entry as PerformanceEventTiming
      capture('web_vital_fid', {
        value: Math.round(fidEntry.processingStart - fidEntry.startTime),
        rating: fidEntry.processingStart - fidEntry.startTime < 100 ? 'good' : fidEntry.processingStart - fidEntry.startTime < 300 ? 'needs-improvement' : 'poor',
      })
    })
  })

  try {
    fidObserver.observe({ type: 'first-input', buffered: true })
  } catch {
    // FID not supported
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
      if (!layoutShift.hadRecentInput) {
        clsValue += layoutShift.value
      }
    }
  })

  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true })

    // Report CLS when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && clsValue > 0) {
        capture('web_vital_cls', {
          value: clsValue.toFixed(4),
          rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
        })
      }
    })
  } catch {
    // CLS not supported
  }
}

// ============================================
// SCROLL DEPTH TRACKING
// ============================================

const scrollDepthThresholds = [25, 50, 75, 100]
const scrollDepthReached = new Set<number>()

export function initScrollDepthTracking() {
  if (!canCapture()) return

  // Reset on page change
  scrollDepthReached.clear()

  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    if (scrollHeight <= 0) return

    const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100)

    for (const threshold of scrollDepthThresholds) {
      if (scrollPercent >= threshold && !scrollDepthReached.has(threshold)) {
        scrollDepthReached.add(threshold)
        capture('scroll_depth', {
          depth: threshold,
          path: window.location.pathname,
        })
      }
    }
  }

  // Throttle scroll events
  let ticking = false
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll()
        ticking = false
      })
      ticking = true
    }
  })
}

// Reset scroll tracking on route change (call from usePageTracking)
export function resetScrollDepthTracking() {
  scrollDepthReached.clear()
}

// ============================================
// SECTION VISIBILITY TRACKING
// ============================================

const sectionsViewed = new Set<string>()
let sectionObserver: IntersectionObserver | null = null

export function initSectionVisibilityTracking() {
  if (!canCapture()) return

  // Disconnect previous observer if exists
  if (sectionObserver) {
    sectionObserver.disconnect()
  }

  sectionsViewed.clear()

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id || entry.target.getAttribute('data-section')
          if (sectionId && !sectionsViewed.has(sectionId)) {
            sectionsViewed.add(sectionId)
            capture('section_viewed', {
              section: sectionId,
              path: window.location.pathname,
              viewportPercent: Math.round(entry.intersectionRatio * 100),
            })
          }
        }
      })
    },
    {
      threshold: 0.3, // Trigger when 30% of section is visible
    }
  )

  // Observe all sections with id or data-section attribute
  const sections = document.querySelectorAll('section[id], [data-section]')
  sections.forEach((section) => sectionObserver?.observe(section))
}

// Re-observe sections after route change
export function refreshSectionObserver() {
  sectionsViewed.clear()
  if (sectionObserver) {
    sectionObserver.disconnect()
    const sections = document.querySelectorAll('section[id], [data-section]')
    sections.forEach((section) => sectionObserver?.observe(section))
  }
}

// ============================================
// ERROR TRACKING
// ============================================

export function initErrorTracking() {
  if (!canCapture()) return

  // Track JavaScript errors
  window.addEventListener('error', (event) => {
    if (!canCapture()) return
    capture('js_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack?.slice(0, 1000), // Limit stack trace length
      path: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  })

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (!canCapture()) return
    const reason = event.reason
    capture('unhandled_promise_rejection', {
      message: reason?.message || String(reason),
      stack: reason?.stack?.slice(0, 1000),
      path: window.location.pathname,
    })
  })
}

// Export posthog instance for advanced usage
export { posthog }
