# Plan check replan 07.1

## Verdict

PASS

The inserted slice closes exactly the deterministic desktop snapshot drift recorded by Wave 07 without expanding product or test scope.

## Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Failure alignment | PASS | `wave-verify-07.md` reports that only `tarefas-desktop.png` failed after the workspace selector changed shared sidebar pixels. The new acceptance updates that baseline and rejects any other cause or changed artifact. |
| Minimal ownership | PASS | `files_modified` contains only `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png`. The final diff is required to contain only that file. |
| Locked browser oracle | PASS | The existing Playwright test `mantém Tarefas legível em desktop e mobile` already captures `tarefas-desktop.png` at 1440x900 and `tarefas-mobile.png` at 390x844. The plan runs it first without update, once with update, and again without update for Gate 2. |
| Mobile guard | PASS | The plan records and compares the mobile SHA-256 checksum, requires `git diff --exit-code` for the mobile PNG, and repeats the guard in Gate 2. The current mobile checksum matches the replan evidence: `d088884337324e3156ac1a06373814cbb998fa04c883180694f1018caf348fad`. |
| No code or test expansion | PASS | The plan forbids changes to `tests/e2e/tarefas.spec.ts`, product code, other snapshots and dependencies. Gate 2 explicitly requires a clean diff for the test file and no refactor. |
| Dependency insertion | PASS | `07.1-workspace-selector-task-snapshot` depends only on `07-workspace-selector`. `08-admin-access` now depends on 07.1, while 09 remains after 08. |
| Wave graph | PASS | The required installed `waves.sh` exited 0 with strict order `01 -> 02 -> 03 -> 04 -> 05 -> 06 -> 07 -> 07.1 -> 08 -> 09`. Each wave contains one slice, so there are no intra-wave file conflicts or parallel Playwright writers. |
| Acceptance coverage | PASS | Slices 01 through 07 and 08 through 09 retain the original report, task, selector and Admin outcomes. Slice 07.1 adds only the previously uncovered integrated desktop visual baseline and protects the already-correct mobile result. |

No execution blocker, dependency error, file conflict or acceptance gap remains in this replan.
