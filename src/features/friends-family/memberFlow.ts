import type { RoundOverview } from './contract'

export type MemberStage = 'welcome' | 'amount' | 'summary'
export type MemberFlowEvent = { type: 'next'; overview: RoundOverview } | { type: 'save-confirmed' }

// The one authority for "this member already has commitment history" (active, withdrawn or any saved version).
export function hasMemberHistory(overview: RoundOverview): boolean {
  return overview.ownCommitment !== null || BigInt(overview.currentVersion) > 0n
}
// Every page load starts at the welcome letter, for every signed-in member.
export function initialMemberStage(): MemberStage {
  return 'welcome'
}
export function memberFlowReducer(stage: MemberStage, event: MemberFlowEvent): MemberStage {
  if (event.type === 'save-confirmed') return 'summary'
  if (stage !== 'welcome') return stage
  return hasMemberHistory(event.overview) ? 'summary' : 'amount'
}
