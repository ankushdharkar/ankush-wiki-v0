# Private round dashboard

The same `/invest` route starts every account in the regular member experience, including the admin. Only a server-enabled `capabilities.canViewParticipants` adds the explicit **Admin view** control at the top, styled as a quiet text button (the shared `quietButton`: 44px tall, visible focus ring) so it reads as a control without outweighing the page. Clicking it mounts the dashboard and starts participant fetching. **Member view** returns to the regular experience. The client contains no admin email constant, URL toggle or persisted view preference. Refresh, re-login and account changes default to the member view. Like every member, the admin starts at the welcome letter on each load, and Next opens the summary when the admin has commitment history. The server separately enforces the participants endpoint authorization.

`AdminDashboard` fetches `/admin/friends-and-family/participants` (through `fetchParticipants` in `api.ts`, where `ADMIN_PATHS` holds all three admin paths) under `['private-friends-family', 'participants', authId]`, enabled only by that server capability and a nonempty signed-in account ID. It uses no previous-account placeholder, gcTime zero, no-store requests, 15-second refresh and refocus refresh. Returning to the member view unmounts the privileged dashboard, cancels its query and removes its cache. Capability loss, account change and signout also remove the dashboard. A late target-save response cannot repopulate its cache after unmount. Existing private signout clears this cache too.

The member component stays mounted but hidden while the admin view is open, preserving welcome/amount/summary stage, unsaved amount drafts, frozen versions and in-flight or uncertain commands. The same normal owner-scoped commitment API lets the admin save, increase, decrease and withdraw their own amount in the member view; that real personal record contributes to totals and appears in the dashboard list. No participant endpoint is fetched while the account remains in the member view.

A target draft locks **Member view** with inline instructions to save or cancel first. An uncertain target result requires retrying the same command before leaving. Save confirmation or cancel releases the lock. If target-management permission is revoked, leaving remains possible even while participant viewing is still allowed; permitted switches reset the lock so a later fresh dashboard does not inherit it.

All displayed aggregate progress (the “Together so far” total and bar), the Remaining and People committed figures, and participant entries use the same participants response. Search affects only displayed entries; it never recalculates round totals. A background network error preserves that complete last-confirmed snapshot and labels it accordingly. 401/403 feedback precedes data rendering, so a denied response cannot leave participant identities visible. Loading, initial network failure, no commitments, and no search matches have distinct feedback.

The dashboard is titled “Round overview”, with its last update time beside the title. One overview sheet holds the status first and the settings after it: the progress, then Remaining and People committed in one band, then Round target and Conversion rate in a second band below a hairline (target first). Each band is a two column grid from the sm breakpoint up and a single column below it. Each setting is one non-wrapping line of label and figure with its compact **Change target** or **Change rate** button on the right, and its “updated” line beneath that row. While an editor is open its section spans both columns, so the form has the full width on a phone and on desktop. There is no separate Committed tile: the committed total is the headline figure of the progress. A separate Commitments section follows, with the shown count, search and rate note appearing only once entries exist. From the md breakpoint up the list is a three column table (Member, Commitment, Updated); below it each entry is a stacked list item. Each entry shows the original currency amount, rounded USD equivalent for INR commitments at the labelled server rate, and a local timestamp sourced from commitment.createdAt with semantic time and a full timestamp title. Names/emails are labelled as snapshots of the most recent signed-in submission, without suggesting independent name verification. Row keys combine email, createdAt and version because this contract has no stable participant identifier.

The round card (`RoundProgress` with Remaining and People committed) appears only here. No member screen shows it, including the admin's own member view, and the API sends the round figures to the admin alone. The card reads them from the participants response; from the overview it takes only the admin's own commitment, for the own-share segment. When the admin has an active commitment of their own, the bar's fill has two parts: everyone else combined (teal-600), then the admin's own share as the last part (teal-950 light, teal-100 dark), with the "Your commitment" (phone: "Yours") line, a matching swatch, the amount and its percent of the target beneath it. Without an active commitment, or after a withdrawal, the bar is a single segment, in the same teal-600 in both themes, and there is no such line. The main fill is therefore one colour whether or not the admin has a commitment of their own. The split comes from `progressSplit` in `money.ts`, which reads only the round progress and the viewer's own commitment (from the overview, through `ownBasisPoints`); the participants list never draws the bar, and the bar never shows one segment per person or any other member's amount. The current target editor is described below. There are no controls to edit other members’ commitments or export participant data. The admin manages their own commitment in the shared member view. Private analytics guards and noindex remain in the parent shell.

## Task03 verification

- Focused Node suite: 15/15, including capability gating, private account keys, search without list mutation, and exact nonnegative remaining amounts.
- TypeScript, Vite build and targeted ESLint passed. Targeted lint uses the existing documented temporary equivalent flat config because the repository preset remains legacy.
- Admin browser screenshots are not yet captured. The task02 IAB binding expired between agent turns; the current browser inventory is empty. Both IAB and Chrome creation report unavailable. A bounded recovery check used the documented browser troubleshooting guidance. Task04 should finish synthetic `/admin` browser QA when the browser provider is available.

No commit, merge, push or deployment occurred. The API/frontend synthetic preview processes from task02 remain running.

## Task04 browser completion

The subagent browser became available after creating a background IAB tab. Synthetic admin QA now confirms desktop table, 320px mobile cards, light/dark themes, search by email, no-match feedback without changing totals, noindex metadata, and no horizontal overflow. After a reviewed member save, the admin response showed two active participants with original INR/USD amounts and matching committed/remaining/count values. Screenshots are in ignored `qa/admin-*.jpg`. The earlier task03 browser blocker is resolved.

## 2026-10-03 rate and editing-scope follow-up

The current backend planning rate is INR 95 per USD. Earlier screenshots record the then-current rate 90; they remain historical QA evidence. The refreshed local admin API returned rate 95 and valued the seeded INR 1 lakh as US$1,052.63.

The admin dashboard remains read-only. The route selects it in place of the member panel, so the admin currently cannot manage their own commitment through this page, and it has no controls to edit other members' amounts. The underlying authenticated mutation endpoints still apply only to the signed-in owner. No admin editing, authentication-order, or invitation-flow expansion was made while the intended follow-up scope awaits clarification. (Superseded: the opening sections above describe the current behavior, where the admin manages their own commitment in the member view.)

## Current target editor (task08)

The approved follow-up supersedes the earlier read-only dashboard scope for the round target only. Admins with server capability canManageRound see the current target, labelled “Round target”, inside the overview sheet with a Change target control. Editing uses a clearly labelled USD million input (2 means US$2,000,000) and shows the full USD amount and INR equivalent at the server's temporary planning rate. Save target and Cancel are explicit; target updatedAt is displayed locally using semantic time and a full timestamp title.

The decimal scale parser is shared with the member money helpers. One USD million is exactly 100,000,000 cents; fractional cents, scientific notation and invalid formats are rejected. Positive target bounds come from config.minTargetUsdMinor/maxTargetUsdMinor. There is no frontend admin email or float-based money conversion.

PUT /admin/friends-and-family/round-target submits only operationId, expectedVersion and targetUsdMinor. The draft freezes round.version when editing begins; it does not use the member currentVersion and background polling does not overwrite it. Unknown failures lock input/cancel and retry the exact same command object. A 409 loads the latest target and requires explicit review before a new UUID is created. If another poll changes the version after the review fetch, the user must load the latest target again. An in-flight guard prevents double submissions. Access failures hide dashboard data through the existing privacy feedback.

A successful response contains config, round, summary and participants from one server snapshot. Before replacing the participants cache, the frontend cancels older participants and overview requests. It then installs that whole confirmed snapshot and invalidates the overview. An overview refresh failure cannot turn an already confirmed save into an uncertain target command or discard the new dashboard data. Original participant commitments and the admin/member ownCommitment are never edited by this path. Lowering the target below the committed amount shows progress above 100%, caps the bar at 100%, and keeps remaining at zero.

## Task08 verification and remaining QA

The focused suite passes 35 checks, including the existing member welcome/amount/summary/privacy checks plus exact million parsing and target bounds, authenticated target payload, cache cancellation/replacement order, two-million to one-million metrics without own-commitment changes, below-total goals, capability visibility, actual handler retry/re-entry, frozen versions, stale review and access failures. TypeScript, production build and targeted lint also pass. Targeted lint still uses the previously documented temporary flat-config adapter.

The API preview has not been restarted and still lacks the new round metadata endpoint contract. Task09 should refresh the synthetic backend helper and verify the paired member journey and admin target editor in both themes and narrow mobile, including cross-window target updates, uncertainty retries and conflict review. Existing screenshots predate this editor and are not its visual proof. No backend, actual environment files, shared database, commit, merge or deployment was touched for task08.

## Conversion rate editor (2026-10-03)

The USD to INR rate is admin-editable and append-only on the server. In the overview sheet a row labelled “Conversion rate” sits below “Round target” and is styled as its pair. At rest it reads `US$1 = ₹95`, then “Temporary rate. Rate updated …” while the rate is still the migration seed (only “Rate updated …” once an admin has set one). Only an account whose overview grants `capabilities.canManageRound` sees **Change rate**; members and view-only admins see the row without the control, and member pages have no rate editor at all.

Editing shows a label “Rupees for one US dollar” tied to the input, then `US$1 = ₹ [input]` prefilled with the current rate, a help line, **Save rate** and **Cancel**. The input accepts digits with up to two decimals, from ₹1 to ₹1,000 (the server's `minInrMinorPerUsd`/`maxInrMinorPerUsd`). Anything else shows “Enter a rate from ₹1 to ₹1,000, using numbers and up to two decimals.” (or “Enter a rate from ₹1 to ₹1,000.” for an out-of-range number) as an alert and sends nothing.

`ExchangeRateEditor.tsx` mirrors `RoundTargetEditor.tsx`. The draft freezes `exchangeRate.version` when editing starts. Saving sends `PUT /admin/friends-and-family/exchange-rate` with `{operationId, expectedVersion, inrMinorPerUsd}`, where `inrMinorPerUsd` is INR paise per US$1 (88.75 is `"8875"`). An uncertain result locks the draft and offers **Retry same rate change**, which resends the identical command. A 409 shows “The conversion rate changed in another window. Review the latest rate before continuing.” with the latest rate, **Load latest rate** and then **I reviewed this, keep my draft**, after which a new command gets a new UUID. Other 4xx answers show “The rate could not be saved. Check the rate and try again.” Success shows “The conversion rate is saved.” (or “The conversion rate is up to date.” for a replay). The confirmed admin snapshot replaces the participants cache and the member overview is refreshed, so admin and member figures follow the new rate without a reload. Either editor holding a draft or an uncertain command keeps **Member view** locked.

All money maths reads the rate through one function, `inrMinorPerUsd(config)` in `money.ts`. It prefers `config.inrMinorPerUsd` and falls back to the legacy `config.inrPerUsd` times 100 when an older API omits the new field. Conversions round half up once and never convert an entered amount back, so a commitment read in its own currency does not drift. `formatRate` renders every displayed rate (whole rates as `95`, others as `88.75` or `88.50`), and `rateLine` renders the “Temporary rate: US$1 = …” and “Conversion rate: US$1 = …” lines in the amount editor, target editor and commitments list.

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
