import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { privateFetch, RoundApiError, executeRoundTargetCommand } from './api'
import type { ParticipantsResponse, RoundOverview, RoundTargetCommand } from './contract'
import { RoundProgress } from './RoundProgress'
import { formatMoney } from './money'
import { participantsQueryPolicy, remainingUsdMinor, searchParticipants } from './participants'
import { ParticipantList } from './ParticipantList'
import { RoundTargetEditor } from './RoundTargetEditor'
import { applyRoundSnapshot } from './roundTarget'
import { primaryButton } from './MoneyEditor'

export function AdminDashboard({ overview, authId, login, onExitLockChange }: { overview: RoundOverview; authId: string; login: () => void; onExitLockChange?: (locked: boolean) => void }) {
  const queryClient = useQueryClient()
  const mounted = useRef(true)
  const [accessFailure, setAccessFailure] = useState<401 | 403 | null>(null)
  const queryPolicy = participantsQueryPolicy(overview, authId)
  const [search, setSearch] = useState('')
  const query = useQuery({
    ...queryPolicy, enabled: queryPolicy.enabled && accessFailure === null,
    queryFn: ({ signal }) => privateFetch<ParticipantsResponse>('/friends-and-family/admin/participants', { signal }),
  })
  const accessStatus = accessFailure ?? (query.error instanceof RoundApiError ? query.error.status : null)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      const queryKey = ['private-friends-family', 'participants', authId]
      void queryClient.cancelQueries({ queryKey })
      queryClient.removeQueries({ queryKey })
    }
  }, [queryClient, authId])
  useEffect(() => {
    if (accessStatus === 401 || accessStatus === 403) onExitLockChange?.(false)
  }, [accessStatus, onExitLockChange])
  if (accessStatus === 401 || accessStatus === 403) return <DashboardFeedback message={accessStatus === 401 ? 'Your sign-in has expired.' : 'This account cannot view the round dashboard.'} action={login} actionLabel={accessStatus === 401 ? 'Sign in again' : 'Sign in with another account'} />
  if (query.isPending) return <p role="status" className="py-16 text-center">Loading the round dashboard…</p>
  if (!query.data) return <DashboardFeedback message="The round dashboard could not be loaded." action={() => void query.refetch()} actionLabel="Try again" />
  const { config, round, summary, participants } = query.data
  const filtered = searchParticipants(participants, search)
  // Both totals and list come from the same server response, including during background refresh.
  const snapshot = { ...overview, config, round, summary }
  return <div className="space-y-6 sm:space-y-8">
    <RoundProgress overview={snapshot} showOwn={false} />
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold tracking-widest text-teal-800 uppercase dark:text-teal-300">Friends &amp; family round</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Round overview</h1></div><p className="text-xs text-slate-500 dark:text-slate-400">Updated <time dateTime={new Date(query.dataUpdatedAt).toISOString()}>{new Date(query.dataUpdatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</time></p></div>
    {query.isError && <div role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">The latest update could not be loaded. Showing the last confirmed round. <button type="button" onClick={() => void query.refetch()} className="font-medium underline underline-offset-4">Retry</button></div>}
    <RoundTargetEditor snapshot={query.data} canManage={overview.capabilities.canManageRound === true} onEditStateChange={onExitLockChange} save={async (command: RoundTargetCommand) => {
      if (!overview.capabilities.canManageRound) throw new RoundApiError(403)
      const result = await executeRoundTargetCommand(command)
      if (mounted.current) await applyRoundSnapshot(queryClient, queryPolicy.queryKey, ['private-friends-family', 'overview', authId], result, () => mounted.current)
      return result
    }} refresh={async () => {
      const latest = await query.refetch(); if (latest.error) throw latest.error; if (!latest.data) throw new Error('No response'); return latest.data
    }} onAccessDenied={(status) => {
      setAccessFailure(status)
      void queryClient.cancelQueries({ queryKey: queryPolicy.queryKey })
      queryClient.removeQueries({ queryKey: queryPolicy.queryKey })
      void queryClient.invalidateQueries({ queryKey: ['private-friends-family', 'overview', authId] }).catch(() => {})
    }} />
    <div className="grid gap-3 sm:grid-cols-3 sm:gap-5">
      <Metric label="Committed" value={formatMoney(summary.totalUsdMinor, 'USD')} />
      <Metric label="Remaining" value={formatMoney(remainingUsdMinor(config.targetUsdMinor, summary.totalUsdMinor), 'USD')} />
      <Metric label="People committed" value={new Intl.NumberFormat('en-US').format(BigInt(summary.participantCount))} />
    </div>
    <section aria-labelledby="participants-heading" className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-slate-900/5 dark:bg-slate-900">
      <div className="space-y-4 px-5 pt-5 pb-4 sm:px-6 sm:pt-6"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 id="participants-heading" className="text-lg font-semibold text-slate-900 dark:text-white">Commitments</h2><p className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{filtered.length} of {participants.length} shown</p></div>
        <label htmlFor="participant-search" className="sr-only">Search by name or email</label><input id="participant-search" type="search" autoComplete="off" placeholder="Search by name or email" value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-12 w-full rounded-xl bg-slate-50 px-4 text-base text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500" />
        <p className="text-xs text-slate-500 dark:text-slate-400">{config.rateIsTemporary ? 'Temporary rate' : 'Conversion rate'}: US$1 = ₹{config.inrPerUsd}. USD equivalents are rounded per commitment.</p>
      </div>
      {filtered.length ? <ParticipantList participants={filtered} config={config} /> : <p role="status" className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{participants.length ? 'No commitments match your search.' : 'No commitments have been added yet.'}</p>}
      <p className="border-t border-slate-100 px-5 py-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:px-6">Names and emails reflect each member’s most recent signed-in submission.</p>
    </section>
  </div>
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-white px-5 py-4 shadow-sm shadow-slate-900/5 dark:bg-slate-900 sm:block sm:p-5"><p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p><p className="break-words text-xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white sm:mt-3 sm:text-2xl">{value}</p></div>
}
function DashboardFeedback({ message, action, actionLabel }: { message: string; action: () => void; actionLabel: string }) {
  return <div role="alert" className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"><p className="mb-5 text-slate-700 dark:text-slate-200">{message}</p><button type="button" onClick={action} className={primaryButton}>{actionLabel}</button></div>
}
