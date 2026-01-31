import { useEffect } from 'react'
import Navigation from '../components/layout/Navigation'
import RealDevSquadSection from '../components/sections/RealDevSquadSection'

export default function RealDevSquad() {
  useEffect(() => {
    document.title = 'Real Dev Squad'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Navigation />
      <RealDevSquadSection isStandalone={true} />
    </div>
  )
}