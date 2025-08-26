import { Routes, Route } from 'react-router-dom'
import Portfolio from './pages/Portfolio'
import AceShowcase from './pages/AceShowcase'
import Chillouts from './pages/Chillouts'
import JsTsGuild from './pages/JsTsGuild' 
import RealDevSquad from './pages/RealDevSquad'
import PageTransition from './components/layout/PageTransition'

function App() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/ace" element={<AceShowcase />} />
        <Route path="/chillouts" element={<Chillouts />} />
        <Route path="/js-ts-guild" element={<JsTsGuild />} />
        <Route path="/real-dev-squad" element={<RealDevSquad />} />
      </Routes>
    </PageTransition>
  )
}

export default App