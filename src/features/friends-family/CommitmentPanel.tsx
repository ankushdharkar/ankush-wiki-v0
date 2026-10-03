import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Money, RoundCommand, RoundOverview } from './contract'
import { createCommand, executeCommand, RoundApiError } from './api'
import { activeCommitmentMoney, formatMoney } from './money'
import { MoneyEditor, primaryButton, quietButton } from './MoneyEditor'

export function CommitmentPanel({ overview, queryKey, refresh, onUnauthorized, entry = false, onSaveConfirmed }: {
  overview: RoundOverview; queryKey: readonly string[]
  refresh: () => Promise<RoundOverview>; onUnauthorized: () => void
  entry?: boolean; onSaveConfirmed?: () => void
}) {
  const queryClient = useQueryClient()
  const own = activeCommitmentMoney(overview)
  const [draft, setDraft] = useState<{ initial: Money | null; version: string } | null>(() => own && !entry ? null : { initial: null, version: overview.currentVersion })
  const [command, setCommand] = useState<RoundCommand | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [conflict, setConflict] = useState(false)
  const [reviewReady, setReviewReady] = useState(false)
  const reviewedVersion = useRef<string | null>(null)
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const withdrawVersion = useRef(overview.currentVersion)
  const inFlight = useRef(false)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  // A remote withdrawal can reveal an empty editor while this panel stays mounted.
  // Capture its version once, before any input, just as on the first empty load.
  if (!own && draft === null) setDraft({ initial: null, version: overview.currentVersion })

  async function review() {
    setReviewReady(false)
    try { const latest = await refresh(); if (!mounted.current) return; reviewedVersion.current = latest.currentVersion; setReviewReady(true) }
    catch (cause) {
      if (!mounted.current) return
      if (cause instanceof RoundApiError && cause.status === 401) onUnauthorized()
      else setError('The latest commitment could not be loaded. Try again before continuing.')
    }
  }
  async function submit(next: RoundCommand) {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true); setCommand(next); setError(''); setMessage('')
    try {
      const result = await executeCommand(next)
      if (!mounted.current) return
      await queryClient.cancelQueries({ queryKey })
      if (!mounted.current) return
      queryClient.setQueryData(queryKey, result)
      setCommand(null); setDraft(activeCommitmentMoney(result) ? null : { initial: null, version: result.currentVersion }); setConfirmWithdraw(false); setConflict(false)
      if (next.kind === 'save') onSaveConfirmed?.()
      setMessage(result.replayed ? 'Your commitment is up to date.' : next.kind === 'withdraw' ? 'Your commitment is withdrawn.' : 'Your commitment is saved.')
    } catch (cause) {
      if (!mounted.current) return
      if (cause instanceof RoundApiError && cause.status === 401) { onUnauthorized(); return }
      if (cause instanceof RoundApiError && cause.status === 409) {
        setCommand(null); setConflict(true); setError('Your commitment changed in another window. Review the latest amount before continuing.'); await review()
      } else if (cause instanceof RoundApiError && cause.status >= 400 && cause.status < 500) {
        setCommand(null); setError('Your commitment could not be saved. Check the amount and try again.')
      } else {
        setError('We could not confirm whether this change was saved. Retry this same change to safely check its result.')
      }
    } finally { inFlight.current = false; setBusy(false) }
  }
  const showEditor = entry || !!draft || !own
  const canReview = reviewReady && reviewedVersion.current === overview.currentVersion
  const Heading = entry ? 'h1' : 'h2'
  return <section className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-900/5 dark:bg-slate-900 sm:p-8">
    <Heading className={`${entry ? 'text-2xl sm:text-3xl' : 'text-xl'} font-semibold tracking-tight text-slate-900 dark:text-white`}>{entry ? 'What amount are you comfortable investing?' : showEditor ? draft && own ? 'Change your commitment' : 'Make your commitment' : 'Your commitment'}</Heading>
    <p className="mt-2 mb-7 text-sm text-slate-500 dark:text-slate-400">{showEditor ? 'Choose an amount that feels right for you.' : 'Thank you for being part of this round.'}</p>
    {message && <p role="status" className="mb-6 rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900 dark:bg-teal-950 dark:text-teal-200">{message}</p>}
    {error && <div role="alert" className="mb-6 space-y-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100"><p>{error}</p>
      {command && !busy && <button onClick={() => void submit(command)} className={primaryButton}>Retry same change</button>}
      {conflict && <><p>Latest commitment: <strong>{own ? formatMoney(own.amountMinor, own.currency) : 'No active commitment'}</strong></p>
        {canReview ? <button onClick={() => {
          if (!reviewedVersion.current) return
          if (draft) setDraft({ ...draft, version: reviewedVersion.current })
          withdrawVersion.current = reviewedVersion.current; setConflict(false); setError(''); setReviewReady(false)
        }} className={quietButton}>I reviewed this, continue with my change</button> : <button onClick={() => void review()} disabled={busy} className={quietButton}>Load latest commitment</button>}
      </>}
    </div>}
    {showEditor ? <MoneyEditor config={overview.config} initial={draft?.initial ?? null} pending={busy} saveLabel={entry ? 'Save commitment and view round' : undefined} locked={busy || !!command || conflict} onSave={(money) => {
      // Freeze the version when a new member starts a command too.
      void submit(createCommand(draft?.version ?? overview.currentVersion, money))
    }} onCancel={!entry && draft && own && !command && !conflict ? () => { setDraft(null); setError('') } : undefined} /> : <>
      <p className="break-words text-4xl font-medium tracking-tight tabular-nums text-slate-900 dark:text-white">{formatMoney(own.amountMinor, own.currency)}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3"><button disabled={busy || !!command || conflict} onClick={() => { setDraft({ initial: own, version: overview.currentVersion }); setMessage(''); setError(''); setConfirmWithdraw(false) }} className={primaryButton}>Change commitment</button><button disabled={busy || !!command || conflict} onClick={() => { setConfirmWithdraw(true); withdrawVersion.current = overview.currentVersion; setMessage('') }} className={quietButton}>Withdraw commitment</button></div>
      {confirmWithdraw && <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><p className="text-sm text-slate-700 dark:text-slate-200">Withdraw your {formatMoney(own.amountMinor, own.currency)} commitment?</p><div className="mt-3 flex flex-wrap gap-2"><button disabled={busy || !!command || conflict} onClick={() => void submit(createCommand(withdrawVersion.current))} className="min-h-11 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950 dark:text-red-200">{busy ? 'Withdrawing…' : 'Yes, withdraw'}</button><button disabled={busy || !!command || conflict} onClick={() => setConfirmWithdraw(false)} className={quietButton}>Keep commitment</button></div></div>}
    </>}
  </section>
}
