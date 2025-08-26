import Navigation from '../components/layout/Navigation'
import RealDevSquadSection from '../components/sections/RealDevSquadSection'

export default function RealDevSquad() {
  return (
    <div>
      <Navigation />
      <RealDevSquadSection isStandalone={true} />
    </div>
  )
}