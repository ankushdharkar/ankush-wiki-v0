import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { BsLinkedin, BsGithub } from 'react-icons/bs'
import TypingAnimation from '../ui/TypingAnimation'
import { TextHoverEffect } from '../ui/TextHoverEffect'
import { Boxes } from '../ui/BackgroundBoxes'
import { trackExternalLink } from '../../services/analytics'

export default function Header() {
  const location = useLocation()
  const [imageLoaded, setImageLoaded] = useState(false)
  
  return (
    <header id="header" className="h-[90vh] bg-slate-900 text-white flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Boxes Animation */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      
      <div className="container mx-auto px-6 text-center relative z-20 pointer-events-none">
        {/* Profile Photo - Responsive sizing */}
        <div className="mb-6 flex justify-center pointer-events-auto">
          <a
            href="https://twitter.com/ankushdharkar"
            target="_blank"
            rel="noopener noreferrer"
            className="block focus-ring rounded-full"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative"
                 style={{ backgroundColor: !imageLoaded ? '#4f46e5' : 'transparent' }}>
              {/* Simple skeleton loading placeholder */}
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
        <h2 className="text-xl md:text-2xl mb-8 text-gray-300">
          I am a <TypingAnimation />
        </h2>
        
        {/* Featured Products - Prominent CTAs */}
        <nav className="mb-6 pointer-events-auto">
          <ul className="flex flex-wrap justify-center gap-3 md:gap-4">
            {/* RealDSA - Premium */}
            <li>
              <a
                href="https://realdsa.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackExternalLink('https://realdsa.com', 'Header RealDSA')}
                className="group relative px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold transition-all duration-300 flex items-center gap-2 focus-ring hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105"
              >
                <span className="text-lg">🔥</span>
                RealDSA
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-white text-orange-600 text-[10px] font-bold rounded-full shadow">Premium</span>
              </a>
            </li>
            {/* Resume Guide - New */}
            <li>
              <a
                href="https://myresumeisnotgettingshortlisted.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackExternalLink('https://myresumeisnotgettingshortlisted.com/', 'Header Resume Guide')}
                className="group relative px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold transition-all duration-300 flex items-center gap-2 focus-ring hover:shadow-lg hover:shadow-rose-500/30 hover:scale-105"
              >
                <span className="text-lg">📄</span>
                Resume Guide
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full shadow animate-pulse">New</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Navigation - Secondary links */}
        <nav className="mb-8 pointer-events-auto">
          <ul className="flex flex-wrap justify-center gap-3 md:gap-4 text-base">
            {location.pathname !== '/' && (
              <li>
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-full border border-gray-600 transition-all duration-300 focus-ring ${
                    location.pathname === '/'
                      ? 'text-green-400 border-green-400'
                      : 'text-white hover:text-green-400 hover:border-green-400'
                  }`}
                >
                  Home
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/important-links"
                className={`px-4 py-2 rounded-full border border-gray-600 transition-all duration-300 focus-ring ${
                  location.pathname === '/important-links'
                    ? 'text-green-400 border-green-400'
                    : 'text-white hover:text-green-400 hover:border-green-400'
                }`}
              >
                Important Links
              </Link>
            </li>
            <li>
              <Link
                to="/real-dev-squad"
                className={`px-4 py-2 rounded-full border border-gray-600 transition-all duration-300 flex items-center gap-2 focus-ring ${
                  location.pathname === '/real-dev-squad'
                    ? 'text-green-400 border-green-400'
                    : 'text-white hover:text-green-400 hover:border-green-400'
                }`}
              >
                Real Dev Squad
                <img
                  src="/images/Real-Dev-Squad-logo.png"
                  className="w-5 h-5 flex-shrink-0"
                  alt="RDS Logo"
                  loading="lazy"
                />
              </Link>
            </li>
            <li>
              <Link
                to="/chillouts"
                className={`px-4 py-2 rounded-full border border-gray-600 transition-all duration-300 focus-ring ${
                  location.pathname === '/chillouts'
                    ? 'text-green-400 border-green-400'
                    : 'text-white hover:text-green-400 hover:border-green-400'
                }`}
              >
                Chillouts
              </Link>
            </li>
            <li>
              <Link
                to="/js-ts-guild"
                className={`px-4 py-2 rounded-full border border-gray-600 transition-all duration-300 flex items-center gap-2 focus-ring ${
                  location.pathname === '/js-ts-guild'
                    ? 'text-green-400 border-green-400'
                    : 'text-white hover:text-green-400 hover:border-green-400'
                }`}
              >
                JS TS Guild
                <img
                  src="/images/JS-TS-Guild-logo.jpeg"
                  className="w-5 h-5 flex-shrink-0"
                  alt="JS TS Guild Logo"
                  loading="lazy"
                />
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Social links */}
        <div className="flex justify-center gap-6 pointer-events-auto">
          <a
            href="https://www.linkedin.com/in/ankushdharkar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl hover:text-blue-400 transition-colors duration-300 focus-ring rounded-md p-1"
            aria-label="LinkedIn Profile"
          >
            <BsLinkedin />
          </a>
          <a
            href="https://github.com/ankushdharkar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl hover:text-green-400 transition-colors duration-300 focus-ring rounded-md p-1"
            aria-label="GitHub Profile"
          >
            <BsGithub />
          </a>
        </div>
      </div>
    </header>
  )
}