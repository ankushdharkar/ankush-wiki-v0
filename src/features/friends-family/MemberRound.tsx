import { useReducer } from 'react'
import type { RoundOverview } from './contract'
import { CommitmentPanel } from './CommitmentPanel'
import { RoundProgress } from './RoundProgress'
import { formatMoney } from './money'
import { primaryButton } from './MoneyEditor'
import { remainingUsdMinor } from './participants'
import { initialMemberStage, memberFlowReducer } from './memberFlow'
import type { MemberStage } from './memberFlow'

interface MemberRoundProps {
  overview: RoundOverview
  queryKey: readonly string[]
  refresh: () => Promise<RoundOverview>
  onUnauthorized: () => void
  refreshFailed: boolean
}
export function MemberRound(props: MemberRoundProps) {
  // This initializer runs only when the account-keyed component mounts. Polling cannot advance it.
  const [stage, dispatch] = useReducer(memberFlowReducer, props.overview, initialMemberStage)
  return <MemberRoundContent {...props} stage={stage} onNext={() => dispatch('next')} onSaveConfirmed={() => dispatch('save-confirmed')} />
}
export function MemberRoundContent({ stage, onNext, onSaveConfirmed, ...props }: MemberRoundProps & {
  stage: MemberStage; onNext: () => void; onSaveConfirmed: () => void
}) {
  if (stage === 'welcome') return <MemberWelcome onNext={onNext} />
  const panel = <CommitmentPanel overview={props.overview} queryKey={props.queryKey} refresh={props.refresh} onUnauthorized={props.onUnauthorized} entry={stage === 'amount'} onSaveConfirmed={onSaveConfirmed} />
  const refreshNotice = props.refreshFailed && <p role="status" className="text-sm text-amber-800 dark:text-amber-200">The latest update could not be loaded. <button type="button" onClick={() => void props.refresh().catch(() => {})} className="underline underline-offset-4">Retry</button></p>
  if (stage === 'amount') return <div className="mx-auto max-w-xl space-y-4">{panel}{refreshNotice}</div>
  return <>
    <RoundProgress overview={props.overview} />
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
      <section className="pt-2"><p className="text-xs font-semibold tracking-widest text-teal-800 uppercase dark:text-teal-300">Friends &amp; family round</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">The round so far</h1><p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">Your commitment stays yours to manage. You can change it or withdraw it here.</p><dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"><SummaryValue label="Remaining" value={formatMoney(remainingUsdMinor(props.overview.config.targetUsdMinor, props.overview.summary.totalUsdMinor), 'USD')} /><SummaryValue label="People committed" value={new Intl.NumberFormat('en-US').format(BigInt(props.overview.summary.participantCount))} /></dl></section>
      <div className="min-w-0 space-y-4">{panel}{refreshNotice}</div>
    </div>
  </>
}
function MemberWelcome({ onNext }: { onNext: () => void }) {
  return <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm shadow-slate-900/5 dark:bg-slate-900 sm:p-10">
    <p className="text-xs font-semibold tracking-widest text-teal-800 uppercase dark:text-teal-300">Friends &amp; family</p>
    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Thank you for being here.</h1>
    <div className="mt-6 max-w-prose space-y-4 text-base leading-7 text-slate-600 dark:text-slate-300"><p>Thank you for being part of this friends and family round. It means the world to me to have your support.</p><p>Building a global company is tough, very, very, very tough. But I am in it for the long game, and I am humbled and extremely grateful to have your support in this journey.</p></div>
    <p className="mt-6 text-sm font-medium text-slate-900 dark:text-white">Ankush</p>
    <button type="button" onClick={onNext} className={`${primaryButton} mt-8`}>Next</button>
  </section>
}
function SummaryValue({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt><dd className="mt-2 break-words text-xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white">{value}</dd></div>
}
