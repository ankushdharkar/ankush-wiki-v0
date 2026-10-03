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

### Tests added by future work

This checkout currently has no test script. The following is an illustrative template, not a runnable command. Replace the placeholder with the project's actual approved test command. Preserve the wrapper for focused tests as well. The runner must include a counted final summary within the final 20 lines and exit nonzero on failure.

```text
mkdir -p /tmp/test-results/ankush-wiki
LOG=/tmp/test-results/ankush-wiki/$(date +%Y%m%d-%H%M%S)-web-tests.log
<actual-test-command> > "$LOG" 2>&1; rc=$?; tail -n 20 "$LOG"; echo "exit=$rc · full log: $LOG"; exit $rc
```
