import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ThemeToggle } from '../components/ThemeToggle'
import type { SessionUser } from '../hooks/useAuth'
import { API_URL } from '../services/api'
import { privateFetch, RoundApiError } from '../features/friends-family/api'
import type { RoundOverview } from '../features/friends-family/contract'
import { RoundViews } from '../features/friends-family/RoundViews'
import { primaryButton, quietButton } from '../features/friends-family/MoneyEditor'

export default function FriendsAndFamily() {
  const queryClient = useQueryClient()
  const [expired, setExpired] = useState(false)
  const session = useQuery({
    queryKey: ['private-friends-family', 'session'],
    queryFn: ({ signal }) => privateFetch<{ user: SessionUser | null }>('/auth/session', { signal }),
    retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: true,
  })
  const user = session.data?.user
  const queryKey = ['private-friends-family', 'overview', user?.authId ?? 'anonymous']
  const overview = useQuery({
    queryKey, queryFn: ({ signal }) => privateFetch<RoundOverview>('/friends-and-family', { signal }),
    enabled: !!user && !expired && !session.isError,
    retry: false, staleTime: 0, gcTime: 0, refetchInterval: 15_000, refetchOnWindowFocus: true,
  })
  const unauthorized = expired || session.error instanceof RoundApiError && session.error.status === 401 || overview.error instanceof RoundApiError && overview.error.status === 401
  const login = () => { window.location.href = `${API_URL}/auth/login?returnTo=${encodeURIComponent('/invest')}` }
  async function signout() {
    setExpired(true)
    await queryClient.cancelQueries({ queryKey: ['private-friends-family'] })
    queryClient.removeQueries({ queryKey: ['private-friends-family'] })
    queryClient.removeQueries({ queryKey: ['session'] })
    window.location.href = `${API_URL}/auth/logout?returnTo=${encodeURIComponent('/invest')}`
  }
  const anonymous = unauthorized || !session.isPending && !session.isError && !user
  const hasSessionFailure = session.isError && !unauthorized
  return <div data-private-round className="ph-no-capture ph-no-record min-h-screen bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
    <title>Friends &amp; family | Ankush</title><meta name="robots" content="noindex, nofollow, noarchive" />
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-5 sm:px-8 sm:py-6">
      <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">Ankush<span className="ml-2 text-slate-400 dark:text-slate-500">/</span><span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">Friends &amp; family</span></span>
      <div className="flex shrink-0 items-center gap-2"><ThemeToggle />{user && !anonymous && <button onClick={() => void signout()} className={quietButton}>Sign out</button>}</div>
    </header>
    <main className="mx-auto max-w-5xl space-y-6 px-5 pt-5 sm:space-y-8 pb-16 sm:px-8 sm:pt-10">
      {session.isPending ? <p role="status" className="py-16 text-center">Checking your sign-in…</p> : anonymous ? <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900 sm:p-12"><p className="text-xs font-semibold tracking-widest text-teal-800 uppercase dark:text-teal-300">A personal invitation</p><h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Friends &amp; family</h1><p className="mt-4 mb-8 text-slate-500 dark:text-slate-400">Sign in with Google to view the round and manage your commitment.</p><button onClick={login} className={primaryButton}>Continue with Google</button></section> : hasSessionFailure ? <ErrorCard message="We could not check your sign-in. Please try again." retry={() => void session.refetch()} /> : overview.isPending ? <p role="status" className="py-16 text-center">Loading the round…</p> : overview.data && user ? <RoundViews key={user.authId} authId={user.authId} login={login} overview={overview.data} queryKey={queryKey} refresh={async () => {
        const result = await overview.refetch(); if (result.error) throw result.error; if (!result.data) throw new Error('No response'); return result.data
      }} onUnauthorized={() => { setExpired(true); queryClient.removeQueries({ queryKey: ['private-friends-family'] }) }} refreshFailed={overview.isError} /> : <ErrorCard message="The round could not be loaded. Please try again." retry={() => void overview.refetch()} />}

    </main>
  </div>
}
function ErrorCard({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"><p className="mb-5 text-slate-700 dark:text-slate-200">{message}</p><button onClick={retry} className={primaryButton}>Try again</button></div>
}
