import { useState } from 'react'
import type { Money, RoundConfig } from './contract'
import { amountError, convertMinor, decimalForScale, formatMoney, parseAmount, selectedMoney, unitScale } from './money'
import type { RupeeUnit } from './money'

export const primaryButton = 'min-h-12 rounded-xl bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200'
export const quietButton = 'min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-600 dark:text-slate-300 dark:hover:bg-slate-800'
const stepButton = 'h-14 w-14 shrink-0 rounded-xl bg-slate-100 text-3xl text-slate-700 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'

export function MoneyEditor({ config, initial, locked, pending, onSave, onCancel, saveLabel = 'Save commitment' }: {
  config: RoundConfig; initial: Money | null; locked: boolean; pending: boolean
  onSave: (money: Money) => void; onCancel?: () => void; saveLabel?: string
}) {
  const [currency, setCurrency] = useState<Money['currency']>(initial?.currency ?? 'INR')
  const [unit, setUnit] = useState<RupeeUnit>('Crore')
  const [canonical, setCanonical] = useState<Money | null>(initial)
  const [value, setValue] = useState(initial ? decimalForScale(BigInt(initial.amountMinor), unitScale(initial.currency, 'Crore')) : '')
  const [showError, setShowError] = useState(false)
  const selected = selectedMoney(canonical, currency, config.inrPerUsd)
  const error = amountError(selected?.amountMinor ?? null, config)
  const invalidDraft = value !== '' && canonical === null

  function edit(next: string) {
    setValue(next)
    const amountMinor = parseAmount(next, currency, unit)
    setCanonical(amountMinor === null ? null : { currency, amountMinor })
  }
  function step(direction: bigint) {
    const current = canonical ? convertMinor(canonical, currency, config.inrPerUsd) : 0n
    const increment = currency === 'INR' ? unitScale(currency, unit) : 10_000n
    const next = current + direction * increment
    const bounded = next < 0n ? 0n : next
    edit(decimalForScale(bounded, unitScale(currency, unit)))
    setShowError(false)
  }
  const full = canonical ? convertMinor(canonical, currency, config.inrPerUsd).toString() : null
  const otherCurrency = currency === 'INR' ? 'USD' : 'INR'
  return <form onSubmit={(event) => { event.preventDefault(); setShowError(true); if (selected && !error) onSave(selected) }} className="space-y-6">
    <fieldset disabled={locked} className="min-w-0 space-y-6 disabled:opacity-60">
      <legend className="sr-only">Commitment amount</legend>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="commitment-amount" className="font-semibold text-slate-900 dark:text-white">Your amount</label>
        <div className="flex gap-2">
          <label className="sr-only" htmlFor="commitment-currency">Currency</label>
          <select id="commitment-currency" value={currency} disabled={locked || invalidDraft} onChange={(event) => {
            const next = event.target.value as Money['currency']; setCurrency(next)
            if (canonical) setValue(decimalForScale(convertMinor(canonical, next, config.inrPerUsd), unitScale(next, unit)))
          }} className="rounded-lg bg-slate-100 px-3 py-2 text-base text-slate-800 focus-visible:outline-teal-600 dark:bg-slate-800 dark:text-slate-100">{config.currencies.map((item) => <option key={item}>{item}</option>)}</select>
          {currency === 'INR' && <><label className="sr-only" htmlFor="commitment-unit">Rupee unit</label><select id="commitment-unit" value={unit} disabled={locked || invalidDraft} onChange={(event) => {
            const next = event.target.value as RupeeUnit; setUnit(next)
            if (canonical) setValue(decimalForScale(convertMinor(canonical, currency, config.inrPerUsd), unitScale(currency, next)))
          }} className="rounded-lg bg-slate-100 px-3 py-2 text-base text-slate-800 focus-visible:outline-teal-600 dark:bg-slate-800 dark:text-slate-100"><option>Lakh</option><option>Crore</option></select></>}
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button type="button" onClick={() => step(-1n)} aria-label={`Decrease by ${currency === 'INR' ? `1 ${unit}` : '100 dollars'}`} disabled={locked || invalidDraft || !canonical || BigInt(full ?? '0') === 0n} className={stepButton}>−</button>
        <input id="commitment-amount" inputMode="decimal" autoComplete="off" placeholder="0" value={value} onChange={(event) => edit(event.target.value)} onBlur={() => { if (value) setShowError(true) }} aria-invalid={showError && !!error} aria-describedby="amount-help amount-error" className="h-20 min-w-0 w-full rounded-xl bg-slate-50 px-2 text-center text-4xl font-medium tracking-tight tabular-nums text-slate-900 outline-none focus:ring-2 focus:ring-teal-600 dark:bg-slate-950 dark:text-white sm:text-5xl" />
        <button type="button" onClick={() => step(1n)} aria-label={`Increase by ${currency === 'INR' ? `1 ${unit}` : '100 dollars'}`} disabled={locked || invalidDraft} className={stepButton}>+</button>
      </div>
      <div id="amount-help" className="text-center text-sm text-slate-500 dark:text-slate-400">
        <p className="font-medium text-slate-700 dark:text-slate-200">{full ? formatMoney(full, currency) : 'Enter the amount you would like to commit'}</p>
        {canonical && <p className="mt-1">About {formatMoney(convertMinor(canonical, otherCurrency, config.inrPerUsd).toString(), otherCurrency)}</p>}
        <p className="mt-3">{config.rateIsTemporary ? 'Temporary rate' : 'Conversion rate'}: US$1 = ₹{config.inrPerUsd}</p>
      </div>
      {showError && error && <p id="amount-error" role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    </fieldset>
    <div className="flex flex-wrap items-center gap-3"><button type="submit" disabled={locked} className={primaryButton}>{pending ? 'Saving…' : saveLabel}</button>{onCancel && <button type="button" disabled={locked} onClick={onCancel} className={quietButton}>Cancel</button>}</div>
  </form>
}
