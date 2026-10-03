import { useRef, useState } from 'react'
import type { ParticipantsResponse, RoundTargetCommand, RoundTargetResult } from './contract'
import { createRoundTargetCommand, RoundApiError } from './api'
import { convertMinor, decimalForScale, formatMoney, inrMinorPerUsd, rateLine } from './money'
import { actions, AlertIcon, compactButton, fieldError, fieldGroup, fieldGroupInvalid, fieldInput, fieldLabel, figure, hairline, label, Notice, primaryButton, quietButton, secondaryButton, secondaryText } from './ui'
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
  const invalid = showError && !!validation
  return <section aria-labelledby="round-target-heading" className={`min-w-0 ${draft && canManage ? 'sm:col-span-2' : ''}`}>
    <div className="flex items-center justify-between gap-x-4"><div className="min-w-0"><h2 id="round-target-heading" className={label}>Round target</h2><p className={`${figure} mt-1 text-lg leading-7 break-words`}>{formatMoney(snapshot.config.targetUsdMinor, 'USD')}</p></div>
      {canManage && !draft && <button type="button" onClick={() => { onEditStateChange?.(true); setDraft({ value: decimalForScale(BigInt(snapshot.config.targetUsdMinor), USD_MILLION_SCALE), version: snapshot.round.version }); setMessage(''); setError('') }} className={`${compactButton} shrink-0`}>Change target</button>}
    </div>
    <p className={`mt-1 text-sm leading-6 ${secondaryText}`}>Target updated <time dateTime={snapshot.round.updatedAt} title={new Date(snapshot.round.updatedAt).toLocaleString()}>{new Date(snapshot.round.updatedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time></p>
    {message && <Notice tone="success" role="status" className="mt-4">{message}</Notice>}
    {draft && canManage && <form className="mt-6 max-w-xl space-y-5" onSubmit={(event) => {
      event.preventDefault(); if (locked) return; setShowError(true)
      if (amount !== null && !validation) void submit(createRoundTargetCommand(draft.version, amount))
    }}>
      {error && <Notice tone="warning" role="alert"><p>{error}</p>{command && !busy && <button type="button" onClick={() => void submit(command)} className={primaryButton}>Retry same target change</button>}
        {conflict && <><p>Latest target: <strong className="font-semibold tabular-nums">{formatMoney(snapshot.config.targetUsdMinor, 'USD')}</strong></p>{canReview ? <button type="button" onClick={() => {
          if (reviewedVersion.current) setDraft({ ...draft, version: reviewedVersion.current })
          setConflict(false); setError(''); setReviewReady(false)
        }} className={secondaryButton}>I reviewed this, keep my draft</button> : <button type="button" disabled={busy} onClick={() => void reviewLatest()} className={secondaryButton}>Load latest target</button>}</>}
      </Notice>}
      <div className="space-y-3">
        <label htmlFor="round-target-millions" className={fieldLabel}>Target in USD millions</label>
        <div className={`${invalid ? fieldGroupInvalid : fieldGroup} ${locked ? 'opacity-60' : ''}`}><input id="round-target-millions" inputMode="decimal" autoComplete="off" value={draft.value} disabled={locked} onChange={(event) => setDraft({ ...draft, value: event.target.value })} aria-invalid={invalid} aria-describedby="round-target-help round-target-error" className={`${fieldInput} h-14 w-full text-2xl font-medium tabular-nums`} /><span className={`flex shrink-0 items-center border-l px-3.5 text-base ${hairline} ${secondaryText}`}>million USD</span></div>
        {invalid && <p id="round-target-error" role="alert" className={fieldError}><AlertIcon />{validation}</p>}
        <div id="round-target-help" className={`text-sm leading-6 break-words ${secondaryText}`}>{amount !== null && <><p className="text-lg leading-7 font-semibold tabular-nums text-stone-900 dark:text-stone-50">{formatMoney(amount, 'USD')}</p><p className="tabular-nums">{formatMoney(convertMinor({ currency: 'USD', amountMinor: amount }, 'INR', inrMinorPerUsd(snapshot.config)).toString(), 'INR')}</p></>}<p className={amount !== null ? 'mt-3' : ''}>{rateLine(snapshot.config)}</p></div>
      </div>
      <div className={actions}><button type="submit" disabled={locked} className={primaryButton}>{busy ? 'Saving…' : 'Save target'}</button><button type="button" disabled={busy || !!command} onClick={cancel} className={quietButton}>Cancel</button></div>
    </form>}
  </section>
}
