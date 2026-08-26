---
feature: workspace-admin-continuation
milestone: m1
run: 2026-08-25-workspace-admin-continuation
mode: autopilot
---

# Workspace and Admin continuation

## Frame

Finish the parked workspace selector and Admin requests without reopening the delivered Relatórios or Tarefas product slices.
The selector slice owns every shared shell and Tarefas test or snapshot affected by removing workspace tabs, so no integration expectation is left in a later snapshot-only slice.

## Planned slices

| Slice | Goal | Dependency |
| --- | --- | --- |
| `01-workspace-selector-contract` | Replace tabs and update all affected functional and visual contracts together. | none |
| `02-admin-access-boundary` | Establish the single superadmin rule and protect `/admin` before any Admin metadata renders. | `01-workspace-selector-contract` |
| `03-admin-workspace` | Expose the authorized Admin workspace and static page through the protected shell. | `02-admin-access-boundary` |

## Design direction

This is a bounded continuation of an approved existing design.
The visual language remains the current Studio Parla shell: compact, warm, quiet and information-led.
The selector replaces the segmented workspace tabs in the same sidebar region, while Admin adds one restrained static destination instead of introducing a second visual system.

## Scope limits

- No new database object, RLS rule, migration or generated database type.
- No administrative data or tools beyond the static placeholder.
- No localStorage, URL flag or session email authorization shortcut.
- No release cut or environment promotion.
