import Navigation from '../components/layout/Navigation'
import JsTsGuildSection from '../components/sections/JsTsGuildSection'

export default function JsTsGuild() {
  return (
    <div>
      <Navigation />
      <JsTsGuildSection isStandalone={true} />
    </div>
  )
}