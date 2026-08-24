---
id: 07-workspace-selector
milestone: m1
status: parked
depends_on: [06-task-route-e2e]
files_modified: [src/components/Sidebar.tsx, src/components/Sidebar.test.tsx, tests/e2e/shell.spec.ts, tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png, tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png]
acceptance: "Dado qualquer caminho do app, quando a Sidebar aparece, entao um unico seletor acessivel chamado Workspace reflete a rota atual; escolher Operacao, Cadastros ou Tatica navega ao destino inicial e fecha o drawer movel; se a rota atual pertencer a um workspace oculto em visibleWorkspaces, o seletor usa a primeira opcao visivel sem expor valor invalido."
goal: "Substituir as tabs por um seletor nativo controlado pela rota e seguro para listas filtradas."
must_not_break: ["Links do workspace ativo, aria-current, deep links, reload, Sair e drawer movel.", "Shell e navegacao de Tarefas entregues ate a fatia 06."]
rules: ["Usar NativeSelect, Field, FieldLabel e useId existentes.", "Nao persistir workspace em estado local ou localStorage.", "Nao adicionar Admin, autorizacao ou dependencia de UI nesta fatia."]
verifier_focus: "Confirmar ausencia de tablist, tab e aria-selected, associacao de label e dica, fallback para workspace visivel e fechamento do drawer."
---

# Seletor unico de workspace

## Escopo

Alterar somente a escolha de workspace na `Sidebar`.
`visibleWorkspaces` continua opcional e nao vazio, com `WORKSPACES` como padrao.
O workspace ativo e o item de navegacao devem usar a primeira opcao visivel quando o workspace derivado da rota nao estiver em `visibleWorkspaces`.
Esse fallback nao altera a URL sozinho e impede um `<select>` controlado sem `<option>` correspondente.

## Red

1. Criar `Sidebar.test.tsx` com a suite `seletor acessível de workspace` usando `MemoryRouter` e `userEvent`.
2. Provar label, dica por `aria-describedby`, valor controlado pela rota, ids unicos em duas instancias e ausencia de papeis de tab.
3. Selecionar os tres workspaces e provar os destinos `/relatorios`, `/contatos` e `/visao-geral`, alem de `onNavigate`.
4. Montar `/precos` com apenas Operacao e Tatica visiveis e exigir fallback para Operacao, somente duas opcoes e nenhum acesso a Cadastros.
5. Atualizar apenas as assercoes de workspace nos dois testes funcionais de `shell.spec.ts` e registrar FAIL contra as tabs atuais.

## Green

1. Adicionar `visibleWorkspaces?: readonly Workspace[]` a `SidebarProps`.
2. Resolver `routeWorkspace` pela rota e `activeWorkspace` pela lista visivel, com fallback em `visibleWorkspaces[0]`.
3. Substituir as tabs por um `NativeSelect` rotulado `Workspace`, com ids de `useId` para o controle e a dica.
4. Procurar a escolha somente na lista visivel, navegar ao `defaultPath` e chamar `onNavigate` depois da selecao.
5. Filtrar os links pelo `activeWorkspace.id` e remover imports, handlers e atributos exclusivos das tabs.
6. Atualizar os baselines do shell somente depois dos testes funcionais verdes e revisar desktop e mobile.

## Oraculos de Gate 2

```bash
npm run test -- src/components/Sidebar.test.tsx -t "seletor acessível de workspace"
npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium --grep "mantém os três workspaces e a rota ativa após recarregar|oferece navegação móvel sem perder contexto|preserva o shell visual"
npx eslint src/components/Sidebar.tsx src/components/Sidebar.test.tsx tests/e2e/shell.spec.ts --max-warnings=0
git diff --check
```

Para gerar os baselines durante Green, usar o mesmo grep com `--update-snapshots` uma unica vez.
Nenhum teste pode reintroduzir tabs ou aceitar um valor fora de `visibleWorkspaces`.
