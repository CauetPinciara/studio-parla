# Verify: 04-task-storage-domain

Verdict: PASS

## Target and scope

- Verified worktree `HEAD` is `6c233cefb73859387e26edf7f8179f1717e58f7f`.
- Inspected the commit diff from its parent and all seven changed files.
- The diff is confined to the seven files declared by the acceptance plan.
- Existing `relatorios` schema and typed fields, including `concluido_em`, remain intact.

## Gate evidence

The exact command exited with status 0:

```bash
npm run test -- src/features/tarefas/domain.test.ts src/features/tarefas/api.test.ts && npm run typecheck && npx eslint src/lib/database.types.ts src/features/tarefas/domain.ts src/features/tarefas/domain.test.ts src/features/tarefas/api.ts src/features/tarefas/api.test.ts --max-warnings=0 && git diff --check
```

- Vitest: 2 files passed, 8 tests passed.
- Typecheck: passed.
- Changed-file ESLint: passed with zero warnings.
- Diff whitespace check: passed.
- Domain tests cover trimming, nullable descriptions, open, completed, and reopened states, preserved completion dates, required-field errors, and invalid date intervals.
- API tests cover the query key, descending order chain, typed create and update payloads, returned rows, ID-filtered update and delete, and propagation of the same error instance from all operations.

## SQL line-by-line review

- `tarefas` contains `id`, `status`, `data_abertura`, `data_conclusao`, `responsavel`, `titulo`, `descricao`, and `created_at` in both schema and migration.
- Status is required, defaults to `a_fazer`, and is constrained to `a_fazer`, `em_andamento`, or `concluida`.
- Opening date is required and defaults to `current_date`.
- Completion date is required exactly for completed tasks, null for other statuses, and cannot precede the opening date.
- Responsible person and title are required and constrained after trimming to remain nonempty.
- RLS is enabled for `public.tarefas`.
- The migration creates `membros full` only when absent and uses `public.is_member()` for both `using` and `with check`.
- The schema mirror uses the existing `is_member()` allowlist model.
- Changes are strictly additive and contain no drop, truncate, delete, data update, policy replacement, seed modification, credential, remote access, or report regression.

Migration pending: `supabase/migrations/20260824134500_add_tarefas.sql`.
No remote service was accessed, no file was modified in the worktree, and no verification process remains running.
