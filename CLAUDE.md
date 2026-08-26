# Project Agent Guidelines

<!-- nexo:managed:start version=4 sha256=02fd055249adb37ac71ec0db87e5e313c575eadc762d972ac81c07a1a398a84b -->
## Nexo workflow contract

Nexo owns the delivery workflow while a Nexo flow is active.
Work moves through Frame, Plan, Execute, Verify, and Capture.
Feature and batch flows plan the complete initial slice set before execution, then adapt only within the finite runtime policy.

The human owns WHAT and why.
The agent owns HOW.
Gate 1 is human approval of WHAT and is skipped only by explicit autopilot.
Gate 2 is local verification and is never skipped.
Gate 3 is the human-approved release cut and is never automatic.

Verification is tiered.
Each slice runs its named locked oracle tests plus lint on changed files.
Each integrated wave runs the full suite, full lint, and security checks once.
Each feature runs mutation testing once after all waves are green.
Execute and Verify use separate agents whenever the host supports them and the user has not explicitly required single-agent execution.

Delivery is local trunk flow.
Verified short-lived branches merge serially to `main` with no pull request and no hosted CI requirement.
Promotion to `staging` and `production` exists only when `nexo/state.json` opts into it, and every promotion is fast-forward-only.
The user never commits by hand because Nexo owns branch, commit, verification, merge, and cleanup.

Autopilot never waits for a human and never expands a budget.
A blocker or exhausted budget is recorded in `AUDIT.md`, unfinished work is parked, owned worktrees and processes are cleaned up, and the run returns a partial completion report.
<!-- nexo:managed:end -->

## Commit convention

Use Conventional Commits such as `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, and `chore:` so Nexo can derive release versions from commit history.

## Execution performance

The user explicitly authorizes agents to choose the most performant in-scope execution strategy for each task.
Prefer direct single-agent execution when delegation, extra worktrees, or orchestration overhead would not reduce wall-clock time.
Use parallel agents only for genuinely independent workstreams, reuse valid plans and verification evidence, and avoid redundant planning or test runs.
When a Nexo flow is explicitly active, apply this performance priority within its mandatory safety and verification gates.
Wall-clock duration alone is not evidence that an agent is looping or blocked.
Never interrupt an active agent merely because a wait timeout elapsed.
Interrupt only when there is concrete evidence of repeated non-progress or a hard block, or when the user explicitly asks to stop.

## Frontend component policy

For every task that changes frontend code, invoke and follow the project-local `shadcn` skill before planning or editing.
Prefer existing shadcn/ui components and compose them according to the installed project base.
Install missing official components through the shadcn CLI after consulting their current documentation.
Do not introduce a raw browser-native control when shadcn/ui provides the requested interaction, unless the user explicitly asks for native behavior.
