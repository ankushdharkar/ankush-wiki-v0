import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { executeExchangeRateCommand, executeRoundTargetCommand, privateFetch, RoundApiError } from './api'
import type { ExchangeRateCommand, ParticipantsResponse, RoundOverview, RoundTargetCommand, RoundTargetResult } from './contract'
import { RoundProgress } from './RoundProgress'
import { formatMoney, rateLine } from './money'
import { participantsQueryPolicy, remainingUsdMinor, searchParticipants } from './participants'
import { ParticipantList } from './ParticipantList'
import { RoundTargetEditor } from './RoundTargetEditor'
import { ExchangeRateEditor } from './ExchangeRateEditor'
import { applyRoundSnapshot } from './roundTarget'
import { compactButton, flushSheet, hairline, MessageSheet, Notice, pageTitle, SearchIcon, searchInput, secondaryText, sectionTitle, sheet, Stat, statRow, statusText } from './ui'

export function AdminDashboard({ overview, authId, login, onExitLockChange }: { overview: RoundOverview; authId: string; login: () => void; onExitLockChange?: (locked: boolean) => void }) {
  const queryClient = useQueryClient()
  const mounted = useRef(true)
  const [accessFailure, setAccessFailure] = useState<401 | 403 | null>(null)
  const queryPolicy = participantsQueryPolicy(overview, authId)
  const [search, setSearch] = useState('')
  // Either editor holding a draft or an uncertain command keeps the view switch locked.
  const editing = useRef({ target: false, rate: false })
  const overviewKey = ['private-friends-family', 'overview', authId]
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
  if (accessStatus === 401 || accessStatus === 403) return <MessageSheet message={accessStatus === 401 ? 'Your sign-in has expired.' : 'This account cannot view the round dashboard.'} onAction={login} actionLabel={accessStatus === 401 ? 'Sign in again' : 'Sign in with another account'} />
  if (query.isPending) return <p role="status" className={statusText}>Loading the round dashboard…</p>
  if (!query.data) return <MessageSheet message="The round dashboard could not be loaded." onAction={() => void query.refetch()} actionLabel="Try again" />
  const { config, round, summary, participants } = query.data
  const canManage = overview.capabilities.canManageRound === true
  function reportEditing(editor: 'target' | 'rate') {
    return (next: boolean) => {
      editing.current = { ...editing.current, [editor]: next }
      onExitLockChange?.(editing.current.target || editing.current.rate)
    }
  }
  // Both editors confirm through the same admin snapshot update and member overview refresh.
  function managed<C>(execute: (command: C) => Promise<RoundTargetResult>) {
    return async (command: C) => {
      if (!overview.capabilities.canManageRound) throw new RoundApiError(403)
      const result = await execute(command)
      if (mounted.current) await applyRoundSnapshot(queryClient, queryPolicy.queryKey, overviewKey, result, () => mounted.current)
      return result
    }
  }
  async function refresh() {
    const latest = await query.refetch(); if (latest.error) throw latest.error; if (!latest.data) throw new Error('No response'); return latest.data
  }
  function onAccessDenied(status: 401 | 403) {
    setAccessFailure(status)
    void queryClient.cancelQueries({ queryKey: queryPolicy.queryKey })
    queryClient.removeQueries({ queryKey: queryPolicy.queryKey })
    void queryClient.invalidateQueries({ queryKey: overviewKey }).catch(() => {})
  }
  const filtered = searchParticipants(participants, search)
  // Both totals and list come from the same server response, including during background refresh.
  const snapshot = { ...overview, config, round, summary }
  return <div className="mx-auto max-w-4xl space-y-8">
    <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"><h1 className={pageTitle}>Round overview</h1><p className={`text-sm leading-6 tabular-nums ${secondaryText}`}>Updated <time dateTime={new Date(query.dataUpdatedAt).toISOString()}>{new Date(query.dataUpdatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</time></p></header>
    {query.isError && <Notice tone="warning" role="status"><p>The latest update could not be loaded. Showing the last confirmed round.</p><button type="button" onClick={() => void query.refetch()} className={compactButton}>Retry</button></Notice>}
    <div className={sheet}>
      <RoundProgress overview={snapshot} showOwn={false} />
      <dl className={statRow}>
        <Stat label="Remaining" value={formatMoney(remainingUsdMinor(config.targetUsdMinor, summary.totalUsdMinor), 'USD')} />
        <Stat label="People committed" value={new Intl.NumberFormat('en-US').format(BigInt(summary.participantCount))} />
      </dl>
      <div className={`mt-6 border-t pt-6 ${hairline}`}>
        <RoundTargetEditor snapshot={query.data} canManage={canManage} onEditStateChange={reportEditing('target')} save={managed<RoundTargetCommand>(executeRoundTargetCommand)} refresh={refresh} onAccessDenied={onAccessDenied} />
      </div>
      <div className={`mt-6 border-t pt-6 ${hairline}`}>
        <ExchangeRateEditor snapshot={query.data} canManage={canManage} onEditStateChange={reportEditing('rate')} save={managed<ExchangeRateCommand>(executeExchangeRateCommand)} refresh={refresh} onAccessDenied={onAccessDenied} />
      </div>
    </div>
    <section aria-labelledby="participants-heading" className={flushSheet}>
      <div className="space-y-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"><h2 id="participants-heading" className={sectionTitle}>Commitments</h2>{participants.length > 0 && <p className={`text-sm leading-6 tabular-nums ${secondaryText}`}>{filtered.length} of {participants.length} shown</p>}</div>
        {/* Search and the rate note only help once there is something to read. */}
        {participants.length > 0 && <>
          <div className="relative"><label htmlFor="participant-search" className="sr-only">Search by name or email</label><SearchIcon /><input id="participant-search" type="search" autoComplete="off" placeholder="Search by name or email" value={search} onChange={(event) => setSearch(event.target.value)} className={searchInput} /></div>
          <p className={`text-sm leading-6 ${secondaryText}`}>{rateLine(config)}. USD equivalents are rounded per commitment.</p>
        </>}
        {filtered.length === 0 && <p role="status" className={`py-6 text-base leading-7 ${secondaryText}`}>{participants.length ? 'No commitments match your search.' : 'No commitments have been added yet.'}</p>}
      </div>
      {filtered.length > 0 && <ParticipantList participants={filtered} config={config} />}
      {participants.length > 0 && <p className={`border-t px-6 py-4 text-sm leading-6 sm:px-8 ${hairline} ${secondaryText}`}>Names and emails reflect each member’s most recent signed-in submission.</p>}
    </section>
  </div>
}
