# Feature-boundary mutation verification

Verdict: PASS

Started: 2026-08-26T18:00:39Z

Target branch: `main`

Target commit: `dd2f6fab2e3b747a6d1c6bff3546428661e754da`

## Committed configuration

The `test:mutation` package script is `stryker run`.
The committed `stryker.config.mjs` mutates these three files:

- `src/features/fechamento/domain.ts`
- `src/features/pecas/domain.ts`
- `src/features/visao-geral/domain.ts`

It uses the Vitest runner, clear-text and progress reporters, and concurrency 2.
It does not override mutation score thresholds.
The installed committed Stryker schema therefore supplies high 80%, low 60%, and break `null`.

## Mutation result

`npm run test:mutation` ran exactly once and exited successfully.
The dry run passed all 10 selected tests.
Stryker instrumented 3 source files with 145 mutants and completed in 26 seconds.

| Metric | Result |
| --- | ---: |
| Total mutation score | 100.00% |
| Covered mutation score | 100.00% |
| Killed | 145 |
| Survived | 0 |
| No coverage | 0 |
| Timed out | 0 |
| Errors | 0 |

The module totals were 50 killed mutants in `fechamento`, 22 in `pecas`, and 73 in `visao-geral`.
The run averaged 1.12 tests per mutant.

Threshold verdict: PASS.
The 100.00% score is above the default high threshold of 80%, and there is no configured break threshold.

Stryker emitted one advisory warning that 15 static mutants were estimated to consume 62% of execution time.
Those mutants remained enabled, all were tested, and none survived.

## File integrity and disposable output

The repository remained at the exact requested commit.
No tracked product file changed.
The product working tree was clean before and after mutation testing.

The tracked Nexo plan and state changes visible in the root repository predated this command and belong to the active orchestration run.
The mutation command did not alter their tracked diff set.

No `.stryker-tmp`, mutation report, or other disposable Stryker output remained after the command.
No cleanup deletion was necessary.

## Process cleanup

Port 4173 is free.
The Node process set after mutation testing matches the recorded baseline and contains only the ChatGPT tool kernel and the pre-existing Vite server on port 5173.
No Stryker, Vitest, mutation worker, watcher, or process group started by this verification remains running.
