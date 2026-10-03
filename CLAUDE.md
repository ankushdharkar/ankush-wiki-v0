- Always use the  new Tailwind v4 that uses a different approach, unless mentioned otherwise
- if you are going to do something different than official ways, please ask me first

## Check output and worktree ownership

Every implementation owner, including Codex, Claude and delegated subagents, must read and follow this section before running checks. Include these rules in every delegated work brief.

All tests, builds, typechecks and lint checks must redirect stdout and stderr to a timestamped log under `/tmp/test-results/ankush-wiki/`, labelled `web-<check>`. Never run a check unredirected. Never add verbose flags or verbose reporters. Show only the final 20 lines, the captured exit code and the log path. On failure, read or grep the saved log; do not rerun merely to obtain more output. Preserve the check's nonzero exit status.

Run each block in a separate shell from the owning web checkout; `exit "$rc"` ends that shell. For a new worktree, preflight symlinks and output paths first. Keep build output and writable caches local to the owning worktree. A shared `node_modules` symlink also shares `.tmp`, `.vite`, `.vite-temp` and `.cache`; choose an isolated dependency/cache strategy before running tools that write there. Do not modify the main checkout or another owner's files through symlinks.

### Build

```bash
mkdir -p /tmp/test-results/ankush-wiki
LOG=/tmp/test-results/ankush-wiki/$(date +%Y%m%d-%H%M%S)-web-build.log
pnpm build > "$LOG" 2>&1; rc=$?; tail -n 20 "$LOG"; echo "exit=$rc · full log: $LOG"; exit $rc
```

### Typecheck

The root TypeScript config has no source files and references other projects. This command alone does not check those sources; the build above checks the referenced projects.

```bash
mkdir -p /tmp/test-results/ankush-wiki
LOG=/tmp/test-results/ankush-wiki/$(date +%Y%m%d-%H%M%S)-web-types.log
pnpm exec tsc --noEmit > "$LOG" 2>&1; rc=$?; tail -n 20 "$LOG"; echo "exit=$rc · full log: $LOG"; exit $rc
```

### Lint

```bash
mkdir -p /tmp/test-results/ankush-wiki
LOG=/tmp/test-results/ankush-wiki/$(date +%Y%m%d-%H%M%S)-web-lint.log
pnpm lint > "$LOG" 2>&1; rc=$?; tail -n 20 "$LOG"; echo "exit=$rc · full log: $LOG"; exit $rc
```

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
