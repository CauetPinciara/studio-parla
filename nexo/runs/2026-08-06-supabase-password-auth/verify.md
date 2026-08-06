# Verify - Supabase password auth

Status: PASS.

Verified commit: `aa3d93ff68e3f967c5ca5b9cc1a6e45500d3e02f` on `feat/supabase-password-auth`.

## Automated checks

- `npm run test -- src/components/Protected.test.tsx` passed: 1 file and 3 tests.
- `npm run test` passed: 7 files and 15 tests.
- `npm run lint` passed with zero warnings.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run test:e2e` passed: 3 Chromium tests.
- `git diff --check` passed.

## Acceptance review

- `src/lib/auth.tsx` invokes `supabase.auth.signInWithPassword({ email, password })`.
- `src/components/Protected.tsx` presents required e-mail and password fields, and submits them through that password sign-in function.
- Failed sign-in errors are replaced with the safe message `E-mail ou senha inválidos.`, without exposing the Supabase error detail.
- The protected-component test directly verifies password sign-in, the absence of Google UI, and safe invalid-credential feedback.
- The requested search returned no instances of `signInWithOAuth`, `signInWithGoogle`, `Entrar com Google`, `Google Cloud`, `OAuth client`, `service_role`, or `SUPABASE_SERVICE_ROLE` in `src`, `README.md`, or `.env.example`.
- `README.md` documents Supabase email authentication, user provisioning, disabled public signup, and no in-product signup or password reset.
- The commit diff contains no change to `supabase/schema.sql`.
  Read-only inspection confirms the existing `app_members` allowlist function and all RLS enablement and policies remain present.

## Workspace safety

- `.env.local` remains untracked and outside the index.
- `supabase/schema.sql` remains modified but outside the index; its current change only replaces example allowlist e-mail addresses and was not altered by Verify.
- The index is empty.
- No process started by this Verify run remains.
  A Vite server for this workspace was already running from 12:20:04, before this Verify run began, and was left untouched.
