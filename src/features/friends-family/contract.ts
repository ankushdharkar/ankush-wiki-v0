export type Currency = 'INR' | 'USD'
export interface RoundConfig {
  targetUsdMinor: string
  minTargetUsdMinor: string
  maxTargetUsdMinor: string
  inrPerUsd: string
  rateIsTemporary: boolean
  minAmountMinor: string
  maxAmountMinor: string
  currencies: Currency[]
  minorUnitsPerMajor: string
  conversionPolicy: string
}
export interface Commitment {
  status: 'active' | 'withdrawn'
  currency: Currency | null
  amountMinor: string | null
  version: string
  createdAt: string
}
export interface RoundSummary {
  participantCount: string
  totalInrMinor: string
  totalUsdMinor: string
  exactUsdMinor: { numerator: string; denominator: string }
  progressBasisPoints: string
}
export interface RoundView { version: string; updatedAt: string }
export interface RoundOverview {
  round: RoundView
  config: RoundConfig
  summary: RoundSummary
  ownCommitment: Commitment | null
  currentVersion: string
  capabilities: { canViewParticipants: boolean; canManageRound: boolean }
}
export interface Money { currency: Currency; amountMinor: string }
export type RoundCommand = { operationId: string; expectedVersion: string } & (
  { kind: 'save'; currency: Currency; amountMinor: string } | { kind: 'withdraw' }
)
export interface Participant {
  name: string
  email: string
  commitment: Commitment
}
export interface ParticipantsResponse {
  round: RoundView
  config: RoundConfig
  summary: RoundSummary
  participants: Participant[]
}

export interface RoundTargetCommand {
  operationId: string
  expectedVersion: string
  targetUsdMinor: string
}
export interface RoundTargetResult extends ParticipantsResponse { replayed: boolean }
