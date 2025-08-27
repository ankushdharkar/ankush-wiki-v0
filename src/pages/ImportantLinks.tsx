import { useEffect } from 'react'
import Navigation from '../components/layout/Navigation'
import ImportantLinksSection from '../components/sections/ImportantLinksSection'

export default function ImportantLinks() {
  useEffect(() => {
    document.title = 'Important Links - Ankush Dharkar'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div>
      <Navigation />
      <ImportantLinksSection isStandalone={true} />
    </div>
  )
}