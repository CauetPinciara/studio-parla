# Execute evidence: 07-workspace-selector

Status: PASS

## Red

Command: `npm run test -- src/components/Sidebar.test.tsx -t "seletor acessível de workspace"`

Result: exit 1 with 3 expected failures.
The old tablist had no controlled select value, native options, unique control IDs, or filtered-workspace fallback.

Command: `npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium --grep "mantém os três workspaces e a rota ativa após recarregar|oferece navegação móvel sem perder contexto|preserva o shell visual"`

Result: exit 1 with the two functional tests failing against the old tablist and the unchanged visual test passing.

## Green

The Sidebar now derives its selected workspace from the current route and visible options.
When the route workspace is hidden, it displays the first visible workspace without navigating automatically.
Selection searches only visible options, navigates to the selected default path, then invokes `onNavigate` so the mobile drawer closes.

Focused component result: 3 tests passed.
Focused functional browser result: 2 tests passed with one worker before baseline updates.

## Visual verification

The exact shell grep was run once with `--update-snapshots` after functional Green.
All 3 tests passed.
The desktop baseline changed to show the native controlled selector.
The mobile baseline was exercised but remained byte-identical because its drawer is closed.

Both 1440x1000 and 390x844 PNGs were inspected at original size.
Desktop has a clear Workspace label, full-width native control, associated route hint, preserved active link, and consistent shell density.
Mobile remains legible and unchanged outside the drawer.

## Gate 2

Commands:

`npm run test -- src/components/Sidebar.test.tsx -t "seletor acessível de workspace"`

`npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium --grep "mantém os três workspaces e a rota ativa após recarregar|oferece navegação móvel sem perder contexto|preserva o shell visual"`

`npx eslint src/components/Sidebar.tsx src/components/Sidebar.test.tsx tests/e2e/shell.spec.ts --max-warnings=0`

`git diff --check`

Result: exit 0.
Vitest passed 3 tests, Playwright passed 3 tests serially, scoped ESLint passed, and `git diff --check` passed.
Port 4173 is released and no server, watcher, worker, or process group started by this execution remains.

## Files touched

- `src/components/Sidebar.tsx`
- `src/components/Sidebar.test.tsx`
- `tests/e2e/shell.spec.ts`
- `tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png`

Inspected but unchanged: `tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png`.
