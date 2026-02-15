import { useState } from 'react'
import { useSession, useLogin, useLogout } from '../../hooks/useAuth'
import { motion } from 'framer-motion'

interface UserMenuProps {
  variant?: 'hero' | 'nav'
}

const styles = {
  hero: {
    button: `px-4 py-2.5 rounded-full border border-gray-600 text-sm font-medium transition-all duration-300
      text-white hover:text-green-400 hover:border-green-400
      focus:outline-none focus:ring-2 focus:ring-green-500/50
      disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:text-white disabled:hover:border-gray-600`,
    spinner: 'border-white',
    userName: 'text-sm text-gray-300 hidden sm:inline',
    loading: 'h-10 w-24 rounded-full bg-gray-700/50 border border-gray-600 animate-pulse',
  },
  nav: {
    button: `px-4 py-2 rounded-lg border text-sm font-medium transition-colors
      bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/60 dark:hover:bg-gray-700/70
      border-gray-200 dark:border-gray-700/50
      text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100
      focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
      disabled:opacity-60 disabled:cursor-not-allowed`,
    spinner: 'border-gray-700 dark:border-gray-300',
    userName: 'text-sm text-gray-600 dark:text-gray-400 hidden sm:inline',
    loading: 'h-9 w-20 rounded-lg bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 animate-pulse',
  },
}

export default function UserMenu({ variant = 'nav' }: UserMenuProps) {
  const { user, loading } = useSession()
  const login = useLogin()
  const logout = useLogout()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const s = styles[variant]

  const handleSignIn = () => {
    setIsRedirecting(true)
    login()
  }

  if (loading) {
    return <div className={s.loading} />
  }

  if (!user) {
    return (
      <motion.button
        onClick={handleSignIn}
        disabled={isRedirecting}
        whileTap={{ scale: isRedirecting ? 1 : 0.95 }}
        className={s.button}
      >
        <span className="flex items-center gap-2">
          {isRedirecting && (
            <span className={`animate-spin h-3.5 w-3.5 border-2 border-t-transparent rounded-full ${s.spinner}`} />
          )}
          {isRedirecting ? 'Signing in...' : 'Sign In'}
        </span>
      </motion.button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className={s.userName}>
        {user.name || user.email}
      </span>
      <motion.button
        onClick={() => logout()}
        whileTap={{ scale: 0.95 }}
        className={s.button}
      >
        Sign Out
      </motion.button>
    </div>
  )
}
