# Execute 01: contrato do seletor de workspace

## Resultado

PASS.
O seletor nativo controlado pela rota substitui as tabs, e os contratos compartilhados do shell e de Tarefas foram atualizados na mesma fatia.

## Estado inicial

- Worktree: `.worktrees/2026-08-25-workspace-admin-continuation/01-workspace-selector-contract`.
- Branch: `feat/2026-08--01-workspace-selector-contract`.
- Base: `0b535bd23375454bf9ece34f97b94746adcf61a0`.
- O worktree estava limpo e a porta 4173 estava livre.

## RED 1 observado

Os tres testes de `Sidebar.test.tsx` foram escritos antes de qualquer mudanca em producao.

```bash
npm run test -- src/components/Sidebar.test.tsx -t "seletor acessível de workspace"
```

Resultado: FAIL, 3 testes falharam.
O controle rotulado ainda era um `tablist`, nao tinha valor e `selectOptions("cadastros")` falhou porque nao existia um select com opcoes.

## RED 2 observado

Os contratos de shell e Tarefas foram alterados ainda contra as tabs atuais.

```bash
npm run test:e2e -- tests/e2e/shell.spec.ts tests/e2e/tarefas.spec.ts --project=chromium --workers=1 --ignore-snapshots --grep "mantém os três workspaces e a rota ativa após recarregar|oferece navegação móvel sem perder contexto|mantém Tarefas legível em desktop e mobile"
```

Resultado: FAIL, 3 testes falharam.
O shell desktop reportou que Workspace nao era input, o shell mobile reportou que o elemento nao era select e Tarefas reproduziu o mesmo erro no drawer mobile.

## GREEN

`Sidebar` passou a usar `Field`, `FieldLabel`, `NativeSelect` e ids de `useId`.
A rota define o valor controlado, `visibleWorkspaces` limita as opcoes e usa a primeira visivel como fallback sem navegacao automatica.
A selecao navega ao `defaultPath` e chama `onNavigate`, preservando o fechamento do drawer.

```bash
npm run test -- src/components/Sidebar.test.tsx -t "seletor acessível de workspace"
npm run test:e2e -- tests/e2e/shell.spec.ts tests/e2e/tarefas.spec.ts --project=chromium --workers=1 --ignore-snapshots --grep "mantém os três workspaces e a rota ativa após recarregar|oferece navegação móvel sem perder contexto|mantém Tarefas legível em desktop e mobile"
```

Resultado: PASS, 3 testes unitarios e 3 testes E2E passaram.

## Snapshots e inspecao visual

Um unico comando de update regenerou somente `shell-desktop.png` e `tarefas-desktop.png`.
Os dois testes visuais passaram durante o update.

- `shell-desktop.png` mede 1440x1000.
- `tarefas-desktop.png` mede 1440x900.
- Os dois PNGs foram inspecionados em tamanho original.
- O seletor preserva densidade, cores e espacamento do Studio Parla.
- Label, controle, item ativo, tabelas e acoes estao alinhados e sem clipping ou overflow visivel.
- `shell-mobile.png` permaneceu com SHA-256 `1bc1cf2990d3ab52b3a7a366ba628ec22eaba148eb19b957055aa3e6e6ac708d`.
- `tarefas-mobile.png` permaneceu com SHA-256 `d088884337324e3156ac1a06373814cbb998fa04c883180694f1018caf348fad`.

## Commit atomico

Commit criado:

```text
48238b8d40452b422192ed6fead8b375d9b8d66d
feat: replace workspace tabs with selector
```

Nenhum coautor foi adicionado.

## Gate 2 apos o commit

O range verificado foi `0b535bd23375454bf9ece34f97b94746adcf61a0` ate `48238b8d40452b422192ed6fead8b375d9b8d66d`.

- O range contem exatamente um commit.
- O teste unitario passou com 3 de 3.
- O Playwright serial sem update passou com 4 de 4.
- `npm run typecheck` passou.
- O ESLint dos quatro arquivos TypeScript e TSX passou com zero warnings.
- O range contem exatamente os seis caminhos declarados no plano.
- O range contem exatamente os dois snapshots desktop declarados.
- Os dois snapshots mobile sao identicos entre merge-base e HEAD por diff e SHA-256.
- Schema, tipos gerados e migrations nao mudaram no range.
- `git diff --check "$slice_base" HEAD` passou.
- O worktree terminou limpo e a porta 4173 ficou livre.

## Arquivos commitados

- `src/components/Sidebar.tsx`
- `src/components/Sidebar.test.tsx`
- `tests/e2e/shell.spec.ts`
- `tests/e2e/tarefas.spec.ts`
- `tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png`
- `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png`

Nenhum schema, tipo gerado, migration, dependencia, plano Nexo ou servico remoto foi alterado.
