import { trackExternalLink } from '../../services/analytics'

export default function TelegramBannerSection() {
  return (
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
              Get instant notifications for X Spaces, YouTube Live sessions, Discord hangouts, and local meetups. Join 3,000+ members - it's completely free.
            </p>
          </div>

          {/* CTA Button */}
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

          {/* Pro Tip */}
          <div className="flex items-center justify-center gap-2 bg-blue-900/30 border border-blue-400/20 rounded-lg p-3 text-left">
            <span className="text-blue-300 flex-shrink-0">💡</span>
            <p className="text-cyan-200/70 text-xs md:text-sm leading-relaxed">
              <strong className="text-cyan-200">Pro tip:</strong> X/Twitter notifications aren't reliable for Spaces. Enable Telegram notifications to never miss a live event.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
