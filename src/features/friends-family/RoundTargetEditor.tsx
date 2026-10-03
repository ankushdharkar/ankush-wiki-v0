import { useRef, useState } from 'react'
import type { ParticipantsResponse, RoundTargetCommand, RoundTargetResult } from './contract'
import { createRoundTargetCommand, RoundApiError } from './api'
import { convertMinor, decimalForScale, formatMoney } from './money'
import { primaryButton, quietButton } from './MoneyEditor'
import { parseTargetMillions, targetError, USD_MILLION_SCALE } from './roundTarget'

export function RoundTargetEditor({ snapshot, canManage, save, refresh, onAccessDenied, onEditStateChange }: {
  snapshot: ParticipantsResponse; canManage: boolean
  save: (command: RoundTargetCommand) => Promise<RoundTargetResult>
  refresh: () => Promise<ParticipantsResponse>; onAccessDenied: (status: 401 | 403) => void
  onEditStateChange?: (editing: boolean) => void
}) {
  const [draft, setDraft] = useState<{ value: string; version: string } | null>(null)
  const [command, setCommand] = useState<RoundTargetCommand | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [conflict, setConflict] = useState(false)
  const [reviewReady, setReviewReady] = useState(false)
  const reviewedVersion = useRef<string | null>(null)
  const inFlight = useRef(false)
  const locked = busy || command !== null || conflict
  const amount = draft ? parseTargetMillions(draft.value) : null
  const validation = targetError(amount, snapshot.config)
  const canReview = reviewReady && reviewedVersion.current === snapshot.round.version

  async function reviewLatest() {
    setReviewReady(false)
    try { const latest = await refresh(); reviewedVersion.current = latest.round.version; setReviewReady(true) }
    catch (cause) {
      if (cause instanceof RoundApiError && (cause.status === 401 || cause.status === 403)) onAccessDenied(cause.status)
      else setError('The latest target could not be loaded. Try again before continuing.')
    }
  }
  async function submit(next: RoundTargetCommand) {
    if (inFlight.current || !canManage) return
    inFlight.current = true; setBusy(true); setCommand(next); setError(''); setMessage('')
    try {
      const result = await save(next)
      setCommand(null); setDraft(null); setConflict(false); setReviewReady(false); setShowError(false)
      onEditStateChange?.(false)
      setMessage(result.replayed ? 'The round target is up to date.' : 'The round target is saved.')
    } catch (cause) {
      if (cause instanceof RoundApiError && (cause.status === 401 || cause.status === 403)) { onAccessDenied(cause.status); return }
      if (cause instanceof RoundApiError && cause.status === 409) {
        setCommand(null); setConflict(true); setError('The target changed in another window. Review the latest target before continuing.'); await reviewLatest()
      } else if (cause instanceof RoundApiError && cause.status >= 400 && cause.status < 500) {
        setCommand(null); setError('The target could not be saved. Check the amount and try again.')
      } else setError('We could not confirm whether the target was saved. Retry this same change to safely check its result.')
    } finally { inFlight.current = false; setBusy(false) }
  }
  function cancel() {
    if (busy || command) return
    setDraft(null); setConflict(false); setReviewReady(false); setError(''); setShowError(false)
    onEditStateChange?.(false)
  }
  return <section aria-labelledby="round-target-heading" className="rounded-2xl bg-white p-5 shadow-sm shadow-slate-900/5 dark:bg-slate-900 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="round-target-heading" className="text-xs font-medium text-slate-500 dark:text-slate-400">Round target</h2><p className="mt-1 break-words text-xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white">{formatMoney(snapshot.config.targetUsdMinor, 'USD')}</p><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Target updated <time dateTime={snapshot.round.updatedAt} title={new Date(snapshot.round.updatedAt).toLocaleString()}>{new Date(snapshot.round.updatedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time></p></div>
      {canManage && !draft && <button type="button" onClick={() => { onEditStateChange?.(true); setDraft({ value: decimalForScale(BigInt(snapshot.config.targetUsdMinor), USD_MILLION_SCALE), version: snapshot.round.version }); setMessage(''); setError('') }} className={quietButton}>Change target</button>}
    </div>
    {message && <p role="status" className="mt-4 text-sm font-medium text-teal-800 dark:text-teal-300">{message}</p>}
    {draft && canManage && <form className="mt-6 space-y-5" onSubmit={(event) => {
      event.preventDefault(); if (locked) return; setShowError(true)
      if (amount !== null && !validation) void submit(createRoundTargetCommand(draft.version, amount))
    }}>
      {error && <div role="alert" className="space-y-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100"><p>{error}</p>{command && !busy && <button type="button" onClick={() => void submit(command)} className={primaryButton}>Retry same target change</button>}
        {conflict && <><p>Latest target: <strong>{formatMoney(snapshot.config.targetUsdMinor, 'USD')}</strong></p>{canReview ? <button type="button" onClick={() => {
          if (reviewedVersion.current) setDraft({ ...draft, version: reviewedVersion.current })
          setConflict(false); setError(''); setReviewReady(false)
        }} className={quietButton}>I reviewed this, keep my draft</button> : <button type="button" disabled={busy} onClick={() => void reviewLatest()} className={quietButton}>Load latest target</button>}</>}
      </div>}
      <div><label htmlFor="round-target-millions" className="text-sm font-semibold text-slate-900 dark:text-white">Target in USD millions</label><div className="mt-2 flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-4 dark:bg-slate-950"><input id="round-target-millions" inputMode="decimal" autoComplete="off" value={draft.value} disabled={locked} onChange={(event) => setDraft({ ...draft, value: event.target.value })} aria-invalid={showError && !!validation} aria-describedby="round-target-help round-target-error" className="h-16 min-w-0 w-full bg-transparent text-3xl font-medium tracking-tight tabular-nums text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:opacity-50 dark:text-white" /><span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">million USD</span></div></div>
      <div id="round-target-help" className="break-words text-sm text-slate-500 dark:text-slate-400">{amount !== null && <><p className="font-medium text-slate-700 dark:text-slate-200">{formatMoney(amount, 'USD')}</p><p className="mt-1">{formatMoney(convertMinor({ currency: 'USD', amountMinor: amount }, 'INR', snapshot.config.inrPerUsd).toString(), 'INR')}</p></>}<p className="mt-2">{snapshot.config.rateIsTemporary ? 'Temporary rate' : 'Conversion rate'}: US$1 = ₹{snapshot.config.inrPerUsd}</p></div>
      {showError && validation && <p id="round-target-error" role="alert" className="text-sm text-red-700 dark:text-red-300">{validation}</p>}
      <div className="flex flex-wrap gap-3"><button type="submit" disabled={locked} className={primaryButton}>{busy ? 'Saving…' : 'Save target'}</button><button type="button" disabled={busy || !!command} onClick={cancel} className={quietButton}>Cancel</button></div>
    </form>}
  </section>
}
