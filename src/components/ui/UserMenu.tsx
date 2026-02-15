import { useState } from 'react'
import { useSession, useLogin, useLogout } from '../../hooks/useAuth'
import { motion } from 'framer-motion'

export default function UserMenu() {
  const { user, loading } = useSession()
  const login = useLogin()
  const logout = useLogout()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleSignIn = () => {
    setIsRedirecting(true)
    login()
  }

  if (loading) {
    return <div className="h-8 w-16 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
  }

  if (!user) {
    return (
      <motion.button
        onClick={handleSignIn}
        disabled={isRedirecting}
        whileTap={{ scale: isRedirecting ? 1 : 0.95 }}
        className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors
          text-gray-600 dark:text-gray-400
          hover:text-gray-900 dark:hover:text-gray-200
          hover:bg-gray-100 dark:hover:bg-gray-800/50
          disabled:opacity-60 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-green-500/50"
      >
        <span className="flex items-center gap-1.5">
          {isRedirecting && (
            <span className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full" />
          )}
          {isRedirecting ? 'Signing in...' : 'Sign In'}
        </span>
      </motion.button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
        {user.name || user.email}
      </span>
      <motion.button
        onClick={() => logout()}
        whileTap={{ scale: 0.95 }}
        className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors
          text-gray-600 dark:text-gray-400
          hover:text-gray-900 dark:hover:text-gray-200
          hover:bg-gray-100 dark:hover:bg-gray-800/50
          focus:outline-none focus:ring-2 focus:ring-green-500/50"
      >
        Sign Out
      </motion.button>
    </div>
  )
}
