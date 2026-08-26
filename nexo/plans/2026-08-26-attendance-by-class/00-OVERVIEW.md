---
feature: attendance-by-class
milestone: m1
status: doing
---

# Attendance by class

## Frame

Refine the daily report header and turn the selected date into an operational attendance view grouped by class.
The feature removes manual roster reconstruction and preserves attendance against dated class occurrences.

## Approval

The user approved automatic class blocks and asked Nexo to continue in autopilot.
Gate 1 is skipped for this run.

## Acceptance

- The header has no `Dia selecionado`, centers date navigation, uses `Quarta Feira, 26/08/2026`, and only shows `Ir para hoje` away from today.
- A selected date shows one block per expected turma, populated from active or new enrollments and confirmed one-off bookings.
- Catarina can persist `Presente` or `Faltou` per person, and saved history remains visible after source data changes.
- `Tudo anotado!` cannot complete a day while an expected person is unmarked, but completed days can be reopened.
- Desktop and mobile remain visually correct and accessible.

## Slice index

| Slice | Goal | Depends on |
| --- | --- | --- |
| `01-report-header-refinement` | Apply the exact conditional and centered date-header behavior. | None |
| `02-attendance-domain` | Add dated class occurrences, attendance persistence, and roster derivation. | None |
| `03-attendance-blocks` | Compose automatic shadcn class cards, marking controls, and completion gating. | `01`, `02` |

## Execution waves

- Wave 1 runs `01-report-header-refinement` and `02-attendance-domain` in parallel because their canonical `files_modified` sets do not overlap.
- Wave 2 runs `03-attendance-blocks` only after both Wave 1 slices are green and integrated.

## Scope limits

No class cancellation, rescheduling, substitutes, make-up classes, bulk marking, or analytics.
The migration is authored and verified locally but not applied to the remote database.

## Design

The approved design is in `docs/superpowers/specs/2026-08-26-attendance-by-class-design.md`.

## Feature boundary

After both waves pass their integrated verification, run `npm run test:mutation` exactly once.
The slice 02 plan extends `stryker.config.mjs` without removing existing targets so this command includes `attendance-domain.ts` and `attendance-api.ts`.
