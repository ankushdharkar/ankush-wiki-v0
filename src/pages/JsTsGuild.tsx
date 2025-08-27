import { useEffect } from 'react'
import Navigation from '../components/layout/Navigation'
import JsTsGuildSection from '../components/sections/JsTsGuildSection'

export default function JsTsGuild() {
  useEffect(() => {
    document.title = 'JS TS Guild'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div>
      <Navigation />
      <JsTsGuildSection isStandalone={true} />
    </div>
  )
}