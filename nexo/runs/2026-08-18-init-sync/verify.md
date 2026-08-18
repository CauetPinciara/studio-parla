# Gate 2 verification: init-sync

Status: FAIL

## Acceptance criteria

- PASS: `main` is the only local branch named `main`, `staging`, or `production`.
- PASS: `nexo/state.json` has no `delivery` block, so delivery remains main-only.
- PASS: The canonical managed-context check reports both `AGENTS.md` and `CLAUDE.md` as current.
- PASS: `.worktrees/` is ignored by `.gitignore`.
- PASS: `AGENTS.md` and `CLAUDE.md` both document Conventional Commits.
- PASS: No hosted CI workflow was added, GitHub reports `main` as unprotected, and the repository has no rulesets.
- PASS: `.github/workflows/keepalive.yml` is unchanged from `HEAD` and retains the same SHA-256 digest.
- PASS: `docs/superpowers/` remains tracked and unchanged from `HEAD`.
- PASS: The tracked diff is limited to `.gitignore`, `AGENTS.md`, and `CLAUDE.md`; other untracked files are this run's artifacts or the two explicitly out-of-scope pre-existing run directories.

## Locked verification

The exact verification command exited 1 at `npm audit --audit-level=high`.
Before that failure, the managed-context check passed, 7 unit test files with 15 tests passed, lint passed, and the production build passed.
The audit reported 3 vulnerabilities: 1 high-severity `nanoid` advisory and 2 moderate findings involving `qs` and `typed-rest-client`.
Because the command is joined with `&&`, its Playwright step was not reached.
An independent diagnostic run of `CI=true npm run test:e2e` subsequently passed all 3 Chromium tests, but it does not change the failed locked-command verdict.

No implementation files were modified during verification, and no process started by verification remains running.
