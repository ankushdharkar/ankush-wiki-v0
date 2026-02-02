import { useEffect } from 'react'
import Header from '../components/layout/Header'
import FeaturedVideoSection from '../components/sections/FeaturedVideoSection'
import TelegramBannerSection from '../components/sections/TelegramBannerSection'
import ResumeHighlightSection from '../components/sections/ResumeHighlightSection'
import RealDSASection from '../components/sections/RealDSASection'
import RealDevSquadSection from '../components/sections/RealDevSquadSection'
import JsTsGuildSection from '../components/sections/JsTsGuildSection'
import ChilloutsSection from '../components/sections/ChilloutsSection'
import ImportantLinksSection from '../components/sections/ImportantLinksSection'
import { ImportantLinksCards } from '../components/ui/HomePageCanvasReveal'
import { trackExternalLink } from '../services/analytics'
// import AboutSection from '../components/sections/AboutSection'

export default function Portfolio() {
  useEffect(() => {
    document.title = 'Ankush Dharkar'
  }, [])
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Header />
      <FeaturedVideoSection />
      <TelegramBannerSection />

      {/* Products */}
      <ResumeHighlightSection />
      <RealDSASection />

      {/* Important Links */}
      <ImportantLinksCards />

      {/* Communities */}
      <RealDevSquadSection />
      <JsTsGuildSection />
      <ChilloutsSection />

      {/* Coming Soon */}
      <ImportantLinksSection />
      {/* <AboutSection /> */}

      {/* Footer */}
      <footer className="relative py-16 md:py-20 bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="flex flex-col items-center text-center">
            {/* Avatar/Icon */}
            <div className="mb-6 relative">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 dark:shadow-blue-400/20">
                <span className="text-4xl md:text-5xl">👋</span>
              </div>
              <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-2xl animate-ping opacity-75"></div>
            </div>

            {/* Heading */}
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Let's Connect
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg mb-8 max-w-md leading-relaxed">
              Have a question, idea, or just want to chat? Drop me a message and I'll get back to you.
            </p>

            {/* CTA Card */}
            <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
                You can contact me here 💬
              </p>

              <a
                href="https://superdm.com/ankush"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={() => trackExternalLink('https://superdm.com/ankush', 'SuperDM Contact')}
              >
                <span>Send a Message</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <p className="text-gray-500 dark:text-gray-500 text-sm mt-4 italic flex items-center justify-center gap-2">
                <span className="text-base">✓</span>
                Answer is guaranteed (eventually)
              </p>
            </div>

            {/* Footer Meta */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 w-full">
              <p className="text-gray-500 dark:text-gray-600 text-sm">
                © {new Date().getFullYear()} Ankush Dharkar. Built with care.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
