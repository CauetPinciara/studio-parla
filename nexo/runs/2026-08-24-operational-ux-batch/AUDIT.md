# Autopilot audit - run 2026-08-24-operational-ux-batch

## Planejamento 03-workspace-selector - dispatch perdido

- [ ] O primeiro planejador nao publicou `done: true` dentro de 600 segundos.
- RECOVERY: uma nova tentativa foi aberta dentro do orcamento finito; se ela falhar, a fatia sera estacionada.

## Execute 03-report-daily-ui - dispatch perdido

- [ ] O primeiro executor nao publicou `done: true` dentro de 600 segundos.
- RECOVERY: a branch parcial permaneceu isolada e recebeu uma unica tentativa de conclusao; nada foi integrado em `main` sem novo verdict.

## Execute 04-task-storage-domain - dispatch perdido

- [ ] O primeiro executor nao publicou `done: true` dentro de 600 segundos.
- RECOVERY: schema, tipos, migration, dominio e testes parciais permaneceram isolados; uma nova tentativa deve concluir a API e os oraculos antes de qualquer commit.

## Migration pendente

- [ ] Aplicar `supabase/migrations/20260824140000_add_relatorios_concluido_em.sql` por operador autorizado antes de publicar a conclusao diaria de Relatorios.
- [ ] Aplicar `supabase/migrations/20260824134500_add_tarefas.sql` por operador autorizado antes de publicar a tela de Tarefas.

## Wave 07 - baseline compartilhado ausente

- [ ] A verificacao integrada falhou porque `tarefas-desktop.png` ainda mostrava as tabs antigas depois da troca para o seletor.
- RECOVERY: o merge foi revertido com commit append-only, o ultimo replanejamento finito inseriu a fatia 07.1 com ownership exclusivo do baseline e o plan-check aprovou a nova ordem serial.

## Runtime budget exhausted

Reason: `max_replans:3`.

Unfinished work must be parked and the run must finish without extending the budget.

## Fatias estacionadas

- [ ] Retomar `07-workspace-selector` na branch `feat/2026-08--07-workspace-selector`.
- [ ] Na fatia `07.1-workspace-selector-task-snapshot`, atualizar `tests/e2e/tarefas.spec.ts` para selecionar `operacao` pelo controle `Workspace` no drawer mobile; a branch `feat/2026-08--07.1-workspace-selector-task-snapshot` preserva o baseline desktop correto.
- [ ] Depois de novo Gate 2 e wave completa, executar `08-admin-access` e `09-admin-workspace` para restringir Admin a `cauetpinciara@gmail.com`.
- [ ] Executar mutation testing uma vez quando todas as fatias estiverem verdes.
- [ ] Nao publicar uma release ate aplicar as duas migrations pendentes e concluir as fatias estacionadas.
