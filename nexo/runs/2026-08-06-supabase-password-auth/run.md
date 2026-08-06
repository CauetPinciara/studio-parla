---
id: 2026-08-06-supabase-password-auth
milestone: m1
mode: autopilot
status: verifying
---

# Supabase password auth run

## Frame

Remover Google OAuth e usar somente contas com e-mail e senha criadas pelo administrador no Supabase.
A allowlist e o RLS permanecem como a camada de autorização.

## Slice log

- supabase-password-auth: Red confirmou ausência dos campos de credenciais e presença do fluxo Google; Green passou com 3 testes do gate, 15 testes totais, lint, typecheck, build e 3 E2E.
- A varredura do código-fonte e do runbook não encontrou Google OAuth nem chave privilegiada.
- `.env.local` e a alteração do usuário em `supabase/schema.sql` permaneceram fora do stage.
