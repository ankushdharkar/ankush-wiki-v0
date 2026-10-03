import { useReducer } from 'react'
import type { RoundOverview } from './contract'
import { CommitmentPanel } from './CommitmentPanel'
import { RoundProgress } from './RoundProgress'
import { formatMoney } from './money'
import { remainingUsdMinor } from './participants'
import { initialMemberStage, memberFlowReducer } from './memberFlow'
import type { MemberStage } from './memberFlow'
import { compactButton, Notice, pageTitle, primaryButton, secondaryText, sheet, Stat, statRow, voice } from './ui'

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
  const refreshNotice = props.refreshFailed && <Notice tone="warning" role="status"><p>The latest update could not be loaded.</p><button type="button" onClick={() => void props.refresh().catch(() => {})} className={compactButton}>Retry</button></Notice>
  if (stage === 'amount') return <div className="mx-auto max-w-xl space-y-6">{panel}{refreshNotice}</div>
  return <div className="mx-auto max-w-xl space-y-8">
    <header>
      <h1 className={pageTitle}>The round</h1>
      <p className={`mt-3 text-base leading-7 ${secondaryText}`}>Your commitment stays yours to manage. You can change it or withdraw it here.</p>
    </header>
    <div className={sheet}>
      <RoundProgress overview={props.overview} />
      <dl className={statRow}>
        <Stat label="Remaining" value={formatMoney(remainingUsdMinor(props.overview.config.targetUsdMinor, props.overview.summary.totalUsdMinor), 'USD')} />
        <Stat label="People committed" value={new Intl.NumberFormat('en-US').format(BigInt(props.overview.summary.participantCount))} />
      </dl>
    </div>
    <div className="min-w-0 space-y-6">{panel}{refreshNotice}</div>
  </div>
}
function MemberWelcome({ onNext }: { onNext: () => void }) {
  return <section className={`mx-auto max-w-xl ${sheet}`}>
    <h1 className={pageTitle}>Thank you for being here.</h1>
    <div className={`mt-6 space-y-5 ${voice}`}><p>Thank you for being part of this friends and family round. It means the world to me to have your support.</p><p>Building a global company is tough, very, very, very tough. But I am in it for the long game, and I am humbled and extremely grateful to have your support in this journey.</p></div>
    <p className="mt-6 font-serif text-base leading-7 text-stone-900 sm:text-lg sm:leading-8 dark:text-stone-50">Ankush</p>
    <button type="button" onClick={onNext} className={`${primaryButton} mt-8`}>Next</button>
  </section>
}
