import { useEffect } from 'react'
import Navigation from '../components/layout/Navigation'
import ChilloutsSection from '../components/sections/ChilloutsSection'

export default function Chillouts() {
  useEffect(() => {
    document.title = 'Chillouts'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Navigation />
      <ChilloutsSection isStandalone={true} />
    </div>
  )
}