import { useEffect } from 'react'
import Header from '../components/layout/Header'
import RealDevSquadSection from '../components/sections/RealDevSquadSection'
import JsTsGuildSection from '../components/sections/JsTsGuildSection'
import ChilloutsSection from '../components/sections/ChilloutsSection'
import ImportantLinksSection from '../components/sections/ImportantLinksSection'
import { HomePageCanvasReveal } from '../components/ui/HomePageCanvasReveal'
// import AboutSection from '../components/sections/AboutSection'

export default function Portfolio() {
  useEffect(() => {
    document.title = 'Ankush Dharkar'
  }, [])
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <HomePageCanvasReveal />
      <ImportantLinksSection />
      <RealDevSquadSection />
      <JsTsGuildSection />
      <ChilloutsSection />
      {/* <AboutSection /> */}
    </div>
  )
}
