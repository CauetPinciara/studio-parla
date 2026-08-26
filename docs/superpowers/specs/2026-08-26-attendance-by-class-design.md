# Attendance by class design

## Goal

The daily report must show one attendance block per class expected on the selected date.
Each block must automatically list the people expected from active or new enrollments and confirmed one-off bookings.
Catarina must be able to mark each person as present or absent without manually recreating the class roster.

## Approved experience

The report date header remains one line and loses the text `Dia selecionado`.
The date navigation group is centered in the content header.
The date label uses the format `Quarta Feira, 26/08/2026` on desktop.
The action `Ir para hoje` appears only when the selected date is not today.
The `Tudo anotado!` action stays at the right edge of the header.

Attendance appears before the daily summary.
Classes are ordered by time and rendered as separate shadcn Card compositions.
Each card shows the class name, time, expected-person count, and one row per person.
Each person has an origin Badge and a single-choice shadcn ToggleGroup with `Presente` and `Faltou`.
An official shadcn Empty state explains dates without expected classes.

## Domain model

An `aula` is a dated occurrence of a recurring `turma`.
It is distinct from the recurring class registration because presence belongs to a specific date.
An aula is created lazily on the first attendance mutation, so navigating between dates remains read-only.
The pair `data` and `turma_id` uniquely identifies an aula.

A `presenca` belongs to one aula and initially references one contact.
Its status is either `presente` or `faltou`.
Its origin is either `matricula` or `avulsa` and retains the corresponding source identifier when available.
The pair `aula_id` and `contato_id` is unique, preventing duplicate attendance for the same person in one class.
It stores a `contato_nome` snapshot so historical attendance remains understandable if the contact is later deleted.

## Automatic roster

A class block is expected when its turma weekday matches the selected date.
A turma referenced by a confirmed one-off booking for the selected date also creates a block, even if its recurring weekday differs.

The expected roster includes enrollments with status `Ativa` or `Nova` for that turma.
It also includes one-off bookings with the selected date, the turma, and status `Confirmada`.
If the same contact appears through both sources, the person appears once and the enrollment origin wins.
Saved attendance is included in the roster even if its original enrollment or booking later changes, preserving historical records.
People are ordered by name.

## Persistence and security

The database adds `aulas` and `presencas` tables with foreign keys, checks, unique constraints, timestamps, row-level security, and the existing member-only access policy.
Deleting a turma keeps historical aula rows by setting `turma_id` to null only if the schema can still preserve a stable class label.
To avoid losing the class identity, aula stores a `turma_nome` snapshot when it is created.
Deleting a contact sets the presence reference to null and retains the name snapshot.

The frontend first upserts the aula by `data,turma_id`, then upserts the attendance by `aula_id,contato_id`.
An empty aula created before a failed attendance request is harmless and can be reused by the next attempt.
React Query invalidates the attendance-day query after a successful mutation.
Errors use the existing Sonner error pattern.

The migration is committed to the repository but is not applied to the remote database automatically.
Applying a database migration remains a human-gated deployment action.

## Completion semantics

`Tudo anotado!` continues to represent completion of the whole daily report.
When the selected date has expected people, completing the day is disabled until every expected person has either `Presente` or `Faltou` recorded.
Reopening an already completed day remains available.
Dates without expected people retain the current completion behavior.

## Boundaries

This feature does not add class cancellation, rescheduling, substitute teachers, make-up classes, bulk attendance, or attendance analytics.
It does not change the existing enrollment and one-off booking forms.
It does not apply the migration to Supabase remotely.

## Testing

Domain tests cover weekday matching, confirmed one-off bookings, status filtering, deduplication, historical attendance, sorting, and completion readiness.
API tests cover aula upsert, attendance upsert, listing, and error propagation.
Playwright covers the centered header, conditional `Ir para hoje`, exact desktop date format, two class blocks, automatic rosters, presence persistence, completion gating, empty dates, and mobile overflow.
Visual baselines cover desktop and mobile report layouts.

## Alternatives considered

Storing attendance directly inside `relatorios.resumo` was rejected because it is not queryable and cannot preserve relational integrity.
A single `presencas` table keyed only by date and turma was rejected because it lacks a first-class class occurrence for future cancellation or rescheduling.
Creating all future aulas in advance was rejected because it creates large amounts of speculative data and complicates schedule changes.
