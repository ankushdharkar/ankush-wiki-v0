import type { Participant, RoundOverview } from './contract'

export function participantsQueryPolicy(overview: RoundOverview, authId: string) {
  return {
    queryKey: ['private-friends-family', 'participants', authId] as const,
    enabled: overview.capabilities.canViewParticipants === true && authId.length > 0,
    retry: false as const, staleTime: 0, gcTime: 0,
    refetchInterval: 15_000, refetchOnWindowFocus: true,
  }
}
export function searchParticipants(participants: Participant[], value: string): Participant[] {
  const query = value.trim().toLocaleLowerCase()
  if (!query) return participants
  return participants.filter(({ name, email }) => name.toLocaleLowerCase().includes(query) || email.toLocaleLowerCase().includes(query))
}
export function remainingUsdMinor(target: string, committed: string): string {
  const remaining = BigInt(target) - BigInt(committed)
  return (remaining > 0n ? remaining : 0n).toString()
}
