import { Link, useLocation } from 'react-router-dom'
import { BsLinkedin, BsGithub } from 'react-icons/bs'
import TypingAnimation from '../ui/TypingAnimation'
import { TextHoverEffect } from '../ui/TextHoverEffect'
import { Boxes } from '../ui/BackgroundBoxes'
import { HoverBorderGradient } from '../ui/hover-border-gradient'

export default function Header() {
  const location = useLocation()
  return (
    <header id="header" className="h-[90vh] bg-slate-900 text-white flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Boxes Animation */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      
      <div className="container mx-auto px-6 text-center relative z-20 pointer-events-none">
        {/* Main heading */}
        <div className="mb-8 h-24 flex items-center justify-center pointer-events-auto">
          <Link to="/" className="block w-full max-w-2xl">
            <TextHoverEffect text="Ankush Dharkar" duration={0} />
          </Link>
        </div>
        
        {/* Typing animation */}
        <h2 className="text-xl md:text-2xl mb-8 text-gray-300">
          I am a <TypingAnimation />
        </h2>
        
        {/* Navigation */}
        <nav className="mb-8 pointer-events-auto">
          <ul className="flex flex-wrap justify-center gap-6 md:gap-8 text-lg">
            {location.pathname !== '/' && (
              <li>
                <HoverBorderGradient
                  as={Link}
                  to="/"
                  containerClassName="rounded-full"
                  className="bg-slate-900 text-white hover:text-green-400"
                >
                  Home
                </HoverBorderGradient>
              </li>
            )}
            <li>
              <HoverBorderGradient
                as={Link}
                to="/real-dev-squad"
                containerClassName="rounded-full"
                className={`bg-slate-900 flex items-center gap-2 ${
                  location.pathname === '/real-dev-squad' 
                    ? 'text-green-400' 
                    : 'text-white hover:text-green-400'
                }`}
              >
                Real Dev Squad
                <img 
                  src="/images/Real-Dev-Squad-logo.png" 
                  className="w-6 h-6 flex-shrink-0" 
                  alt="RDS Logo"
                  loading="lazy"
                />
              </HoverBorderGradient>
            </li>
            <li>
              <HoverBorderGradient
                as={Link}
                to="/chillouts"
                containerClassName="rounded-full"
                className={`bg-slate-900 ${
                  location.pathname === '/chillouts' 
                    ? 'text-green-400' 
                    : 'text-white hover:text-green-400'
                }`}
              >
                Chillouts
              </HoverBorderGradient>
            </li>
            <li>
              <HoverBorderGradient
                as={Link}
                to="/js-ts-guild"
                containerClassName="rounded-full"
                className={`bg-slate-900 flex items-center gap-2 ${
                  location.pathname === '/js-ts-guild' 
                    ? 'text-green-400' 
                    : 'text-white hover:text-green-400'
                }`}
              >
                JS TS Guild
                <img 
                  src="/images/JS-TS-Guild-logo.jpeg" 
                  className="w-6 h-6 flex-shrink-0" 
                  alt="JS TS Guild Logo"
                  loading="lazy"
                />
              </HoverBorderGradient>
            </li>
          </ul>
        </nav>
        
        {/* Social links */}
        <div className="flex justify-center gap-6 pointer-events-auto">
          <a 
            href="https://www.linkedin.com/in/ankushdharkar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-2xl hover:text-blue-400 transition-colors duration-300"
          >
            <BsLinkedin />
          </a>
          <a 
            href="https://github.com/ankushdharkar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-2xl hover:text-green-400 transition-colors duration-300"
          >
            <BsGithub />
          </a>
        </div>
      </div>
    </header>
  )
}