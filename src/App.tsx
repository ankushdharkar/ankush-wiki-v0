import { Routes, Route } from 'react-router-dom'
import Portfolio from './pages/Portfolio'
import AceShowcase from './pages/AceShowcase'
import Chillouts from './pages/Chillouts'
import JsTsGuild from './pages/JsTsGuild' 
import RealDevSquad from './pages/RealDevSquad'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/ace" element={<AceShowcase />} />
      <Route path="/chillouts" element={<Chillouts />} />
      <Route path="/js-ts-guild" element={<JsTsGuild />} />
      <Route path="/real-dev-squad" element={<RealDevSquad />} />
    </Routes>
  )
}

export default App