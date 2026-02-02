import { useEffect } from 'react'
import Header from '../components/layout/Header'
import ResumeHighlightSection from '../components/sections/ResumeHighlightSection'
import RealDSASection from '../components/sections/RealDSASection'
import RealDevSquadSection from '../components/sections/RealDevSquadSection'
import JsTsGuildSection from '../components/sections/JsTsGuildSection'
import ChilloutsSection from '../components/sections/ChilloutsSection'
import ImportantLinksSection from '../components/sections/ImportantLinksSection'
import { HomePageCanvasReveal } from '../components/ui/HomePageCanvasReveal'
import { trackExternalLink } from '../services/analytics'
// import AboutSection from '../components/sections/AboutSection'

export default function Portfolio() {
  useEffect(() => {
    document.title = 'Ankush Dharkar'
  }, [])
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Header />
      <ResumeHighlightSection />

      {/* Notification Banner */}
      <section className="relative z-10 py-8 md:py-12 bg-gradient-to-r from-cyan-900 via-blue-900 to-purple-900">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-6 md:p-10 shadow-2xl text-center">
            {/* Header with Icon */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg mb-4">
                <span className="text-3xl md:text-4xl">🎙️</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                Never Miss Our Live Events
              </h3>
              <p className="text-cyan-100 text-sm md:text-base leading-relaxed max-w-lg">
                Get instant notifications for X Spaces, YouTube Live sessions, Discord hangouts, and local meetups.
              </p>
            </div>

            {/* Social Proof Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-cyan-400/30">
                <span className="text-emerald-400 text-lg">✓</span>
                <span className="text-white text-sm font-medium">Completely Free</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-cyan-400/30">
                <span className="text-cyan-400 text-lg">👥</span>
                <span className="text-white text-sm font-medium">3,000+ Members</span>
              </div>
            </div>

            {/* CTA Button - Primary Action */}
            <div className="mb-5">
              <a
                href="https://t.me/+lu4d9CgVFjpjYzUx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 text-base md:text-lg w-full md:w-auto"
                onClick={() => trackExternalLink('https://t.me/+lu4d9CgVFjpjYzUx', 'Telegram Updates Channel')}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                <span>Subscribe on Telegram</span>
                <span className="text-2xl">🔔</span>
              </a>
            </div>

            {/* Footer Note - De-emphasized */}
            <div className="flex items-center justify-center gap-2 bg-blue-900/30 border border-blue-400/20 rounded-lg p-3 text-left">
              <span className="text-blue-300 flex-shrink-0">💡</span>
              <p className="text-cyan-200/70 text-xs md:text-sm leading-relaxed">
                <strong className="text-cyan-200">Pro tip:</strong> X/Twitter notifications aren't reliable for Spaces. Enable Telegram notifications to never miss a live event.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomePageCanvasReveal />
      <RealDSASection />
      <ImportantLinksSection />
      <RealDevSquadSection />
      <JsTsGuildSection />
      <ChilloutsSection />
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
