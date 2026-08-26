---
run: 2026-08-26-shadcn-workspace-select
milestone: m1
flow: quick
mode: autopilot
status: completed
base_commit: 7a35388
started: 2026-08-26T20:08:35Z
completed: 2026-08-26T20:26:19Z
plan: nexo/plans/2026-08-26-shadcn-workspace-select.md
---

# Shadcn Workspace selector

## Frame

Replace the native Workspace selector that opens an operating-system menu with the project's official shadcn Select component.
Preserve route control, authorization, keyboard access, and mobile drawer behavior.

## Gate 1

Approved by the user with explicit Autopilot authorization on 2026-08-26.

## Slice log

- `2026-08-26-shadcn-workspace-select`: done with Gate 2 PASS and merged into `main`.

## Result

The native Sidebar Workspace control was replaced with the official Radix-based shadcn Select.
The completed control preserves route-controlled values, authorized workspace options, navigation, keyboard access, Admin hiding, and mobile drawer closure.
The implementation was verified and merged into `main` at `d0954dd5b1054db8f66a5230b3cc9d2a7aaf7706`.

## Gate 2 evidence

- The required ordered command `npm test && npm run test:e2e && npm run lint && npm run build && npm audit --omit=dev --audit-level=high` exited `0`.
- Vitest passed 16 files and 57 tests.
- Playwright passed all 11 Chromium E2E tests, including route persistence, authorization, keyboard selection, and mobile drawer behavior.
- ESLint and the production build passed.
- The production dependency audit found 0 vulnerabilities.
- The open-menu visual baseline was opaque, aligned, unclipped, and free from unintended overlap or bleed-through.
- The independent verification report is `nexo/runs/2026-08-26-shadcn-workspace-select/verify.md`.

## Commits

- Base: `7a353880024a46a5bbf4e1378a6e8d73476fb14a`.
- Implementation: `4ab3b823204ab1db87c43e5205bdd0a0aa03e53e` (`fix: replace native workspace selector`).
- Merge to `main`: `d0954dd5b1054db8f66a5230b3cc9d2a7aaf7706`.

## Learnings

- The root `tsconfig.json` must expose the `@/*` path alias so the shadcn CLI resolves the project layout and generates components in the correct directory.
- The CSS popover tokens are required for the Select menu to render with an opaque surface.
