# Private member page

`/invest` (including trailing slash) renders an unlisted private shell, with no global navigation or transition wrapper. The page is noindex/nofollow/noarchive. Signed-out visitors see a short invitation: the line “A personal invitation from Ankush”, the title “Friends & family”, one paragraph in Ankush’s voice, three points (what you can do here, that no payment is taken, why Google sign-in is asked) and **Continue with Google**. “What you can do here” reads: “After you sign in, you can record the amount you are comfortable investing. You can change or withdraw it here.” The invitation shows no round figures, and the round overview is not requested without a signed-in user. Login and logout return to this route. Every account, including the admin, starts in the regular member view. No participant endpoint is fetched before explicitly opening the capability-gated **Admin view**. The retired `/friends-and-family` page URL has no redirect and shows the public Not found page.

## Current member flow

Every signed-in member, with or without a commitment and including the admin, sees the personal thank-you welcome first on every page load and every refresh. For a member with no prior commitment (ownCommitment null and currentVersion zero), Next opens the amount question, “What amount are you comfortable investing?”, as the page title above one sheet holding an empty INR/Crore editor. No member stage renders the target, total, percentages, remaining amount, participant count or chart. The API withholds those figures from members (`summary`, `round` and `config.targetUsdMinor` are null), and the member screens never read them, so they also show nothing about the round when an older API still sends them.

“Save commitment” submits through the existing command path. Only a confirmed successful save or replay advances the local stage to the summary. Unknown failures stay on entry, lock editing and reuse the same command UUID on retry; version conflicts still require explicit review. Local stage starts at the welcome once per account-keyed mount and is never changed by polling. The draft freezes its expected commitment version before editing, even if another window commits while this one is open.

For a returning member with an active or withdrawn record, or a nonzero historical version, Next on the welcome opens summary/management directly. `hasMemberHistory` in `memberFlow.ts` is the single check for that history, and the reducer evaluates it from the latest overview at the moment Next is pressed. The summary is titled “Your commitment”, with the subtitle “Your commitment stays yours to manage. You can change it or withdraw it here.” It has no round card: no progress bar, total, target, percentages, “Your commitment ... of the target” line, “Still to go” or “Friends and family so far”. This holds for the admin's own member view too; the admin sees the round card only in **Admin view**. Below the title come the commitment panel and the contact line. At rest the panel shows the member's amount, the thank-you line and **Change commitment** / **Withdraw commitment**; it no longer repeats a “Your commitment” label above the amount, because the page title says it once. After a withdrawal the panel shows “Make your commitment” and the editor. Titles carry no uppercase eyebrow label above them. It exposes no participant identities. Welcome/Next state is local React state; there is no onboarding database state, localStorage, sessionStorage, cookie or URL parameter.

In `contract.ts`, `RoundOverview` types `round`, `summary` and `config.targetUsdMinor` as nullable; the round figures are read only from the admin's participants response (`RoundCardView` for the card). The contract also carries canManageRound and target bounds from the backend. Admin target editing was added by the separate task08; it changes the server-owned goal without changing member commitments.

## Letters, signature and personal content

- **Greeting.** The page passes the signed-in session's `user.name` down as `memberName`. `firstNameFrom` in `memberFlow.ts` is the one derivation: the first word of the trimmed name, or no first name when the name is empty or contains `@`. With a first name both letters open "Dear <first name>," and the summary's thank-you line reads "Thank you for being part of this round, <first name>." Without one, the letter opens exactly as before and the line reads "Thank you for being part of this round."
- **First-time letter.** A member without history (`hasMemberHistory` false) sees "Thank you for being here." with Ankush's original two paragraphs, then two short paragraphs of his own before the sign-off: "I have already built the MVP. This round helps me get it to more people, faster." and "Please commit only what you are comfortable with. You are under no obligation, and I do not want you to feel that you have to." They are styled like the paragraphs above them. The welcome-back letter does not carry them. Nothing else in the letter changes apart from the greeting line.
- **Welcome-back letter.** A member with history sees "Welcome back.", the greeting, then "Thank you for coming back, and for your support of this round." With an active commitment it adds "Your commitment of <amount> is recorded.", in the currency they entered (`formatMoney`). After a withdrawal it adds "You withdrew your commitment, and that is completely fine. You are always welcome here." Next behaves exactly as before. Neither letter shows round figures; only the member's own amount may appear.
- **Signature.** Both letters close with a drawn, decorative signature (`Signature` in `ui.tsx`): an inline SVG path in `currentColor`, so it follows light and dark. It is not Ankush's real signature. The name stays available to screen readers as visually hidden text. No font or third-party request is involved.
- **Photo.** When a photo file is present it sits beside the signature as a 56px circle. Without one, nothing renders and no gap is left.
- **Video or voice note.** When a media file is present, the first-time letter shows a native player (video with `controls`, `preload="metadata"`, `playsInline`; audio with `controls`, `preload="none"`), captioned "A short video from me" or "A short voice note from me", with an accessible label. It never autoplays.
- **Contact line.** The summary always ends with "Questions? Call me or WhatsApp me." and an **Email me** link to Ankush's email address. No phone number appears, and the address appears only in the link, never as visible text.
- **Wording.** Member-facing labels were warmed: "Remaining" became "Still to go", "People committed" became "Friends and family so far", and the conflict line's "No active commitment" became "None at the moment". (2026-10-03: "Still to go" and "Friends and family so far" left the member summary with the round card.)

### How to add content

1. **Photo:** put a square-ish photo at `src/assets/friends-family/ankush-photo.jpg` (`.jpeg`, `.png` or `.webp` also work). Keep it small: about 256px square and well under 50 KB (for example `sips -Z 256` on a square crop).
2. **Video or voice note:** put one file at `src/assets/friends-family/welcome.mp4` or `welcome.webm` (video), or `welcome.m4a` or `welcome.mp3` (audio). If several are present, the order of preference is mp4, webm, m4a, mp3.

Files are picked up by `import.meta.glob` in `assets.ts` at build time, so no code change is needed. **Everything built into the page is public:** the photo and media file are part of the site's built assets and can be fetched without signing in, even though the page itself asks for sign-in. Only add what is fine for anyone to see.

## Amounts and mutations

Shared `money.ts` helpers parse plain decimal input into integer paise/cents using BigInt. The amount is one composed field labelled “Your amount”: a currency select, the amount input and, for INR, a Lakh/Crore unit select, bordered as one control. INR starts empty in Crore, supports Lakh, and steps by one selected unit. USD steps by US$100. The two step buttons show their step as visible text (for example “− 1 Crore” and “+ US$100”) and are named “Decrease by …” and “Increase by …” for assistive technology; on a phone they sit directly under the field. Below the field are the full formatted amount, an “About” figure in the other currency and the rate line. Presentation unit switches preserve the exact amount. Currency toggles keep the canonical original amount until an actual edit; saving converts it once to the selected currency and validates server bounds against that selected amount. Rounded-zero USD and converted amounts over the server maximum cannot be submitted.

Save/withdraw commands carry a UUID and version, with no name/email/authId fields. An uncertain transport/server failure locks edits and retries the exact command object. A 409 refreshes server state and requires explicit review before a new command. No optimistic total update is used. Drafts freeze their edit version and are not reinitialized by periodic/refocus refreshes. Withdrawal has a separate deliberate confirmation on the management card.

Private queries use account-specific keys, no placeholder data, gcTime zero, no-store fetches and bounded requests. Signout cancels/removes private queries and the public session cache before redirect. 401 renders sign-in; network/server failures render retry feedback without claiming that the user is signed out. The overview refreshes every 15 seconds and on refocus; a failed refresh shows a retry notice.

## Analytics

Direct private loads never initialize PostHog. History push/replace and popstate stop recording before private DOM mounts; a public route effect resumes normal analytics after private DOM is gone. Guards cover manual events/identify, delayed observer/error callbacks, and before_send. Private roots carry autocapture/replay blocking classes plus a blocking/masking selector. The replay network filter drops financial endpoint requests even when a request completes later. There is no persistent global opt-out. Public configured analytics remains enabled. PostHog's already-optional runtime key is optional in Vite validation too, allowing explicit blank-key QA.

Focused analytics checks use a mocked SDK. Local browser checks use a blank analytics key and synthetic signed sessions, never production accounts or credentials. Actual configured PostHog network behavior still belongs in final privacy QA.

## Verification

- Focused Node suite: 47 checks, including rendered welcome/amount/summary output, returning history, same-command uncertain retry, frozen draft versions, money precision, explicit admin switching, private cache lifecycle and private analytics.
- TypeScript and Vite build use the redirected build command below.
- Targeted ESLint uses a temporary equivalent flat config because the existing repository config selects the legacy React Hooks plugins-array preset. No repository lint-config change was made.
- React Doctor reviewed the full repository; preexisting errors/warnings remain outside this change. Explicit submit-button type and handler-only withdrawal version were corrected. New component control-flow complexity warnings reflect the auth/editor/mutation states and remain for further review; no new dependencies were installed.
- Synthetic browser QA verified selected-USD save, total changes after server confirmation, withdrawal/resave controls, stale edits in two windows and explicit review, trailing slash, light/dark, noindex, and 320px overflow. Screenshots are in ignored `qa/`.

No commit, merge, push, migration against the shared database, or deployment was performed.

## Final review regression

When another window withdraws an active commitment, the already-mounted panel now captures a new empty draft's version before input. Later polling can update the confirmed commitment without replacing that draft version. Synthetic two-window QA confirmed that a newer remote save produces 409 and explicit review, preserving the intended draft amount until the member reviews and resubmits.

## 2026-10-03 planning rate follow-up

The backend now supplies a temporary INR 95 per USD planning rate. It is not a verified live quote. The frontend continues to use the response config, with no client conversion constant. Existing unit/currency precision and rounding fixtures now exercise 95, including 47 paise rounding to zero USD cents and 48 paise rounding to one cent.

Members with an active commitment use **Change commitment** to open the editor prefilled with their original currency and amount, then **Save commitment** to record a new version. This existing handler and the prior browser evidence remain valid; the rate update did not alter that flow. Sign-in still precedes the welcome/amount/summary flow described above.

## Admin integration

Task10 uses the same `MemberRound` and `CommitmentPanel` for every signed-in account. The account-keyed `RoundViews` component starts in the member view, exposes **Admin view** only with the server capability, and preserves the member subtree while the dashboard is visible. Unsaved drafts, entry stage and uncertain same-UUID retries survive returning through **Member view**. The dashboard itself is removed on return, including participant query cleanup. View choice has no URL, query-string or storage override. Identity display preserves server snapshot provenance. The member path contains no hardcoded admin email.

## Task07 verification limits

TypeScript, focused render/state checks, production build and targeted lint passed for the revised member flow. The test render uses the real form/panel/progress components; panel mutation handlers are exercised with a small hook-store harness and synthetic transport outcomes. These checks do not substitute for browser interaction QA.

A bounded supported CUA check still reports IAB unavailable in this agent. The old synthetic API preview remains untouched and does not yet run the new backend build. Task09 should refresh that preview and check welcome -> Next -> amount -> confirmed save -> summary in both themes and narrow mobile, plus account switches, conflict and unknown-response retries. Existing qa screenshots predate this revised flow and should not be treated as its proof.

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
