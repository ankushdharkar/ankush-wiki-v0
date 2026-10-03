import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Money, RoundCommand, RoundOverview } from './contract'
import { createCommand, executeCommand, RoundApiError } from './api'
import { activeCommitmentMoney, formatMoney } from './money'
import { MoneyEditor } from './MoneyEditor'
import { actions, dangerButton, figure, inset, Notice, pageTitle, primaryButton, quietButton, secondaryButton, secondaryText, sectionTitle, sheet, voice } from './ui'

export function CommitmentPanel({ overview, queryKey, refresh, onUnauthorized, entry = false, onSaveConfirmed, firstName = null }: {
  overview: RoundOverview; queryKey: readonly string[]
  refresh: () => Promise<RoundOverview>; onUnauthorized: () => void
  entry?: boolean; onSaveConfirmed?: () => void; firstName?: string | null
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
  // Only the editor has a heading here. At rest the summary page title, "Your commitment", heads the amount.
  const title = entry ? 'What amount are you comfortable investing?' : draft && own ? 'Change your commitment' : 'Make your commitment'
  const intro = showEditor ? 'Choose an amount that feels right for you.' : `Thank you for being part of this round${firstName ? `, ${firstName}` : ''}.`
  return <section className="space-y-6">
    {/* On the entry step the question is the page title and sits above the sheet. */}
    {entry && <header><Heading className={pageTitle}>{title}</Heading><p className={`mt-3 text-base leading-7 ${secondaryText}`}>{intro}</p></header>}
    <div className={`${sheet} space-y-6`}>
      {message && <Notice tone="success" role="status">{message}</Notice>}
      {error && <Notice tone="warning" role="alert"><p>{error}</p>
        {command && !busy && <button onClick={() => void submit(command)} className={primaryButton}>Retry same change</button>}
        {conflict && <><p>Latest commitment: <strong className="font-semibold tabular-nums">{own ? formatMoney(own.amountMinor, own.currency) : 'None at the moment'}</strong></p>
          {canReview ? <button onClick={() => {
            if (!reviewedVersion.current) return
            if (draft) setDraft({ ...draft, version: reviewedVersion.current })
            withdrawVersion.current = reviewedVersion.current; setConflict(false); setError(''); setReviewReady(false)
          }} className={secondaryButton}>I reviewed this, continue with my change</button> : <button onClick={() => void review()} disabled={busy} className={secondaryButton}>Load latest commitment</button>}
        </>}
      </Notice>}
      {/* The outcome and any warning come first; the editor's heading follows them. */}
      {!entry && showEditor && <Heading className={sectionTitle}>{title}</Heading>}
      {showEditor ? <MoneyEditor config={overview.config} initial={draft?.initial ?? null} pending={busy} locked={busy || !!command || conflict} onSave={(money) => {
        // Freeze the version when a new member starts a command too.
        void submit(createCommand(draft?.version ?? overview.currentVersion, money))
      }} onCancel={!entry && draft && own && !command && !conflict ? () => { setDraft(null); setError('') } : undefined} /> : <>
        <div>
          <p className={`${figure} text-3xl leading-9 break-words`}>{formatMoney(own.amountMinor, own.currency)}</p>
          <p className={`${voice} mt-2`}>{intro}</p>
        </div>
        <div className={actions}><button disabled={busy || !!command || conflict} onClick={() => { setDraft({ initial: own, version: overview.currentVersion }); setMessage(''); setError(''); setConfirmWithdraw(false) }} className={secondaryButton}>Change commitment</button><button disabled={busy || !!command || conflict} onClick={() => { setConfirmWithdraw(true); withdrawVersion.current = overview.currentVersion; setMessage('') }} className={quietButton}>Withdraw commitment</button></div>
        {confirmWithdraw && <div className={inset}><p className="text-base leading-7 text-stone-900 dark:text-stone-100">Withdraw your {formatMoney(own.amountMinor, own.currency)} commitment?</p><div className={`${actions} mt-3`}><button disabled={busy || !!command || conflict} onClick={() => void submit(createCommand(withdrawVersion.current))} className={dangerButton}>{busy ? 'Withdrawing…' : 'Yes, withdraw'}</button><button disabled={busy || !!command || conflict} onClick={() => setConfirmWithdraw(false)} className={quietButton}>Keep commitment</button></div></div>}
      </>}
    </div>
  </section>
}
