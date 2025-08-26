import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AceShowcase from './pages/AceShowcase'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/ace" element={<AceShowcase />} />
    </Routes>
  )
}

export default App