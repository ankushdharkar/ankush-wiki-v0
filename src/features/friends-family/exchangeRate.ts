import type { RoundConfig } from './contract'
import { formatRate, parseScaledDecimal } from './money'

// Server bounds, used until an older API that omits them is replaced: ₹1.00 to ₹1,000.00 per US$1.
const MIN_INR_MINOR_PER_USD = '100'
const MAX_INR_MINOR_PER_USD = '100000'

// Rupees per US$1 as typed: digits with at most two decimals. Returns INR paise per US$1.
export function parseRate(value: string): string | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null
  return parseScaledDecimal(value, 100n)
}
export function rateError(rateMinor: string | null, config: RoundConfig): string | null {
  const min = config.minInrMinorPerUsd ?? MIN_INR_MINOR_PER_USD
  const max = config.maxInrMinorPerUsd ?? MAX_INR_MINOR_PER_USD
  const range = `Enter a rate from ₹${formatRate(min)} to ₹${formatRate(max)}`
  if (rateMinor === null) return `${range}, using numbers and up to two decimals.`
  if (BigInt(rateMinor) < BigInt(min) || BigInt(rateMinor) > BigInt(max)) return `${range}.`
  return null
}
