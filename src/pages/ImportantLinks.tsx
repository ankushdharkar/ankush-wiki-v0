import { useEffect } from 'react'
import Navigation from '../components/layout/Navigation'
import ImportantLinksSection from '../components/sections/ImportantLinksSection'

export default function ImportantLinks() {
  useEffect(() => {
    document.title = 'Important Links - Ankush Dharkar'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Navigation />
      <ImportantLinksSection isStandalone={true} />
    </div>
  )
}