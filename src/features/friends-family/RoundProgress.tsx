import type { RoundOverview } from './contract'
import { activeCommitmentMoney, formatMoney, ownBasisPoints, percentLabel } from './money'
import { figure, label, secondaryText } from './ui'

export function RoundProgress({ overview, showOwn = true }: { overview: RoundOverview; showOwn?: boolean }) {
  const { summary, config } = overview
  const own = activeCommitmentMoney(overview)
  const progress = BigInt(summary.progressBasisPoints)
  const width = Number(progress > 10_000n ? 10_000n : progress) / 100
  return <section aria-label="Round progress">
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <p className={label}>Together so far</p>
      <p className={`text-sm leading-6 tabular-nums ${secondaryText}`}>{percentLabel(progress)} of the round</p>
    </div>
    <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums"><strong className={`${figure} max-w-full min-w-0 text-3xl leading-9 break-words`}>{formatMoney(summary.totalUsdMinor, 'USD')}</strong><span className={`text-base ${secondaryText}`}>of {formatMoney(config.targetUsdMinor, 'USD')}</span></p>
    <div role="progressbar" aria-label="Round committed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={width} aria-valuetext={`${percentLabel(progress)} committed`} className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800"><div className="h-full rounded-full bg-teal-800 dark:bg-teal-500" style={{ width: `${width}%` }} /></div>
    {showOwn && <p className={`mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm leading-6 ${secondaryText}`}><span><span className="sm:hidden">Yours</span><span className="hidden sm:inline">Your commitment</span> <strong className="ml-1 font-semibold tabular-nums text-stone-900 dark:text-stone-50">{own ? formatMoney(own.amountMinor, own.currency) : 'Not yet added'}</strong></span><span className="tabular-nums">{percentLabel(ownBasisPoints(own, config))} of the target</span></p>}
  </section>
}
