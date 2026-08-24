# Execute evidence: 04-task-storage-domain retry

Status: PASS

## TDD evidence

Red 1 command: `npm run test -- src/features/tarefas/domain.test.ts`

Result: exit 1 because `@/features/tarefas/domain` did not exist, with 0 tests collected.

Green 1 result: the focused domain run passed 4 tests and `npm run typecheck` exited 0.

Red 2 command: `npm run test -- src/features/tarefas/api.test.ts`

Result: exit 1 because `@/features/tarefas/api` did not exist, with 0 tests collected.

Green 2 initially exposed two nullable `.single()` return types in typecheck and one `only-throw-error` lint failure.
The minimum type narrowing retained the original error instance and removed both failures.

## Final oracle

Command: `npm run test -- src/features/tarefas/domain.test.ts src/features/tarefas/api.test.ts && npm run typecheck && npx eslint src/lib/database.types.ts src/features/tarefas/domain.ts src/features/tarefas/domain.test.ts src/features/tarefas/api.ts src/features/tarefas/api.test.ts --max-warnings=0 && git diff --check`

Result: exit 0.
Vitest passed 2 files and 8 tests.
Typecheck, scoped ESLint, and `git diff --check` passed.

## Review

The SQL diff was inspected line by line.
It adds only `public.tarefas`, enables RLS, and conditionally creates the `membros full` policy through `pg_policies` in the migration.
No remote database command was run.
The existing `relatorios.concluido_em` storage and generated types remain present.
No process started by this execution remains running.

## Files touched

- `supabase/schema.sql`
- `supabase/migrations/20260824134500_add_tarefas.sql`
- `src/lib/database.types.ts`
- `src/features/tarefas/domain.ts`
- `src/features/tarefas/domain.test.ts`
- `src/features/tarefas/api.ts`
- `src/features/tarefas/api.test.ts`
