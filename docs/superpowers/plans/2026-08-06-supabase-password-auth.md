# Supabase Password Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Google OAuth with an administrator-managed Supabase email and password login while preserving the allowlist and RLS authorization.

**Architecture:** `AuthProvider` keeps ownership of Supabase sessions and exposes a typed password sign-in operation. `Protected` renders the accessible login form and owns only submission feedback. The database schema remains unchanged because authorization continues to use the authenticated JWT email through `is_member()`.

**Tech Stack:** React 19, TypeScript strict, Supabase JS, Testing Library, Vitest, Playwright, ESLint, Vite.

## Global Constraints

Do not modify or stage `.env.local`.
Preserve the user's real email changes already present in `supabase/schema.sql` without staging that file.
Do not add signup, invitations, SMTP, password recovery, Google OAuth, administrative keys or `service_role`.
Keep all user-facing copy in Portuguese.
Use `signInWithPassword({ email, password })` from the existing typed Supabase client.
Keep authorization based on `app_members` and the existing RLS policies.

---

### Task 1: Password login and operational runbook

**Files:**
- Create: `src/components/Protected.test.tsx`
- Modify: `src/lib/auth.tsx`
- Modify: `src/components/Protected.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: the existing `supabase` client, `Session`, `Row<"app_members">`, `AuthProvider`, `useAuth` and `Protected` gate.
- Produces: `AuthContextValue.signInWithPassword(email: string, password: string): Promise<void>` and a login form with the accessible fields `E-mail`, `Senha` and button `Entrar`.

- [ ] **Step 1: Write the failing user-visible test**

Create `src/components/Protected.test.tsx` with a mocked authenticated context boundary and assert that a user can type into `E-mail` and `Senha`, submit `Entrar`, and cause `signInWithPassword("catarina@example.com", "senha-segura")` exactly once.
Assert that the rendered screen contains no button or text matching `Google`.
Add a rejection case where the mocked operation throws and the screen shows `E-mail ou senha inválidos.` without exposing the underlying Supabase message.

- [ ] **Step 2: Run the oracle and confirm Red**

Run `npm run test -- src/components/Protected.test.tsx`.
Expected result: FAIL because `Protected` still renders `Entrar com Google` and `useAuth` does not expose `signInWithPassword`.

- [ ] **Step 3: Implement the typed auth operation**

In `src/lib/auth.tsx`, replace the context property `signInWithGoogle` with:

```ts
signInWithPassword: async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
},
```

Keep session discovery, auth-state subscription, membership lookup, access errors and logout unchanged.

- [ ] **Step 4: Implement the accessible form**

In `src/components/Protected.tsx`, add local `email`, `password`, `submitting` and `loginError` state.
Submit through a semantic `<form>` so Enter works.
Use `type="email"`, `autoComplete="email"`, `type="password"` and `autoComplete="current-password"`.
Disable the submit button while pending and display `Entrando…` during submission.
On rejection, show `E-mail ou senha inválidos.` in an alert and keep the form available for retry.
Remove `LogIn`, `Entrar com Google` and all Google-specific copy.

- [ ] **Step 5: Update the runbook**

In `README.md`, replace the Google section with Supabase-only instructions:

1. Open Authentication > Sign In / Providers > Email and keep Email enabled.
2. Disable `Allow new users to sign up`.
3. Open Authentication > Users, create one confirmed user for every email in `app_members`, and assign a strong initial password.
4. Explain that password reset is administered in the Supabase dashboard because SMTP and in-app recovery are intentionally out of scope.

Remove every Google Cloud, OAuth Client ID, OAuth Secret and Authorized JavaScript origins instruction.
Keep the existing local development and Cloudflare deployment steps, with no authentication redirect configuration required for password login.

- [ ] **Step 6: Verify Green and regressions**

Run:

```bash
npm run test -- src/components/Protected.test.tsx
npm run test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Expected result: all commands PASS and the existing visual snapshots remain unchanged outside the login gate.

- [ ] **Step 7: Security and scope checks**

Run:

```bash
rg -n "signInWithOAuth|signInWithGoogle|Entrar com Google|Google Cloud|OAuth client|service_role|SUPABASE_SERVICE_ROLE" src README.md .env.example
git diff --check
git status --short
```

Expected result: no Google or privileged-key matches in product and runbook files, no whitespace errors, and the user's pre-existing `supabase/schema.sql` and `.env.local` changes remain unstaged.

- [ ] **Step 8: Commit**

Stage only `src/lib/auth.tsx`, `src/components/Protected.tsx`, `src/components/Protected.test.tsx`, `README.md` and Nexo run artifacts.
Commit with `feat: use Supabase password authentication`.
