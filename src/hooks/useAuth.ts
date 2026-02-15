import { useQuery } from '@tanstack/react-query'
import { identifyUser, resetUser } from '../services/analytics'
import { apiAuthFetch, API_URL } from '../services/api'

export interface SessionUser {
  authId: string
  email: string
  name: string
}

export function useSession() {
  const { data, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { user } = await apiAuthFetch<{ user: SessionUser | null }>('/auth/session')
      if (user) {
        identifyUser(user.authId, { email: user.email, name: user.name })
      }
      return user
    },
  })

  return { user: data ?? null, loading: isLoading }
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
