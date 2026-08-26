# Verify - 01-workspace-selector-contract

Verdict: PASS

Started: 2026-08-25T21:27:25Z

Target commit: `48238b8d40452b422192ed6fead8b375d9b8d66d`

Merge base with `main`: `0b535bd23375454bf9ece34f97b94746adcf61a0`

## Locked Gate 2 oracles

The commands from the plan's `Oraculos de Gate 2` section ran once, in the declared order, without snapshot-update or snapshot-ignore flags.

| Check | Result | Evidence |
| --- | --- | --- |
| One commit from merge base | PASS | Commit count was 1. |
| Sidebar selector unit oracle | PASS | 1 file passed, 3 tests passed. |
| Shell and Tarefas Chromium oracle | PASS | 4 tests passed with 1 worker. |
| TypeScript typecheck | PASS | `tsc -b --pretty false` exited 0. |
| Diff-scoped ESLint | PASS | ESLint exited 0 with zero warnings allowed. |
| Exact committed file set | PASS | The six declared paths matched exactly. |
| Exact snapshot set | PASS | Only the two declared desktop PNGs changed. |
| Mobile snapshot diff guard | PASS | Neither mobile PNG differs from the merge base. |
| Shell mobile checksum | PASS | Base and HEAD are `1bc1cf2990d3ab52b3a7a366ba628ec22eaba148eb19b957055aa3e6e6ac708d`. |
| Tarefas mobile checksum | PASS | Base and HEAD are `d088884337324e3156ac1a06373814cbb998fa04c883180694f1018caf348fad`. |
| Database scope guard | PASS | No changes to schema, generated database types, or migrations. |
| Git diff check | PASS | No whitespace errors. |
| Port 4173 | PASS | No listener remained after the browser run. |

## Acceptance review

`NativeSelect` renders a native `select`, and `FieldLabel` is connected through the per-instance ID returned by `useId`.
The hint has its own per-instance ID and is connected through `aria-describedby`.
The selector value and navigation links are derived from the current route without local or persisted workspace state.
The three options navigate to `/relatorios`, `/contatos`, and `/visao-geral`, then invoke `onNavigate`, which closes the mobile drawer in `Layout`.
When the route belongs to a hidden workspace, the first visible workspace supplies the selector value, hint, and links without automatic navigation.
The selector contract contains no `tablist`, `tab`, or `aria-selected` workspace semantics.
All twelve common navigation routes share the same `Layout` and `Sidebar`, and the shell oracle exercises their deep-link and reload behavior.
The shell and Tarefas mobile contracts exercise selector navigation within the drawer and confirm that the drawer closes.

## Visual inspection

Both changed PNGs were opened at original detail.

- `shell-desktop.png` is exactly 1440x1000.
  The Workspace label, select, hint, navigation, content grid, and sidebar footer are aligned and readable.
  No horizontal clipping, overlap, or overflow is visible.
- `tarefas-desktop.png` is exactly 1440x900.
  The selector, active Tarefas link, view controls, task table, action controls, and sidebar footer are aligned and readable.
  No horizontal clipping, overlap, or overflow is visible.

The two desktop baselines are genuinely affected because the visible desktop sidebar changed from workspace tabs to the selector.
The remaining Lista and Kanban controls in Tarefas are its valid view switch, not stale workspace tabs.
The reused native select defines a visible `focus-visible` ring, and the inspected label, border, text, and selected navigation state have no broken contrast.
Both mobile baselines remained byte-identical because their final screenshots capture the drawer closed.

## Commit and scope audit

The complete committed diff from the merge base to HEAD contains exactly these paths:

- `src/components/Sidebar.test.tsx`
- `src/components/Sidebar.tsx`
- `tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png`
- `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png`
- `tests/e2e/shell.spec.ts`
- `tests/e2e/tarefas.spec.ts`

There is one atomic commit with subject `feat: replace workspace tabs with selector`.
The commit has no co-author trailer.
Added text and the commit message contain no em dash character.
The committed diff adds no Admin behavior and changes no schema, generated type, migration, dependency, or remote-access path.
The target worktree is clean.
Every test and browser process started by verification exited, and port 4173 is free.
