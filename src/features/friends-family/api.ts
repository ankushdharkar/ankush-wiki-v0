import { API_URL } from '../../services/api'
import type { RoundCommand, RoundOverview, RoundTargetCommand, RoundTargetResult } from './contract'

export class RoundApiError extends Error {
  readonly status: number
  constructor(status: number) {
    super(`Request failed (${status})`)
    this.status = status
  }
}
export async function privateFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options, credentials: 'include', cache: 'no-store', signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new RoundApiError(response.status)
  return response.json() as Promise<T>
}
export function executeCommand(command: RoundCommand): Promise<RoundOverview & { replayed: boolean }> {
  const { kind, ...body } = command
  return privateFetch(`/friends-and-family/${kind === 'save' ? 'commitment' : 'withdraw'}`, {
    method: kind === 'save' ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
}
// Keep the same object after uncertain failures. Only a reviewed new command gets a new UUID.
export function createCommand(expectedVersion: string, money?: { currency: 'INR' | 'USD'; amountMinor: string }): RoundCommand {
  const base = { operationId: crypto.randomUUID(), expectedVersion }
  return money ? { ...base, kind: 'save', ...money } : { ...base, kind: 'withdraw' }
}

export function createRoundTargetCommand(expectedVersion: string, targetUsdMinor: string): RoundTargetCommand {
  return { operationId: crypto.randomUUID(), expectedVersion, targetUsdMinor }
}
export function executeRoundTargetCommand(command: RoundTargetCommand): Promise<RoundTargetResult> {
  return privateFetch('/friends-and-family/admin/round-target', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(command),
  })
}
