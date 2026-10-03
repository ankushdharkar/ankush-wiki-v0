import type { RoundOverview } from './contract'
import { activeCommitmentMoney, formatMoney, ownBasisPoints, percentLabel } from './money'

export function RoundProgress({ overview, showOwn = true }: { overview: RoundOverview; showOwn?: boolean }) {
  const { summary, config } = overview
  const own = activeCommitmentMoney(overview)
  const progress = BigInt(summary.progressBasisPoints)
  const width = Number(progress > 10_000n ? 10_000n : progress) / 100
  return <section aria-label="Round progress" className="sticky top-3 z-10 rounded-2xl bg-white p-4 shadow-lg shadow-slate-900/5 dark:bg-slate-900 dark:shadow-black/20 sm:p-6">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <p className="text-xs font-semibold tracking-widest text-teal-800 uppercase dark:text-teal-300">Together so far</p>
      <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400">{percentLabel(progress)} of the round</span>
    </div>
    <p className="mt-2 flex flex-wrap items-baseline gap-x-2 tabular-nums"><strong className="min-w-0 max-w-full break-words text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{formatMoney(summary.totalUsdMinor, 'USD')}</strong><span className="text-sm text-slate-500 dark:text-slate-400">of {formatMoney(config.targetUsdMinor, 'USD')}</span></p>
    <div role="progressbar" aria-label="Round committed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={width} aria-valuetext={`${percentLabel(progress)} committed`} className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-teal-600 dark:bg-teal-400" style={{ width: `${width}%` }} /></div>
    {showOwn && <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300"><span><span className="sm:hidden">Yours</span><span className="hidden sm:inline">Your commitment</span> <strong className="ml-1 font-semibold text-slate-900 dark:text-white">{own ? formatMoney(own.amountMinor, own.currency) : 'Not yet added'}</strong></span><span className="tabular-nums">{percentLabel(ownBasisPoints(own, config))} of the target</span></div>}
  </section>
}
