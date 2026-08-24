# Execute 07.1: snapshot desktop de Tarefas

## Resultado

FAIL.
O baseline desktop foi regenerado corretamente e o ownership permaneceu estrito, mas o oraculo visual bloqueado nao pode ficar Green sem alterar o teste, acao proibida por esta fatia.

## Estado inicial

- Worktree: `.worktrees/2026-08-24-operational-ux-batch/07.1-workspace-selector-task-snapshot`.
- Branch: `feat/2026-08--07.1-workspace-selector-task-snapshot`.
- O worktree estava limpo.
- A porta 4173 estava livre.
- SHA-256 mobile antes do update: `d088884337324e3156ac1a06373814cbb998fa04c883180694f1018caf348fad`.

## RED observado

Comando:

```bash
npm run test:e2e -- tests/e2e/tarefas.spec.ts --project=chromium --grep "mantém Tarefas legível em desktop e mobile"
```

Resultado: FAIL esperado na comparacao de `tarefas-desktop.png`.
O Playwright reportou 3.192 pixels diferentes, proporcao 0,01, na assercao desktop da linha 221.
Nenhum arquivo havia sido alterado antes desse Red.

## Update unico

Comando:

```bash
npm run test:e2e -- tests/e2e/tarefas.spec.ts --project=chromium --grep "mantém Tarefas legível em desktop e mobile" --update-snapshots
```

O Playwright regenerou somente `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png`.
Depois de aceitar o novo desktop, o mesmo teste atingiu o fluxo mobile e expirou esperando `getByRole("tab", { name: "Operação" })` na linha 226.
A fatia 07 removeu esse papel ao substituir tabs pelo seletor nativo Workspace.
O plano e a ordem de execucao proíbem alterar `tests/e2e/tarefas.spec.ts`, entao o bloqueio nao pode ser corrigido dentro deste ownership.

## Inspecao visual

O PNG regenerado foi aberto e inspecionado em tamanho original, 1440x900.
O seletor Workspace cabe na sidebar, o estado ativo de Tarefas esta claro, os controles e a tabela estao alinhados, o texto nao esta cortado e nao ha overflow horizontal visivel.

## Rerun sem update

Comando:

```bash
npm run test:e2e -- tests/e2e/tarefas.spec.ts --project=chromium --grep "mantém Tarefas legível em desktop e mobile"
```

Resultado: FAIL apos 30 segundos.
A comparacao desktop passou e a falha ocorreu no fluxo mobile pelo mesmo locator obsoleto de tab na linha 226.

## Verificacoes finais

- `git diff --name-only` contem somente `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png`.
- `tarefas-desktop.png` mede exatamente 1440x900.
- SHA-256 mobile depois do update: `d088884337324e3156ac1a06373814cbb998fa04c883180694f1018caf348fad`.
- `git diff --exit-code -- tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-mobile.png` passou.
- `git diff --exit-code -- tests/e2e/tarefas.spec.ts` passou.
- `git diff --check` passou.
- `! lsof -nP -iTCP:4173 -sTCP:LISTEN` passou.

## Arquivo alterado

- `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png`.

Nenhum codigo, teste, outro PNG, plano Nexo, servico remoto ou banco foi alterado.
