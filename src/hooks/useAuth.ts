import { useState, useEffect } from 'react'
import { identifyUser, resetUser } from '../services/analytics'
import { apiAuthFetch, API_URL } from '../services/api'

export interface SessionUser {
  authId: string
  email: string
  name: string
}

interface AuthState {
  user: SessionUser | null
  loading: boolean
}

export function useSession() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    apiAuthFetch<{ user: SessionUser | null }>('/auth/session')
      .then(({ user }) => {
        setState({ user, loading: false })
        if (user) {
          identifyUser(user.authId, { email: user.email, name: user.name })
        }
      })
      .catch(() => setState({ user: null, loading: false }))
  }, [])

  return state
}

export function useLogin() {
  return (returnTo?: string) => {
    const path = returnTo || window.location.pathname
    window.location.href = `${API_URL}/auth/login?returnTo=${encodeURIComponent(path)}`
  }
}

export function useLogout() {
  return (returnTo?: string) => {
    resetUser()
    const path = returnTo || '/'
    window.location.href = `${API_URL}/auth/logout?returnTo=${encodeURIComponent(path)}`
  }
}
