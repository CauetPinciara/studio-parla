---
id: supabase-password-auth
milestone: m1
status: ready
acceptance: "Um membro entra com e-mail e senha pelo Supabase, Google OAuth desaparece do produto e do runbook, credenciais inválidas recebem feedback seguro, e a allowlist com RLS permanece inalterada; o teste de Protected, a suíte, lint, typecheck, build, E2E e a varredura de segurança passam."
---

# Supabase password auth

Fatia única em autopilot.
O oráculo bloqueado é `src/components/Protected.test.tsx` e deve reproduzir o envio do formulário como um usuário final antes da implementação.
O executor não pode modificar nem adicionar ao stage `.env.local` ou a alteração do usuário em `supabase/schema.sql`.
O plano detalhado está em `docs/superpowers/plans/2026-08-06-supabase-password-auth.md`.
