import { useEffect } from 'react'
import Navigation from '../components/layout/Navigation'
import RealDevSquadSection from '../components/sections/RealDevSquadSection'

export default function RealDevSquad() {
  useEffect(() => {
    document.title = 'Real Dev Squad'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div>
      <Navigation />
      <RealDevSquadSection isStandalone={true} />
    </div>
  )
}