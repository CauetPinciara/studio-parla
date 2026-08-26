# Clean merged Nexo worktrees before integrated Vitest

## Rule

Clean each merged Nexo slice worktree before running the integrated `npm test` gate.

## Reason

Vitest discovers tests recursively from the repository root and can collect Playwright suites under `.worktrees` when a merged slice worktree remains mounted.
Those browser suites then fail during Vitest collection even when the integrated product tree is correct.

## Check

Confirm with `git worktree list` that merged slice worktrees are gone before starting the integrated gate.
After cleanup, run `npm test` from the integrated repository root and treat any remaining collection failure as a product or test configuration issue.
