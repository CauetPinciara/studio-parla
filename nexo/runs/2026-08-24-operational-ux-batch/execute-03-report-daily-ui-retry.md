# Execute evidence: 03-report-daily-ui retry

Status: PASS

## TDD evidence

The initial report E2E run failed all three locked cases against the historical list UI.
Observed failures were the absent canonical `?data=2026-08-04` URL, absent daily piece blocks, and absent accessible day controls.

The implementation replaces the list with URL-driven daily navigation, preserves all three piece workflows, adds editable daily notes, and persists reversible `Tudo anotado!` state.

## Final oracles

Command: `npm run test:e2e -- tests/e2e/relatorios.spec.ts --project=chromium`

Result: exit 0, three tests passed.

Command: `npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium`

Result: exit 0, three tests passed, including both snapshot comparisons without updates.

Command: `npm run typecheck`

Result: exit 0.

Command: `npx eslint src/features/relatorios/RelatorioForm.tsx src/features/relatorios/RelatoriosPage.tsx tests/e2e/relatorios.spec.ts tests/e2e/shell.spec.ts --max-warnings=0`

Result: exit 0 with no warnings or errors.

## Visual and process checks

The 1440x1000 and 390x844 PNGs were inspected after update.
Portuguese date casing was corrected, controls remain visible, and the mobile page has no horizontal overflow.
All Supabase REST traffic is intercepted in E2E.
Port 4173 has no listening process after verification.

## Files touched

- `src/features/relatorios/RelatorioForm.tsx`
- `src/features/relatorios/RelatoriosPage.tsx`
- `tests/e2e/relatorios.spec.ts`
- `tests/e2e/shell.spec.ts`
- `tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png`
- `tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png`
