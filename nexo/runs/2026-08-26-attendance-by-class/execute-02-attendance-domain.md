# Execute 02 attendance domain

Status: PASS

Started: 2026-08-26T22:37:20Z

Ended: 2026-08-26T22:52:19Z

## TDD evidence

### Task 1: SQL schema and database types

The SQL oracle was created before either production schema path or the generated-style TypeScript types changed.

Red command: the plan's temporary `postgres:17-alpine` command loaded the pre-change `supabase/schema.sql` and then ran `supabase/tests/attendance-schema.sql` with `ON_ERROR_STOP=1`.

Red result: exit 3 with the explicit expected error `public.aulas does not exist` after a successful PostgreSQL bootstrap and schema load.

The cleanup trap removed the temporary Red container.

Green implementation added `aulas`, `presencas`, their uniqueness and check constraints, snapshot-preserving foreign keys, non-null timestamps, narrowly scoped update triggers, RLS, and the existing member-only policy to the fresh schema and versioned migration.

Green SQL command: the plan's run-once two-container command exercised the merge-base schema plus migration as the upgrade path and the changed schema as the fresh-install path.

Green SQL result: exit 0, with both executable oracle invocations ending in `ROLLBACK`.

Type contract command: `npm run typecheck`.

Type contract result: PASS with exact `Row`, `Insert`, and `Update` entries for `aulas` and `presencas`.

### Task 2: pure attendance domain

The locked domain test was created before `attendance-domain.ts`.

Red command: `npm run test -- src/features/relatorios/attendance-domain.test.ts`.

Red result: exit 1 because Vite could not resolve the intentionally absent `@/features/relatorios/attendance-domain` module.

Green implementation added strict UTC ISO date validation, recurring and confirmed one-off class candidates, status filtering, enrollment-first deduplication, persisted historical attendance, snapshot names, deterministic Portuguese sorting, stable keys, and completion readiness.

Green command: `npm run test -- src/features/relatorios/attendance-domain.test.ts`.

Green result: PASS, 16 tests passed.

Domain lint command: `npx eslint src/features/relatorios/attendance-domain.ts src/features/relatorios/attendance-domain.test.ts --max-warnings=0`.

Domain lint result: PASS.

The Green refactor only extracted private helpers and prefixed internal person identities so a contact UUID cannot collide with an orphaned presence UUID.

### Task 3: read-only loading and attendance persistence

The locked API test with independent table-specific Supabase chains was created before `attendance-api.ts`.

Red command: `npm run test -- src/features/relatorios/attendance-api.test.ts`.

Red result: exit 1 because Vite could not resolve the intentionally absent `@/features/relatorios/attendance-api` module.

Green implementation added the date-scoped query key, two-phase filtered read-only loading, snapshot-preserving occurrence upsert, canonical occurrence lookup, ordered attendance upsert, pre-write origin validation, empty-id query skipping, and original Supabase error propagation through `ensureNoError`.

Green command: `npm run test -- src/features/relatorios/attendance-api.test.ts`.

Green result: PASS, 17 tests passed.

Combined Green command: `npm run test -- src/features/relatorios/attendance-api.test.ts src/features/relatorios/attendance-domain.test.ts`.

Combined Green result: PASS, 2 files and 33 tests passed.

Combined typecheck command: `npm run typecheck`.

Combined typecheck result: PASS.

Combined lint command: `npx eslint src/features/relatorios/attendance-api.ts src/features/relatorios/attendance-api.test.ts src/features/relatorios/attendance-domain.ts src/features/relatorios/attendance-domain.test.ts src/lib/database.types.ts stryker.config.mjs --max-warnings=0`.

Combined lint result: PASS with zero warnings.

Mutation testing was not run because the approved plan reserves it for the integrated feature boundary.

## Final verification

- The named domain and API oracles passed with 33 tests.

- `npm run typecheck` passed.

- Changed-file ESLint passed with zero warnings.

- The upgrade migration oracle and fresh-schema oracle both passed and ended in `ROLLBACK`.

- `docker ps --filter name=parla-attendance --format '{{.Names}}'` produced no container name after cleanup.

- `git diff --check` passed before commit and against the committed merge-base diff.

- The committed diff contains exactly the nine canonical paths declared by the slice.

- The worktree is clean and contains exactly one commit after its merge base with `main`.

- No Supabase CLI command, linked project option, project reference, remote URL, remote credential, merge, or push was used.

## Contract produced for slice 03

`attendance-domain.ts` exports the exact `AttendanceStatus`, `AttendanceOrigin`, `AttendancePerson`, `AttendanceClass`, `AttendanceDay`, `AttendanceDayInput`, `deriveAttendanceDay`, and `isAttendanceDayReady` contract from the plan.

The domain emits `turma:<uuid>`, `aula:<uuid>`, `contato:<uuid>`, and `presenca:<uuid>` keys as specified, including renderable orphaned historical rows whose identifiers are null.

`attendance-api.ts` exports the exact `UpsertAulaInput`, `UpsertAttendanceInput`, `attendanceDayQueryKey`, `loadAttendanceDay`, `upsertAula`, and `upsertAttendance` contract from the plan.

`loadAttendanceDay` contains only filtered selects and never creates an `aula` or `presenca` during date navigation.

`upsertAula` uses `data,turma_id` with `ignoreDuplicates: true` and then reads the canonical row without overwriting its class-name snapshot.

`upsertAttendance` awaits the occurrence and then uses `aula_id,contato_id` with the complete source and contact-name snapshot.

Slice 03 may render orphaned rows but must not call `upsertAttendance` when `turmaId` or `contatoId` is null, and it may invalidate `attendanceDayQueryKey(selectedDate)` after a successful mutation.

## Files changed

- `supabase/schema.sql`

- `supabase/migrations/20260826220000_add_aulas_presencas.sql`

- `supabase/tests/attendance-schema.sql`

- `src/lib/database.types.ts`

- `src/features/relatorios/attendance-domain.ts`

- `src/features/relatorios/attendance-domain.test.ts`

- `src/features/relatorios/attendance-api.ts`

- `src/features/relatorios/attendance-api.test.ts`

- `stryker.config.mjs`

## Commit

`36a254e9c519396d0252e182c2cfa10b913729fc feat: add attendance domain and persistence`
