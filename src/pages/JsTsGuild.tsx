import { useEffect } from 'react'
import JsTsGuildSection from '../components/sections/JsTsGuildSection'

export default function JsTsGuild() {
  useEffect(() => {
    document.title = 'JS TS Guild'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <JsTsGuildSection isStandalone={true} />
    </div>
  )
}