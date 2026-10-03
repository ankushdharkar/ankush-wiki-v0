# Private round dashboard

The same `/invest` route starts every account in the regular FnF experience, including the admin. Only a server-enabled `capabilities.canViewParticipants` adds the explicit **Admin View** control at the top. Clicking it mounts the dashboard and starts participant fetching. **FnF View** returns to the regular experience. The client contains no admin email constant, URL toggle or persisted view preference. Refresh, re-login and account changes default to FnF. The server separately enforces the participants endpoint authorization.

`AdminDashboard` fetches `/friends-and-family/admin/participants` under `['private-friends-family', 'participants', authId]`, enabled only by that server capability and a nonempty signed-in account ID. It uses no previous-account placeholder, gcTime zero, no-store requests, 15-second refresh and refocus refresh. Returning to FnF unmounts the privileged dashboard, cancels its query and removes its cache. Capability loss, account change and signout also remove the dashboard. A late target-save response cannot repopulate its cache after unmount. Existing private signout clears this cache too.

The member component stays mounted but hidden during Admin View, preserving welcome/amount/summary stage, unsaved amount drafts, frozen versions and in-flight or uncertain commands. The same normal owner-scoped commitment API lets the admin save, increase, decrease and withdraw their own amount in FnF View; that real personal record contributes to totals and appears in the dashboard list. No participant endpoint is fetched while the account remains in FnF View.

A target draft locks **FnF View** with inline instructions to save or cancel first. An uncertain target result requires retrying the same command before leaving. Save confirmation or cancel releases the lock. If target-management permission is revoked, leaving remains possible even while participant viewing is still allowed; permitted switches reset the lock so a later fresh dashboard does not inherit it.

All displayed aggregate progress, committed/remaining/count metrics and participant entries use the same participants response. Search affects only displayed entries; it never recalculates round totals. A background network error preserves that complete last-confirmed snapshot and labels it accordingly. 401/403 feedback precedes data rendering, so a denied response cannot leave participant identities visible. Loading, initial network failure, no commitments, and no search matches have distinct feedback.

Desktop uses a table and mobile uses cards. Each entry shows the original currency amount, rounded USD equivalent for INR commitments at the labelled server rate, and a local timestamp sourced from commitment.createdAt with semantic time and a full timestamp title. Names/emails are labelled as snapshots of the most recent signed-in submission, without suggesting independent name verification. Row keys combine email, createdAt and version because this contract has no stable participant identifier.

The shared progress component supports `showOwn={false}` for the dashboard. The current target editor is described below. There are no controls to edit other members’ commitments or export participant data. The admin manages their own commitment in the shared FnF View. Private analytics guards and noindex remain in the parent shell.

## Task03 verification

- Focused Node suite: 15/15, including capability gating, private account keys, search without list mutation, and exact nonnegative remaining amounts.
- TypeScript, Vite build and targeted ESLint passed. Targeted lint uses the existing documented temporary equivalent flat config because the repository preset remains legacy.
- Admin browser screenshots are not yet captured. The task02 IAB binding expired between agent turns; the current browser inventory is empty. Both IAB and Chrome creation report unavailable. A bounded recovery check used the documented browser troubleshooting guidance. Task04 should finish synthetic `/admin` browser QA when the browser provider is available.

No commit, merge, push or deployment occurred. The API/frontend synthetic preview processes from task02 remain running.

## Task04 browser completion

The subagent browser became available after creating a background IAB tab. Synthetic admin QA now confirms desktop table, 320px mobile cards, light/dark themes, search by email, no-match feedback without changing totals, noindex metadata, and no horizontal overflow. After a reviewed member save, the admin response showed two active participants with original INR/USD amounts and matching committed/remaining/count values. Screenshots are in ignored `qa/admin-*.jpg`. The earlier task03 browser blocker is resolved.

## 2026-10-03 rate and editing-scope follow-up

The current backend planning rate is INR 95 per USD. Earlier screenshots record the then-current rate 90; they remain historical QA evidence. The refreshed local admin API returned rate 95 and valued the seeded INR 1 lakh as US$1,052.63.

The admin dashboard remains read-only. The route selects it in place of the member panel, so the admin currently cannot manage their own commitment through this page, and it has no controls to edit other members' amounts. The underlying authenticated mutation endpoints still apply only to the signed-in owner. No admin editing, authentication-order, or invitation-flow expansion was made while the intended follow-up scope awaits clarification.

## Current target editor (task08)

The approved follow-up supersedes the earlier read-only dashboard scope for the round target only. Admins with server capability canManageRound see a compact current target and Change target control. Editing uses a clearly labelled USD million input (2 means US$2,000,000) and shows the full USD amount and INR equivalent at the server's temporary planning rate. Save target and Cancel are explicit; target updatedAt is displayed locally using semantic time and a full timestamp title.

The decimal scale parser is shared with the member money helpers. One USD million is exactly 100,000,000 cents; fractional cents, scientific notation and invalid formats are rejected. Positive target bounds come from config.minTargetUsdMinor/maxTargetUsdMinor. There is no frontend admin email or float-based money conversion.

PUT /friends-and-family/admin/round-target submits only operationId, expectedVersion and targetUsdMinor. The draft freezes round.version when editing begins; it does not use the member currentVersion and background polling does not overwrite it. Unknown failures lock input/cancel and retry the exact same command object. A 409 loads the latest target and requires explicit review before a new UUID is created. If another poll changes the version after the review fetch, the user must load the latest target again. An in-flight guard prevents double submissions. Access failures hide dashboard data through the existing privacy feedback.

A successful response contains config, round, summary and participants from one server snapshot. Before replacing the participants cache, the frontend cancels older participants and overview requests. It then installs that whole confirmed snapshot and invalidates the overview. An overview refresh failure cannot turn an already confirmed save into an uncertain target command or discard the new dashboard data. Original participant commitments and the admin/member ownCommitment are never edited by this path. Lowering the target below the committed amount shows progress above 100%, caps the bar at 100%, and keeps remaining at zero.

## Task08 verification and remaining QA

The focused suite passes 35 checks, including the existing member welcome/amount/summary/privacy checks plus exact million parsing and target bounds, authenticated target payload, cache cancellation/replacement order, two-million to one-million metrics without own-commitment changes, below-total goals, capability visibility, actual handler retry/re-entry, frozen versions, stale review and access failures. TypeScript, production build and targeted lint also pass. Targeted lint still uses the previously documented temporary flat-config adapter.

The API preview has not been restarted and still lacks the new round metadata endpoint contract. Task09 should refresh the synthetic backend helper and verify the paired member journey and admin target editor in both themes and narrow mobile, including cross-window target updates, uncertainty retries and conflict review. Existing screenshots predate this editor and are not its visual proof. No backend, actual environment files, shared database, commit, merge or deployment was touched for task08.

## Running frontend checks

Run each check from this web worktree in its own shell. Never run these checks unredirected, and never add verbose flags. On failure, read or grep the saved log instead of rerunning the check. Only the final 20 lines, exit code and log path enter the conversation.

The focused suite uses Node’s counted final test summary and exits nonzero on failure. Build writes `dist/` and TypeScript build info; ensure these outputs stay in this worktree. The existing `node_modules` symlink points outside the worktree. Before building, temporarily replace it with a worktree-local `node_modules` directory containing dependency symlinks and real local `.tmp`, `.vite`, `.vite-temp` and `.cache` directories; restore the original symlink afterward. Do not create cache directories through the original shared symlink. The root `tsc --noEmit` command checks a solution config with no source files; the build checks its referenced source projects. Lint is the existing non-fixing command.

### tests

```bash
mkdir -p /tmp/test-results/ankush-wiki
LOG=/tmp/test-results/ankush-wiki/$(date +%Y%m%d-%H%M%S)-web-tests.log
pnpm --config.verify-deps-before-run=false test:friends-family > "$LOG" 2>&1; rc=$?; tail -n 20 "$LOG"; echo "exit=$rc · full log: $LOG"; exit $rc
```

### build

```bash
mkdir -p /tmp/test-results/ankush-wiki
LOG=/tmp/test-results/ankush-wiki/$(date +%Y%m%d-%H%M%S)-web-build.log
VITE_PUBLIC_API_URL=https://example.com VITE_PUBLIC_POSTHOG_KEY='' pnpm --config.verify-deps-before-run=false build > "$LOG" 2>&1; rc=$?; tail -n 20 "$LOG"; echo "exit=$rc · full log: $LOG"; exit $rc
```

### types

```bash
mkdir -p /tmp/test-results/ankush-wiki
LOG=/tmp/test-results/ankush-wiki/$(date +%Y%m%d-%H%M%S)-web-types.log
pnpm --config.verify-deps-before-run=false exec tsc --noEmit > "$LOG" 2>&1; rc=$?; tail -n 20 "$LOG"; echo "exit=$rc · full log: $LOG"; exit $rc
```

### lint

```bash
mkdir -p /tmp/test-results/ankush-wiki
LOG=/tmp/test-results/ankush-wiki/$(date +%Y%m%d-%H%M%S)-web-lint.log
pnpm --config.verify-deps-before-run=false lint > "$LOG" 2>&1; rc=$?; tail -n 20 "$LOG"; echo "exit=$rc · full log: $LOG"; exit $rc
```
