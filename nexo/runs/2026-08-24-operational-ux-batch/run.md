---
run: 2026-08-24-operational-ux-batch
flow: batch
mode: autopilot
milestone: m1
status: parked
started: 2026-08-24T00:00:00-03:00
---

# Operacao e administracao

## Frame

Entregar quatro melhorias de uso diario: relatorios navegaveis por data com confirmacao de preenchimento, tarefas em lista e Kanban, seletor unico de workspace e area administrativa exclusiva do superadmin.

## Acceptance

- A tela de relatorios abre no dia atual, navega entre datas sem exigir a criacao manual de um dia e persiste a confirmacao "Tudo anotado!".
- A area Operacao oferece Tarefas em lista e Kanban com status, datas de abertura e conclusao, responsavel, titulo e descricao.
- O workspace e escolhido por um seletor acessivel que navega ao destino inicial de cada area.
- O workspace Admin aparece e e acessivel apenas para `cauetpinciara@gmail.com`.

## Scope limits

- Sem notificacoes, anexos, comentarios, prioridades ou drag-and-drop nas tarefas.
- Sem gestao de permissoes pela interface nesta primeira versao.
- Sem promocao para staging ou producao neste fluxo.

## Slice log

| Slice | Status | Plan | Verify |
| --- | --- | --- | --- |
| 01-report-date-rules | done | ready | PASS |
| 02-report-completion-storage | done | ready | PASS |
| 03-report-daily-ui | done | ready | PASS |
| 04-task-storage-domain | done | ready | PASS |
| 05-task-ui | done | ready | PASS |
| 06-task-route-e2e | done | ready | PASS |
| 07-workspace-selector | parked | ready | FAIL |
| 07.1-workspace-selector-task-snapshot | parked | ready | FAIL |
| 08-admin-access | parked | ready | blocked |
| 09-admin-workspace | parked | ready | blocked |

## Capture

Seis fatias foram verificadas, integradas e enviadas para `main`.
Relatorios diarios e Tarefas estao entregues no ultimo estado verde.
O seletor de workspace, sua correcao visual e as duas fatias de Admin foram estacionados quando o limite `max_replans:3` foi atingido.
O conteudo de produto em `main` e identico ao commit verde `809fbf4a78e034dee1c3554ce8eb96dbc3468ca7`; os commits posteriores registram apenas as tentativas e reversoes append-only do seletor.
Mutation testing nao foi iniciado depois da exaustao do orcamento, conforme o contrato do Autopilot.
