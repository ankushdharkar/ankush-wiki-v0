import Navigation from '../components/layout/Navigation'
import ChilloutsSection from '../components/sections/ChilloutsSection'

export default function Chillouts() {
  return (
    <div>
      <Navigation />
      <ChilloutsSection isStandalone={true} />
    </div>
  )
}