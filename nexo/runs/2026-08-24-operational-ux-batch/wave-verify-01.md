# Wave Verify: wave-01

Verdict: FAIL

## Target

- Integrated commit: `4953a8dcb81051e875ff53d9bd2ec0b5776442fc`
- Verified `HEAD` matched the integrated commit before running the gate.
- The existing working-tree changes were confined to Nexo artifacts.

## Gate result

The exact command was:

```bash
npm test && npm run test:e2e && npm run lint && npm run build && npm audit --omit=dev --audit-level=high
```

The command exited with status 1 during `npm test`.
Vitest reported 16 passing test files, 1 failed suite, and 36 passing tests.
The failed suite was `.worktrees/2026-08-24-operational-ux-batch/01-report-date-rules/tests/e2e/shell.spec.ts`, which Vitest collected as a unit test and then rejected because Playwright's `test.beforeEach()` was called outside the Playwright runner.

Because the chain uses `&&`, `npm run test:e2e`, `npm run lint`, `npm run build`, and `npm audit --omit=dev --audit-level=high` were not executed and therefore have no exit codes for this attempt.
The wave integration Gate is not green.
