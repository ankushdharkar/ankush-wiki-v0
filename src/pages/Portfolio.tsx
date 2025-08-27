import Header from '../components/layout/Header'
import RealDevSquadSection from '../components/sections/RealDevSquadSection'
import JsTsGuildSection from '../components/sections/JsTsGuildSection'
import ChilloutsSection from '../components/sections/ChilloutsSection'
import { HomePageCanvasReveal } from '../components/ui/HomePageCanvasReveal'
// import AboutSection from '../components/sections/AboutSection'

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <HomePageCanvasReveal />
      <RealDevSquadSection />
      <JsTsGuildSection />
      <ChilloutsSection />
      {/* <AboutSection /> */}
    </div>
  )
}
