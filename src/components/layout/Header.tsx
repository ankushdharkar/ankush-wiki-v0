import { Link } from 'react-router-dom'
import { useState } from 'react'
import { BsLinkedin, BsGithub, BsTwitterX, BsYoutube } from 'react-icons/bs'
import TypingAnimation from '../ui/TypingAnimation'
import { TextHoverEffect } from '../ui/TextHoverEffect'
import { Boxes } from '../ui/BackgroundBoxes'
import { trackExternalLink } from '../../services/analytics'
import { SOCIAL_LINKS, PRODUCT_LINKS } from '../../config/links'

export default function Header() {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <header id="header" className="min-h-[80vh] md:min-h-[90vh] bg-slate-900 text-white flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Boxes Animation */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />

      <div className="container mx-auto px-6 text-center relative z-20 pointer-events-none">
        {/* Profile Photo */}
        <div className="mb-6 flex justify-center pointer-events-auto">
          <a
            href={SOCIAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="block focus-ring rounded-full"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative"
                 style={{ backgroundColor: !imageLoaded ? '#4f46e5' : 'transparent' }}>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600" />
              )}
              <img
                src="/images/ankush-at-event.JPG"
                alt="Ankush Dharkar"
                className={`w-full h-full object-cover transition-opacity duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>
          </a>
        </div>

        {/* Main heading */}
        <div className="mb-8 h-24 flex items-center justify-center pointer-events-auto">
          <Link to="/" className="block w-full max-w-2xl focus-ring rounded-lg">
            <TextHoverEffect text="Ankush Dharkar" duration={0} />
          </Link>
        </div>

        {/* Typing animation */}
        <h2 className="text-xl md:text-2xl mb-10 text-gray-300">
          I am a <TypingAnimation />
        </h2>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-10 pointer-events-auto">
          {/* YouTube - Primary */}
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExternalLink(SOCIAL_LINKS.youtube, 'Header YouTube Subscribe')}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-300 focus-ring hover:shadow-lg hover:shadow-red-500/30 hover:scale-105"
          >
            <BsYoutube className="text-xl" />
            Subscribe on YouTube
          </a>

          {/* RealDSA */}
          <a
            href={PRODUCT_LINKS.realDsa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExternalLink(PRODUCT_LINKS.realDsa, 'Header RealDSA')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold transition-all duration-300 focus-ring hover:shadow-lg hover:shadow-pink-500/30 hover:scale-105"
          >
            <img src="/images/Real DSA.png" alt="" className="w-5 h-5" />
            RealDSA
          </a>

          {/* Get Shortlisted */}
          <a
            href={PRODUCT_LINKS.getShortlisted}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExternalLink(PRODUCT_LINKS.getShortlisted, 'Header Get Shortlisted')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold transition-all duration-300 focus-ring hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105"
          >
            Get Shortlisted
          </a>
        </div>

        {/* Secondary nav links */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-10 pointer-events-auto">
          <Link
            to="/important-links"
            className="px-5 py-2.5 rounded-full border border-gray-600 text-sm text-white hover:text-green-400 hover:border-green-400 transition-all duration-300 focus-ring"
          >
            Important Links
          </Link>
          <Link
            to="/real-dev-squad"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-600 text-sm text-white hover:text-green-400 hover:border-green-400 transition-all duration-300 focus-ring"
          >
            Real Dev Squad
            <img src="/images/Real-Dev-Squad-logo.png" className="w-5 h-5" alt="RDS Logo" loading="lazy" />
          </Link>
          <Link
            to="/chillouts"
            className="px-5 py-2.5 rounded-full border border-gray-600 text-sm text-white hover:text-green-400 hover:border-green-400 transition-all duration-300 focus-ring"
          >
            Chillouts
          </Link>
          <Link
            to="/js-ts-guild"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-600 text-sm text-white hover:text-green-400 hover:border-green-400 transition-all duration-300 focus-ring"
          >
            JS TS Guild
            <img src="/images/JS-TS-Guild-logo.jpeg" className="w-5 h-5" alt="JS TS Guild Logo" loading="lazy" />
          </Link>
        </div>

        {/* Social links */}
        <div className="flex justify-center gap-6 pointer-events-auto">
          <a
            href={SOCIAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-3xl text-white/50 hover:text-white transition-colors duration-300 focus-ring rounded-md p-1"
            aria-label="X (Twitter) Profile"
            onClick={() => trackExternalLink(SOCIAL_LINKS.twitter, 'Twitter')}
          >
            <BsTwitterX />
          </a>
          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-3xl text-white/50 hover:text-blue-400 transition-colors duration-300 focus-ring rounded-md p-1"
            aria-label="LinkedIn Profile"
            onClick={() => trackExternalLink(SOCIAL_LINKS.linkedin, 'LinkedIn')}
          >
            <BsLinkedin />
          </a>
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-3xl text-white/50 hover:text-green-400 transition-colors duration-300 focus-ring rounded-md p-1"
            aria-label="GitHub Profile"
            onClick={() => trackExternalLink(SOCIAL_LINKS.github, 'GitHub')}
          >
            <BsGithub />
          </a>
        </div>
      </div>
    </header>
  )
}
