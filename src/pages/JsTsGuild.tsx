import { useEffect } from 'react'
import Navigation from '../components/layout/Navigation'
import JsTsGuildSection from '../components/sections/JsTsGuildSection'

export default function JsTsGuild() {
  useEffect(() => {
    document.title = 'JS TS Guild'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Navigation />
      <JsTsGuildSection isStandalone={true} />
    </div>
  )
}