import type { Participant, RoundConfig } from './contract'
import { convertMinor, formatMoney } from './money'
import { hairline, secondaryText } from './ui'

const name = 'font-medium break-words text-stone-900 dark:text-stone-50'
const cell = 'px-8 py-4 align-top'
const hasAmount = ({ commitment }: Participant) => !!commitment.currency && !!commitment.amountMinor
const rowKey = (participant: Participant) => `${participant.email}:${participant.commitment.createdAt}:${participant.commitment.version}`

function CommitmentAmount({ participant, config }: { participant: Participant; config: RoundConfig }) {
  const { currency, amountMinor } = participant.commitment
  if (!currency || !amountMinor) return <span>No active commitment</span>
  return <><p className="font-semibold tabular-nums text-stone-900 dark:text-stone-50">{formatMoney(amountMinor, currency)}</p>{currency === 'INR' && <p className={`text-sm tabular-nums ${secondaryText}`}>About {formatMoney(convertMinor({ currency, amountMinor }, 'USD', config.inrPerUsd).toString(), 'USD')}</p>}</>
}
function UpdatedTime({ participant }: { participant: Participant }) {
  const { createdAt } = participant.commitment
  return <time dateTime={createdAt} title={new Date(createdAt).toLocaleString()}>{new Date(createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time>
}
export function ParticipantList({ participants, config }: { participants: Participant[]; config: RoundConfig }) {
  return <>
    <div className="hidden md:block"><table className="w-full table-fixed text-left text-base leading-6"><caption className="sr-only">Active commitments with signed-in name and email snapshots</caption>
      <thead className={`border-y bg-stone-50 text-sm dark:bg-stone-950/40 ${hairline} ${secondaryText}`}><tr><th scope="col" className="px-8 py-3 font-medium">Member</th><th scope="col" className="w-64 px-8 py-3 text-right font-medium">Commitment</th><th scope="col" className="w-52 px-8 py-3 text-right font-medium">Updated</th></tr></thead>
      <tbody className="divide-y divide-stone-200 dark:divide-stone-800">{participants.map((participant) => <tr key={rowKey(participant)}><td className={cell}><p className={name}>{participant.name || 'Name not provided'}</p><p className={`mt-0.5 text-sm break-all ${secondaryText}`}>{participant.email}</p></td><td className={`${cell} text-right break-words`}><CommitmentAmount participant={participant} config={config} /></td><td className={`${cell} text-right text-sm tabular-nums ${secondaryText}`}>{hasAmount(participant) && <UpdatedTime participant={participant} />}</td></tr>)}</tbody>
    </table></div>
    <ul className={`divide-y divide-stone-200 border-t md:hidden dark:divide-stone-800 ${hairline}`}>{participants.map((participant) => <li key={rowKey(participant)} className="space-y-2 px-6 py-4 text-base leading-6 sm:px-8"><div><p className={name}>{participant.name || 'Name not provided'}</p><p className={`mt-0.5 text-sm break-all ${secondaryText}`}>{participant.email}</p></div><div><div className="flex flex-wrap items-baseline gap-x-2"><CommitmentAmount participant={participant} config={config} /></div>{hasAmount(participant) && <p className={`mt-0.5 text-sm ${secondaryText}`}>Updated <UpdatedTime participant={participant} /></p>}</div></li>)}</ul>
  </>
}
