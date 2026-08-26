---
id: 02-attendance-domain
milestone: m1
status: done
depends_on: []
files_modified: [supabase/schema.sql, supabase/migrations/20260826220000_add_aulas_presencas.sql, supabase/tests/attendance-schema.sql, src/lib/database.types.ts, src/features/relatorios/attendance-domain.ts, src/features/relatorios/attendance-domain.test.ts, src/features/relatorios/attendance-api.ts, src/features/relatorios/attendance-api.test.ts, stryker.config.mjs]
acceptance: "Given a valid report date, when attendance is loaded, then the result contains time-ordered class occurrences for matching recurring classes, confirmed one-off bookings, and saved history, with only Ativa or Nova enrollments, only Confirmada one-off bookings, enrollment-first deduplication, name-ordered people, and no database write; given an expected person, when presente or faltou is persisted, then one dated aula is reused by data and turma_id, one presenca is upserted by aula_id and contato_id with source and name snapshots, member-only RLS protects both tables, and all behavior is proven locally without applying a remote migration."
goal: "Add the secure, typed persistence and pure roster domain consumed by the attendance UI."
must_not_break:
  - "Date navigation remains read-only and never creates an aula or presenca."
  - "Existing relatorios, turmas, matriculas, avulsas, contatos, their CRUD APIs, RLS policies, and deletion behavior remain unchanged."
  - "Saved attendance remains readable after its turma, contato, matricula, or avulsa source is deleted."
  - "No migration is applied to a linked or remote Supabase project."
rules:
  - "Implement with Red, Green, Refactor and keep the named domain, API, and SQL oracle tests locked."
  - "Use data plus turma_id as the aula upsert key and aula_id plus contato_id as the presenca upsert key."
  - "Store durable turma_nome and contato_nome snapshots, and use on delete set null for removable source references."
  - "Use the existing public.is_member() member-only policy for both new tables."
  - "Keep derivation pure, deterministic, locale-aware, and independent of React, React Query, and the DOM."
  - "Do not add cancellation, rescheduling, substitutes, make-up classes, bulk attendance, analytics, dependencies, UI, or remote database commands."
verifier_focus: "Prove the two uniqueness boundaries, snapshot-preserving deletion behavior, member-only RLS, read-only date loading, source filters and dedupe precedence, historical rows, deterministic ordering, exact public interfaces for slice 03, and the absence of any remote Supabase command."
---

# Attendance domain and persistence

> **For the Nexo executor:** use test-driven development for every task in this slice.
> The locked tests are written first and may not be deleted, skipped, weakened, or rewritten merely to make Green pass.

**Goal:** Add dated class occurrences, per-person attendance persistence, and a pure automatic roster model without writing during report navigation.

**Architecture:** PostgreSQL owns occurrence and attendance identity, referential integrity, snapshots, timestamps, and member-only authorization.
A pure TypeScript module merges current recurring sources, confirmed one-off sources, and saved attendance into one deterministic day model.
A separate API module performs filtered reads and is the only module allowed to create an occurrence and attendance record, keeping navigation read-only.

**Tech Stack:** PostgreSQL and Supabase RLS, Supabase JS 2, TypeScript 6, Vitest 4, ESLint, and a temporary local PostgreSQL 17 container for executable SQL verification.

**Spec:** `docs/superpowers/specs/2026-08-26-attendance-by-class-design.md` and `nexo/plans/2026-08-26-attendance-by-class/00-OVERVIEW.md`.

## Scope and terminology

An `aula` is one dated occurrence of a recurring `turma`.
It is created only by the attendance mutation.
The pair `data, turma_id` identifies an occurrence while the turma exists.
PostgreSQL can retain multiple historical rows whose `turma_id` became null after different turmas were deleted, which is necessary because nulls are distinct in a unique constraint.

A `presenca` is one recorded attendance decision for one contact in one aula.
Its status is `presente` or `faltou`.
Its origin is `matricula` or `avulsa`.
The pair `aula_id, contato_id` prevents duplicate live-contact attendance inside an occurrence.
`turma_nome` and `contato_nome` are historical snapshots.

An expected class block exists when a current turma matches the selected weekday, a confirmed avulsa points to that turma on the selected date, or saved presencas require a historical aula to remain visible.
An empty saved aula without a current expected source and without presencas is not rendered.
This makes a partially successful mutation harmless after its source later changes.

## Public TypeScript contract for slice 03

Create `src/features/relatorios/attendance-domain.ts` with these exact exported names and fields:

```ts
import type { Row } from "@/lib/database.types";

export type AttendanceStatus = "presente" | "faltou";
export type AttendanceOrigin = "matricula" | "avulsa";

export interface AttendancePerson {
  key: string;
  presencaId: string | null;
  contatoId: string | null;
  nome: string;
  origem: AttendanceOrigin;
  matriculaId: string | null;
  avulsaId: string | null;
  status: AttendanceStatus | null;
}

export interface AttendanceClass {
  key: string;
  aulaId: string | null;
  turmaId: string | null;
  turmaNome: string;
  hora: string | null;
  pessoas: AttendancePerson[];
}

export interface AttendanceDay {
  data: string;
  turmas: AttendanceClass[];
}

export interface AttendanceDayInput {
  data: string;
  turmas: Row<"turmas">[];
  matriculas: Row<"matriculas">[];
  avulsas: Row<"avulsas">[];
  contatos: Row<"contatos">[];
  aulas: Row<"aulas">[];
  presencas: Row<"presencas">[];
}

export function deriveAttendanceDay(input: AttendanceDayInput): AttendanceDay;
export function isAttendanceDayReady(day: AttendanceDay): boolean;
```

Create `src/features/relatorios/attendance-api.ts` with this exact public contract:

```ts
import type { Row } from "@/lib/database.types";
import type {
  AttendanceDay,
  AttendanceOrigin,
  AttendanceStatus,
} from "@/features/relatorios/attendance-domain";

export interface UpsertAulaInput {
  data: string;
  turmaId: string;
  turmaNome: string;
}

export interface UpsertAttendanceInput extends UpsertAulaInput {
  contatoId: string;
  contatoNome: string;
  status: AttendanceStatus;
  origem: AttendanceOrigin;
  matriculaId: string | null;
  avulsaId: string | null;
}

export const attendanceDayQueryKey = (data: string) =>
  ["attendance-day", data] as const;

export async function loadAttendanceDay(data: string): Promise<AttendanceDay>;
export async function upsertAula(input: UpsertAulaInput): Promise<Row<"aulas">>;
export async function upsertAttendance(
  input: UpsertAttendanceInput,
): Promise<Row<"presencas">>;
```

Slice 03 may render a row when `turmaId` or `contatoId` is null, but it must not call `upsertAttendance` for that orphaned historical row.
After a successful mutation it invalidates `attendanceDayQueryKey(selectedDate)`.
No file owned by this slice is modified by slice 03.

## Task 1: Add executable attendance schema and generated-style types

**Files:**

- Modify: `supabase/schema.sql`
- Create: `supabase/migrations/20260826220000_add_aulas_presencas.sql`
- Create: `supabase/tests/attendance-schema.sql`
- Modify: `src/lib/database.types.ts`

**Produces:** The exact `Row`, `Insert`, and `Update` contracts for `aulas` and `presencas`, plus locally executable schema evidence.

### Red

- [ ] Create `supabase/tests/attendance-schema.sql` first.

The SQL oracle must run with `ON_ERROR_STOP`, begin a transaction, and fail with explicit `raise exception` messages unless all of these facts hold:

- `aulas` and `presencas` exist in `public`.
- `aulas_data_turma_id_key` and `presencas_aula_id_contato_id_key` exist and reject duplicates.
- `aulas_status` is not introduced, while `presencas_status_check`, `presencas_origem_check`, and `presencas_origem_fonte_check` reject invalid literals and cross-origin source ids.
- `aulas.turma_id`, `presencas.contato_id`, `presencas.matricula_id`, and `presencas.avulsa_id` use `ON DELETE SET NULL`.
- `presencas.aula_id` uses `ON DELETE CASCADE`.
- Deleting a turma retains `turma_nome`, and deleting a contato retains `contato_nome`.
- Both `created_at` and `updated_at` are non-null and the update trigger advances `updated_at`.
- RLS is enabled on both tables.
- Both tables have exactly one `membros full` policy whose `qual` and `with_check` call `is_member()`.
- A non-member role sees no rows and cannot insert, while a member in `app_members` can select and insert.

Use fixed UUID fixtures and roll back at the end so the oracle is repeatable.
The test must exercise constraints and RLS behavior through SQL operations, not by matching migration source text.

- [ ] Run the local SQL oracle against the pre-change schema and confirm a valid Red.

Run this command from the repository root:

```bash
set -euo pipefail
container="parla-attendance-red-$RANDOM"
cleanup() { docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run --name "$container" -e POSTGRES_PASSWORD=postgres -d postgres:17-alpine >/dev/null
until docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL'
create schema auth;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
SQL
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < supabase/schema.sql
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < supabase/tests/attendance-schema.sql
```

Expected Red: PostgreSQL reports that `public.aulas` or `public.presencas` does not exist.
A Docker, network, authentication, or SQL bootstrap failure is not a valid Red.
The cleanup trap must remove the temporary container before continuing.

### Green

- [ ] Add the following database shape to both the fresh schema and migration.

`aulas` has:

```sql
create table if not exists public.aulas (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  turma_id uuid references public.turmas(id) on delete set null,
  turma_nome text not null check (btrim(turma_nome) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aulas_data_turma_id_key unique (data, turma_id)
);
```

`presencas` has:

```sql
create table if not exists public.presencas (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references public.aulas(id) on delete cascade,
  contato_id uuid references public.contatos(id) on delete set null,
  contato_nome text not null check (btrim(contato_nome) <> ''),
  status text not null constraint presencas_status_check
    check (status in ('presente', 'faltou')),
  origem text not null constraint presencas_origem_check
    check (origem in ('matricula', 'avulsa')),
  matricula_id uuid references public.matriculas(id) on delete set null,
  avulsa_id uuid references public.avulsas(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint presencas_aula_id_contato_id_key unique (aula_id, contato_id),
  constraint presencas_origem_fonte_check check (
    (origem = 'matricula' and avulsa_id is null)
    or (origem = 'avulsa' and matricula_id is null)
  )
);
```

Add one narrowly named trigger function and two triggers:

```sql
create or replace function public.set_attendance_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

drop trigger if exists aulas_set_updated_at on public.aulas;
create trigger aulas_set_updated_at
before update on public.aulas
for each row execute function public.set_attendance_updated_at();

drop trigger if exists presencas_set_updated_at on public.presencas;
create trigger presencas_set_updated_at
before update on public.presencas
for each row execute function public.set_attendance_updated_at();
```

Enable RLS and create `membros full` with `using (public.is_member())` and `with check (public.is_member())` on both tables.
In `supabase/schema.sql`, place the two `alter table ... enable row level security` statements and two `create policy` statements beside their existing peers.
In the migration, guard policy creation with `do` blocks that query `pg_policies` by schema, table, and policy name so the migration is safe to inspect or replay locally.
Do not grant anonymous access, add service-role policies, change `is_member`, touch existing policies, or modify `supabase/seed.sql`.

- [ ] Add exact database types.

Add `aulas` to `Database["public"]["Tables"]`:

```ts
aulas: Table<
  { id: string; data: string; turma_id: string | null; turma_nome: string; created_at: string; updated_at: string },
  { id?: string; data: string; turma_id?: string | null; turma_nome: string; created_at?: string; updated_at?: string },
  { id?: string; data?: string; turma_id?: string | null; turma_nome?: string; created_at?: string; updated_at?: string }
>;
```

Add `presencas` with literal unions:

```ts
presencas: Table<
  { id: string; aula_id: string; contato_id: string | null; contato_nome: string; status: "presente" | "faltou"; origem: "matricula" | "avulsa"; matricula_id: string | null; avulsa_id: string | null; created_at: string; updated_at: string },
  { id?: string; aula_id: string; contato_id?: string | null; contato_nome: string; status: "presente" | "faltou"; origem: "matricula" | "avulsa"; matricula_id?: string | null; avulsa_id?: string | null; created_at?: string; updated_at?: string },
  { id?: string; aula_id?: string; contato_id?: string | null; contato_nome?: string; status?: "presente" | "faltou"; origem?: "matricula" | "avulsa"; matricula_id?: string | null; avulsa_id?: string | null; created_at?: string; updated_at?: string }
>;
```

- [ ] Run the SQL oracle against both upgrade and fresh-install paths.

Use this exact run-once command:

```bash
set -euo pipefail
upgrade_container="parla-attendance-upgrade-$RANDOM"
fresh_container="parla-attendance-fresh-$RANDOM"
cleanup() {
  docker rm -f "$upgrade_container" "$fresh_container" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run --name "$upgrade_container" -e POSTGRES_PASSWORD=postgres -d postgres:17-alpine >/dev/null
docker run --name "$fresh_container" -e POSTGRES_PASSWORD=postgres -d postgres:17-alpine >/dev/null
until docker exec "$upgrade_container" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
until docker exec "$fresh_container" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done

for container in "$upgrade_container" "$fresh_container"; do
  docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL'
create schema auth;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
SQL
done

git show "$(git merge-base main HEAD)":supabase/schema.sql \
  | docker exec -i "$upgrade_container" psql -U postgres -v ON_ERROR_STOP=1
docker exec -i "$upgrade_container" psql -U postgres -v ON_ERROR_STOP=1 \
  < supabase/migrations/20260826220000_add_aulas_presencas.sql
docker exec -i "$upgrade_container" psql -U postgres -v ON_ERROR_STOP=1 \
  < supabase/tests/attendance-schema.sql

docker exec -i "$fresh_container" psql -U postgres -v ON_ERROR_STOP=1 \
  < supabase/schema.sql
docker exec -i "$fresh_container" psql -U postgres -v ON_ERROR_STOP=1 \
  < supabase/tests/attendance-schema.sql
```

Expected Green: both SQL oracle invocations end with `ROLLBACK` and exit zero.
Never pass `--linked`, a project ref, a remote URL, or credentials from `.env.local`.

- [ ] Run the type contract.

```bash
npm run typecheck
```

Expected Green: exit zero with both tables accepted by `Row`, `Insert`, and `Update`.

## Task 2: Derive deterministic attendance blocks as a pure domain model

**Files:**

- Create: `src/features/relatorios/attendance-domain.test.ts`
- Create: `src/features/relatorios/attendance-domain.ts`
- Modify: `stryker.config.mjs`

**Consumes:** The exact new `Row<"aulas">` and `Row<"presencas">` types from Task 1.

**Produces:** `AttendanceDay`, `AttendanceClass`, `AttendancePerson`, `deriveAttendanceDay`, and `isAttendanceDayReady` exactly as declared above.

### Red

- [ ] Write fixtures using `satisfies Row<...>` for all six source tables before creating the domain module.

Use `2026-08-26` as Wednesday and these focused cases:

1. A turma with `dia: 3` creates a block, while a turma with `dia: 4` does not.
2. A `Confirmada` avulsa on `2026-08-26` creates its turma block even when that turma has another weekday.
3. `A confirmar`, another date, and a null `turma_id` do not create blocks.
4. Only `Ativa` and `Nova` matriculas enter an expected block; `Pausada`, `Saiu`, and null `turma_id` do not.
5. The same contact from a matricula and one or more avulsas appears once with `origem: "matricula"`, its matricula id, and `avulsaId: null`.
6. A saved presenca supplies its status and snapshot name even after matriculas and avulsas disappear.
7. A saved presenca whose aula has `turma_id: null` and whose own `contato_id` is null still creates one historical block and row from `turma_nome` and `contato_nome` snapshots.
8. A saved presenca whose aula still points to a current turma creates `turma:<uuid>` even when that turma no longer matches the selected weekday and no current matricula or avulsa still expects the person.
9. A saved empty aula that has no current expected source and no presenca creates no block.
10. Blocks sort by non-null `hora`, then `turmaNome`, then `key`; null times sort last.
11. People sort with `localeCompare("pt-BR", { sensitivity: "base" })`, then `key` as the tie breaker.
12. `isAttendanceDayReady` returns false when any expected person has null status, true when all people are marked, and true when there are no expected people.

Assert complete objects, including `key`, `aulaId`, `presencaId`, source ids, nulls, and status.
Use `turma:<uuid>` for a current class key, `aula:<uuid>` for a deleted-turma historical class key, `contato:<uuid>` for a live contact row key, and `presenca:<uuid>` for an orphaned-contact row key.

- [ ] Run the domain test before creating `attendance-domain.ts`.

```bash
npm run test -- src/features/relatorios/attendance-domain.test.ts
```

Expected Red: module resolution fails for `attendance-domain.ts`.

### Green

- [ ] Implement strict ISO weekday parsing without local-time conversion.

Accept only real `YYYY-MM-DD` dates, construct with `Date.UTC`, and compare reconstructed UTC parts.
Throw `RangeError("Invalid attendance date: <value>")` for an invalid date.
Use `getUTCDay()`, where Sunday is 0 and Wednesday is 3, matching `turmas.dia` and the existing seed.

- [ ] Implement class candidate derivation.

Start with current turmas whose `dia` equals the selected weekday.
Add a current turma when at least one avulsa has the selected `data`, status exactly `Confirmada`, and that `turma_id`.
For every same-date aula that already has a current candidate or has at least one saved presenca, merge it into `turma:<id>` when its `turma_id` still resolves to a current turma, including when current schedule and source data no longer make that turma expected.
Expose its `aulaId` and `turma_nome` snapshot on the merged candidate.
Add `aula:<id>` when the aula has at least one saved presenca and cannot be associated with a current turma.
Do not render a standalone empty aula that has no current class source.

- [ ] Implement roster merge with explicit precedence.

For each expected class, sort current `Ativa` and `Nova` matriculas by id and add them first.
Then sort selected-date `Confirmada` avulsas by id and add them only when that contact is not already present.
Finally merge saved presencas by `contato_id`, applying their `status`, `presencaId`, and `contato_nome` snapshot without replacing a current matricula origin.
Add saved-only and null-contact records from their persisted origin and source ids.
Do not synthesize a `?` person when a current source has no contact row.

- [ ] Implement deterministic sorting and readiness.

Sort people by normalized Portuguese name and stable key.
Sort classes by time ascending with null last, then normalized name and stable key.
`isAttendanceDayReady` must use all rows in all blocks and return the natural `every` result, including true for an empty roster.

- [ ] Run the focused tests.

```bash
npm run test -- src/features/relatorios/attendance-domain.test.ts
npx eslint src/features/relatorios/attendance-domain.ts src/features/relatorios/attendance-domain.test.ts --max-warnings=0
```

Expected Green: all twelve behaviors pass and lint exits zero.

- [ ] Add `src/features/relatorios/attendance-domain.ts` and `src/features/relatorios/attendance-api.ts` to the existing `mutate` array in `stryker.config.mjs` without removing its current targets or changing runner, reporters, concurrency, or color settings.
- [ ] Do not run mutation testing inside this slice.
The integrated feature boundary runs it exactly once after both waves pass.

### Refactor

- [ ] Extract only small internal helpers for validated weekday, class identity, person merge, and comparison while keeping the exported surface exact.
- [ ] Re-run the two commands above after refactoring.

## Task 3: Load without writes and persist occurrence plus attendance

**Files:**

- Create: `src/features/relatorios/attendance-api.test.ts`
- Create: `src/features/relatorios/attendance-api.ts`

**Consumes:** `deriveAttendanceDay`, the public domain types, `supabase`, `ensureNoError`, and the two new database table types.

**Produces:** `attendanceDayQueryKey`, `loadAttendanceDay`, `upsertAula`, and `upsertAttendance` exactly as declared above.

### Red

- [ ] Create table-specific Supabase chain mocks before the API module.

Give `turmas`, `matriculas`, `avulsas`, `aulas`, `contatos`, and `presencas` independent chain objects so concurrent calls cannot consume another table's mock result.
Mock `select`, `in`, `eq`, `upsert`, and `single` only where that table uses them.
Return fixtures typed with `satisfies Row<...>`.

- [ ] Lock the read contract with these tests.

1. `attendanceDayQueryKey("2026-08-26")` equals `[
  "attendance-day",
  "2026-08-26",
]`.
2. `loadAttendanceDay` first selects all turmas, selects matriculas filtered with `.in("status", ["Ativa", "Nova"])`, selects avulsas filtered by `.eq("data", data).eq("status", "Confirmada")`, and selects aulas filtered by `.eq("data", data)`.
3. When ids exist, it selects contatos with one deduplicated `.in("id", sortedContatoIds)` and presencas with one deduplicated `.in("aula_id", sortedAulaIds)`.
4. When either id list is empty, it does not issue that empty `.in` request and passes an empty source array to the domain.
5. Listing returns the exact result of `deriveAttendanceDay`.
6. Listing calls no `insert`, `update`, `upsert`, or mutation helper, proving date navigation is read-only.
7. An error from every one of the six read boundaries is propagated through `ensureNoError` with the original message.

- [ ] Lock occurrence and attendance persistence with these tests.

1. `upsertAula` calls `.upsert({ data, turma_id, turma_nome }, { onConflict: "data,turma_id", ignoreDuplicates: true })`.
2. It then reads the canonical aula with `.select("*").eq("data", data).eq("turma_id", turmaId).single()` so a concurrent existing row is returned without overwriting its snapshot.
3. `upsertAttendance` awaits `upsertAula` before calling the presencas table.
4. It calls `.upsert({ aula_id, contato_id, contato_nome, status, origem, matricula_id, avulsa_id }, { onConflict: "aula_id,contato_id" }).select("*").single()` and returns the row.
5. A failed presenca upsert rejects with its original message after the successful aula upsert, documenting that the empty occurrence is reusable.
6. A failed aula upsert or canonical aula lookup prevents any presenca write.
7. A matricula origin with non-null `avulsaId`, or an avulsa origin with non-null `matriculaId`, rejects with `RangeError` before any write.

- [ ] Run the API test before creating `attendance-api.ts`.

```bash
npm run test -- src/features/relatorios/attendance-api.test.ts
```

Expected Red: module resolution fails for `attendance-api.ts`.

### Green

- [ ] Implement `loadAttendanceDay` as two read-only phases.

Phase one runs the four independent filtered reads for turmas, matriculas, avulsas, and aulas with `Promise.all`.
Call `ensureNoError` for every result before using its data.
Build sorted, deduplicated contact ids from the current matricula and avulsa rows, and sorted, deduplicated aula ids from same-date aulas.
Phase two loads only the required contatos and presencas in parallel, skipping a query when its id list is empty.
Pass the six arrays and `data` to `deriveAttendanceDay`.
Do not import or call `upsertAula` or `upsertAttendance` from the listing path.

- [ ] Implement snapshot-preserving `upsertAula`.

Use `ignoreDuplicates: true` so a conflict does not update `turma_nome` or timestamps.
After the upsert succeeds, select by both conflict columns and return the canonical row.
Treat a null row or any Supabase error as an error through the existing boundary pattern.

- [ ] Implement ordered attendance persistence.

Validate origin and cross-origin source ids before the first write.
Await `upsertAula` with `data`, `turmaId`, and `turmaNome`.
Then upsert one presenca by `aula_id,contato_id` with the exact snapshot, status, origin, and source fields.
Return the selected row.
Do not catch and replace Supabase error messages.

- [ ] Run API, domain, type, and lint checks.

```bash
npm run test -- src/features/relatorios/attendance-api.test.ts src/features/relatorios/attendance-domain.test.ts
npm run typecheck
npx eslint src/features/relatorios/attendance-api.ts src/features/relatorios/attendance-api.test.ts src/features/relatorios/attendance-domain.ts src/features/relatorios/attendance-domain.test.ts src/lib/database.types.ts --max-warnings=0
```

Expected Green: all commands exit zero.

### Refactor

- [ ] Keep read helpers private and table-specific.
- [ ] Preserve the exact public interface and the write-free call graph of `loadAttendanceDay`.
- [ ] Re-run the commands above after refactoring.

## Gate 2 verification

The separate Verify agent runs the locked behavioral oracles and changed-file lint in run-once mode:

```bash
npm run test -- src/features/relatorios/attendance-domain.test.ts src/features/relatorios/attendance-api.test.ts
npm run typecheck
npx eslint src/features/relatorios/attendance-domain.ts src/features/relatorios/attendance-domain.test.ts src/features/relatorios/attendance-api.ts src/features/relatorios/attendance-api.test.ts src/lib/database.types.ts stryker.config.mjs --max-warnings=0
git diff --check "$(git merge-base main HEAD)" HEAD -- supabase/schema.sql supabase/migrations/20260826220000_add_aulas_presencas.sql supabase/tests/attendance-schema.sql src/lib/database.types.ts src/features/relatorios/attendance-domain.ts src/features/relatorios/attendance-domain.test.ts src/features/relatorios/attendance-api.ts src/features/relatorios/attendance-api.test.ts stryker.config.mjs
```

The Verify agent must also run the Task 1 temporary PostgreSQL upgrade oracle and fresh-schema oracle.
Both containers must be removed by their cleanup traps, and `docker ps --filter name=parla-attendance --format '{{.Names}}'` must print nothing afterward.

Inspect the complete committed diff:

```bash
git diff --name-only "$(git merge-base main HEAD)" HEAD
git diff --unified=100 "$(git merge-base main HEAD)" HEAD -- supabase/schema.sql supabase/migrations/20260826220000_add_aulas_presencas.sql supabase/tests/attendance-schema.sql src/lib/database.types.ts src/features/relatorios/attendance-domain.ts src/features/relatorios/attendance-api.ts stryker.config.mjs
```

PASS requires exactly the nine canonical paths in frontmatter.
PASS also requires no modification to existing table definitions or policies beyond inserting the two new table entries beside them, no UI or React Query file, no package change, no Supabase seed change, and no command or code path that applies a migration remotely.
The mutation configuration must retain every existing target and add both attendance production modules so the feature-boundary run measures the new domain and persistence code.
The per-wave gate remains responsible for the full test suite, full lint, build, and production dependency security audit on integrated `main`.

The suggested atomic commit is `feat: add attendance domain and persistence`.
