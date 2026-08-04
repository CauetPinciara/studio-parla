# Verify 02 - Supabase auth

Status: PASS

Branch verificada: `feat/02-supabase-auth`.

## Evidências

- `npm run test -- src/lib/supabase.test.ts` terminou com exit code 0: 1 arquivo e 2 testes passaram.
- `npm run lint` terminou com exit code 0 e zero warnings permitidos.
- `npm run build` terminou com exit code 0 sem credenciais Supabase reais.
- `rg -n "service_role|SUPABASE_SERVICE" src .env.example supabase/schema.sql` não encontrou ocorrências e terminou com exit code 1, conforme esperado para uma busca sem resultados.

## Contrato inspecionado

- `supabase/schema.sql` contém as nove tabelas do contrato: `app_members`, `contatos`, `turmas`, `matriculas`, `workshops`, `inscricoes`, `avulsas`, `pecas` e `relatorios`.
- RLS está habilitado nas nove tabelas.
- A allowlist usa `is_member()`, com leitura protegida de `app_members` e policies completas protegidas nas oito tabelas de domínio.
- `supabase/seed.sql` existe e contém dados iniciais idempotentes.
- `Database` declara `Row`, `Insert` e `Update` para todas as nove tabelas.
- O cliente usa `VITE_SUPABASE_ANON_KEY`, é tipado com `Database` e possui valores locais de fallback para build sem ambiente real.
- `AuthProvider` oferece login Google por OAuth e consulta a allowlist.
- `Protected` bloqueia o conteúdo interno até configuração, sessão e confirmação da allowlist; o componente envolve todas as rotas do app.

## Observação

O build emitiu apenas o aviso não bloqueante de chunk maior que 500 kB.
Nenhum segredo privilegiado foi encontrado no cliente pelos termos exigidos.
