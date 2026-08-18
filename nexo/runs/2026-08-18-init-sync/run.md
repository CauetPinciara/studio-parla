---
id: 2026-08-18-init-sync
milestone: m1
mode: autopilot
status: done
---

# Nexo init synchronization

## Frame

Synchronize the existing repository with the current Nexo main-only rails without enabling promotion or removing project-owned files.

## Acceptance

- `main` remains the only long-lived branch.
- `nexo/state.json` contains no promotion delivery block.
- `AGENTS.md` and `CLAUDE.md` pass the canonical managed-context check.
- `.worktrees/` is ignored by Git.
- Both standing-context files document Conventional Commits.
- No hosted CI gate or branch protection is added.

## Scope

The existing Supabase keep-alive workflow is project maintenance and remains unchanged.
The existing `docs/superpowers/` directory is flagged for future consolidation and is not moved or deleted by init.

## Gate 2

Verification attempt 1 failed because `npm audit --audit-level=high` found one high-severity `nanoid` vulnerability.
The managed-context checks, Git rail checks, unit tests, lint, build, and three browser E2E tests passed.
The branch is parked before commit or merge pending human authorization to expand scope into dependency remediation.

## Autopilot resumption

The human authorized dependency remediation and requested continuation in autopilot mode.

## Security remediation

The first Gate 2 failure traced to `nanoid@3.3.17`, which the lockfile selected through Vite and PostCSS even though the dependency range permits the fixed `3.3.18` patch.
The lockfile now selects `nanoid@3.3.18`.
The audit also reported `qs@6.15.1` through Stryker's `typed-rest-client`, which hard-pins that vulnerable version.
An npm override selects the compatible `qs@6.15.3` patch until the upstream dependency updates its exact pin.
The retry strengthens the security oracle from high-severity-only to a zero-vulnerability `npm audit` check.

## Capture

Final Gate 2 status is PASS after the locked verification retry passed all rail, dependency, audit, unit, lint, build, and browser E2E checks.
Capture uses one atomic dependency-remediation commit for `package.json` and `package-lock.json`, followed by one atomic Nexo-rails commit for `.gitignore`, `AGENTS.md`, `CLAUDE.md`, and the `nexo/runs/2026-08-18-init-sync/` record.
Commit creation, merge, and push remain owned by the Nexo orchestrator.

## Committed-state verification

Gate 2 passed again against committed branch state `00e689d` using the full rail, dependency, unit, lint, build, zero-vulnerability audit, and browser E2E command.
