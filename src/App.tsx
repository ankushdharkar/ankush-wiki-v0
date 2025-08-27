import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PageTransition from './components/layout/PageTransition'

const Portfolio = lazy(() => import('./pages/Portfolio'))
const AceShowcase = lazy(() => import('./pages/AceShowcase'))
const Chillouts = lazy(() => import('./pages/Chillouts'))
const JsTsGuild = lazy(() => import('./pages/JsTsGuild'))
const RealDevSquad = lazy(() => import('./pages/RealDevSquad'))

function App() {
  return (
    <PageTransition>
      <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/ace" element={<AceShowcase />} />
          <Route path="/chillouts" element={<Chillouts />} />
          <Route path="/js-ts-guild" element={<JsTsGuild />} />
          <Route path="/real-dev-squad" element={<RealDevSquad />} />
        </Routes>
      </Suspense>
    </PageTransition>
  )
}

export default App