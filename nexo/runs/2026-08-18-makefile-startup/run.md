---
id: 2026-08-18-makefile-startup
milestone: m1
mode: autopilot
status: done
---

# Makefile startup run

## Frame

Create a root Makefile whose default target starts the Studio Parla development system with the repository's canonical `npm run dev` command.
The user-visible acceptance check is that invoking `make` reaches Vite startup without requiring a named target.

## Preflight

Nexo managed-context validation stopped the run before planning or implementation because both managed instruction files are stale.
No Makefile, test, branch, commit, merge, push, or long-running process was created.

## Resumption

Nexo Init synchronized the managed instructions, and the mandatory preflight now passes.
Autopilot resumed this original single-slice run.

## Execute

Red: `make --dry-run` exited 2 because the repository had no Makefile.
Green: the minimal default `dev` target delegates to `npm run dev`.
The isolated startup probe invoked plain `make`, received an HTTP success response from Vite at `http://localhost:5173/`, and terminated the spawned process group.

## Capture

The first Gate 2 attempt failed solely because trailing whitespace and one blank line at EOF in the generated `context-pack.md` caused `git diff --check main...HEAD` to fail.
The generator-artifact normalization commit `f644a43` removed only that whitespace and preserved the artifact's non-whitespace content.
The final Gate 2 retry at `f644a43` passed the full locked command, including the startup probe, unit tests, lint, build, zero-vulnerability audit, and browser E2E suite.
The delivered product behavior is a root `Makefile` whose default phony `dev` target executes exactly `npm run dev`, so plain `make` starts the existing Vite development server without a named target.
Merge and push remain owned by the orchestrator.
