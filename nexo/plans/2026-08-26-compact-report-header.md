---
id: 2026-08-26-compact-report-header
milestone: m1
status: done
depends_on: []
files_modified: [package.json, package-lock.json, src/components/Layout.tsx, src/components/Sidebar.tsx, src/components/ui/button.tsx, src/components/ui/button-variants.ts, src/components/ui/calendar.tsx, src/components/ui/popover.tsx, src/features/relatorios/RelatorioDayHeader.tsx, src/features/relatorios/RelatoriosPage.tsx, tests/e2e/admin.spec.ts, tests/e2e/relatorios.spec.ts, tests/e2e/shell.spec.ts, tests/e2e/__screenshots__/admin.spec.ts/admin-desktop.png, tests/e2e/__screenshots__/admin.spec.ts/admin-mobile.png, tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png, tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png, tests/e2e/__screenshots__/shell.spec.ts/shell-workspace-select-open.png, tests/e2e/__screenshots__/shell.spec.ts/shell-report-calendar-open.png, tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png, tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-mobile.png]
acceptance: "Given any desktop route, when the shell renders, then the sidebar brand header and white content header have the same 80px height and the content header has no page subtitle; given the daily report route, when a date is selected with arrows, Today, or the shadcn calendar, then the URL and page data follow that date while all date controls and Tudo anotado remain in one header row and the old date card is absent."
must_not_break: [Workspace navigation and authorization remain unchanged, daily report completion persists, desktop and mobile controls remain accessible, no blank report is created by date navigation]
rules: [Use the project-local shadcn skill, use official Radix-based Calendar and Popover, write the failing test before implementation, do not implement attendance in this slice]
verifier_focus: "Inspect the desktop and mobile report headers for equal shell heights, white background, a single compact control row, an opaque unclipped calendar popover, and no old report date card."
---

# Compact daily report header

Align the desktop shell headers at 80px, remove page subtitles from the content header, and replace the report date card with one inline shadcn date-control row in the content header.

The locked oracle is the daily report Playwright flow, supported by focused shell component tests and desktop and mobile visual snapshots.

Attendance, class occurrence generation, and database changes are explicitly out of scope.
