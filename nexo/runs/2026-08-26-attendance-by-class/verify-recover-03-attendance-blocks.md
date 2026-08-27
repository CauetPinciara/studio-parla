# Verify recovery: 03-attendance-blocks

## Verdict

PASS.

The recovery at `08342d02bf336429beea0c8865594a8d3ad06bba` satisfies the contrast blocker without changing the global color token or flattening the visual hierarchy.

The merge base is `b6a441dce1468a058d302c2acb2e0818b00346ee`.

## Contrast evidence

The E2E helper reads the target element's computed color with `getComputedStyle`, parses it through a canvas, composites every ancestor background until the result is opaque, composites the foreground alpha, calculates WCAG relative luminance, and rejects any sample below 4.5:1.

It measures real locators for the `Presenças` heading, the schedule/count `CardDescription`, and the `EmptyDescription`.

It therefore tests computed contrast rather than the presence of a CSS class.

The canvas-quantized foreground for the local `text-foreground/70` override is equivalent to `rgba(41, 38, 35, 179/255)`.

| Target | Effective background | Current ratio | Prior `text-muted-foreground` ratio | Result |
| --- | --- | ---: | ---: | --- |
| `Presenças` heading | `rgb(251, 250, 249)` | 5.55:1 | 3.58:1 | PASS |
| Schedule/count `CardDescription` | `rgb(255, 255, 255)` | 5.66:1 | 3.73:1 | PASS |
| `EmptyDescription` | `rgb(251, 250, 249)` | 5.55:1 | 3.58:1 | PASS |

All 3 current samples exceed 4.5:1.

All 3 counterfactual samples using the prior computed `text-muted-foreground` value `rgb(140, 131, 120)` fall below 4.5:1, so the same assertion would have failed the previous values.

Both attendance Cards use the same local `CardDescription` override.

`src/index.css` has zero diff, and the changed-path set contains no global token file.

The six original-resolution baselines preserve hierarchy: the section heading remains small, uppercase, tracked, and subordinate to Card titles, while descriptions remain smaller and lighter than primary copy despite the stronger contrast.

## Command evidence

The requested chained command was executed exactly once and exited 0.

- Playwright: 11 passed, 0 failed, 1 Chromium worker.
- Vitest: 4 files passed, 41 tests passed, 0 failed.
- TypeScript: `tsc -b --pretty false` exited 0.
- ESLint: 7 requested textual paths, 0 warnings and 0 errors.
- Whitespace check: 7 requested textual paths, exit 0.
- Protected diff: 11 protected paths unchanged, exit 0.

The attendance E2E covers persistence, failed upsert, reload, completion gating, empty-day navigation without attendance writes, keyboard operation, orphan history, computed contrast, screenshot comparison, and desktop/mobile overflow assertions.

## Visual review

All 6 PNGs were inspected at original resolution.

- `relatorios-attendance-desktop.png`: 1440 x 1000.
- `relatorios-attendance-mobile.png`: 390 x 844.
- `shell-desktop.png`: 1440 x 1000.
- `shell-mobile.png`: 390 x 844.
- `shell-report-calendar-open.png`: 1440 x 1000.
- `shell-workspace-select-open.png`: 1440 x 1000.

No horizontal overflow, clipped attendance control, text collision, or unintended overlay was found.

Cards precede the summary, mobile ToggleGroups remain fully inside the viewport, names and badges wrap naturally, the Empty stays balanced, and both desktop overlays remain within their intended surfaces.

## Scope and hygiene

The diff contains exactly 13 declared paths: 7 textual paths and 6 PNG baselines.

There are no undeclared paths.

The worktree is clean and remains on `feat/2026-08--03-attendance-blocks` at the expected HEAD.

Port 4173 has 0 listeners.

There are 0 residual Playwright or Vite processes owned by this worktree.

No remote operation was invoked, and Supabase traffic in the E2E was locally mocked.
