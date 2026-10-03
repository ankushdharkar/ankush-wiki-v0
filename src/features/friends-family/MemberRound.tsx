import { useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import type { Money, RoundOverview } from './contract'
import { CommitmentPanel } from './CommitmentPanel'
import { activeCommitmentMoney, formatMoney } from './money'
import { firstNameFrom, initialMemberStage, letterVariant, memberFlowReducer } from './memberFlow'
import type { LetterVariant, MemberStage } from './memberFlow'
import { ankushPhoto, welcomeMedia } from './assets'
import { compactButton, cornerLink, Disclosure, hairline, label, Notice, pageTitle, primaryButton, secondaryText, sectionTitle, sheet, Signature, textLink, voice } from './ui'

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
  if (stage === 'welcome') return <WelcomeLetter overview={props.overview} firstName={firstName} onNext={onNext} />
  const panel = <CommitmentPanel overview={props.overview} queryKey={props.queryKey} refresh={props.refresh} onUnauthorized={props.onUnauthorized} entry={stage === 'amount'} onSaveConfirmed={onSaveConfirmed} firstName={firstName} />
  const refreshNotice = props.refreshFailed && <Notice tone="warning" role="status"><p>The latest update could not be loaded.</p><button type="button" onClick={() => void props.refresh().catch(() => {})} className={compactButton}>Retry</button></Notice>
  if (stage === 'amount') return <div className="mx-auto max-w-xl space-y-6">{panel}{refreshNotice}</div>
  // No round figures here, for any member or the admin: the round card lives only in the admin overview.
  // The TrueHuman block comes first as its own section; "Your commitment" then heads only the commitment part below it.
  return <div className="mx-auto max-w-xl space-y-12">
    <TrueHumanBlock />
    <div className="space-y-8">
      <header>
        <h1 className={pageTitle}>Your commitment</h1>
        <p className={`mt-3 text-base leading-7 ${secondaryText}`}>Your commitment stays yours to manage. You can change it or withdraw it here.</p>
      </header>
      <div className="min-w-0 space-y-6">{panel}{refreshNotice}</div>
      {/* The address lives only in the link; the people on this page already have Ankush's number. */}
      <p className={`${voice} flex flex-wrap items-center gap-x-2`}><span>Questions? Call me or WhatsApp me.</span><a href="mailto:ankushdharkar@gmail.com" className={textLink}>Email me</a></p>
    </div>
  </div>
}
// Plain links only: nothing from X is embedded, previewed or loaded until a link is clicked.
// The labels name the posts' authors and nothing more; the page does not describe or quote the posts.
const trueHumanLinks: [string, string][] = [
  ['Paul Graham on X', 'https://x.com/paulg/status/2103050328270946328'],
  ['Nikita Bier on X', 'https://x.com/nikitabier/status/2102432368158245252'],
]
// Ankush's own two lines, in his voice, on the member summary only.
function TrueHumanBlock() {
  return <section aria-labelledby="truehuman-heading" className={sheet}>
    <h2 id="truehuman-heading" className={sectionTitle}>What I am building</h2>
    <div className={`mt-4 space-y-4 ${voice}`}>
      <p>Online, it is getting harder to know who is real and who to trust.</p>
      <p>TrueHuman fixes that. Think of it as what a CIBIL or FICO score does for credit, but for trust between people online.</p>
    </div>
    <div className={`mt-6 border-t pt-2 ${hairline}`}>
      <Disclosure summary="Why this matters now">
        <ul className="flex flex-col items-start pb-1 sm:flex-row sm:gap-x-6">
          {trueHumanLinks.map(([name, href]) => <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" className={textLink}>{name}</a></li>)}
        </ul>
      </Disclosure>
    </div>
  </section>
}
const previewVariants: [LetterVariant, string][] = [['new', 'New'], ['returning', 'Returning'], ['withdrawn', 'Withdrawn']]
// Shown in a previewed returning letter when the admin has no active commitment of their own.
const sampleMoney: Money = { currency: 'INR', amountMinor: '50000000' }
// The admin can read any letter as a member in that state would. Local only: nothing is sent, and Next still judges the real overview.
function WelcomeLetter({ overview, firstName, onNext }: { overview: RoundOverview; firstName: string | null; onNext: () => void }) {
  const [preview, setPreview] = useState<LetterVariant | null>(null)
  const own = activeCommitmentMoney(overview)
  const variant = preview ?? letterVariant(overview)
  const corner = overview.capabilities.canManageRound === true && <div role="group" aria-label="Preview the letter as" className="absolute top-0 right-0 flex gap-3 pt-1 pr-6 pl-3 opacity-0 transition-opacity duration-150 hover:opacity-100 has-focus-visible:opacity-100 motion-reduce:transition-none sm:pr-8">
    {previewVariants.map(([value, name]) => <button key={value} type="button" aria-pressed={value === variant} onClick={() => setPreview(value)} className={cornerLink}>{name}</button>)}
  </div>
  if (variant === 'new') return <MemberWelcome firstName={firstName} onNext={onNext} corner={corner} />
  return <WelcomeBack money={preview ? own ?? sampleMoney : own} withdrawn={variant === 'withdrawn'} firstName={firstName} onNext={onNext} corner={corner} />
}
interface LetterProps { firstName: string | null; onNext: () => void; corner?: ReactNode }
// The first-time letter. Its text is Ankush's own, including the last two paragraphs; only the greeting line is added.
function MemberWelcome({ firstName, onNext, corner }: LetterProps) {
  return <Letter title="Thank you for being here." firstName={firstName} onNext={onNext} corner={corner} after={welcomeMedia && <WelcomeMediaPlayer />}>
    <p>Thank you for being part of this friends and family round. It means the world to me to have your support.</p>
    <p>Building a global company is tough, very, very, very tough. But I am in it for the long game, and I am humbled and extremely grateful to have your support in this journey.</p>
    <p>I have already built the MVP. This round helps me get it to more people, faster.</p>
    <p>Please commit only what you are comfortable with. You are under no obligation, and I do not want you to feel that you have to.</p>
  </Letter>
}
// A returning member reads a short note instead of the first-time letter on every visit.
function WelcomeBack({ money, withdrawn, firstName, onNext, corner }: LetterProps & { money: Money | null; withdrawn: boolean }) {
  return <Letter title="Welcome back." firstName={firstName} onNext={onNext} corner={corner}>
    <p>Thank you for coming back, and for your support of this round.</p>
    {withdrawn ? <p>You withdrew your commitment, and that is completely fine. You are always welcome here.</p>
      : money && <p>Your commitment of {formatMoney(money.amountMinor, money.currency)} is recorded.</p>}
  </Letter>
}
function Letter({ title, firstName, onNext, corner, children, after }: LetterProps & { title: string; children: ReactNode; after?: ReactNode }) {
  return <section className={`relative mx-auto max-w-xl ${sheet}`}>
    {corner}
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
