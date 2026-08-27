# Feature mutation verification

- Agent: `verify`
- Slice: `feature-mutation`
- Repository HEAD: `8a59517197c58e22e43d5c9da7369e27b876d1e4`
- Expected HEAD matched: yes
- Command: `npm run test:mutation`
- Command executions: 1
- Started: `2026-08-26T21:37:51-03:00`
- Finished: `2026-08-26T21:37:52-03:00`
- Exit code: `1`
- Verdict: `FAIL`

## Configuration inspection

`stryker.config.mjs` preserves the three existing mutation targets:

- `src/features/fechamento/domain.ts`
- `src/features/pecas/domain.ts`
- `src/features/visao-geral/domain.ts`

It also includes both new targets:

- `src/features/relatorios/attendance-domain.ts`
- `src/features/relatorios/attendance-api.ts`

## Mutation result

Stryker found all 5 configured source files and instrumented them with 502 mutants.
It then crashed during sandbox setup before mutant evaluation started.
Consequently, Stryker did not emit its mutation result table or any valid mutation scores.

| Metric | Result |
| --- | --- |
| Mutants instrumented | 502 |
| Killed | Not reported - evaluation did not start |
| Survived | Not reported - evaluation did not start |
| Timeout | Not reported - evaluation did not start; no test-runner timeout was observed |
| No coverage | Not reported - evaluation did not start |
| Ignored | Not reported - evaluation did not start |
| Fatal errors | 1 sandbox copy error |
| Overall mutation score | Unavailable |

## New modules

| Module | Execution evidence | Mutation score | Reported survivors |
| --- | --- | --- | --- |
| `src/features/relatorios/attendance-domain.ts` | Included among the 5 configured and instrumented files, but mutant tests did not run | Unavailable | None reported because evaluation did not start; this is not a zero-survivor result |
| `src/features/relatorios/attendance-api.ts` | Included among the 5 configured and instrumented files, but mutant tests did not run | Unavailable | None reported because evaluation did not start; this is not a zero-survivor result |

## Failure

Stryker failed with `ENOTSUP: operation not supported on socket` while copying `.claude/skills/migrate-radix-to-base` into `.stryker-tmp/sandbox-tBxHSb/.claude/skills/migrate-radix-to-base`.
This is a fatal sandbox setup crash, so the two new modules were not actually exercised by mutant test runs.
The PASS contract requires exit code 0 and real execution of both new modules without a crash, timeout, or omitted target.
Those requirements were not met.

## Process cleanup

After the command exited, no Vitest or Stryker process remained.
The preexisting Vite listener on port 5173 remained active as PID 13949 and was not touched.
