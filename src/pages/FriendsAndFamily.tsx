import { useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { SessionUser } from '../hooks/useAuth'
import { API_URL } from '../services/api'
import { privateFetch, RoundApiError } from '../features/friends-family/api'
import type { RoundOverview } from '../features/friends-family/contract'
import { RoundViews } from '../features/friends-family/RoundViews'
import { ThemeSwitch } from '../features/friends-family/ThemeSwitch'
import { actions, hairline, label, MessageSheet, pageTitle, primaryButton, quietButton, secondaryText, sheet, statusText, voice } from '../features/friends-family/ui'

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
  return <div data-private-round className="ph-no-capture ph-no-record min-h-screen bg-stone-50 text-stone-700 dark:bg-stone-950 dark:text-stone-300">
    <title>Friends &amp; family | Ankush</title><meta name="robots" content="noindex, nofollow, noarchive" />
    <header className={`border-b ${hairline}`}>
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <span className="text-base font-semibold text-stone-900 dark:text-stone-50">Ankush<span aria-hidden="true" className="mx-2 font-normal text-stone-400 dark:text-stone-600">/</span><span className={`font-normal ${secondaryText}`}>Friends &amp; family</span></span>
        <div className="flex shrink-0 items-center gap-1"><ThemeSwitch />{user && !anonymous && <button onClick={() => void signout()} className={quietButton}>Sign out</button>}</div>
      </div>
    </header>
    <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-20 sm:px-6 sm:pt-12">
      {session.isPending ? <p role="status" className={statusText}>Checking your sign-in…</p> : anonymous ? <Invitation><button onClick={login} className={primaryButton}>Continue with Google</button></Invitation> : hasSessionFailure ? <MessageSheet message="We could not check your sign-in. Please try again." actionLabel="Try again" onAction={() => void session.refetch()} /> : overview.isPending ? <p role="status" className={statusText}>Loading the round…</p> : overview.data && user ? <RoundViews key={user.authId} authId={user.authId} login={login} memberName={user.name} overview={overview.data} queryKey={queryKey} refresh={async () => {
        const result = await overview.refetch(); if (result.error) throw result.error; if (!result.data) throw new Error('No response'); return result.data
      }} onUnauthorized={() => { setExpired(true); queryClient.removeQueries({ queryKey: ['private-friends-family'] }) }} refreshFailed={overview.isError} /> : <MessageSheet message="The round could not be loaded. Please try again." actionLabel="Try again" onAction={() => void overview.refetch()} />}

    </main>
  </div>
}
// Anyone with the link can see this, signed out or after a session expires.
// It must never show round figures or call an authenticated endpoint.
// The page passes in the one action, so the sign-in button stays in the page's own tree.
function Invitation({ children }: { children: ReactNode }) {
  return <section className={`mx-auto max-w-xl ${sheet}`}>
    <p className={label}>A personal invitation from Ankush</p>
    <h1 className={`${pageTitle} mt-1`}>Friends &amp; family</h1>
    <p className={`${voice} mt-5`}>I shared this page with you personally. It is where you can take part in this friends and family round.</p>
    <dl className={`mt-8 divide-y divide-stone-200 border-y dark:divide-stone-800 ${hairline}`}>
      <InvitationPoint title="What you can do here">After you sign in, you can see how the round is coming along and record the amount you are comfortable investing. You can change or withdraw it here.</InvitationPoint>
      <InvitationPoint title="No payment is taken">Recording a commitment does not move any money. Nothing is charged or transferred on this page.</InvitationPoint>
      <InvitationPoint title="Why I ask you to sign in">Signing in with Google ties your commitment to you and keeps it private.</InvitationPoint>
    </dl>
    <div className={`${actions} mt-8`}>{children}</div>
  </section>
}
function InvitationPoint({ title, children }: { title: string; children: string }) {
  return <div className="py-4"><dt className="text-base leading-6 font-semibold text-stone-900 dark:text-stone-50">{title}</dt><dd className="mt-1 text-base leading-7">{children}</dd></div>
}
