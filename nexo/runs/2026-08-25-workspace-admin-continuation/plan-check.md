# Plan check

Verdict: FAIL

## Blocking findings

1. Slice `01-workspace-selector-contract` does not verify the committed slice diff.
Its Gate 2 commands at lines 225-227 and its exact-file inspection at line 233 use plain `git diff`, so a separate verifier can miss committed changes to mobile snapshots, database files, or any undeclared path.
Nexo execution creates slice commits before verification, so these checks must compare `$(git merge-base main HEAD)` with `HEAD`, as slices 02 and 03 already do.

2. Slice `03-admin-workspace` does not lock its Red phase with exact run-once commands.
Lines 161-162 only say to run the unit tests and functional E2E without snapshots, leaving the executor to choose the files and flags.
The plan needs explicit unit and Playwright Red commands, including one worker and ignored snapshots for the functional Red, plus the expected valid failure for each command.

## Checks that passed

- The three slices collectively match the Frame and do not add database, remote-service, release, or promotion scope.
- Slice 01 owns `Sidebar`, shell and Tarefas functional tests, and the two affected desktop baselines together.
- Slice 02 declares all required Nexo frontmatter and exports the exact `SUPERADMIN_EMAIL`, `isSuperadminEmail(email)`, and `AdminAccessBoundary({ children })` contracts.
- Slice 03 consumes those access contracts without owning their source files, keeps `/admin` outside the ordinary route tree, and covers pending, absent, ordinary, and confirmed superadmin identities without Admin metadata or content flashes.
- The Admin page is constrained to static content with no data access or actions.
- `files_modified` paths are canonical and cover the planned App, Layout, Sidebar, tests, and snapshots.
- `waves.sh` derives three serial waves in the order 01, 02, 03, with no cycle, dangling dependency, or same-wave overlap.
- All required frontmatter keys are present, acceptance statements are observable, and no em dash occurs in the reviewed Frame or plans.
