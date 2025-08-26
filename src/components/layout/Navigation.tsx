import { Link, useLocation } from 'react-router-dom'
import { BsLinkedin, BsGithub } from 'react-icons/bs'
import TypingAnimation from '../ui/TypingAnimation'

export default function Navigation() {
  const location = useLocation()
  
  return (
    <header className="bg-gray-900 text-white py-6 border-b border-gray-700">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo and typing */}
          <div className="text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              <Link to="/" className="hover:text-green-400 transition-colors duration-300">
                Ankush Dharkar
              </Link>
            </h1>
            <h2 className="text-sm lg:text-base text-gray-300">
              I am a <TypingAnimation />
            </h2>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 mx-8">
            <ul className="flex flex-wrap justify-center gap-4 lg:gap-6 text-sm lg:text-base">
              <li>
                <Link 
                  to="/" 
                  className={`font-semibold transition-colors ${
                    location.pathname === '/' 
                      ? 'text-green-400' 
                      : 'hover:text-green-400'
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/real-dev-squad" 
                  className={`transition-colors duration-300 flex items-center gap-2 ${
                    location.pathname === '/real-dev-squad'
                      ? 'text-green-400'
                      : 'hover:text-green-400'
                  }`}
                >
                  Real Dev Squad
                  <img 
                    src="/images/Real-Dev-Squad-logo.png" 
                    className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" 
                    alt="RDS Logo"
                    loading="lazy"
                  />
                </Link>
              </li>
              <li>
                <Link 
                  to="/chillouts" 
                  className={`transition-colors duration-300 ${
                    location.pathname === '/chillouts'
                      ? 'text-green-400'
                      : 'hover:text-green-400'
                  }`}
                >
                  Chillouts
                </Link>
              </li>
              <li>
                <Link 
                  to="/js-ts-guild" 
                  className={`transition-colors duration-300 ${
                    location.pathname === '/js-ts-guild'
                      ? 'text-green-400'
                      : 'hover:text-green-400'
                  }`}
                >
                  JS TS Guild
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Social links */}
          <div className="flex justify-center gap-4">
            <a 
              href="https://www.linkedin.com/in/ankushdharkar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xl hover:text-blue-400 transition-colors duration-300"
            >
              <BsLinkedin />
            </a>
            <a 
              href="https://github.com/ankushdharkar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xl hover:text-green-400 transition-colors duration-300"
            >
              <BsGithub />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}