import { useEffect } from 'react'
import TwitterEmbedsSection from '../components/sections/TwitterEmbedsSection'

export default function Dev() {
  useEffect(() => {
    document.title = 'Development - Ankush Dharkar'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
      <TwitterEmbedsSection isStandalone={true} />
    </div>
  )
}