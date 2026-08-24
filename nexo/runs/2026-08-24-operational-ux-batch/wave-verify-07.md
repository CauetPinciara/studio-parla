# Wave Verify: wave-07

Verdict: FAIL

## Target and isolation

- Verified `main` `HEAD` is `0f1ade8ae625aa70951ea5014c3605bfe8357400`.
- `git worktree list` showed only the root repository.
- A scan under `.worktrees` found no test or spec files that could duplicate test discovery.
- Existing working-tree changes were confined to Nexo artifacts, and source remained unchanged after verification.

## Gate result

The exact command was run once without watch or snapshot-update flags:

```bash
npm test && npm run test:e2e && npm run lint && npm run build && npm audit --omit=dev --audit-level=high
```

The chain exited with status 1 during `npm run test:e2e`.

- Unit tests passed: 13 files and 36 tests.
- Playwright ran 8 Chromium tests using 1 worker.
- Seven E2E tests passed.
- `mantém Tarefas legível em desktop e mobile` failed at `tarefas-desktop.png` with 3,192 differing pixels, approximately 1 percent of the image.
- Because the chain uses `&&`, full lint, production build, and production dependency audit did not run and have no exit codes for this attempt.

## Failure diagnosis

- The expected 1440 by 900 task desktop baseline still shows the former workspace tabs.
- The received stable 1440 by 900 image shows the newly integrated labeled workspace selector.
- The generated diff isolates the sidebar selector area and displaced navigation text.
- This is deterministic integrated snapshot drift caused by the Wave 07 selector change.
- Slice 07 updated `shell-desktop.png`, but `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png` also captures the desktop sidebar and was not updated.
- No snapshot update was performed during verification.

## Safety and cleanup

- No migration, database command, or remote service was accessed.
- Port 4173 has no listening process after the failed run.
- No Playwright, browser, Vite 4173, watcher, or worker process group started by verification remains.

The integrated Wave 07 Gate is not green until the intentional task desktop baseline is regenerated, reviewed, and the full gate passes.
