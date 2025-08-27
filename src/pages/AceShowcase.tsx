import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Meteors } from '../components/ui/MeteoursAceternity'
import { ExpandableCards } from '../components/ui/ExpandableCards'
import { FollowerPointerCard, TitleComponent } from '../components/ui/FollowingPointer'

export default function AceShowcase() {
  useEffect(() => {
    document.title = 'Aceternity UI Showcase'
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="min-h-screen bg-black text-white pb-8 md:pb-20">
      {/* Navigation */}
      <nav className="p-6">
        <Link 
          to="/" 
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to Home
        </Link>
      </nav>

      {/* Page Header */}
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-5xl font-bold text-center mb-4">
          Aceternity UI Components
        </h1>
        <p className="text-xl text-center text-gray-400 mb-16">
          Showcasing beautiful Aceternity UI components with Tailwind CSS and React
        </p>

        {/* Components Showcase */}
        <div className="space-y-20">
          
          {/* Official Aceternity Meteors */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Aceternity Meteors Component</h2>
            <div className="relative h-96 bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-lg overflow-hidden border border-gray-700">
              <Meteors number={25} className="bg-white" />
              <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
                <h3 className="text-5xl font-bold mb-6 text-white text-center">
                  Official Meteors
                </h3>
                <p className="text-xl text-gray-300 max-w-lg text-center leading-relaxed">
                  The authentic Aceternity UI Meteors component with beautiful animated meteor trails and random timing effects
                </p>
                <div className="mt-8">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                    Experience the Magic
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Expandable Cards with Pokemon */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Expandable Cards - Friendly Pokemon</h2>
            <p className="text-center text-gray-400 mb-8">Click on any Pokemon card to expand and learn more!</p>
            <ExpandableCards />
          </section>

          {/* Following Pointer Demo */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Following Pointer</h2>
            <p className="text-center text-gray-400 mb-8">Move your mouse over the cards below to see the pointer follow your cursor!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              <FollowerPointerCard
                title={
                  <TitleComponent
                    title="Aceternity UI"
                    avatar="https://ui.aceternity.com/logo.png"
                  />
                }
                className="relative overflow-hidden h-64 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl p-6 text-white"
              >
                <div className="relative z-50 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Beautiful Components</h3>
                    <p className="text-purple-100">
                      Discover amazing UI components with smooth animations
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/50 rounded-full"></div>
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </FollowerPointerCard>

              <FollowerPointerCard
                title={
                  <TitleComponent
                    title="Interactive Design"
                    avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face"
                  />
                }
                className="relative overflow-hidden h-64 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-6 text-white"
              >
                <div className="relative z-50 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Mouse Following</h3>
                    <p className="text-emerald-100">
                      Experience the magic of cursor-following animations
                    </p>
                  </div>
                  <div className="text-emerald-200">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </FollowerPointerCard>

              <FollowerPointerCard
                title={
                  <TitleComponent
                    title="React + Framer"
                    avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
                  />
                }
                className="relative overflow-hidden h-64 bg-gradient-to-br from-orange-500 to-red-700 rounded-2xl p-6 text-white"
              >
                <div className="relative z-50 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Smooth Animations</h3>
                    <p className="text-orange-100">
                      Powered by Framer Motion for buttery smooth interactions
                    </p>
                  </div>
                  <div className="text-orange-200">
                    ⚡ Motion
                  </div>
                </div>
              </FollowerPointerCard>

              <FollowerPointerCard
                title="Customizable Pointer 🎯"
                className="relative overflow-hidden h-64 bg-gradient-to-br from-pink-500 to-rose-700 rounded-2xl p-6 text-white"
              >
                <div className="relative z-50 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Easy to Use</h3>
                    <p className="text-pink-100">
                      Simple API with powerful customization options
                    </p>
                  </div>
                  <div className="text-pink-200 text-2xl">
                    🎨
                  </div>
                </div>
              </FollowerPointerCard>

            </div>
          </section>
          
          {/* Sample Card with Tailwind Styling */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Sample Card Component</h2>
            <div className="max-w-sm mx-auto">
              <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg p-1">
                <div className="bg-black rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Beautiful Card</h3>
                  <p className="text-gray-300 mb-4">
                    This is a sample card with gradient border using Tailwind CSS.
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Animated Elements */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Animated Elements</h2>
            <div className="flex justify-center space-x-8">
              <div className="w-20 h-20 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-20 h-20 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="w-20 h-20 bg-pink-500 rounded-full animate-spin"></div>
            </div>
          </section>

          {/* Grid Layout */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Grid Layout</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
                  <h3 className="text-lg font-semibold mb-2">Card {item}</h3>
                  <p className="text-gray-400">Sample content for card {item}</p>
                </div>
              ))}
            </div>
          </section>


          {/* Hero Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Hero Section Example</h2>
            <div className="text-center py-20 bg-gradient-to-b from-gray-900 to-black rounded-lg">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Welcome
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Beautiful typography with gradient text effects
              </p>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 rounded-full text-white font-semibold transition-all transform hover:scale-105">
                Get Started
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
