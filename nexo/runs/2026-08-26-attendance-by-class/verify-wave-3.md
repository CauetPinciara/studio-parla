# Verify Wave 3

- Run: `2026-08-26-attendance-by-class`
- Slice: `wave-3`
- Verdict: `PASS`
- Started: `2026-08-27T01:11:21.475Z`
- Ended: `2026-08-27T01:15:40.277Z`
- Branch: `main`
- Verified HEAD: `69a3df72f770ca756e55b33183b22a233efb79c7`
- Comparison base: `8a595171`

## Integrated change

`git diff 8a595171 HEAD` contains exactly one changed file, `stryker.config.mjs`, with one added property.
The only integrated addition is `ignorePatterns: ["/.agents", "/.claude"]`.
The protected diff outside `stryker.config.mjs` is empty and `git diff --check 8a595171 HEAD` is clean.
Preexisting user files and not-yet-captured Nexo artifacts reported by `git status` were ignored as instructed.

## Mutation sandbox contract

The run-once Node oracle imported the real Stryker configuration and passed.
The five mutation targets remain exact and ordered:

1. `src/features/fechamento/domain.ts`
2. `src/features/pecas/domain.ts`
3. `src/features/visao-geral/domain.ts`
4. `src/features/relatorios/attendance-domain.ts`
5. `src/features/relatorios/attendance-api.ts`

The two root-relative exclusions are exactly `/.agents` and `/.claude`.
The configuration still has exactly the six keys `allowConsoleColors`, `concurrency`, `ignorePatterns`, `mutate`, `reporters`, and `testRunner`.
`testRunner` remains `vitest`, reporters remain `clear-text` and `progress`, concurrency remains `2`, and `allowConsoleColors` remains `false`.
No `src` path, unit test, or Vitest dependency was added to the exclusions.
Mutation testing was not executed in this wave, as required by the boundary contract.

## Integrated command

The following command was executed exactly once and exited with code 0:

```bash
npm test && npm run test:e2e && npm run lint && npm run build && npm audit --omit=dev --audit-level=high
```

Results:

- Vitest: 18 test files passed, 91 tests passed, 0 failed.
- Playwright: 16 E2E passed in Chromium, 0 failed.
- ESLint: exit code 0 with `--max-warnings=0`.
- TypeScript and Vite build: exit code 0, with 3,096 modules transformed.
- Production dependency audit: 0 vulnerabilities.

## UI, visual baselines, and contrast

All 16 E2E scenarios passed against the complete application.
The six feature-relevant visual baselines passed unchanged: four shell states and the desktop and mobile attendance states.
The four additional Admin and Tarefas baselines also passed, for 10 repository baselines covered in total.
All 10 baseline images were visually inspected without an evident crop, overlap, overflow, or broken responsive layout.
The attendance E2E contrast assertion passed with its WCAG AA threshold of 4.5.
No snapshot was updated.

## Isolation and cleanup

`git worktree list --porcelain` reports only the primary repository worktree, so no worktree for this run remains.
No `.stryker-tmp` directory exists in the repository.
No Stryker or Vitest process remains.
The Playwright web server and browser started by this verification terminated with the test command.
Port 4173 was free before and after the integrated command.
A Vite process for this repository on port 5173 was already running since 2026-08-25 and was not started or modified by this verification.

## Verdict

PASS.
Wave 3 satisfies the sandbox configuration contract and the integrated regression, visual, accessibility, build, and security gates at the exact expected HEAD.
The next boundary may run mutation testing once, but mutation testing was intentionally not part of this wave verification.
