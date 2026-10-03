# Friends and family final QA and release gates

Reviewed on 2026-10-02 UTC (2026-10-03 Asia/Kolkata). The feature is implemented and verified locally. Both worktrees remain uncommitted. No merge, deployment, shared-database migration, production OAuth login, or authenticated production verification was performed.

## Scope and decisions

- Hidden authenticated `/invest`, absent from public navigation. Anyone signed in with the link can participate; there is no invitation list.
- The round starts with a US$2,000,000 target; the verified admin can change it through append-only target events. New members see the thank-you welcome, then an empty INR/Crore amount step. Only a confirmed explicit save reveals round totals. Returning members with active or withdrawn history go directly to the summary. Lakh/Crore controls and USD input remain available, with no lakh minimum. Exact integer paise/cents are used throughout.
- The server owns the temporary INR 95 per USD rate. Future rate management is deferred. Aggregate USD cents round once after exact summation.
- Members receive only aggregates and their own commitment. The server separately grants the participant dashboard to `ankushdharkar@gmail.com` only when the issuer-verified session email claim is true.
- Commitments are reversible intent, with append-only UTC events, UUID replay protection, optimistic versions, exact Origin checks, and private no-store responses.

The checks and screenshots below record task04 at the then-current INR 90 rate. The dated follow-up at the end records the later INR 95 update. Historical screenshots are unchanged.

## Independent review finding and fix

The mounted member panel previously opened an empty editor after a remote withdrawal with no saved draft version. A later background refresh could supply the newest version to Save and overwrite a newer remote commitment without review. `CommitmentPanel.tsx` now captures the empty draft version once before input, including this transition.

The real two-window regression passed:

1. Window A saved US$42; window B withdrew it.
2. Polling in A opened an empty editor; A entered US$43.
3. B saved US$44. Polling in A displayed confirmed US$44 while preserving its US$43 draft.
4. A's Save returned a conflict, showed the latest US$44, and disabled editing/saving until explicit review.
5. Explicit review followed by Save recorded US$43 and updated the confirmed total. The admin list then showed the original USD commitment alongside the seeded INR 1 lakh commitment, with two participants and a consistent summary.

This checks the actual React component and query lifecycle in the supported browser, rather than a mock of the new render guard. Evidence: ignored `qa/member-remote-withdrawal-conflict.jpg` and `qa/admin-mixed-currencies.jpg`.

The existing admin row key combines email, event time, and version. It is adequate for the current read-only presentation and synthetic/provider identity model; no extra participant identifier or contract expansion was introduced.

## Focused verification

All commands used existing dependencies and `pnpm --config.verify-deps-before-run=false`. Full runner output is outside the repository in `/tmp/test-results/ankush-wiki/`.

| Check | Result | Exit | Log |
|---|---|---|---|
| Backend build | Passed | 0 | `20261002T214913Z-task04-api-build.log` |
| PostgreSQL/Nest integration | 51 checks passed | 0 | `20261002T214942Z-task04-api-tests.log` |
| Backend TypeScript | Passed | 0 | `20261002T214956Z-task04-api-types.log` |
| Frontend focused suite | 15 tests passed | 0 | `20261002T214914Z-task04-web-tests.log` |
| Frontend TypeScript/Vite build | Passed | 0 | `20261002T214935Z-task04-web-build.log` |
| Targeted frontend ESLint | Passed | 0 | `20261002T214954Z-task04-web-lint.log` |
| Both worktrees `git diff --check` | Passed | 0 | No output |

Integration checks recreate only `friends_family_test` on parent-owned loopback PostgreSQL port 55439. They cover migrations and direct SQL reapplication, immutability, exact mixed money, numeric versions above nine, concurrent writes/replays, withdrawal/resave, anonymous/member/admin authorization, identity forgery rejection, Origin denial and no-store headers. No actual project database is used.

Frontend tests cover exact money/units/bounds, currency no-drift and selected-currency save, command retries, typed errors, route privacy matching, direct/SPA/back analytics suppression, admin query capability/account keys, search and remaining totals. Targeted ESLint uses `/tmp/test-results/ankush-wiki/member-eslint.config.mjs` because the existing repository React Hooks preset is incompatible with its flat config. No lint configuration or dependency was added for that workaround.

Earlier React Doctor review reported preexisting whole-site issues (score 42, six errors and 80 warnings). Three new component complexity warnings were accepted for the auth/editor/mutation state flow. No unrelated cleanup was performed. Vite still reports the existing large shared vendor chunk warning.

## Browser evidence

Task04 visually checked the admin desktop table, narrow 320px cards, both themes, email search and no-match feedback with unchanged totals, noindex metadata, and matching participant/aggregate data after member changes. The 320px document scroll width was exactly 320px. Screenshots are ignored local artifacts under `qa/`: `admin-light.jpg`, `admin-dark.jpg`, `admin-mobile-dark.jpg`, and `admin-mixed-currencies.jpg`.

Earlier member browser QA covered selected-USD save, withdrawal/resave, two-window stale edits, units/currency, anonymous sign-in, trailing slash, both themes and mobile overflow. Task04 independently confirmed the additional remote-withdrawal draft regression and member/admin identity separation when switching synthetic sessions.

Direct private loads do not initialize PostHog. SDK-mocked tests cover SPA/back transitions, stop-recording ordering, delayed event suppression, before-send filtering and financial network masking. Browser QA used an explicitly blank analytics key. Actual configured PostHog transport/replay behavior has not been exercised and remains a release privacy check.

## Local preview and setup

The preview uses synthetic identities and a disposable database only. The parent-owned helper/API exec session is 33325 (processes 67180/67181, ports 8080/8081); Vite exec session is 35316 (processes 67288/67294, port 5173). Disposable PostgreSQL runs on 127.0.0.1:55439 (pid 84570, `/tmp/ankush-wiki-friends-family-pg/data`). Processes are left running for review.

Open `http://localhost:8081/member` or `http://localhost:8081/admin` to establish a synthetic HttpOnly session and redirect to the preview. The helper is excluded from the production build, rejects real env files in its worktree, and uses `friends_family_browser`. It seeds another synthetic member at INR 1 lakh. The browser database retains synthetic history across restarts.

For a fresh local setup, follow the disposable cluster commands in the API worktree's `docs/friends-family.md`, build the API, run `pnpm --config.verify-deps-before-run=false dev:friends-family`, and start the web worktree with `VITE_PUBLIC_API_URL=http://localhost:8080 VITE_PUBLIC_POSTHOG_KEY='' pnpm --config.verify-deps-before-run=false dev --host 127.0.0.1`. Do not copy or link credential/env files into these worktrees.

Stop only these parent-owned preview sessions with Ctrl-C when no longer needed. Stop the disposable cluster with `/opt/homebrew/opt/postgresql@16/bin/pg_ctl -D /tmp/ankush-wiki-friends-family-pg/data -m fast stop`.

## Remaining delivery gates

1. Review and approve committing the two worktrees, then integrate the paired API/web changes.
2. Apply migrations `0003_friends_family_commitments.sql` and `0004_friends_family_round_targets.sql` through the checked Drizzle journal using the existing approved `pnpm db:migrate` deployment path. This project currently shares its development and production database, so migration application is an explicit release action. The disposable database has passed migration reapplication; the actual database has not been migrated.
3. Deploy both API and web builds with the existing authorized configuration. No deployment happened during this effort.
4. Verify a real OIDC session emits `email_verified: true` for the admin. Existing old sessions must re-login for admin privileges. Verify anonymous access, member-only data, admin-only identities, money updates, withdrawals and conflict/retry flows on the deployed feature.
5. Check configured PostHog transport/replay suppression on direct private loads and public/private SPA/back navigation using synthetic financial data before collecting real commitments. SDK behavior is unit-tested; actual configured transport is not yet live-verified.

No admin visual QA remains blocked. Production login, actual migration, deployment, production behavior, and configured telemetry verification remain undelivered.

## 2026-10-03 task05 follow-up: INR 95 planning constant

At Ankush’s request, the sole backend `INR_PER_USD` constant changed from 90n to 95n. This is a temporary planning assumption, not a verified live exchange-rate quote. The admin constant remains exactly `ankushdharkar@gmail.com`. Existing ledger rows and original amounts remain intact; current equivalents are derived at 95. No migration is needed for this constant change.

Backend fixtures now assert the odd-denominator rounding boundary (47/48 paise), exact mixed totals, versions above nine and withdrawal totals at 95. Frontend fixtures now use 95 for currency toggles, selected-currency amounts, converted bounds and remaining totals. No conversion constant was added to the frontend.

| Follow-up check | Result | Exit | Log in `/tmp/test-results/ankush-wiki/` |
|---|---|---|---|
| API build | Passed | 0 | `20261002T215953Z-task05-api-build.log` |
| PostgreSQL/Nest integration | 51 checks passed | 0 | `20261002T220007Z-task05-api-tests.log` |
| Frontend focused suite | 15 tests passed | 0 | `20261002T215953Z-task05-web-tests.log` |
| Frontend TypeScript/Vite build | Passed | 0 | `20261002T220002Z-task05-web-build.log` |
| Synthetic live loopback API | Member/admin rate 95 and exact seed conversion passed | 0 | `20261002T220135Z-task05-live-local-rate.log` |

These checks ran after the rate/fixture changes. They use only the disposable PostgreSQL cluster and synthetic local sessions. The live API returned `inrPerUsd: "95"`, `rateIsTemporary: true`, the exact denominator 95, INR 1 lakh aggregate, rounded US$1,052.63, and private no-store headers for both member and admin reads.

The previous API helper was stopped by targeting its confirmed worktree-owned process only. The current API/login helper exec session is 62872, listener process 92556 on ports 8080/8081. Its log is `20261002T220037Z-task05-api-preview.log`. Vite remains exec session 35316 (processes 67288/67294), and PostgreSQL remains process 84570. This supersedes the task04 API process details above. No unrelated process was stopped.

The existing member **Change commitment** button captures the current original amount and version, opens the editor, and saves a new owner-scoped event. Earlier browser evidence and unchanged handler review establish this path. No new browser result is claimed for task05: the subagent IAB became unavailable again, and the parent accepted existing evidence plus loopback service verification for this constant-only change.

The admin dashboard is currently read-only and replaces the member commitment panel. It has neither an own-commitment editor for the admin nor controls to change another participant's amount. Admin editing and whether amount entry should precede sign-in await user clarification; both flows were left unchanged.

All changes remain uncommitted, with no merge, actual database migration or deployment. Earlier task04 screenshots retain the historical rate 90 and must not be presented as current-rate screenshots.

## Task09 final independent review and paired QA

Completed on 2026-10-02 UTC (2026-10-03 Asia/Kolkata). This section supersedes the earlier journey, target-editing and preview-process state. All implementation remains uncommitted in the two parent-owned worktrees. No actual database, deployment or production login was touched.

Independent review found that member conflict confirmation adopted `overview.currentVersion` at click time, even if a background poll had advanced beyond the version loaded for review. The member panel now records the exact reviewed version and offers confirmation only while it still matches the current snapshot. A newer poll requires another load; the original draft remains intact. The focused regression exercises the real panel handlers and checks that the new command uses the reviewed version and preserves the original amount.

The synthetic preview was restarted, which applied migration 0004 only to `friends_family_browser` on fixed loopback port 55439. The helper now provides `/new-member` with a fresh fictional subject on each visit and `/returning-new-member` for the latest fresh subject during the current helper process. Neither route is part of production or real authentication.

Browser checks using supported CUA passed:

- A fresh member sees the welcome and Next, then the empty INR/Crore input and explicit Save commitment and view round button. No target, total, progress, remaining, participant count or own share appears before save. INR unit switches and +/- controls preserve the amount.
- Saving synthetic US$500,000 reveals US$501,052.63 total, 25.05% overall progress and 25% own share at the US$2 million goal. Reloading an active member skips the welcome. Changing the own amount to US$500,001 updates the aggregate by exactly one dollar. Withdrawal removes the active amount and opens the editor; withdrawn history still skips the welcome.
- Admin Save target from 2 to 1 USD million immediately shows US$1 million, 50.1% overall progress and US$498,947.37 remaining. The paired member shows the unchanged US$500,000 original amount and 50% own share.
- A synthetic admin event reducing the goal to US$400,000 is picked up by member polling without navigation: 125.26% overall progress, 125% own share, a capped bar and US$0 remaining. Local DB checks confirmed identical participant snapshots and commitment-event counts across both target changes.
- The target editor freezes its draft while the target changes elsewhere. Saving its stale 0.4 million draft returns 409, loads the restored US$2 million goal, retains the draft and disables saving until explicit review. The stale draft was canceled.
- Welcome, amount, summary and admin editor work at 320px in light/dark themes. Measured document scroll width was exactly 320px. Desktop member/admin views also passed visual review.

The goal was restored to US$2 million through a new target event (round version 4), and every large QA commitment was withdrawn through new events. Final active totals are the seeded INR 1 lakh, US$1,052.63 equivalent, one participant and US$1,998,947.37 remaining. No history was deleted or overwritten. Unknown-result retry and re-entry paths are verified by actual component-handler tests; no browser network-fault simulation is claimed.

| Final check | Result | Exit | Log in `/tmp/test-results/ankush-wiki/` |
|---|---|---|---|
| Backend PostgreSQL/Nest integration | 111 checks passed | 0 | `20261003-040827-task09-api-tests.log` |
| Frontend focused suite, including review regression | 36 tests passed | 0 | `20261003-040327-task09-web-tests.log` |
| Frontend TypeScript/Vite build | Passed with explicit dummy public API URL and blank analytics key | 0 | `20261003-040649-task09-web-build.log` |
| Targeted frontend ESLint | Passed using existing temporary flat-config adapter | 0 | `20261003-040613-task09-web-lint.log` |
| Local overfunded target and commitment preservation | Passed | 0 | `20261003-040639-task09-local-overfunded.log` |
| Local goal restoration and commitment preservation | Passed | 0 | `20261003-040732-task09-local-restore-target.log` |
| Both worktrees whitespace checks and helper syntax | Passed | 0 | No output |

The first build attempt (`20261003-040613-task09-web-build.log`) failed because the isolated worktree had no configured public API URL. The final passing build supplied an explicit dummy URL; no environment file was read, copied or linked. The existing shared vendor chunk warning remains.

Current screenshot evidence is in ignored `qa/`: `task09-welcome-light.jpg`, `task09-welcome-mobile-light.jpg`, `task09-welcome-mobile-dark.jpg`, `task09-amount-light.jpg`, `task09-amount-mobile-dark.jpg`, `task09-summary-light.jpg`, `task09-summary-mobile-dark.jpg`, `task09-admin-edit-dark.jpg`, `task09-admin-edit-mobile-light.jpg`, `task09-admin-edit-mobile-dark.jpg`, `task09-admin-one-million-dark.jpg`, `task09-member-one-million-dark.jpg`, `task09-member-overfunded-dark.jpg` and `task09-admin-conflict-mobile-light.jpg`. These show INR 95 and the latest journey/editor, replacing older screenshots as current visual proof.

Current local API/login helper: exec session 84527, listener PID 22908, ports 8080/8081, log `20261003-040434-task09-api-preview.log`. Vite remains exec session 35316, listener PID 67294, port 5173. PostgreSQL remains PID 84570, loopback port 55439 and `/tmp/ankush-wiki-friends-family-pg/data`. The earlier preview-process details are historical. `/new-member` is the review link for the welcome; `/admin` opens the current synthetic dashboard. These processes are left running for review.

Remaining release gates are review/commit/integration, approved actual migration 0003 plus 0004, paired deployment, real OIDC admin `email_verified` verification and production behavior checks, and configured PostHog transport/replay suppression. Browser QA used a blank analytics key; SDK-mocked privacy checks do not prove configured transport behavior. No local visual blocker remains.

## Task10: admin starts in the regular FnF experience

Completed on 2026-10-02 UTC (2026-10-03 Asia/Kolkata). This supersedes the earlier automatic admin-dashboard selection. Every account now starts in the shared member journey. An admin with no commitment history receives the same welcome, Next, empty amount step, explicit save and summary as an ordinary member. Returning active or withdrawn history follows the same existing rule. The admin's personal commitment uses the unchanged normal owner-scoped save/withdraw endpoints, validation, frozen versions, conflict review and same-UUID retry behavior.

`RoundViews` adds **Admin View** at the top only with the server's participant-view capability. The dashboard mounts and fetches participants only after that explicit click. **FnF View** returns to the same still-mounted member subtree, so stage, unsaved input and uncertain/in-flight commands survive switching. Dashboard unmount cancels and removes its account-specific participants query; a late target result cannot repopulate that cache. A late owner-command response after an actual account unmount also cannot restore an old own cache or expire the new account through the old callback. Account-keyed mounts, capability loss, refresh and re-login reset the view to FnF. There is no client email constant or URL/storage override.

An open target edit disables FnF View and explains how to save/cancel, or retry an uncertain result. Confirmed save or cancellation releases the lock. Losing target-management capability allows exit even if participant viewing remains enabled, and permitted switches reset the lock before another dashboard mount. Ordinary members cannot see either view-switch action; existing server authorization still protects participant and target endpoints. No backend change was needed.

Fresh Sol browser QA passed with the retained disposable preview:

- Synthetic admin initially saw the thank-you welcome rather than the dashboard. Next entered the normal amount form. An unsaved INR 1 lakh draft survived Admin View and FnF View switching.
- Saving INR 1 lakh created the admin's real synthetic personal record, increasing total committed to US$2,105.26 with two participants. Increasing to INR 2 lakh changed the total to US$3,157.89; decreasing back to INR 1 lakh restored US$2,105.26. The dashboard showed the admin's own active record alongside the seeded other participant.
- Target editing disabled FnF View, and Cancel released it. No target mutation was submitted during task10. Reloading while in the dashboard defaulted back to regular FnF management.
- The normal member fixture had no Admin View or FnF View controls. Both themes passed at 320px with document/body widths exactly 320px. Member summary metrics now stack below the small-screen breakpoint so the remaining currency amount stays on one line; larger widths retain two columns.
- The admin's synthetic commitment was withdrawn through the normal UI, preserving ledger history. Final dashboard data is one original seeded participant, INR 1 lakh, US$1,052.63 committed and US$1,998,947.37 remaining. The goal remains US$2 million and the temporary planning rate remains INR 95 per USD. The local admin fixture now has withdrawn history and therefore correctly returns to management on later visits.

The original implementer's CUA binding was unavailable during the follow-up; a fresh Sol reviewer successfully completed the supported browser pass. Browser network-request counts were not verified. Actual page/component tests prove there is no dashboard mount or participant query on the initial admin FnF render. Unknown-result retries, late responses, account/capability resets and permission-regain lock reset are verified by actual component-handler and cache-lifecycle tests; no browser network-fault simulation is claimed.

| Final task10 check | Result | Exit | Log in `/tmp/test-results/ankush-wiki/` |
|---|---|---|---|
| Frontend focused suite | 47 tests passed | 0 | `20261003-042432-task10-web-tests.log` |
| Frontend TypeScript/Vite build | Passed with dummy public API URL and blank analytics key | 0 | `20261003-042432-task10-web-build.log` |
| Targeted frontend ESLint | Passed with existing temporary adapter | 0 | `20261003-042432-task10-web-lint.log` |
| Whitespace check | Passed | 0 | No output |

The unchanged backend's latest 111-check result remains `20261003-040827-task09-api-tests.log`, covering normal/admin owner scoping and participant/target authorization. It was not rerun for this frontend-only follow-up. A bounded React Doctor scan used the already cached 0.9.14 runtime; it reported six legacy errors, existing complexity warnings and a callback-effect warning for navigation unlock on externally observed authorization loss. No feature error was reported. Its score service was unavailable, so no new score is claimed (`20261003-041820-task10-react-doctor.log`, exit 1). No unrelated health fixes, dependencies or lint configuration changes were made. Vite's existing shared-chunk warning remains.

Current ignored browser evidence: `qa/task10-admin-default-welcome.jpg`, `qa/task10-explicit-admin-dashboard.jpg`, `qa/task10-admin-draft-retained.jpg`, `qa/task10-admin-own-saved-summary.jpg`, `qa/task10-admin-own-increased.jpg`, `qa/task10-admin-own-decreased.jpg`, `qa/task10-dashboard-own-record.jpg`, `qa/task10-target-edit-return-locked.jpg`, `qa/task10-admin-refresh-fnf.jpg`, `qa/task10-nonadmin-no-switch.jpg`, `qa/task10-mobile-light-form.jpg`, `qa/task10-mobile-dark-form.jpg`, `qa/task10-mobile-light-admin.jpg`, `qa/task10-mobile-dark-admin.jpg`, `qa/task10-mobile-light-fnf-final.jpg`, `qa/task10-mobile-dark-fnf-final.jpg`, `qa/task10-admin-own-withdrawn.jpg` and `qa/task10-dashboard-after-withdrawal.jpg`. The final FnF mobile screenshots supersede the earlier pre-polish mobile summary shots.

Preview processes remain the task09 processes: API/helper session 84527 and PID 22908; Vite session 35316 and PID 67294; disposable PostgreSQL PID 84570. `http://localhost:8081/admin` now opens the synthetic admin's regular FnF management view, with the explicit Admin View control. `http://localhost:8081/new-member` still supplies a fresh fictional welcome. All work remains uncommitted. No actual database migration, merge, deployment, production OAuth session or configured telemetry verification occurred. The existing release gates remain unchanged.

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

On 2026-10-03, branch `fix-eslint-react-hooks-flat` switched the lint config to the plugin's documented flat preset (`reactHooks.configs.flat.recommended`, eslint-plugin-react-hooks 7.0.1) and ignored the committed `.vite` and `Old-Backup` folders. Plain `pnpm lint` now loads and passes on the whole repository (`20261003-115721-web-lint.log`), so the temporary adapter config referenced in the earlier evidence is no longer needed.

## Local closeout evidence preservation

On 2026-10-03 Asia/Kolkata, all 43 regular browser QA images were copied without following symlinks to `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-qa/2026-10-03/`. Every copied image has an identical SHA-256 digest to its original. `SHA256SUMS` in that directory lists the archived filenames and hashes. The historical `qa/` references above map to the same relative filenames there, so removing the feature worktree will not remove this evidence. Dependency symlinks and generated build outputs are disposable; test logs remain under `/tmp/test-results/ankush-wiki/`.

Local integration and cleanup are separate from the remaining release gates: approved actual migrations 0003 and 0004, paired deployment, real OIDC verified-email login, authenticated production behavior, and configured telemetry transport/replay verification. Earlier dated QA and process descriptions above are retained as historical evidence.

## 2026-10-03: move to /invest, redesign and Not found page

- The private page moved from `/friends-and-family` to `/invest` in 7a6f859. The old page URL is retired with no redirect. API paths under `/friends-and-family` are unchanged.
- The page was redesigned in ac88783: a signed-out invitation landing, one composed amount field with labelled step buttons, a progress section that scrolls with the page instead of a sticky card, one admin overview sheet with a three column table, no uppercase eyebrow labels and no admin Committed tile. The member and admin docs describe the current interface, including the strings “The round”, “Admin view” and “Member view”.
- A catch-all route now renders a public Not found page with a link home and a `noindex` robots meta, because the single-page app answers unknown URLs with HTTP 200. One routing test covers it: unknown paths, including `/friends-and-family`, reach Not found and never the private page, while `/invest` still opens the private page. It failed first (`20261003-125126-web-tests-red.log`) and then passed (`20261003-125144-web-tests-green.log`).
- A synthetic browser check against a local Vite server and the mock API (signed-out state) confirmed at 375px and 1280px, light and dark: `/friends-and-family` and `/some-unknown-page` show Not found with no private markup, `/` shows the home page and `/invest` shows the signed-out invitation. The home link is 44px tall and shows a focus ring on keyboard focus. The public theme toggle on the home page switched light to dark and back, and each choice survived a reload.
- Check logs for this change are under `/tmp/test-results/ankush-wiki/`. After rebasing onto 5d4f8b1 the final gate passed with exit 0: tests `20261003-125541-web-tests.log` (49 of 49), build `20261003-125542-web-build.log` and lint `20261003-125547-web-lint.log`.
- The redesign before and after screenshots (116 each), the throwaway QA scripts (mock API, screenshot, audit, flow, focus and the temporary ESLint config) and the Not found screenshots were copied to `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-redesign/2026-10-03/`, outside any git repository like the earlier QA folder, with a `SHA256SUMS` file verified against the originals.
- Still unverified: the real API and Google sign-in at `/invest`, Safari and iOS rendering, a screen-reader pass, and reduced-motion behavior.

## 2026-10-03: admin-editable conversion rate

- The rate moved from the API constant to the append-only rate history (API migration 0005). The page reads `config.inrMinorPerUsd` with a fallback to `inrPerUsd` times 100, and admins with round management get a “Conversion rate” row with **Change rate** in the overview sheet. See `friends-family-admin.md`.
- Tests were written first and failed (`20261003-131053-web-tests-red.log`, the new modules did not exist), then passed. Nine tests were added; the fixture `config` gained `inrMinorPerUsd: '9500'`, and existing `convertMinor`/`selectedMoney` calls now pass the minor-unit rate `'9500'` instead of `'95'` with the same expected values.
- A synthetic browser check against a local Vite server and a scratch copy of the mock API (extended with the rate endpoint and fields) captured 24 screenshots at 375px and 1280px, light and dark: at rest, editing, invalid input (`88.755`), conflict, saved at 88.75, and a member summary at 88.75 (₹50,00,000 shown as about US$56,338.03). No page errors, no horizontal overflow, and every rate control measured at least 44px tall. Screenshots and the scratch scripts are in `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-rate/2026-10-03/` with a `SHA256SUMS` file.
- Still unverified: the real API with the migrated shared database, Google sign-in, Safari and iOS, and a screen-reader pass.

## 2026-10-03: welcome letter on every load

- Every signed-in member, including the admin, now starts at the welcome letter on each page load and refresh. Next opens the summary for a member with history (active or withdrawn commitment, or a nonzero version) and the amount step otherwise. `hasMemberHistory` in `memberFlow.ts` is the single check, evaluated by the reducer from the latest overview when Next is pressed. Nothing is stored in the browser or the database.
- Tests were rewritten and added first and failed (`20261003-133856-web-tests-red.log`, 4 failing), then passed (`20261003-133919-web-tests-green.log`, 60 of 60).
- A synthetic browser check against a local Vite server and a scratch copy of the mock API captured 18 light mode screenshots at 375px and 1280px: a member with a saved commitment sees the welcome on load, Next shows the summary and a refresh shows the welcome again; a new member sees the welcome, then the amount step; the admin sees the welcome, then the summary, and Admin view then Member view returns to the summary without the welcome. No round figures were visible on the welcome or amount step, no page errors, no horizontal overflow. Screenshots and the scratch scripts are in `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-welcome/2026-10-03/` with a `SHA256SUMS` file.
- Still unverified: the real API, Google sign-in, Safari and iOS, and a screen-reader pass.

## 2026-10-03: personal letters, signature and contact line

- The letter greets by first name, returning members get a short welcome-back letter (their recorded amount, or a withdrawal sentence), both letters close with a drawn decorative signature, and the summary thanks by name and always ends with "Questions? Call me or WhatsApp me." and an **Email me** link. Slots for a photo, a "Why I am raising" story and a video or voice note stay hidden until content is added (see `friends-family-member.md`). Three member labels were warmed.
- Tests were written first and failed (`20261003-135534-web-tests-red.log`, 9 failing: 6 new and 3 with edited wording), then passed (`20261003-135724-web-tests-green.log`, 67 of 67). Filled-in states are exercised through stubbed content and assets modules.
- A synthetic browser check against a local Vite server and a scratch copy of the mock API (adding a withdrawn state and a name override) captured screenshots at 375px and 1280px, light and dark: first-time letter with and without a name, welcome-back with an amount and after a withdrawal, the summary with the contact line, and signature close-ups. A temporary local override (sample story text, a stand-in photo and a synthesized voice note) showed the filled-in slots; it was reverted, and the committed content holds `null` with no media or photo file. No page errors, no horizontal overflow, no requests to other hosts, no autoplay, every control at least 44px tall, and no round figures on either letter. Evidence is in `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-personal/2026-10-03/` with a `SHA256SUMS` file.
- Still unverified: a video file in the player (only audio was rendered in the browser), the real API and Google sign-in, Safari and iOS, and a screen-reader pass.
- 2026-10-03: added the portrait `src/assets/friends-family/ankush-photo.jpg` (256 x 256 JPEG, 10,688 bytes, resized with `sips` from the 1500 x 1500 original, no crop needed); a mock browser check at 375px and 1280px, light and dark, showed it as a 56px circle beside the signature on both letters, same origin, `alt=""`, no overflow and no layout shift from the image. Evidence is in `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-photo/2026-10-03/`.
- 2026-10-03: the first-time letter now ends with two short paragraphs from Ankush (the MVP is built; commit only what you are comfortable with) before the sign-off, and the unused "Why I am raising" slot and `content.ts` were removed; the welcome-back letter is unchanged. Tests failed first (`20261003-141001-web-tests-red.log`, 1 failing) then passed (`20261003-141031-web-tests-green.log`, 67 of 67). Mock browser screenshots at 375px and 1280px, light mode, are in `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-letter-lines/2026-10-03/`.
- 2026-10-03: the progress bar now shows the viewer's own commitment as the last segment of the fill (everyone else combined first), on the member summary and the admin overview, with a swatch beside the "Yours" line; no commitment or a withdrawal keeps one segment and no own line. Tests failed first (`20261003-142031-web-tests.log`, 5 failing) then passed (`20261003-142125-web-tests.log`, 72 of 72). Mock browser screenshots at 375px and 1280px, light and dark, with bar close-ups, are in `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-own-share/2026-10-03/`.
- 2026-10-03: the admin calls moved to `/admin/friends-and-family/participants`, `/round-target` and `/exchange-rate` (paths defined once in `ADMIN_PATHS` in `api.ts`), and session-replay masking now also covers `/admin/friends-and-family` but no other `/admin/` path. Tests failed first (`20261003-145510-web-tests-red.log`, 4 failing) then passed (`20261003-145529-web-tests-green.log`, 81 of 81). A mock browser check showed the admin dashboard loading participants and saving a target and a rate through the new paths only, and an ordinary member making no admin call; evidence is in `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-admin-paths/2026-10-03/`.
- 2026-10-03: round figures are now for the admin only. The member summary (including the admin's own member view) is titled "Your commitment" and has no round card, the amount step button reads "Save commitment", and the signed-out "What you can do here" no longer mentions seeing how the round is going; the API withholds the figures from members, so the deploy order is now web first, then the API (`api/docs/friends-family.md`, Rollout). Tests failed first (`20261003-155930-web-tests-red.log`, 6 failing) then passed (`20261003-160010-web-tests-green.log`, 86 of 86). Mock browser screenshots at 375px and 1280px, light mode, are in `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-hide-totals/2026-10-03/`.
- 2026-10-03: the amount editor now preselects Lakh instead of Crore (one constant, `DEFAULT_RUPEE_UNIT` in `money.ts`), so the empty editor steps by "1 Lakh" and Change commitment shows a saved INR amount in Lakh (₹25,00,000 as 25, ₹2,00,00,000 as 200); Crore stays selectable. Tests failed first (`20261003-160927-web-tests.log`, 1 failing) then passed (`20261003-160937-web-tests.log`, 86 of 86). Mock browser screenshots at 375px, light mode, are in `/Users/ankush/Workspaces/People/Ankush/ankush-wiki/.artifacts/friends-family-lakh-default/2026-10-03/`.
