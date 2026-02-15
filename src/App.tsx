import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PageTransition from './components/layout/PageTransition'
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

function App() {
  // Track page views on route changes
  usePageTracking()

  return (
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
  )
}

export default App