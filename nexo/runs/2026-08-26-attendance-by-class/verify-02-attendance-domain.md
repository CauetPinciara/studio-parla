# Verify 02 - Attendance domain

## Veredito

PASS.

A slice `02-attendance-domain` satisfaz os critérios e contratos do plano no commit `36a254e9c519396d0252e182c2cfa10b913729fc`.
Não foram encontrados bloqueadores ou desvios de escopo.

## Escopo inspecionado

- Plano lido: `nexo/plans/2026-08-26-attendance-by-class/02-attendance-domain.md`.
- Diff inspecionado: `main...HEAD` completo, limitado aos nove caminhos canônicos declarados no frontmatter.
- O diff não altera UI, React Query, dependências, seed ou tabelas e políticas existentes fora das inserções necessárias para `aulas` e `presencas`.
- O diff não contém comando, credencial, URL ou caminho de código para aplicar migração em Supabase remoto.
- Nenhum relatório de Execute ou context-pack foi lido.

## Evidência dos contratos

- `aulas_data_turma_id_key` protege a unicidade por `data,turma_id`.
- `presencas_aula_id_contato_id_key` protege a unicidade por `aula_id,contato_id`.
- `turma_nome` e `contato_nome` são snapshots duráveis e não vazios.
- `aulas.turma_id`, `presencas.contato_id`, `presencas.matricula_id` e `presencas.avulsa_id` usam `ON DELETE SET NULL`.
- `presencas.aula_id` usa `ON DELETE CASCADE`.
- Deleções de turma, contato e fontes preservam o histórico e os snapshots de presença.
- RLS está habilitado nas duas tabelas e cada tabela tem a política `membros full` com `public.is_member()` em `using` e `with check`.
- O oráculo SQL confirma que não membros não veem as linhas nem inserem, enquanto membros selecionam e inserem.
- `loadAttendanceDay` usa somente `SELECT`, em duas fases, sem chamada de `insert`, `update`, `upsert` ou helper de mutação.
- Matrículas são filtradas para `Ativa` e `Nova`.
- Avulsas são filtradas para a data selecionada e status `Confirmada`.
- A deduplicação adiciona matrículas antes de avulsas e preserva a origem de matrícula ao mesclar presença salva.
- Presenças salvas mantêm turmas e pessoas históricas visíveis mesmo após remoção das fontes.
- Turmas são ordenadas por horário não nulo, nome em `pt-BR` e chave estável, com horários nulos por último.
- Pessoas são ordenadas por nome em `pt-BR` e chave estável.
- As interfaces públicas de `attendance-domain.ts` e `attendance-api.ts` correspondem exatamente ao contrato consumido pela slice 03.
- O `stryker.config.mjs` preserva os alvos existentes e adiciona os dois módulos de produção de attendance.

## Oráculo combinado bloqueado

O comando fornecido foi executado exatamente uma vez no worktree da slice e terminou com exit code 0.

- Caminho de upgrade PostgreSQL 17: `ROLLBACK` alcançado.
- Caminho de schema fresh PostgreSQL 17: `ROLLBACK` alcançado.
- Vitest: 2 arquivos passaram e 33 testes passaram.
- TypeScript: `npm run typecheck` terminou sem erro.
- ESLint: todos os arquivos bloqueados terminaram sem warning ou erro.
- `git diff --check`: terminou sem erro.

## Integridade e limpeza

- HEAD inicial e final: `36a254e9c519396d0252e182c2cfa10b913729fc`.
- O worktree permaneceu limpo.
- Os containers temporários `parla-attendance-verify-upgrade-*` e `parla-attendance-verify-fresh-*` foram removidos pelo trap.
- Nenhum processo iniciado por este Verify permaneceu em execução.
- Nenhuma operação remota Supabase foi executada.

## Horários

- Início: `2026-08-26T22:57:37Z`.
- Fim: `2026-08-26T23:00:44Z`.
