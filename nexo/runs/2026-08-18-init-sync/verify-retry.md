# Gate 2 verification retry: init-sync

Status: PASS

## Acceptance criteria

- PASS: Local `main` exists, and local `staging` and `production` do not exist.
- PASS: `nexo/state.json` has no `delivery` block, so the repository remains main-only.
- PASS: The canonical managed-context check reports `AGENTS.md` and `CLAUDE.md` as current.
- PASS: Git ignores `.worktrees/` through `.gitignore`.
- PASS: `AGENTS.md` and `CLAUDE.md` document Conventional Commits.
- PASS: No hosted CI gate or branch protection was added.
  The tracked diff has no `.github` changes, GitHub reports `main` as unprotected, and the repository ruleset list is empty.
- PASS: `.github/workflows/keepalive.yml` is unchanged from `HEAD`, including an identical Git object hash.
- PASS: `docs/superpowers/` is unchanged from `HEAD` and has no untracked changes.
- PASS: `npm ls nanoid qs --all` resolves `nanoid@3.3.18` and `typed-rest-client@2.3.1 -> qs@6.15.3` with the override applied.
- PASS: `package.json` contains only the narrow `typed-rest-client.qs` override at `6.15.3`, and `npm audit` reports zero vulnerabilities.

## Locked verification

The exact requested verification command exited 0.
Vitest passed 7 files and 15 tests, ESLint passed with zero warnings, the production build completed, `npm audit` found zero vulnerabilities, and Playwright passed all 3 Chromium tests.

## Diff review

The tracked diff is limited to the six expected files: `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `nexo/state.json`, `package.json`, and `package-lock.json`.
The current run directory contains only Nexo run artifacts, while the two named pre-existing untracked run directories were treated as out of scope.
The lockfile also materializes optional bundled Tailwind Oxide WASM dependency metadata; this is non-blocking npm lockfile metadata and does not broaden the declared override.
No implementation or dependency file was modified during verification, and no process started by this verification remains running.
