---
run: 2026-08-26-compact-report-header
milestone: m1
flow: quick
mode: discuss
status: completed
base_commit: 084a325442d034e62421ff58aacd302bd9d7cf89
implementation_commit: d48fb5dfef7e75ba4c49df2744d700bb598f7f53
merge_commit: 5b88a07cfa8a4249e0ea23f3294e0f72686efbcc
started: 2026-08-26T20:52:43Z
completed_at: 2026-08-26T21:13:56Z
plan: nexo/plans/2026-08-26-compact-report-header.md
---

# Compact daily report header

## Frame

Make the sidebar and content headers the same height, give the content header a white surface, remove active-page descriptions, and move daily report date and completion controls into one header row.

## Gate 1

Approved by the user on 2026-08-26.

## Slice log

- `2026-08-26-compact-report-header`: done.

## Resultado

A fatia alinhou em 80 px os headers desktop da sidebar e do conteúdo, removeu os subtítulos globais do header e moveu os controles do relatório diário para uma única linha compacta.

O card antigo de data foi removido, e a navegação por anterior, calendário, próximo e Hoje continua sincronizando URL e dados sem criar relatórios vazios.

A conclusão `Tudo anotado!` continua persistindo e reabrindo corretamente.

## Gate 2

Status: PASS.

- O Verify independente aprovou 57 testes unitários em 16 arquivos.
- O Verify independente aprovou 12 de 12 testes E2E Playwright.
- Lint com `--max-warnings=0` passou.
- Build de TypeScript e Vite passou.
- `npm audit --omit=dev --audit-level=high` passou com 0 vulnerabilidades.
- Os sete baselines exigidos foram inspecionados e aprovados, incluindo o popover opaco e sem clipping e o relatório mobile sem overflow horizontal.
- O relatório completo está em `nexo/runs/2026-08-26-compact-report-header/verify.md`.

## Commits

- Base: `084a325442d034e62421ff58aacd302bd9d7cf89`.
- Implementação: `d48fb5dfef7e75ba4c49df2744d700bb598f7f53`.
- Merge em `main`: `5b88a07cfa8a4249e0ea23f3294e0f72686efbcc`.

## Aprendizados

- O `Button` customizado exigiu mover `buttonVariants` para um módulo separado, permitindo o uso pelo Calendar sem violar a regra de Fast Refresh.
- O Date Picker shadcn é uma composição dos componentes oficiais Radix `Calendar` e `Popover`, em vez de um controle nativo isolado.
- A remoção global dos subtítulos do header afetou outras rotas e exigiu atualizar testes e snapshots de Admin e Tarefas para cobrir a mudança compartilhada.

## Capture

Run concluído sem blockers registrados em `AUDIT.md`.
