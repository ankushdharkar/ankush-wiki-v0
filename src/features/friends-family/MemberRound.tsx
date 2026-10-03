import { useReducer } from 'react'
import type { ReactNode } from 'react'
import type { RoundOverview } from './contract'
import { CommitmentPanel } from './CommitmentPanel'
import { RoundProgress } from './RoundProgress'
import { activeCommitmentMoney, formatMoney } from './money'
import { remainingUsdMinor } from './participants'
import { firstNameFrom, hasMemberHistory, initialMemberStage, memberFlowReducer } from './memberFlow'
import type { MemberStage } from './memberFlow'
import { story } from './content'
import { ankushPhoto, welcomeMedia } from './assets'
import { compactButton, hairline, label, Notice, pageTitle, primaryButton, secondaryText, sectionTitle, sheet, Signature, Stat, statRow, textLink, voice } from './ui'

interface MemberRoundProps {
  overview: RoundOverview
  queryKey: readonly string[]
  refresh: () => Promise<RoundOverview>
  onUnauthorized: () => void
  refreshFailed: boolean
  // The signed-in session's name. The letters and the summary greet by its first word.
  memberName?: string
}
export function MemberRound(props: MemberRoundProps) {
  // Every account-keyed mount starts at the welcome. Polling cannot advance it; Next judges history from the latest overview.
  const [stage, dispatch] = useReducer(memberFlowReducer, undefined, initialMemberStage)
  return <MemberRoundContent {...props} stage={stage} onNext={() => dispatch({ type: 'next', overview: props.overview })} onSaveConfirmed={() => dispatch({ type: 'save-confirmed' })} />
}
export function MemberRoundContent({ stage, onNext, onSaveConfirmed, ...props }: MemberRoundProps & {
  stage: MemberStage; onNext: () => void; onSaveConfirmed: () => void
}) {
  const firstName = firstNameFrom(props.memberName)
  if (stage === 'welcome') return hasMemberHistory(props.overview) ? <WelcomeBack overview={props.overview} firstName={firstName} onNext={onNext} /> : <MemberWelcome firstName={firstName} onNext={onNext} />
  const panel = <CommitmentPanel overview={props.overview} queryKey={props.queryKey} refresh={props.refresh} onUnauthorized={props.onUnauthorized} entry={stage === 'amount'} onSaveConfirmed={onSaveConfirmed} firstName={firstName} />
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
        <Stat label="Still to go" value={formatMoney(remainingUsdMinor(props.overview.config.targetUsdMinor, props.overview.summary.totalUsdMinor), 'USD')} />
        <Stat label="Friends and family so far" value={new Intl.NumberFormat('en-US').format(BigInt(props.overview.summary.participantCount))} />
      </dl>
    </div>
    <div className="min-w-0 space-y-6">{panel}{refreshNotice}</div>
    {/* The address lives only in the link; the people on this page already have Ankush's number. */}
    <p className={`${voice} flex flex-wrap items-center gap-x-2`}><span>Questions? Call me or WhatsApp me.</span><a href="mailto:ankushdharkar@gmail.com" className={textLink}>Email me</a></p>
  </div>
}
// The first-time letter. Its text is Ankush's own; only the greeting line is added.
function MemberWelcome({ firstName, onNext }: { firstName: string | null; onNext: () => void }) {
  return <Letter title="Thank you for being here." firstName={firstName} onNext={onNext} after={<>
    {story && <section aria-labelledby="why-i-am-raising" className={`mt-8 border-t pt-8 ${hairline}`}>
      <h2 id="why-i-am-raising" className={sectionTitle}>Why I am raising</h2>
      <div className={`mt-3 space-y-5 ${voice}`}>{story.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    </section>}
    {welcomeMedia && <WelcomeMediaPlayer />}
  </>}>
    <p>Thank you for being part of this friends and family round. It means the world to me to have your support.</p>
    <p>Building a global company is tough, very, very, very tough. But I am in it for the long game, and I am humbled and extremely grateful to have your support in this journey.</p>
  </Letter>
}
// A returning member reads a short note instead of the first-time letter on every visit.
function WelcomeBack({ overview, firstName, onNext }: { overview: RoundOverview; firstName: string | null; onNext: () => void }) {
  const own = activeCommitmentMoney(overview)
  return <Letter title="Welcome back." firstName={firstName} onNext={onNext}>
    <p>Thank you for coming back, and for your support of this round.</p>
    {own ? <p>Your commitment of {formatMoney(own.amountMinor, own.currency)} is recorded.</p>
      : overview.ownCommitment?.status === 'withdrawn' && <p>You withdrew your commitment, and that is completely fine. You are always welcome here.</p>}
  </Letter>
}
function Letter({ title, firstName, onNext, children, after }: { title: string; firstName: string | null; onNext: () => void; children: ReactNode; after?: ReactNode }) {
  return <section className={`mx-auto max-w-xl ${sheet}`}>
    <h1 className={pageTitle}>{title}</h1>
    <div className={`mt-6 space-y-5 ${voice}`}>{firstName && <p>Dear {firstName},</p>}{children}</div>
    {after}
    <div className="mt-8 flex items-center gap-4 text-stone-800 dark:text-stone-200">
      {ankushPhoto && <img data-photo src={ankushPhoto} alt="" width={56} height={56} className="size-14 shrink-0 rounded-full bg-stone-100 object-cover ring-1 ring-stone-900/10 dark:bg-stone-800 dark:ring-white/10" />}
      <Signature className="h-12 sm:h-14" />
    </div>
    <button type="button" onClick={onNext} className={`${primaryButton} mt-8`}>Next</button>
  </section>
}
// Never autoplays. The caption names what it is; the label repeats it for assistive technology.
function WelcomeMediaPlayer() {
  if (!welcomeMedia) return null
  const name = welcomeMedia.kind === 'video' ? 'A short video from Ankush' : 'A short voice note from Ankush'
  return <figure className="mt-8">
    <figcaption className={label}>{welcomeMedia.kind === 'video' ? 'A short video from me' : 'A short voice note from me'}</figcaption>
    {welcomeMedia.kind === 'video'
      ? <video controls preload="metadata" playsInline aria-label={name} className="mt-2 w-full rounded-md bg-stone-100 dark:bg-stone-800 dark:scheme-dark"><source src={welcomeMedia.src} type={welcomeMedia.type} /></video>
      : <audio controls preload="none" aria-label={name} className="mt-2 w-full dark:scheme-dark"><source src={welcomeMedia.src} type={welcomeMedia.type} /></audio>}
  </figure>
}
