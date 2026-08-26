---
id: 2026-08-26-shadcn-workspace-select
milestone: m1
status: done
depends_on: []
files_modified: [package.json, package-lock.json, tsconfig.json, src/test/setup.ts, src/components/ui/select.tsx, src/components/Sidebar.tsx, src/components/Sidebar.test.tsx, src/index.css, tests/e2e/shell.spec.ts, tests/e2e/admin.spec.ts, tests/e2e/tarefas.spec.ts, tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png, tests/e2e/__screenshots__/shell.spec.ts/shell-workspace-select-open.png, tests/e2e/__screenshots__/admin.spec.ts/admin-desktop.png, tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png, CLAUDE.md]
acceptance: "Given the Workspace control on desktop or mobile, when it is opened, then the application renders a styled shadcn Select overlay instead of the operating system's native select, preserves the active route and authorized options, navigates to each workspace, and closes the mobile drawer after selection."
must_not_break: [Admin remains hidden from unauthorized members, direct and reload navigation remain route-controlled, existing non-workspace native selects remain unchanged]
rules: [Use the installed local shadcn skill for frontend changes, use the official Radix-based shadcn Select, follow test-first development]
verifier_focus: "Confirm the Workspace control is no longer a native select, its overlay is visually contained on desktop and mobile, and all navigation and authorization behavior remains intact."
---

# Replace the native Workspace selector with shadcn Select

Replace only the Sidebar Workspace control with the official shadcn Select component while preserving its established navigation and authorization behavior.

The locked oracle is `src/components/Sidebar.test.tsx`, supported by the shell, Admin, and Tarefas Playwright flows and their affected visual snapshots.

The living project guidance will record the user's requirement that the local shadcn skill is used for every frontend modification.
