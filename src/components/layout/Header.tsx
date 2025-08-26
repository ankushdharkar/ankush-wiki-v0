import { Link } from 'react-router-dom'
import { BsLinkedin, BsGithub } from 'react-icons/bs'
import TypingAnimation from '../ui/TypingAnimation'
import { TextHoverEffect } from '../ui/TextHoverEffect'
import { Boxes } from '../ui/BackgroundBoxes'

export default function Header() {
  return (
    <header id="header" className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Boxes Animation */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      
      <div className="container mx-auto px-6 text-center relative z-20">
        {/* Main heading */}
        <div className="mb-8 h-24 flex items-center justify-center">
          <Link to="/" className="block w-full max-w-2xl">
            <TextHoverEffect text="Ankush Dharkar" duration={0} />
          </Link>
        </div>
        
        {/* Typing animation */}
        <h2 className="text-xl md:text-2xl mb-8 text-gray-300">
          I am a <TypingAnimation />
        </h2>
        
        {/* Navigation */}
        <nav className="mb-8">
          <ul className="flex flex-wrap justify-center gap-6 md:gap-8 text-lg">
            <li>
              <Link to="/" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/real-dev-squad" 
                className="hover:text-green-400 transition-colors duration-300 flex items-center gap-2"
              >
                Real Dev Squad
                <img 
                  src="/images/Real-Dev-Squad-logo.png" 
                  className="w-6 h-6 flex-shrink-0" 
                  alt="RDS Logo"
                  loading="lazy"
                />
              </Link>
            </li>
            <li>
              <Link to="/chillouts" className="hover:text-green-400 transition-colors duration-300">
                Chillouts
              </Link>
            </li>
            <li>
              <Link to="/js-ts-guild" className="hover:text-green-400 transition-colors duration-300">
                JS TS Guild
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Social links */}
        <div className="flex justify-center gap-6">
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