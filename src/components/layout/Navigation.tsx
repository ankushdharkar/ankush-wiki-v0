import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../ThemeToggle'
import UserMenu from '../ui/UserMenu'

const navLinks = [
  { to: '/important-links', label: 'Links' },
  { to: '/real-dsa', label: 'RealDSA' },
  { to: '/real-dev-squad', label: 'Real Dev Squad' },
  { to: '/chillouts', label: 'Chillouts' },
  { to: '/js-ts-guild', label: 'JS TS Guild' },
]

export default function Navigation() {
  const { pathname } = useLocation()

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Home */}
        <Link
          to="/"
          className="flex items-center gap-2 focus-ring rounded-full shrink-0 group"
        >
          <img
            src="/images/ankush-at-event.JPG"
            alt="Ankush Dharkar"
            className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 group-hover:border-green-400 transition-colors"
          />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            Ankush Dharkar
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => {
            const isActive = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-ring ${
                  isActive
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
