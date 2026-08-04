# Project Agent Guidelines

<!-- nexo:managed:start -->
## Nexo workflow

Work proceeds in small, reversible slices through:
**Frame -> Plan -> Human Gate -> Execute (Red -> Green -> Refactor) -> Verify -> Capture.**

The human decides what to build.
The agent decides how to build it.
Do not implement until the human approves the plan, unless the user explicitly selects Nexo autopilot.

### Three gates

1. The human approves the plan and its test contract.
2. A separate Verify agent runs the relevant tests, lint, and security checks locally.
   This gate is never skipped.
3. The human approves every release cut and production promotion.
   Autopilot stops at `main` and never releases automatically.

### Engineering rules

- Start every feature or fix with a failing test that represents user-visible behavior as closely as possible.
- Implement the smallest change that makes the test pass.
- Refactor only while the suite is green.
- Use short-lived local branches and integrate verified changes into `main`.
- Do not add hosted CI workflows or branch protection as part of Nexo.
- Use Conventional Commits such as `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, and `chore:`.
- The user never commits by hand.
  Nexo owns branching, commits, local verification, integration, and pushes.
- Keep Nexo plans, runs, decisions, doubts, playbooks, and milestone records under `nexo/`.
<!-- nexo:managed:end -->
