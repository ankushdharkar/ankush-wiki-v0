import { API_URL } from '../../services/api'
import type { ExchangeRateCommand, ExchangeRateResult, ParticipantsResponse, RoundCommand, RoundOverview, RoundTargetCommand, RoundTargetResult } from './contract'

// The only place the admin endpoint paths are written. Views call the functions below.
export const ADMIN_PATHS = {
  participants: '/admin/friends-and-family/participants',
  roundTarget: '/admin/friends-and-family/round-target',
  exchangeRate: '/admin/friends-and-family/exchange-rate',
} as const

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

export function fetchParticipants(signal?: AbortSignal): Promise<ParticipantsResponse> {
  return privateFetch(ADMIN_PATHS.participants, { signal })
}

export function createRoundTargetCommand(expectedVersion: string, targetUsdMinor: string): RoundTargetCommand {
  return { operationId: crypto.randomUUID(), expectedVersion, targetUsdMinor }
}
export function executeRoundTargetCommand(command: RoundTargetCommand): Promise<RoundTargetResult> {
  return privateFetch(ADMIN_PATHS.roundTarget, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(command),
  })
}

export function createExchangeRateCommand(expectedVersion: string, inrMinorPerUsd: string): ExchangeRateCommand {
  return { operationId: crypto.randomUUID(), expectedVersion, inrMinorPerUsd }
}
export function executeExchangeRateCommand(command: ExchangeRateCommand): Promise<ExchangeRateResult> {
  return privateFetch(ADMIN_PATHS.exchangeRate, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(command),
  })
}
