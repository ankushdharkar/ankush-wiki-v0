import type { CommitmentConfig, Currency, Money, RoundConfig, RoundOverview } from './contract'

export type RupeeUnit = 'Lakh' | 'Crore'
// The one default unit: an empty editor starts here, and a prefilled amount is shown in it.
export const DEFAULT_RUPEE_UNIT: RupeeUnit = 'Lakh'
export const unitScale = (currency: Currency, unit: RupeeUnit): bigint =>
  currency === 'USD' ? 100n : unit === 'Lakh' ? 10_000_000n : 1_000_000_000n

export function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator
}
// The one reading of the conversion rate, as INR paise per US$1. A response from an older API has
// only the whole-rupee inrPerUsd, so it falls back to that value times 100.
export function inrMinorPerUsd(config: Pick<RoundConfig, 'inrMinorPerUsd' | 'inrPerUsd'>): string {
  if (config.inrMinorPerUsd) return config.inrMinorPerUsd
  const legacy = parseScaledDecimal(config.inrPerUsd, 100n)
  if (legacy === null || legacy === '0') throw new Error('The conversion rate is missing')
  return legacy
}
// rateMinor is INR paise per US$1. Each conversion rounds half up once; the entered amount is never converted back.
export function convertMinor(money: Money, currency: Currency, rateMinor: string): bigint {
  const amount = BigInt(money.amountMinor)
  if (money.currency === currency) return amount
  const rate = BigInt(rateMinor)
  return currency === 'INR' ? roundHalfUp(amount * rate, 100n) : roundHalfUp(amount * 100n, rate)
}
// Plain decimal for an input: "95", "88.75", "88.50".
export function rateDecimal(rateMinor: string): string {
  const rate = BigInt(rateMinor)
  const fraction = rate % 100n
  return `${rate / 100n}${fraction ? `.${fraction.toString().padStart(2, '0')}` : ''}`
}
// The one display of a rate: whole rates as "95", others with two decimals ("88.75", "88.50").
export function formatRate(rateMinor: string): string {
  const rate = BigInt(rateMinor)
  const fraction = rate % 100n
  return `${new Intl.NumberFormat('en-IN').format(rate / 100n)}${fraction ? `.${fraction.toString().padStart(2, '0')}` : ''}`
}
export function rateLine(config: Pick<RoundConfig, 'inrMinorPerUsd' | 'inrPerUsd' | 'rateIsTemporary'>): string {
  return `${config.rateIsTemporary ? 'Temporary rate' : 'Conversion rate'}: US$1 = ₹${formatRate(inrMinorPerUsd(config))}`
}
export function decimalForScale(amount: bigint, scale: bigint): string {
  const digits = scale.toString().length - 1
  const fraction = (amount % scale).toString().padStart(digits, '0').replace(/0+$/, '')
  return `${amount / scale}${fraction ? `.${fraction}` : ''}`
}
export function parseScaledDecimal(value: string, scale: bigint): string | null {
  if (value.length > 40 || !/^\d+(\.\d+)?$/.test(value)) return null
  const precision = scale.toString().length - 1
  const [whole, fraction = ''] = value.split('.')
  // Trailing zeros do not change precision; fractional paise/cents are rejected.
  const significant = fraction.replace(/0+$/, '')
  if (significant.length > precision) return null
  return (BigInt(whole) * scale + BigInt(significant.padEnd(precision, '0') || '0')).toString()
}
export function parseAmount(value: string, currency: Currency, unit: RupeeUnit): string | null {
  return parseScaledDecimal(value, unitScale(currency, unit))
}
export function amountError(amountMinor: string | null, config: Pick<CommitmentConfig, 'minAmountMinor' | 'maxAmountMinor'>): string | null {
  if (amountMinor === null) return 'Enter an amount using numbers and a decimal point.'
  if (BigInt(amountMinor) < BigInt(config.minAmountMinor)) return `Enter at least ${decimalForScale(BigInt(config.minAmountMinor), 100n)} in the full currency amount.`
  if (BigInt(amountMinor) > BigInt(config.maxAmountMinor)) return `Enter ${decimalForScale(BigInt(config.maxAmountMinor), 100n)} or less in the full currency amount.`
  return null
}
export function formatMoney(amountMinor: string, currency: Currency): string {
  const amount = BigInt(amountMinor)
  const whole = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US').format(amount / 100n)
  const fraction = amount % 100n
  return `${currency === 'INR' ? '₹' : 'US$'}${whole}${fraction ? `.${fraction.toString().padStart(2, '0')}` : ''}`
}
export function percentLabel(basisPoints: bigint): string {
  return `${decimalForScale(basisPoints, 100n)}%`
}
export function ownBasisPoints(money: Money | null, config: RoundConfig): bigint {
  if (!money) return 0n
  // Hundredths of a paise keep a two-decimal rate exact, matching the server's progress rule.
  const rate = BigInt(inrMinorPerUsd(config))
  const scaled = BigInt(money.amountMinor) * (money.currency === 'USD' ? rate : 100n)
  return scaled * 10_000n / (BigInt(config.targetUsdMinor) * rate)
}
// The one split of the progress bar. The fill is the round total, capped at the track; the viewer's
// own share is its last part, as a percent of the fill. Only the total and the viewer's own commitment
// go in, so the bar can never draw any other member. No own commitment means no split (null).
export function progressSplit(progressBasisPoints: bigint, own: Money | null, config: RoundConfig): { fillPercent: number; ownPercentOfFill: number | null } {
  const fillPercent = Number(progressBasisPoints > 10_000n ? 10_000n : progressBasisPoints < 0n ? 0n : progressBasisPoints) / 100
  if (!own) return { fillPercent, ownPercentOfFill: null }
  if (progressBasisPoints <= 0n) return { fillPercent, ownPercentOfFill: 100 }
  const ownShare = ownBasisPoints(own, config)
  const clamped = ownShare > progressBasisPoints ? progressBasisPoints : ownShare
  return { fillPercent, ownPercentOfFill: Number(clamped * 10_000n / progressBasisPoints) / 100 }
}

export function activeCommitmentMoney(overview: Pick<RoundOverview, 'ownCommitment'>): Money | null {
  const own = overview.ownCommitment
  return own?.status === 'active' && own.currency && own.amountMinor
    ? { currency: own.currency, amountMinor: own.amountMinor } : null
}
export function selectedMoney(canonical: Money | null, currency: Currency, rateMinor: string): Money | null {
  return canonical ? { currency, amountMinor: convertMinor(canonical, currency, rateMinor).toString() } : null
}
