import { useState, useEffect } from 'react'

export default function TypingAnimation() {
  const words = ["Software Engineer", "Coach", "Coder", "Motivator"]
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(100)

  useEffect(() => {
    const currentWord = words[currentWordIndex]
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.slice(0, currentText.length + 1))
          setTypingSpeed(100)
        } else {
          // Finished typing, wait then start deleting
          setTypingSpeed(2000)
          setIsDeleting(true)
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentWord.slice(0, currentText.length - 1))
          setTypingSpeed(50)
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
          setTypingSpeed(100)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, currentWordIndex, typingSpeed, words])

  return (
    <span className="text-green-400 font-semibold">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  )
}