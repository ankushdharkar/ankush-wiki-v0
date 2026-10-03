# Web agent instructions

Read the repository-root [CLAUDE.md](CLAUDE.md) before substantive work and follow it as shared Codex and Claude guidance. Its **Check output and worktree ownership** section is mandatory for every implementation owner and delegated subagent.

Every test, build, typecheck and lint check must redirect stdout and stderr to `/tmp/test-results/ankush-wiki/<timestamp>-web-<check>.log` using the complete capture, tail and exit wrapper in `CLAUDE.md`. Never run checks unredirected, never add verbose flags, and inspect the saved failure log instead of rerunning merely for more output. Check symlinks and keep writable caches and build output in the owning worktree before running tools. Include these rules when delegating work.
