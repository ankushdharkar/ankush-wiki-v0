import Header from '../components/layout/Header'
import RealDevSquadSection from '../components/sections/RealDevSquadSection'
// import AboutSection from '../components/sections/AboutSection'

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <RealDevSquadSection />
      {/* <AboutSection /> */}
    </div>
  )
}