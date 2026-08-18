---
id: makefile-startup
milestone: m1
status: doing
depends_on: []
files_modified:
  - Makefile
acceptance: "Given the repository root, when the user runs plain make, then Make invokes the canonical npm run dev command and Vite starts without requiring a named target."
goal: "Provide one-command local startup through make."
must_not_break:
  - Existing npm scripts and direct npm run dev usage.
rules:
  - Keep the Makefile limited to the requested default startup behavior.
verifier_focus: "Prove plain make reaches a live Vite server and cleanly stop the entire spawned process group."
---

# Makefile startup

Create a root `Makefile` whose default phony `dev` target runs `npm run dev`.

## Test contract

Red is plain `make` failing because no Makefile exists.
Green is `make --dry-run` printing `npm run dev` and an isolated process-group probe showing plain `make` reaches a responsive Vite server.
Gate 2 runs the startup probe, unit tests, lint, build, zero-vulnerability audit, and browser E2E suite.

## Scope limit

Do not add dependency installation, environment generation, alternate targets, or deployment behavior.
