# Integrated Gate 2 - selector-recovery-wave

Verdict: PASS

Started: 2026-08-26T17:16:41Z

Target branch: `main`

Target commit: `b18a20964654c8a06eede41c04c8260ace3fc5cf`

## Ordered verification

Each required command ran exactly once and in the declared order.

| Order | Command | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `npm test` | PASS | 13 test files passed and all 36 tests passed. No skipped or flaky test was reported. |
| 2 | `npm run test:e2e` | PASS | All 8 Playwright tests passed with one worker. No skip, retry, snapshot drift, or flaky result was reported. |
| 3 | `npm run lint` | PASS | ESLint completed with `--max-warnings=0` and reported no warning or error. |
| 4 | `npm run build` | PASS | TypeScript and the Vite production build completed successfully. Vite transformed 2000 modules and emitted the production bundles. |
| 5 | `npm audit --omit=dev --audit-level=high` | PASS | npm reported 0 vulnerabilities. |

## Integrity and cleanup

The repository was on the exact requested commit before verification and remained on that commit afterward.
The product tree was clean before verification and remained clean afterward.
The only tracked working-tree changes visible outside the product scope were pre-existing Nexo plan and state updates owned by the active orchestration run.
No code, test, snapshot, package, configuration, or other product path became modified or untracked.
Port 4173 was free before the command sequence and remained free afterward.
The unified verification process completed, and no test, Playwright, browser, lint, build, audit, watcher, or server process started by this verification remained running.

A separate Vite development process group on port 5173 predates this verification.
Its process group started on 2026-08-25 at 17:36:58 local time, so it was not started or owned by this verifier and was left untouched.

## Conclusion

The restored selector tree passes the integrated unit, browser, lint, build, security, cleanliness, and cleanup gates at `b18a20964654c8a06eede41c04c8260ace3fc5cf`.
