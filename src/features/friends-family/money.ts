import type { Currency, Money, RoundConfig, RoundOverview } from './contract'

export type RupeeUnit = 'Lakh' | 'Crore'
export const unitScale = (currency: Currency, unit: RupeeUnit): bigint =>
  currency === 'USD' ? 100n : unit === 'Lakh' ? 10_000_000n : 1_000_000_000n

export function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator
}
export function convertMinor(money: Money, currency: Currency, rate: string): bigint {
  const amount = BigInt(money.amountMinor)
  if (money.currency === currency) return amount
  return currency === 'INR' ? amount * BigInt(rate) : roundHalfUp(amount, BigInt(rate))
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
export function amountError(amountMinor: string | null, config: RoundConfig): string | null {
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
  return convertMinor(money, 'INR', config.inrPerUsd) * 10_000n /
    (BigInt(config.targetUsdMinor) * BigInt(config.inrPerUsd))
}

export function activeCommitmentMoney(overview: RoundOverview): Money | null {
  const own = overview.ownCommitment
  return own?.status === 'active' && own.currency && own.amountMinor
    ? { currency: own.currency, amountMinor: own.amountMinor } : null
}
export function selectedMoney(canonical: Money | null, currency: Currency, rate: string): Money | null {
  return canonical ? { currency, amountMinor: convertMinor(canonical, currency, rate).toString() } : null
}
