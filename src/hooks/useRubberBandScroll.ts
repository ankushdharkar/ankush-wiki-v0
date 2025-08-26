import { useEffect } from 'react'

export const useRubberBandScroll = (delay: number = 1000) => {
  useEffect(() => {
    const rubberBandScroll = () => {
      // Start from top
      window.scrollTo({ top: 0, behavior: 'instant' })
      
      // After delay, scroll down a bit
      setTimeout(() => {
        window.scrollTo({ 
          top: 200, 
          behavior: 'smooth' 
        })
        
        // Then bounce back to top
        setTimeout(() => {
          window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
          })
        }, 1500)
      }, delay)
    }

    rubberBandScroll()
  }, [delay])
}