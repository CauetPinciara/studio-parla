# Integrated Gate 2 - wave-02

Verdict: FAIL

Started: 2026-08-26T17:32:41Z

Target branch: `main`

Target commit: `5b5bbc1bb6504e7d3a3b0ff2b5091cb9e2b5ae08`

## Ordered verification

Each required command ran exactly once and in the declared order.
No command was retried.

| Order | Command | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `npm test` | FAIL | Vitest exited 1 with 3 failed suites, 32 passed suites, and 108 passed tests. |
| 2 | `npm run test:e2e` | PASS | All 8 Playwright tests passed with one worker and no snapshot drift, skip, retry, or flaky result. |
| 3 | `npm run lint` | PASS | ESLint completed with `--max-warnings=0` and reported no warning or error. |
| 4 | `npm run build` | PASS | TypeScript and the Vite production build completed successfully after transforming 2002 modules. |
| 5 | `npm audit --omit=dev --audit-level=high` | PASS | npm reported 0 vulnerabilities. |

## Blocking failure

The required `npm test` invocation discovered Playwright E2E specs inside the active slice worktree under `.worktrees/2026-08-26-workspace-admin-final/02-admin-access-boundary/tests/e2e`.
Vitest attempted to load `relatorios.spec.ts`, `shell.spec.ts`, and `tarefas.spec.ts` as unit suites.
All three failed during collection with `Playwright Test did not expect test.beforeEach() to be called here` and executed zero tests.

The command also collected the slice worktree's unit files, which is why its passing suite and test counts were doubled relative to the integrated tree.
This is a deterministic test-discovery failure in the exact required command, so Gate 2 cannot pass even though the dedicated Playwright command and every later gate succeeded.

## Integrity and cleanup

The repository was on the exact requested commit before verification and remained on it afterward.
The product tree was clean before verification and remained clean afterward.
Port 4173 was free before verification and remained free afterward.

The Node process set after verification matches the recorded baseline.
It contains only the ChatGPT tool kernel and a pre-existing Vite server process started on 2026-08-25 at 17:36:58 local time.
No test, Playwright, browser, lint, build, audit, watcher, worker, or server process started by this verification remained running.

## Conclusion

Wave 02 fails integrated Gate 2 because `npm test` exited nonzero after collecting Playwright suites from the active `.worktrees` directory.
