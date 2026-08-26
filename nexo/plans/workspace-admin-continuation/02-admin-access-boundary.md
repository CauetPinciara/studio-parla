---
id: 02-admin-access-boundary
milestone: m1
status: parked
depends_on: [01-workspace-selector-contract]
files_modified: [src/app/access.ts, src/app/access.test.ts, src/components/AdminAccessBoundary.tsx, src/components/AdminAccessBoundary.test.tsx, src/App.tsx, src/App.test.tsx]
acceptance: "Given a direct visit to /admin, while authentication or allowlist membership is pending no Admin child, Layout, or metadata renders; after confirmation, absent and ordinary identities redirect to DEFAULT_ROUTE without a flash, and only a member.email that normalizes to cauetpinciara@gmail.com can render the authorized placeholder."
goal: "Establish one pure superadmin rule and enforce it before the normal application Layout can observe /admin."
must_not_break:
  - "Protected remains the general authentication and allowlist gate for every ordinary application route."
  - "The development shell preview continues to bypass Protected only for ordinary routes and never bypasses AdminAccessBoundary."
  - "The selector contract from 01-workspace-selector-contract and every existing route keep their current behavior."
rules:
  - "Authorize only from the confirmed member.email returned by useAuth, never from session.user.email, member name, localStorage, query parameters, pathname state, or another client-controlled signal."
  - "Do not add the Admin workspace, navigation item, page, card, data, tools, or Supabase request in this slice."
  - "Do not modify schema, generated database types, migrations, RLS, seed, Supabase configuration, dependencies, or environment files."
  - "Use run-once commands only and leave no server, watcher, browser, or worker running."
verifier_focus: "Attempt authorization with pending, absent, ordinary, and normalized superadmin identities, including deceptive session, name, localStorage, and URL values; prove Layout never renders at /admin before redirect and confirm only the declared six files changed."
---

# Admin access boundary

## Scope and architecture

Create one pure access module and one routing boundary.
The pure module owns the only production literal and the normalization rule.
The boundary consumes the existing `useAuth()` state and makes no Supabase call of its own.

Restructure `App.tsx` so `/admin` is a top-level sibling of the ordinary shell route.
The `/admin` element must be `AdminAccessBoundary` around a temporary `<Navigate to={DEFAULT_ROUTE} replace />` child.
The ordinary route group must continue to render `Layout` behind `Protected`, except for the existing development shell preview behavior.
Because the Admin route is matched before that ordinary group, neither `Protected`, the preview flag, nor `Layout` decides Admin authorization.

The authorized placeholder is intentionally only the redirect child.
Slice `03-admin-workspace` will replace that child with the protected Admin shell and page without moving the boundary below `Layout`.

Do not alter `Protected`, `Layout`, navigation metadata, workspaces, Sidebar, feature pages, authentication state, or data access in this slice.

## Interfaces

`src/app/access.ts` exports exactly:

```ts
export const SUPERADMIN_EMAIL = "cauetpinciara@gmail.com" as const;
export function isSuperadminEmail(email: string | null | undefined): boolean;
```

`isSuperadminEmail` trims surrounding whitespace, normalizes case with `toLowerCase()`, and compares the result with `SUPERADMIN_EMAIL`.
It returns `false` for `null`, `undefined`, empty strings, partial matches, suffixes, prefixes, and every other email.
It has no React, Router, storage, auth, or Supabase dependency.

`src/components/AdminAccessBoundary.tsx` exports:

```ts
export function AdminAccessBoundary({ children }: { children: ReactNode }): ReactNode;
```

The boundary reads only `loading`, `membershipChecked`, and `member` from `useAuth()`.
It must not destructure or inspect `session`.
While `loading` is true or `membershipChecked` is false, it renders `LoadingState` and does not mount `children`.
After membership is confirmed, it renders `children` only when `isSuperadminEmail(member?.email)` is true.
For a missing or unauthorized member, it returns `<Navigate to={DEFAULT_ROUTE} replace />`.

## Red

### 1. Lock the pure rule

Create `src/app/access.test.ts` first.
Add the suite `regra única de superadmin` with named cases that prove:

- the exact lowercase email is accepted;
- leading and trailing whitespace plus mixed case are accepted;
- `null`, `undefined`, an empty value, an ordinary email, a subdomain, and an appended suffix are rejected;
- the exported constant is exactly `cauetpinciara@gmail.com`.

Run:

```bash
npm run test -- src/app/access.test.ts
```

Expected Red: FAIL because `src/app/access.ts` does not exist.

### 2. Lock boundary behavior and hostile inputs

Create `src/components/AdminAccessBoundary.test.tsx` with a mutable `useAuth` mock and `MemoryRouter`.
Use an authorized child containing all three sentinels `Admin`, `Administração`, and `Área administrativa` so every denied state proves that no Admin child or metadata mounted.
Add a location probe so redirects are asserted as `DEFAULT_ROUTE` with replacement behavior rather than inferred from missing content.

Cover these named behaviors:

1. `oculta os filhos enquanto autenticação ou membership estão pendentes` exercises `loading: true` and `membershipChecked: false`, expects `LoadingState`, and proves every sentinel absent.
2. `redireciona identidade ausente ou membro comum sem montar filhos` exercises a null member and an ordinary confirmed member, expects `DEFAULT_ROUTE`, and records zero child renders.
3. `ignora sessão, nome, localStorage e URL como sinais de autorização` supplies the superadmin email simultaneously through `session.user.email`, `member.nome`, localStorage, and `?email=`, while `member.email` remains ordinary, then proves redirect and zero child renders.
4. `renderiza o filho somente para member.email confirmado e normalizado` uses `membershipChecked: true` and `member.email: "  CauetPinciara@GMAIL.COM  "`, then proves the child renders and the location remains `/admin`.

Run:

```bash
npm run test -- src/app/access.test.ts src/components/AdminAccessBoundary.test.tsx
```

Expected Red: FAIL because the access module and boundary do not exist.

### 3. Lock the route position before Layout

Create `src/App.test.tsx` with `MemoryRouter`, the same mutable auth states, a location probe, and controlled mocks for `Protected`, `Layout`, and the default lazy page.
The `Layout` mock must record the pathname on every render, not merely expose final DOM text, so a transient render at `/admin` fails the test even if redirect later removes it.
Clear localStorage before every case and exercise both values of the existing shell preview flag where relevant.

Add these named route tests:

1. `mantém /admin fora do Layout enquanto membership está pendente` stays at `/admin`, shows loading, and records no Layout render for `/admin`.
2. `redireciona /admin para DEFAULT_ROUTE sem flash para identidade ausente ou comum` reaches `/relatorios`, records no Layout render for `/admin`, and never renders an Admin sentinel.
3. `não permite que o shell preview contorne a fronteira Admin` sets `studio-parla-shell-preview=1`, visits `/admin` with an ordinary member, reaches `DEFAULT_ROUTE`, and records no Layout render for `/admin`.
4. `mantém rotas comuns no gate Protected existente` visits `/relatorios` without preview and proves the `Protected` mock receives the ordinary shell, then repeats with preview and proves only that ordinary route bypasses it.

Run:

```bash
npm run test -- src/App.test.tsx
```

Expected Red: FAIL because the current App nests every route under `Layout` and applies the preview or `Protected` decision around the entire route set.

The three test files are locked oracles.
Execute may not delete, skip, weaken, snapshot-replace, or rewrite their denied-state expectations to obtain Green.

## Green

1. Implement `SUPERADMIN_EMAIL` and `isSuperadminEmail` in the pure access module with no dependencies.
2. Implement `AdminAccessBoundary` with the exact pending, allow, and redirect branches described above.
3. Refactor the current `App.tsx` route tree so `/admin` is the guarded top-level sibling and ordinary pages remain nested below a small shell element that applies the existing preview-or-`Protected` choice around `Layout`.
4. Keep `NAVIGATION_ITEMS`, the lazy page map, `DEFAULT_ROUTE`, the index route, the unknown-route fallback, and every existing page element unchanged.
5. Use `<Navigate to={DEFAULT_ROUTE} replace />` as the authorized `/admin` child until slice 03 replaces it.
6. Run all three locked test files until PASS.

## Refactor

Refactor only after all locked tests are green.
Name the ordinary shell wrapper for intent, keep the route tree readable, and avoid a generic authorization framework or role registry.
Remove duplicate test setup only when the denied-state render counters and path probes remain explicit.
Do not move the email rule into auth context or expand `Protected` with Admin responsibility.

Run the complete Gate 2 oracle once more after refactoring.

## Gate 2 oracles

Run each command once in the slice worktree and never in watch mode:

```bash
npm run test -- src/app/access.test.ts src/components/AdminAccessBoundary.test.tsx src/App.test.tsx
npm run typecheck
npx eslint src/app/access.ts src/app/access.test.ts src/components/AdminAccessBoundary.tsx src/components/AdminAccessBoundary.test.tsx src/App.tsx src/App.test.tsx --max-warnings=0
git diff --check "$(git merge-base main HEAD)" HEAD -- src/app/access.ts src/app/access.test.ts src/components/AdminAccessBoundary.tsx src/components/AdminAccessBoundary.test.tsx src/App.tsx src/App.test.tsx
git diff --exit-code "$(git merge-base main HEAD)" HEAD -- supabase src/lib/database.types.ts src/lib/supabase.ts src/lib/auth.tsx package.json package-lock.json
test "$(rg -o --fixed-strings 'cauetpinciara@gmail.com' src --glob '!*.test.ts' --glob '!*.test.tsx' | wc -l | tr -d ' ')" = "1"
npm audit --omit=dev --audit-level=high
```

The first command is the locked behavioral oracle.
The second and third commands prove type and lint correctness for the exact owned files.
The fourth rejects whitespace errors in the declared diff.
The fifth proves that database, Supabase, auth-state, and dependency files stayed untouched.
The sixth is a local security invariant proving a single production email literal.
The final command is the run-once production dependency security audit and must not start an application server or access Supabase.

The separate Verify agent must also inspect:

```bash
git diff --name-only "$(git merge-base main HEAD)" HEAD
git diff --unified=80 "$(git merge-base main HEAD)" HEAD -- src/App.tsx src/components/AdminAccessBoundary.tsx src/app/access.ts
```

PASS requires exactly the six declared files, no `/admin` path observed by `Layout`, no authorization input other than confirmed `member.email`, no Admin workspace or page, and no product remote call.
The per-wave gate still runs the full suite, full lint, build, and security checks once on integrated `main`.

The suggested atomic commit is `feat: guard admin access before layout`.
