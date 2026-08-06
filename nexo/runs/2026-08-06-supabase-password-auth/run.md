---
id: 2026-08-06-supabase-password-auth
milestone: m1
mode: autopilot
status: complete
---

# Supabase password auth run

## Frame

Remover Google OAuth e usar somente contas com e-mail e senha criadas pelo administrador no Supabase.
A allowlist e o RLS permanecem como a camada de autorização.

## Slice log

- supabase-password-auth: Red confirmou ausência dos campos de credenciais e presença do fluxo Google; Green passou com 3 testes do gate, 15 testes totais, lint, typecheck, build e 3 E2E.
- A varredura do código-fonte e do runbook não encontrou Google OAuth nem chave privilegiada.
- `.env.local` e a alteração do usuário em `supabase/schema.sql` permaneceram fora do stage.
- Gate 2: PASS pelo Verify independente no commit `aa3d93f` (`feat: use Supabase password authentication`).
- Comandos aprovados: `npm run test -- src/components/Protected.test.tsx`, `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e` e `git diff --check`.
- Red confirmou o fluxo Google anterior; Green entregou login por e-mail e senha, feedback seguro e a remoção de Google OAuth, preservando `.env.local` e a alteração do usuário em `supabase/schema.sql` fora do stage.
