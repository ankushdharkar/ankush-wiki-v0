export type Currency = 'INR' | 'USD'
// The admin's full config, from the participants and admin mutation responses.
export interface RoundConfig {
  targetUsdMinor: string
  minTargetUsdMinor: string
  maxTargetUsdMinor: string
  // INR paise per US$1 (9500 is ₹95.00). Older APIs omit it; read it only through inrMinorPerUsd() in money.ts.
  inrMinorPerUsd?: string
  minInrMinorPerUsd?: string
  maxInrMinorPerUsd?: string
  // Legacy whole-rupee rate kept for deploy order compatibility ("95", or "88.75" for a two-decimal rate).
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
export interface ExchangeRateView { version: string; updatedAt: string }
// What the amount editor needs: the rate and the amount bounds, never the round target.
export type CommitmentConfig = Omit<RoundConfig, 'targetUsdMinor'>
// The overview from GET /friends-and-family and the member commitment and withdraw responses. The API
// withholds the round figures from members (null); the admin, and APIs older than that change, still send
// them. Screens never read them from here: the admin overview reads them from ParticipantsResponse.
export interface RoundOverview {
  round: RoundView | null
  exchangeRate?: ExchangeRateView
  config: CommitmentConfig & { targetUsdMinor: string | null }
  summary: RoundSummary | null
  ownCommitment: Commitment | null
  currentVersion: string
  capabilities: { canViewParticipants: boolean; canManageRound: boolean }
}
// What the round card draws: the admin's round figures plus the viewer's own commitment.
export interface RoundCardView {
  config: RoundConfig
  summary: RoundSummary
  ownCommitment: Commitment | null
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
  exchangeRate?: ExchangeRateView
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

export interface ExchangeRateCommand {
  operationId: string
  expectedVersion: string
  inrMinorPerUsd: string
}
export type ExchangeRateResult = RoundTargetResult
