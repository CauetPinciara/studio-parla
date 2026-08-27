# Feature mutation verification retry

## Verdict

PASS.

`npm run test:mutation` was executed exactly once and exited with code 0.
Stryker completed a real mutation run for all five configured files, including both new attendance modules, without a sandbox crash.
Surviving mutants do not change this command-level PASS because no mutation threshold failed, but they are recorded below as test-quality gaps.

## Preflight

- Expected HEAD: `69a3df72f770ca756e55b33183b22a233efb79c7`.
- Observed branch and HEAD before execution: `main` at `69a3df72f770ca756e55b33183b22a233efb79c7`.
- `.stryker-tmp` before execution: absent.
- Existing Stryker or Vitest workers before execution: none.
- Preexisting dev server: PID 13949 listening on port 5173.
- `stryker.config.mjs` SHA-256 at the final check: `cfc5df89c9777a8eb098c7de998636424584da485f01204731ad21344870000d`.

The configuration contained exactly these five mutation targets:

1. `src/features/fechamento/domain.ts`
2. `src/features/pecas/domain.ts`
3. `src/features/visao-geral/domain.ts`
4. `src/features/relatorios/attendance-domain.ts`
5. `src/features/relatorios/attendance-api.ts`

The configuration also contained the exact value `ignorePatterns: ["/.agents", "/.claude"]`.

## Execution evidence

- Command: `npm run test:mutation`.
- Invocation count in this verification: 1.
- Started: `2026-08-27T01:23:36Z`.
- Finished: `2026-08-27T01:25:11Z`.
- Reported duration: 1 minute 35 seconds.
- Exit code: 0.
- Files selected for mutation: 5 of 459.
- Source files instrumented: 5.
- Mutants instrumented: 502.
- Initial Vitest run: 43 tests passed in 2 seconds.
- Stryker runner concurrency: 2 processes.
- Average tests per mutant: 1.96.
- Sandbox crash: none.

## Mutation totals

| Scope | Total | Killed | Survived | Timeout | No coverage | Ignored | Errors | Score total | Score covered |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| All files | 502 | 418 | 70 | 0 | 14 | 0 | 0 | 83.27% | 85.66% |
| `attendance-domain.ts` | 241 | 182 | 55 | 0 | 4 | 0 | 0 | 75.52% | 76.79% |
| `attendance-api.ts` | 116 | 91 | 15 | 0 | 10 | 0 | 0 | 78.45% | 85.85% |

The ignored count is zero because killed, survived, timeout, no-coverage, and error statuses account for all 502 instrumented mutants.
The two new modules were therefore evaluated with 357 real mutants in total.

The three existing targets remained at 100.00% mutation score:

- `src/features/fechamento/domain.ts`: 50 killed of 50.
- `src/features/pecas/domain.ts`: 22 killed of 22.
- `src/features/visao-geral/domain.ts`: 73 killed of 73.

## Survivors in `attendance-api.ts`

Stryker reported 15 survivors:

1. Line 57, `MethodExpression`: remove `.sort()` from the deduplicated `aulaIds` array.
2. Line 63, `StringLiteral`: change `select("*")` for `contatos` to `select("")`.
3. Line 64, `ObjectLiteral`: replace the empty-contact fallback `{ data: [], error: null }` with `{}`.
4. Line 66, `StringLiteral`: change `select("*")` for `presencas` to `select("")`.
5. Line 67, `ObjectLiteral`: replace the empty-attendance fallback `{ data: [], error: null }` with `{}`.
6. Line 113, `ConditionalExpression`: replace the whole invalid-origin condition with `false`.
7. Line 113, `ConditionalExpression`: replace the left origin comparison with `true`.
8. Line 113, `EqualityOperator`: change `input.origem !== "matricula"` to `input.origem === "matricula"`.
9. Line 113, `StringLiteral`: change the left comparison literal from `"matricula"` to `""`.
10. Line 117, `ConditionalExpression`: replace `input.avulsaId !== null` with `true`.
11. Line 118, `StringLiteral`: replace the matricula cross-reference error message with an empty string.
12. Line 121, `ConditionalExpression`: replace `input.origem === "avulsa"` with `true`.
13. Line 122, `StringLiteral`: replace the avulsa cross-reference error message with an empty string.
14. Line 131, `ObjectLiteral`: replace the object passed to `upsertAula` with `{}`.
15. Line 154, `ConditionalExpression`: replace the missing-presence condition with `false`.

## Survivors in `attendance-domain.ts`

Stryker reported 55 survivors:

1. Line 50, `Regex`: remove the start anchor from the attendance-date pattern.
2. Line 50, `Regex`: remove the end anchor from the attendance-date pattern.
3. Line 60, `MethodExpression`: replace `setUTCHours` with `setUTCMinutes`.
4. Line 64, `LogicalOperator`: change the logical operator between the year and month mismatch checks from `||` to `&&`.
5. Line 64, `ConditionalExpression`: replace the year mismatch check with `false`.
6. Line 65, `ConditionalExpression`: replace the month mismatch check with `false`.
7. Line 66, `ConditionalExpression`: replace the day mismatch check with `false`.
8. Line 74, `BlockStatement`: empty the `compareText` function body.
9. Line 82, `LogicalOperator`: change the people-sort fallback from `||` to `&&`.
10. Line 89, `ConditionalExpression`: replace the null-left, non-null-right class-time condition with `false`.
11. Line 90, `ConditionalExpression`: replace the whole non-null-left, null-right condition with `true`.
12. Line 90, `LogicalOperator`: change `&&` to `||` in the non-null-left, null-right condition.
13. Line 90, `ConditionalExpression`: replace the left time check with `true`.
14. Line 90, `ConditionalExpression`: replace the right time check with `true`.
15. Line 92, `ConditionalExpression`: replace the whole both-times-present condition with `true`.
16. Line 92, `ConditionalExpression`: replace the whole both-times-present condition with `false`.
17. Line 92, `LogicalOperator`: change `&&` to `||` in the both-times-present condition.
18. Line 92, `ConditionalExpression`: replace the left time check with `true`.
19. Line 92, `EqualityOperator`: change the left time check from `!== null` to `=== null`.
20. Line 92, `ConditionalExpression`: replace the right time check with `true`.
21. Line 92, `EqualityOperator`: change the right time check from `!== null` to `=== null`.
22. Line 92, `BlockStatement`: empty the time-comparison block.
23. Line 94, `ConditionalExpression`: replace `timeComparison !== 0` with `false`.
24. Line 111, `ConditionalExpression`: replace the missing-`turmaId` guard with `false`.
25. Line 113, `MethodExpression`: remove the enrollment `.sort(...)` call.
26. Line 119, `ArrowFunction`: replace the enrollment sort comparator with `() => undefined`.
27. Line 123, `LogicalOperator`: change `!contact || !personKey` to `!contact && !personKey`.
28. Line 137, `MethodExpression`: remove the one-off-booking `.sort(...)` call.
29. Line 137, `MethodExpression`: remove the one-off-booking `.filter(...).sort(...)` chain.
30. Line 140, `ConditionalExpression`: replace the full one-off-booking predicate with `true`.
31. Line 140, `LogicalOperator`: change the outer booking predicate operator so the status check is joined with `||`.
32. Line 140, `ConditionalExpression`: replace the combined class-and-date predicate with `true`.
33. Line 140, `LogicalOperator`: change the class-and-date operator from `&&` to `||`.
34. Line 140, `ConditionalExpression`: replace the class-id equality with `true`.
35. Line 141, `ConditionalExpression`: replace the booking-date equality with `true`.
36. Line 142, `ConditionalExpression`: replace the confirmed-status equality with `true`.
37. Line 144, `ArrowFunction`: replace the booking sort comparator with `() => undefined`.
38. Line 148, `ConditionalExpression`: replace the grouped missing-contact and missing-key guard with `false` while retaining the duplicate-person guard.
39. Line 148, `LogicalOperator`: change `!contact || !personKey` to `!contact && !personKey`.
40. Line 169, `MethodExpression`: remove the saved-attendance `.sort(...)` call.
41. Line 169, `MethodExpression`: remove the saved-attendance `.slice().sort(...)` chain.
42. Line 171, `ArrowFunction`: replace the saved-attendance sort comparator with `() => undefined`.
43. Line 184, `ConditionalExpression`: replace the enrollment-origin precedence check with `true`.
44. Line 186, `ObjectLiteral`: replace the saved-origin merge object with `{}`.
45. Line 226, `OptionalChaining`: remove optional chaining from `candidate.turma?.nome`.
46. Line 262, `ConditionalExpression`: replace `booking.turma_id !== null` with `true`.
47. Line 265, `ConditionalExpression`: replace the missing-booking-class guard with `false`.
48. Line 268, `ConditionalExpression`: replace the missing-current-class guard with `false`.
49. Line 273, `LogicalOperator`: change the existing-aula fallback from `?? null` to `&& null`.
50. Line 278, `MethodExpression`: remove the saved-class `.sort(...)` call.
51. Line 278, `MethodExpression`: remove the saved-class `.filter(...).sort(...)` chain.
52. Line 279, `ConditionalExpression`: replace the saved-class date predicate with `true`.
53. Line 280, `ArrowFunction`: replace the saved-class sort comparator with `() => undefined`.
54. Line 295, `ConditionalExpression`: replace the empty orphaned-attendance guard with `false`.
55. Line 313, `MethodExpression`: replace the per-class person `.every(...)` readiness check with `.some(...)`.

## Final integrity and cleanup checks

- Final branch and HEAD: `main` at `69a3df72f770ca756e55b33183b22a233efb79c7`.
- Residual Vitest or Stryker workers: none.
- `.stryker-tmp` after completion: absent.
- Residual temporary path and size: not applicable.
- Preexisting dev server: PID 13949 remained listening on port 5173.
- Code, tests, configuration, and commits changed by this verifier: none.
