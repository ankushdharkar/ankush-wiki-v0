import Navigation from '../components/layout/Navigation'
import RevealAnimation from '../components/ui/RevealAnimation'

export default function Chillouts() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="py-20 flex items-center justify-center">
        <div className="text-center">
          <RevealAnimation delay={0.2}>
            <h1 className="text-4xl font-bold mb-8">Chillouts</h1>
          </RevealAnimation>
          <RevealAnimation delay={0.4}>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Chillouts is a community focused on friends, relationships, high quality connections, dating, life, partnerships, and fun.
            </p>
          </RevealAnimation>
          <RevealAnimation delay={0.6}>
            <a 
              href="https://docs.google.com/document/d/1Pn37IDyVp3yQV9PZduFwWMZa8yHP7FCitvRwo7Zdv5Y/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              View Chillouts Community Document
            </a>
          </RevealAnimation>
        </div>
      </div>
    </div>
  )
}