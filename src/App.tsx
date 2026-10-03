import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navigation from './components/layout/Navigation'
import PageTransition from './components/layout/PageTransition'
import { isPrivateAnalyticsPath } from './services/analytics'
import { usePageTracking } from './hooks/usePageTracking'

const Portfolio = lazy(() => import('./pages/Portfolio'))
const AceShowcase = lazy(() => import('./pages/AceShowcase'))
const Chillouts = lazy(() => import('./pages/Chillouts'))
const JsTsGuild = lazy(() => import('./pages/JsTsGuild'))
const RealDevSquad = lazy(() => import('./pages/RealDevSquad'))
const RealDSA = lazy(() => import('./pages/RealDSA'))
const ImportantLinks = lazy(() => import('./pages/ImportantLinks'))
const Dev = lazy(() => import('./pages/Dev'))
const AskAnkush = lazy(() => import('./pages/AskAnkush'))

const FriendsAndFamily = lazy(() => import('./pages/FriendsAndFamily'))

function App() {
  const location = useLocation()
  // Track page views on route changes
  usePageTracking()

  if (isPrivateAnalyticsPath(location.pathname)) {
    return <Suspense fallback={<div data-private-round className="ph-no-capture ph-no-record min-h-screen bg-slate-50 p-8 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Loading…</div>}><FriendsAndFamily /></Suspense>
  }

  return (
    <>
      <Navigation />
      <PageTransition>
        <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="/ace" element={<AceShowcase />} />
            <Route path="/chillouts" element={<Chillouts />} />
            <Route path="/js-ts-guild" element={<JsTsGuild />} />
            <Route path="/real-dev-squad" element={<RealDevSquad />} />
            <Route path="/real-dsa" element={<RealDSA />} />
            <Route path="/important-links" element={<ImportantLinks />} />
            <Route path="/dev" element={<Dev />} />
            <Route path="/new" element={<AskAnkush />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </>
  )
}

export default App