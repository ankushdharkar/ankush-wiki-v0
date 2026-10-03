import { useState } from 'react'
import type { ComponentProps } from 'react'
import { MemberRound } from './MemberRound'
import { AdminDashboard } from './AdminDashboard'
import { secondaryButton, secondaryText } from './ui'

export function RoundViews({ authId, login, ...memberProps }: ComponentProps<typeof MemberRound> & {
  authId: string; login: () => void
}) {
  const [view, setView] = useState<'fnf' | 'admin'>('fnf')
  const [exitLocked, setExitLocked] = useState(false)
  const canViewAdmin = memberProps.overview.capabilities.canViewParticipants === true
  const adminVisible = view === 'admin' && canViewAdmin
  const exitBlocked = adminVisible && exitLocked && memberProps.overview.capabilities.canManageRound === true
  // The parent keys this component by account. Capability removal also resets the view.
  if (view === 'admin' && !canViewAdmin) { setView('fnf'); setExitLocked(false) }
  return <div className="space-y-4 sm:space-y-6">
    {canViewAdmin && <nav aria-label="Round views" className={`mx-auto flex w-full flex-wrap items-center justify-end gap-x-3 gap-y-2 ${adminVisible ? 'max-w-4xl' : 'max-w-xl'}`}>
      <button type="button" disabled={exitBlocked} aria-describedby={exitBlocked ? 'round-view-lock' : undefined} onClick={() => {
        if (exitBlocked) return
        setExitLocked(false)
        setView(adminVisible ? 'fnf' : 'admin')
      }} className={secondaryButton}>{adminVisible ? 'Member view' : 'Admin view'}</button>
      {exitBlocked && <p id="round-view-lock" role="status" className={`w-full text-sm leading-6 sm:text-right ${secondaryText}`}>Save or cancel the target edit to return. If its result is uncertain, retry the same change first.</p>}
    </nav>}
    {/* Preserve the same member subtree, including draft, stage and uncertain command. */}
    <div hidden={adminVisible}><MemberRound {...memberProps} /></div>
    {adminVisible && <AdminDashboard overview={memberProps.overview} authId={authId} login={login} onExitLockChange={setExitLocked} />}
  </div>
}
