# Autopilot audit

## Run stopped during planning

- The user stopped the run after the orchestrator treated the 600-second result-file timeout as a reason to rush healthy planners.
- The planners were interrupted only after the explicit stop request.
- No product code, migration, commit, or remote branch was changed.
- The design and frame artifacts remain available for an explicit future resume.

## Run resumed

- The user resumed the same run.
- The elapsed-time interruption was a process mistake, not a blocker in the feature.
- Future waits treat timeouts as observability signals while a live agent is demonstrably progressing.

## Wave 1 integrated verification recovery

- The first wave verify failed on integrated commit `5bfa56097a4160447f6501484a6e9b24229f2761` because Vitest recursively collected eight Playwright suites from two residual Nexo slice worktrees under `.worktrees/2026-08-26-attendance-by-class/`.
- The Nexo cleanup helper removed both already-integrated worktrees and their corresponding slice branches before the retry.
- The second wave verify ran the same locked command against the same commit and passed Vitest, Playwright, ESLint, the production build, and the production dependency audit.
- No product change was needed between attempts because the first failure was environmental.
- The durable prevention rule is recorded in `nexo/knowledge/playbooks/clean-merged-nexo-worktrees-before-vitest.md`.

## Runtime budget exhausted

Reason: `max_active_seconds:14400`.

The limit elapsed while the already-dispatched feature mutation command was evaluating 502 mutants.
The user had explicitly instructed the orchestrator not to interrupt healthy agents merely because time elapsed.
The command completed successfully with an 83.27% score, and no new product scope or agent dispatch was started afterward.
The orchestrator performed only the compact final capture, worktree and process checks, commit, and delivery bookkeeping.

## Wave 2 accessibility recovery

- The first integrated Wave 2 gate found contrast between 3.58:1 and 3.73:1 in three new small texts.
- The wave was reverted with append-only history and recovered serially.
- A browser oracle now computes the rendered foreground and effective opaque background and requires at least 4.5:1.
- The recovered values are between 5.54:1 and 5.66:1, and the full integrated gate passed.

## Mutation sandbox adaptation

- The first mutation boundary instrumented 502 mutants but crashed before evaluating them because Stryker copied the local `.claude` skill mirror.
- The adaptation excludes only `/.agents` and `/.claude` from sandbox copying and preserves the five mutation targets.
- The first focused Verify attempt exposed a self-matching residual-process predicate in the plan; the corrected predicate passed on the same product commit.
- The Wave 3 gate passed, and the completed mutation evaluation exited zero with an 83.27% overall score.
