import { Link } from 'react-router-dom'
import { BsLinkedin, BsGithub } from 'react-icons/bs'
import TypingAnimation from '../ui/TypingAnimation'

export default function Header() {
  return (
    <header id="header" className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background pattern or animation could go here */}
      <div className="absolute inset-0 bg-[url('/images/background/bg.jpg')] bg-cover bg-center opacity-10"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <Link to="/" className="hover:text-green-400 transition-colors duration-300">
            Ankush Dharkar
          </Link>
        </h1>
        
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