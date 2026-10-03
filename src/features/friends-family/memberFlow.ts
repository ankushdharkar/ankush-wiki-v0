import type { RoundOverview } from './contract'

export type MemberStage = 'welcome' | 'amount' | 'summary'
export type MemberFlowEvent = { type: 'next'; overview: RoundOverview } | { type: 'save-confirmed' }

// The one authority for "this member already has commitment history" (active, withdrawn or any saved version).
export function hasMemberHistory(overview: RoundOverview): boolean {
  return overview.ownCommitment !== null || BigInt(overview.currentVersion) > 0n
}
export type LetterVariant = 'new' | 'returning' | 'withdrawn'
// The one authority for which welcome letter an overview produces. History without an active or withdrawn commitment reads as returning.
export function letterVariant(overview: RoundOverview): LetterVariant {
  if (!hasMemberHistory(overview)) return 'new'
  return overview.ownCommitment?.status === 'withdrawn' ? 'withdrawn' : 'returning'
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
// The one derivation of the name a letter greets: the first word of the signed-in name.
// An empty name, or one that looks like an email address, gives no first name.
export function firstNameFrom(name: string | null | undefined): string | null {
  const trimmed = name?.trim() ?? ''
  if (!trimmed || trimmed.includes('@')) return null
  return trimmed.split(/\s+/)[0]
}
