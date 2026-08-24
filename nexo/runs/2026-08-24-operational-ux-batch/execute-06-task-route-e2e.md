# Execute evidence: 06-task-route-e2e

Status: PASS

## Red

Command: `npm run test -- src/app/navigation.test.ts`

Result: exit 1 with 2 expected failures.
The route sequence lacked `/tarefas`, and `/tarefas/` resolved to the preserved `/relatorios` fallback.

Command: `npm run test:e2e -- tests/e2e/tarefas.spec.ts tests/e2e/shell.spec.ts --project=chromium`

Result: exit 1 with 3 expected failures and 2 unrelated shell tests passing.
The app redirected `/tarefas` to `/relatorios`, so the Tarefas link, heading, and visual fixture were absent.

## Green

The navigation unit test passed 3 tests after adding the metadata.
The focused real-browser CRUD journey passed serially after adding the lazy route.

The E2E REST boundary implements ordered GET, POST create, id-filtered PATCH, and id-filtered DELETE over in-memory state.
The real page proves create, complete, reload persistence, edit, reopen, delete, keyboard Lista/Kanban switching, deep link, active navigation, mobile drawer navigation, and overflow bounds.

## Visual verification

Command: `npm run test:e2e -- tests/e2e/tarefas.spec.ts tests/e2e/shell.spec.ts --project=chromium --update-snapshots`

Result: 5 tests passed with one worker.
Only `shell-desktop.png`, `tarefas-desktop.png`, and `tarefas-mobile.png` changed.

All three PNGs were inspected at original size.
The shell preserves navigation hierarchy and clearly places Tarefas after Relatório do dia.
Desktop Lista remains legible at 1440x900.
Mobile Kanban remains inside 390x844, wraps the long title and description, keeps readable contrast and action grouping, and has no horizontal overflow.

## Gate 2

Commands ran serially:

`npm run test -- src/app/navigation.test.ts`

`npm run test:e2e -- tests/e2e/tarefas.spec.ts tests/e2e/shell.spec.ts --project=chromium`

`npm run typecheck`

`npx eslint src/app/navigation.ts src/app/navigation.test.ts src/App.tsx tests/e2e/tarefas.spec.ts tests/e2e/shell.spec.ts --max-warnings=0`

`npm run build`

`git diff --check`

Result: exit 0.
Vitest passed 3 tests, Playwright passed 5 tests with one worker, typecheck and scoped ESLint passed, the production build completed, and `git diff --check` passed.
Port 4173 is released and no server, watcher, worker, or process group started by this execution remains.
No remote migration or remote database command was run.

## Files touched

- `src/app/navigation.ts`
- `src/app/navigation.test.ts`
- `src/App.tsx`
- `tests/e2e/tarefas.spec.ts`
- `tests/e2e/shell.spec.ts`
- `tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png`
- `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png`
- `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-mobile.png`
