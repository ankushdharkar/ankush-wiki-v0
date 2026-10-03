import { useState } from 'react'
import type { Money, RoundConfig } from './contract'
import { amountError, convertMinor, decimalForScale, formatMoney, parseAmount, selectedMoney, unitScale } from './money'
import type { RupeeUnit } from './money'
import { actions, AlertIcon, compactButton, fieldError, fieldGroup, fieldGroupInvalid, fieldInput, fieldLabel, fieldSelect, hairline, primaryButton, quietButton, secondaryText, SelectChevron } from './ui'

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
  const invalid = showError && !!error
  // The visible step text is part of each button's accessible name.
  const stepText = currency === 'INR' ? `1 ${unit}` : 'US$100'
  return <form onSubmit={(event) => { event.preventDefault(); setShowError(true); if (selected && !error) onSave(selected) }} className="space-y-8">
    <fieldset disabled={locked} className="min-w-0 space-y-3 disabled:opacity-60">
      <legend className="sr-only">Commitment amount</legend>
      <label htmlFor="commitment-amount" className={fieldLabel}>Your amount</label>
      <div className={invalid ? fieldGroupInvalid : fieldGroup}>
        <div className={`relative shrink-0 border-r ${hairline}`}>
          <label className="sr-only" htmlFor="commitment-currency">Currency</label>
          <select id="commitment-currency" value={currency} disabled={locked || invalidDraft} onChange={(event) => {
            const next = event.target.value as Money['currency']; setCurrency(next)
            if (canonical) setValue(decimalForScale(convertMinor(canonical, next, config.inrPerUsd), unitScale(next, unit)))
          }} className={fieldSelect}>{config.currencies.map((item) => <option key={item}>{item}</option>)}</select>
          <SelectChevron />
        </div>
        <input id="commitment-amount" inputMode="decimal" autoComplete="off" placeholder="0" value={value} onChange={(event) => edit(event.target.value)} onBlur={() => { if (value) setShowError(true) }} aria-invalid={invalid} aria-describedby="amount-help amount-rate amount-error" className={`${fieldInput} h-14 w-full text-2xl font-medium tabular-nums`} />
        {currency === 'INR' && <div className={`relative shrink-0 border-l ${hairline}`}>
          <label className="sr-only" htmlFor="commitment-unit">Rupee unit</label>
          <select id="commitment-unit" value={unit} disabled={locked || invalidDraft} onChange={(event) => {
            const next = event.target.value as RupeeUnit; setUnit(next)
            if (canonical) setValue(decimalForScale(convertMinor(canonical, currency, config.inrPerUsd), unitScale(currency, next)))
          }} className={fieldSelect}><option>Lakh</option><option>Crore</option></select>
          <SelectChevron />
        </div>}
      </div>
      {invalid && <p id="amount-error" role="alert" className={fieldError}><AlertIcon />{error}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className={`min-w-0 text-sm leading-6 ${secondaryText}`}>
          <div id="amount-help">
            {full
              ? <p className="text-lg leading-7 font-semibold tabular-nums text-stone-900 dark:text-stone-50">{formatMoney(full, currency)}</p>
              : <p>Enter the amount you would like to commit</p>}
            {canonical && <p className="tabular-nums">About {formatMoney(convertMinor(canonical, otherCurrency, config.inrPerUsd).toString(), otherCurrency)}</p>}
          </div>
          <p id="amount-rate" className="mt-2">{config.rateIsTemporary ? 'Temporary rate' : 'Conversion rate'}: US$1 = ₹{config.inrPerUsd}</p>
        </div>
        {/* On a phone the steps sit directly under the field they change. */}
        <div className="order-first flex shrink-0 gap-2 sm:order-none">
          <button type="button" onClick={() => step(-1n)} aria-label={`Decrease by ${stepText}`} disabled={locked || invalidDraft || !canonical || BigInt(full ?? '0') === 0n} className={compactButton}><span aria-hidden="true" className="mr-1.5">−</span>{stepText}</button>
          <button type="button" onClick={() => step(1n)} aria-label={`Increase by ${stepText}`} disabled={locked || invalidDraft} className={compactButton}><span aria-hidden="true" className="mr-1.5">+</span>{stepText}</button>
        </div>
      </div>
    </fieldset>
    <div className={actions}><button type="submit" disabled={locked} className={primaryButton}>{pending ? 'Saving…' : saveLabel}</button>{onCancel && <button type="button" disabled={locked} onClick={onCancel} className={quietButton}>Cancel</button>}</div>
  </form>
}
