import { useEffect } from 'react'
import Navigation from '../components/layout/Navigation'
import ChilloutsSection from '../components/sections/ChilloutsSection'

export default function Chillouts() {
  useEffect(() => {
    document.title = 'Chillouts'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div>
      <Navigation />
      <ChilloutsSection isStandalone={true} />
    </div>
  )
}