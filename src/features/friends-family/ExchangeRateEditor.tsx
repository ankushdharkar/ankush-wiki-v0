import { useRef, useState } from 'react'
import type { ExchangeRateCommand, ExchangeRateResult, ParticipantsResponse } from './contract'
import { createExchangeRateCommand, RoundApiError } from './api'
import { formatRate, inrMinorPerUsd, rateDecimal } from './money'
import { actions, AlertIcon, compactButton, fieldError, fieldGroup, fieldGroupInvalid, fieldInput, fieldLabel, figure, hairline, label, Notice, primaryButton, quietButton, secondaryButton, secondaryText } from './ui'
import { parseRate, rateError } from './exchangeRate'

// Mirrors RoundTargetEditor: a frozen draft version, the same command retried after an uncertain
// result, and a reviewed reload before a new command after a conflict.
export function ExchangeRateEditor({ snapshot, canManage, save, refresh, onAccessDenied, onEditStateChange }: {
  snapshot: ParticipantsResponse; canManage: boolean
  save: (command: ExchangeRateCommand) => Promise<ExchangeRateResult>
  refresh: () => Promise<ParticipantsResponse>; onAccessDenied: (status: 401 | 403) => void
  onEditStateChange?: (editing: boolean) => void
}) {
  const [draft, setDraft] = useState<{ value: string; version: string } | null>(null)
  const [command, setCommand] = useState<ExchangeRateCommand | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [conflict, setConflict] = useState(false)
  const [reviewReady, setReviewReady] = useState(false)
  const reviewedVersion = useRef<string | null>(null)
  const inFlight = useRef(false)
  const current = inrMinorPerUsd(snapshot.config)
  const rateVersion = snapshot.exchangeRate?.version
  const locked = busy || command !== null || conflict
  const rate = draft ? parseRate(draft.value) : null
  const validation = rateError(rate, snapshot.config)
  const canReview = reviewReady && reviewedVersion.current === rateVersion

  async function reviewLatest() {
    setReviewReady(false)
    try { const latest = await refresh(); reviewedVersion.current = latest.exchangeRate?.version ?? null; setReviewReady(true) }
    catch (cause) {
      if (cause instanceof RoundApiError && (cause.status === 401 || cause.status === 403)) onAccessDenied(cause.status)
      else setError('The latest rate could not be loaded. Try again before continuing.')
    }
  }
  async function submit(next: ExchangeRateCommand) {
    if (inFlight.current || !canManage) return
    inFlight.current = true; setBusy(true); setCommand(next); setError(''); setMessage('')
    try {
      const result = await save(next)
      setCommand(null); setDraft(null); setConflict(false); setReviewReady(false); setShowError(false)
      onEditStateChange?.(false)
      setMessage(result.replayed ? 'The conversion rate is up to date.' : 'The conversion rate is saved.')
    } catch (cause) {
      if (cause instanceof RoundApiError && (cause.status === 401 || cause.status === 403)) { onAccessDenied(cause.status); return }
      if (cause instanceof RoundApiError && cause.status === 409) {
        setCommand(null); setConflict(true); setError('The conversion rate changed in another window. Review the latest rate before continuing.'); await reviewLatest()
      } else if (cause instanceof RoundApiError && cause.status >= 400 && cause.status < 500) {
        setCommand(null); setError('The rate could not be saved. Check the rate and try again.')
      } else setError('We could not confirm whether the rate was saved. Retry this same change to safely check its result.')
    } finally { inFlight.current = false; setBusy(false) }
  }
  function cancel() {
    if (busy || command) return
    setDraft(null); setConflict(false); setReviewReady(false); setError(''); setShowError(false)
    onEditStateChange?.(false)
  }
  const invalid = showError && !!validation
  return <section aria-labelledby="exchange-rate-heading" className={`min-w-0 ${draft && canManage ? 'sm:col-span-2' : ''}`}>
    <div className="flex items-center justify-between gap-x-4"><div className="min-w-0"><h2 id="exchange-rate-heading" className={label}>Conversion rate</h2><p className={`${figure} mt-1 text-lg leading-7 break-words`}>US$1 = ₹{formatRate(current)}</p></div>
      {canManage && !draft && rateVersion && <button type="button" onClick={() => { onEditStateChange?.(true); setDraft({ value: rateDecimal(current), version: rateVersion }); setMessage(''); setError('') }} className={`${compactButton} shrink-0`}>Change rate</button>}
    </div>
    {snapshot.exchangeRate && <p className={`mt-1 text-sm leading-6 ${secondaryText}`}>{snapshot.config.rateIsTemporary ? 'Temporary rate. ' : ''}Rate updated <time dateTime={snapshot.exchangeRate.updatedAt} title={new Date(snapshot.exchangeRate.updatedAt).toLocaleString()}>{new Date(snapshot.exchangeRate.updatedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time></p>}
    {message && <Notice tone="success" role="status" className="mt-4">{message}</Notice>}
    {draft && canManage && <form className="mt-6 max-w-xl space-y-5" onSubmit={(event) => {
      event.preventDefault(); if (locked) return; setShowError(true)
      if (rate !== null && !validation) void submit(createExchangeRateCommand(draft.version, rate))
    }}>
      {error && <Notice tone="warning" role="alert"><p>{error}</p>{command && !busy && <button type="button" onClick={() => void submit(command)} className={primaryButton}>Retry same rate change</button>}
        {conflict && <><p>Latest rate: <strong className="font-semibold tabular-nums">US$1 = ₹{formatRate(current)}</strong></p>{canReview ? <button type="button" onClick={() => {
          if (reviewedVersion.current) setDraft({ ...draft, version: reviewedVersion.current })
          setConflict(false); setError(''); setReviewReady(false)
        }} className={secondaryButton}>I reviewed this, keep my draft</button> : <button type="button" disabled={busy} onClick={() => void reviewLatest()} className={secondaryButton}>Load latest rate</button>}</>}
      </Notice>}
      <div className="space-y-3">
        <label htmlFor="exchange-rate-inr" className={fieldLabel}>Rupees for one US dollar</label>
        <div className="flex items-center gap-3"><span aria-hidden="true" className={`${figure} shrink-0 text-lg leading-7`}>US$1 =</span>
          <div className={`${invalid ? fieldGroupInvalid : fieldGroup} w-full max-w-56 ${locked ? 'opacity-60' : ''}`}><span aria-hidden="true" className={`flex shrink-0 items-center border-r px-3.5 text-lg ${hairline} ${secondaryText}`}>₹</span><input id="exchange-rate-inr" inputMode="decimal" autoComplete="off" value={draft.value} disabled={locked} onChange={(event) => setDraft({ ...draft, value: event.target.value })} aria-invalid={invalid} aria-describedby="exchange-rate-help exchange-rate-error" className={`${fieldInput} h-14 w-full text-2xl font-medium tabular-nums`} /></div>
        </div>
        {invalid && <p id="exchange-rate-error" role="alert" className={fieldError}><AlertIcon />{validation}</p>}
        <p id="exchange-rate-help" className={`text-sm leading-6 ${secondaryText}`}>Up to two decimals. Totals and USD equivalents use the new rate once it is saved. Commitments keep the amount and currency each member entered.</p>
      </div>
      <div className={actions}><button type="submit" disabled={locked} className={primaryButton}>{busy ? 'Saving…' : 'Save rate'}</button><button type="button" disabled={busy || !!command} onClick={cancel} className={quietButton}>Cancel</button></div>
    </form>}
  </section>
}
