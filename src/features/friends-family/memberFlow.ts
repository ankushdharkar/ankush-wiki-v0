import type { RoundOverview } from './contract'

export type MemberStage = 'welcome' | 'amount' | 'summary'
export type MemberFlowEvent = 'next' | 'save-confirmed'

export function initialMemberStage(overview: RoundOverview): MemberStage {
  return overview.ownCommitment !== null || BigInt(overview.currentVersion) > 0n ? 'summary' : 'welcome'
}
export function memberFlowReducer(stage: MemberStage, event: MemberFlowEvent): MemberStage {
  if (event === 'save-confirmed') return 'summary'
  return stage === 'welcome' ? 'amount' : stage
}
