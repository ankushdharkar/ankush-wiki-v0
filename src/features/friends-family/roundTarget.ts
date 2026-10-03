import type { QueryClient } from '@tanstack/react-query'
import type { ParticipantsResponse, RoundConfig } from './contract'
import { formatMoney, parseScaledDecimal } from './money'

export const USD_MILLION_SCALE = 100_000_000n
export function parseTargetMillions(value: string): string | null {
  return parseScaledDecimal(value, USD_MILLION_SCALE)
}
export function targetError(targetUsdMinor: string | null, config: RoundConfig): string | null {
  if (targetUsdMinor === null) return 'Enter the target using numbers and a decimal point.'
  const target = BigInt(targetUsdMinor)
  if (target < BigInt(config.minTargetUsdMinor) || target > BigInt(config.maxTargetUsdMinor)) {
    return `Enter a target from ${formatMoney(config.minTargetUsdMinor, 'USD')} to ${formatMoney(config.maxTargetUsdMinor, 'USD')}.`
  }
  return null
}
export async function applyRoundSnapshot(
  client: Pick<QueryClient, 'cancelQueries' | 'setQueryData' | 'invalidateQueries'>,
  participantsKey: readonly string[], overviewKey: readonly string[], result: ParticipantsResponse,
  isCurrent: () => boolean = () => true,
): Promise<void> {
  // Neither an older participants request nor an older overview may replace this confirmed response.
  await Promise.all([client.cancelQueries({ queryKey: participantsKey }), client.cancelQueries({ queryKey: overviewKey })])
  if (!isCurrent()) return
  client.setQueryData(participantsKey, result)
  // A refresh failure must not turn a confirmed target save into an uncertain mutation.
  void client.invalidateQueries({ queryKey: overviewKey }).catch(() => {})
}
