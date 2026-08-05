---
id: 2026-08-04-studio-parla-app
milestone: m1
mode: autopilot
status: complete
---

# Studio Parla app run

## Frame

Migrar o protótipo para a stack fechada, preservando dados, regras e interface, e deixar apenas as integrações externas para o runbook final.

## Slice log

O planejamento detalhado está em `nexo/plans/studio-parla-app/`.

- 01-shell-visual: PASS no teste de navegação, lint e build; commit `366081d`.
- 02-supabase-auth: PASS no teste de configuração, lint, build e varredura de segredos; commit `bcebd0b`.
- 03-cadastros: PASS no teste público, lint, build e revisão dos seis módulos CRUD; commit `8e119cb`.
- 04-operacao: PASS no teste da máquina de estados, lint, build e revisão dos relatórios; commit `04c2f1e`.
- 05-tatica-entrega: implementação concluída nos commits `c0e89d7` e `087069d`; testes locais, lint, build, E2E e mutação passaram antes do Gate 2 independente.

## Verificação de mutação

Os domínios de fechamento, fluxo de peças e visão geral alcançaram 100% de mutation score.
Foram mortos 145 de 145 mutantes na versão integrada final, sem sobreviventes, timeouts ou trechos sem cobertura.

## Gate 2

O primeiro rerun visual encontrou uma variação de 91 pixels causada pela data corrente no cabeçalho.
O relógio do Playwright foi fixado no teste, sem alterar a data dinâmica do produto.
O mesmo agente Verify executou dois reruns E2E verdes e repetiu testes unitários, lint, typecheck, build e `git diff --check` com PASS.
