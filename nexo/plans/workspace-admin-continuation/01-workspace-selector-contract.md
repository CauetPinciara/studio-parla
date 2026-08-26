---
id: 01-workspace-selector-contract
milestone: m1
status: done
depends_on: []
files_modified: [src/components/Sidebar.tsx, src/components/Sidebar.test.tsx, tests/e2e/shell.spec.ts, tests/e2e/tarefas.spec.ts, tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png, tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png]
acceptance: "Dado qualquer deep link comum no desktop ou no drawer movel, quando a Sidebar aparece, entao existe um unico select nativo acessivel chamado Workspace que reflete a rota; selecionar Operacao, Cadastros ou Tatica navega ao defaultPath correspondente e depois fecha o drawer; uma rota pertencente a workspace oculto usa a primeira opcao visivel sem navegar sozinha; os contratos funcionais e visuais de shell e Tarefas usam a nova semantica, somente os baselines desktop realmente afetados mudam e todos os oraculos passam sem update de snapshots."
goal: "Substituir as tabs por um seletor de workspace controlado pela rota e atualizar atomicamente todo contrato compartilhado afetado."
must_not_break:
  - "Deep links, reload, rota ativa por aria-current, links do workspace ativo, Sair e fechamento do drawer movel."
  - "CRUD, Lista, Kanban, navegacao e responsividade de Tarefas entregues no batch anterior."
  - "Os baselines shell-mobile.png e tarefas-mobile.png permanecem byte a byte inalterados."
  - "A pagina continua sem overflow horizontal em 1440x1000, 1440x900 e 390x844."
rules:
  - "Seguir Red, Green e Refactor, mudando primeiro os contratos de usuario e observando falha contra as tabs atuais antes de tocar em Sidebar.tsx."
  - "Usar Field e FieldLabel de src/components/ui/field.tsx, NativeSelect de src/features/shared/FormParts.tsx e useId do React, sem criar outro primitive de select."
  - "A rota e a unica fonte de verdade; nao usar estado local, localStorage, sessionStorage ou query string para persistir workspace."
  - "visibleWorkspaces permanece opcional; fallback de rota oculta usa a primeira opcao visivel sem navegacao automatica."
  - "Nao cherry-pickar os commits estacionados nem copiar seus PNGs; c7d6981 e 84d3052 sao somente evidencia historica e os baselines devem ser regenerados pelo navegador."
  - "Nao adicionar Admin, autorizacao, dependencia, schema, migration, tipo gerado ou acesso remoto nesta fatia."
  - "Executar Playwright uma unica vez por comando, com um worker, sem servidor persistente, e liberar a porta 4173 ao terminar."
  - "Todo guard de scope, arquivo exato, banco e snapshot mobile deve comparar o merge-base de main com HEAD depois do commit atomico da fatia, nunca apenas o working tree."
verifier_focus: "Provar label, dica, ids unicos, valor derivado da rota, ausencia total de tablist/tab/aria-selected, destinos e onNavigate, fallback de visibleWorkspaces, navegacao mobile do shell e de Tarefas, ownership exato dos dois PNGs desktop em todo o range commitado, checksums mobile inalterados, inspecao visual original e porta 4173 livre."
---

# Contrato atomico do seletor de workspace

> **Para o executor Nexo:** usar test-driven-development dentro desta fatia e manter os testes alterados como oraculos bloqueados durante Green e Refactor.

**Goal:** Trocar a navegacao segmentada por um select nativo controlado pela rota sem deixar contratos compartilhados obsoletos.

**Architecture:** `Sidebar` deriva o workspace da rota atual, restringe-o a `visibleWorkspaces` e renderiza um unico `NativeSelect` associado a `FieldLabel` e a dica por ids de `useId`.
A selecao navega ao `defaultPath` e chama `onNavigate`, que ja fecha o drawer em `Layout`, sem criar estado paralelo.
Os testes de shell e Tarefas mudam junto com essa semantica, e somente os dois screenshots desktop que exibem a Sidebar aberta sao regenerados.

**Tech Stack:** React 19, React Router, Testing Library, Vitest, Playwright, componentes existentes `Field`, `FieldLabel` e `NativeSelect`.

**Spec:** `nexo/runs/2026-08-25-workspace-admin-continuation/run.md` e `nexo/plans/workspace-admin-continuation/00-OVERVIEW.md`.

## Contexto e causa raiz

O codigo atual renderiza `role="tablist"` com tres botoes `role="tab"` e guarda a escolha apenas pela rota.
O commit estacionado `c7d6981407379b352b566977d0a5d21b849c4aed` provou o desenho do seletor em `Sidebar`, no teste unitario e no shell, e alterou apenas o baseline desktop do shell.
O commit estacionado `84d3052e3e92533f3f7c103d66cb94721fd6c3c5` regenerou apenas o baseline desktop de Tarefas.
A integracao anterior falhou porque `tests/e2e/tarefas.spec.ts` continuou chamando `getByRole("tab", { name: "Operação" })` no drawer mobile depois que tabs deixaram de existir.
Logo, uma fatia posterior apenas de snapshot era ownership invalido: o contrato mobile de Tarefas deve mudar junto com a semantica de `Sidebar`.

## Ownership canonico

- Criar `src/components/Sidebar.test.tsx` para o contrato unitario completo do seletor.
- Modificar `src/components/Sidebar.tsx` para trocar exclusivamente o controle de workspace.
- Modificar `tests/e2e/shell.spec.ts` para usar o select no desktop e no drawer mobile.
- Modificar `tests/e2e/tarefas.spec.ts` para usar o select no drawer mobile antes de voltar a `/tarefas`.
- Regenerar `tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png` em 1440x1000.
- Regenerar `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png` em 1440x900.

`shell-mobile.png` e `tarefas-mobile.png` nao exibem a Sidebar aberta no instante capturado e nao mudaram nos commits historicos.
Eles nao pertencem ao slice e devem permanecer identicos.
`Field`, `FieldLabel`, `NativeSelect`, `Layout`, `WORKSPACES` e a navegacao existente sao consumidos sem alteracao.

## Red 1: contrato unitario primeiro

- [ ] Criar a suite `seletor acessível de workspace` em `Sidebar.test.tsx` usando `MemoryRouter`, `LocationProbe` e `userEvent`.
- [ ] Renderizar duas instancias em `/precos` e exigir dois controles associados ao label `Workspace`, ambos com valor `cadastros`, ids distintos, `aria-describedby` distintos e dica `Pessoas, turmas e serviços`.
- [ ] Exigir ausencia de `tablist`, `tab` e `aria-selected`.
- [ ] Partir de `/tarefas`, selecionar `cadastros`, `tatica` e `operacao`, e provar respectivamente `/contatos`, `/visao-geral` e `/relatorios`, com uma chamada de `onNavigate` depois de cada selecao.
- [ ] Renderizar `/precos` com apenas Operacao e Tatica visiveis, exigir valor `operacao`, duas opcoes, links de Operacao, URL ainda `/precos` e zero chamadas de `onNavigate`.

O contrato central deve usar estas interfaces exatas:

```tsx
const selectors = screen.getAllByLabelText("Workspace");
expect(selectors[0]).toHaveValue("cadastros");
expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
expect(screen.queryByRole("tab")).not.toBeInTheDocument();

await user.selectOptions(screen.getByLabelText("Workspace"), "cadastros");
await waitFor(() =>
  expect(screen.getByLabelText("Caminho atual")).toHaveTextContent("/contatos"),
);

<Sidebar
  visibleWorkspaces={[WORKSPACES[0], WORKSPACES[2]]}
  onNavigate={onNavigate}
/>
```

Rodar antes de alterar producao:

```bash
npm run test -- src/components/Sidebar.test.tsx -t "seletor acessível de workspace"
```

O Red valido falha porque a Sidebar atual nao possui select associado ao label, ainda expoe papeis de tab e ainda nao aceita `visibleWorkspaces`.
Falha de import, sintaxe ou setup nao e um Red valido.

## Red 2: contratos de usuario compartilhados

- [ ] Em `shell.spec.ts`, trocar as assercoes e acoes de tab pelo controle `page.getByLabel("Workspace")` no desktop.
- [ ] Exigir valor `operacao`, ausencia de papeis de tab, selecao de `cadastros`, selecao de `tatica`, persistencia de valor apos reload, links ativos e todos os deep links existentes.
- [ ] No caso mobile do shell, limitar o locator ao dialog `Navegação principal`, selecionar `cadastros` e exigir `/contatos` com o drawer fechado.
- [ ] Em `tarefas.spec.ts`, no teste `mantém Tarefas legível em desktop e mobile`, limitar o locator ao drawer, exigir valor inicial `cadastros`, selecionar `operacao`, exigir `/relatorios` e confirmar fechamento antes de reabrir e navegar para Tarefas.

O trecho que fecha a causa raiz em Tarefas deve ter esta semantica:

```ts
const drawer = page.getByRole("dialog", { name: "Navegação principal" });
await expect(drawer).toBeVisible();
const workspace = drawer.getByLabel("Workspace");
await expect(workspace).toHaveValue("cadastros");
await workspace.selectOption("operacao");
await expect(page).toHaveURL(/\/relatorios$/);
await expect(drawer).toBeHidden();
```

Rodar os contratos modificados ainda contra as tabs atuais e ignorar snapshots para isolar semantica:

```bash
npm run test:e2e -- tests/e2e/shell.spec.ts tests/e2e/tarefas.spec.ts --project=chromium --workers=1 --ignore-snapshots --grep "mantém os três workspaces e a rota ativa após recarregar|oferece navegação móvel sem perder contexto|mantém Tarefas legível em desktop e mobile"
```

O Red valido falha nas tentativas de encontrar ou operar um select nativo, incluindo o fluxo mobile de Tarefas que antes procurava a tab Operacao.
Nao atualizar snapshots durante Red.

## Green: implementar o minimo em Sidebar

- [ ] Adicionar `visibleWorkspaces?: readonly Workspace[]` a `SidebarProps` e usar `WORKSPACES` como padrao e como fallback defensivo para array vazio.
- [ ] Importar `useId`, `Field`, `FieldLabel`, `NativeSelect`, `Workspace`, `WorkspaceId` e `WORKSPACES` dos modulos existentes.
- [ ] Derivar `routeWorkspace` com `getWorkspaceForPath(location.pathname)` e resolver `activeWorkspace` dentro da lista visivel, com fallback para `workspaces[0]` sem navegar.
- [ ] Substituir todo o bloco de tabs por um `Field` compacto contendo `FieldLabel htmlFor={selectId}`, um `NativeSelect` controlado e opcoes derivadas somente de `workspaces`.
- [ ] Associar a dica pelo `hintId` em `aria-describedby` e preservar as classes compactas, cores, espacamento e largura atual da Sidebar.
- [ ] Ao mudar, procurar a escolha somente em `workspaces`, navegar ao `defaultPath` e depois chamar `onNavigate`.
- [ ] Filtrar `NAVIGATION_ITEMS` pelo `activeWorkspace.id` e remover handlers, imports e atributos exclusivos das tabs.

O nucleo da resolucao deve permanecer simples e sem estado adicional:

```tsx
const selectId = useId();
const hintId = useId();
const workspaces = visibleWorkspaces.length > 0 ? visibleWorkspaces : WORKSPACES;
const routeWorkspace = getWorkspaceForPath(location.pathname);
const activeWorkspace = workspaces.find(
  (workspace) => workspace.id === routeWorkspace.id,
) ?? workspaces[0];

const selectWorkspace = (id: WorkspaceId) => {
  const workspace = workspaces.find((item) => item.id === id);
  if (!workspace) return;
  void navigate(workspace.defaultPath);
  onNavigate?.();
};
```

O controle deve usar os primitives existentes desta forma:

```tsx
<Field className="px-2">
  <FieldLabel htmlFor={selectId}>Workspace</FieldLabel>
  <NativeSelect
    id={selectId}
    name="workspace"
    value={activeWorkspace.id}
    aria-describedby={hintId}
    onChange={(event) => selectWorkspace(event.target.value as WorkspaceId)}
  >
    {workspaces.map((workspace) => (
      <option key={workspace.id} value={workspace.id}>
        {workspace.label}
      </option>
    ))}
  </NativeSelect>
</Field>
```

Rodar primeiro o unitario e depois os fluxos funcionais com snapshots ignorados:

```bash
npm run test -- src/components/Sidebar.test.tsx -t "seletor acessível de workspace"
npm run test:e2e -- tests/e2e/shell.spec.ts tests/e2e/tarefas.spec.ts --project=chromium --workers=1 --ignore-snapshots --grep "mantém os três workspaces e a rota ativa após recarregar|oferece navegação móvel sem perder contexto|mantém Tarefas legível em desktop e mobile"
```

Os dois comandos devem passar antes de qualquer update de snapshot.
Se Tarefas ainda procurar `role="tab"`, Green nao foi atingido.

## Refactor e baselines visuais

- [ ] Refatorar somente duplicacao local depois do Green e repetir o teste unitario se `Sidebar.tsx` mudar.
- [ ] Rodar um unico comando de update para os dois testes visuais, ainda com um worker.
- [ ] Confirmar `shell-desktop.png` em 1440x1000 e `tarefas-desktop.png` em 1440x900.
- [ ] Inspecionar ambos os PNGs modificados em tamanho original.
- [ ] Verificar hierarquia, alinhamento, label e select, foco, contraste, densidade compacta, item ativo, quebra de texto, acoes e ausencia de clipping ou overflow.
- [ ] Nao executar outro update de snapshots.
- [ ] Entregar os seis arquivos declarados ao mecanismo Nexo para um unico commit atomico antes de executar os guards de Gate 2.

```bash
npm run test:e2e -- tests/e2e/shell.spec.ts tests/e2e/tarefas.spec.ts --project=chromium --workers=1 --update-snapshots --grep "preserva o shell visual em desktop e mobile|mantém Tarefas legível em desktop e mobile"
sips -g pixelWidth -g pixelHeight tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png
```

O update nao e prova de ownership.
Depois do commit atomico, os guards do Gate 2 comparam todo o range da fatia e devem provar que apenas os dois baselines desktop mudaram e que os dois baselines mobile permanecem identicos.
Se o range commitado contiver um baseline mobile, nao aceitar a mudanca nem ampliar ownership; registrar a divergencia e falhar a fatia para novo planejamento.

## Oraculos de Gate 2

Executar estes comandos em modo run-once e na ordem indicada, somente depois do commit atomico da fatia.
Definir `slice_base` uma unica vez e reutiliza-lo em todo guard para cobrir todos os commits desde a divergencia com `main` ate `HEAD`.

```bash
slice_base="$(git merge-base main HEAD)"
test "$(git rev-list --count "${slice_base}..HEAD")" -eq 1
npm run test -- src/components/Sidebar.test.tsx -t "seletor acessível de workspace"
npm run test:e2e -- tests/e2e/shell.spec.ts tests/e2e/tarefas.spec.ts --project=chromium --workers=1 --grep "mantém os três workspaces e a rota ativa após recarregar|oferece navegação móvel sem perder contexto|preserva o shell visual em desktop e mobile|mantém Tarefas legível em desktop e mobile"
npm run typecheck
npx eslint src/components/Sidebar.tsx src/components/Sidebar.test.tsx tests/e2e/shell.spec.ts tests/e2e/tarefas.spec.ts --max-warnings=0
actual_files="$(git diff --name-only "$slice_base" HEAD | LC_ALL=C sort)"
expected_files="$(printf '%s\n' 'src/components/Sidebar.test.tsx' 'src/components/Sidebar.tsx' 'tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png' 'tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png' 'tests/e2e/shell.spec.ts' 'tests/e2e/tarefas.spec.ts' | LC_ALL=C sort)"
test "$actual_files" = "$expected_files"
actual_snapshots="$(git diff --name-only "$slice_base" HEAD -- 'tests/e2e/__screenshots__' | LC_ALL=C sort)"
expected_snapshots="$(printf '%s\n' 'tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png' 'tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png' | LC_ALL=C sort)"
test "$actual_snapshots" = "$expected_snapshots"
git diff --exit-code "$slice_base" HEAD -- 'tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png' 'tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-mobile.png'
shell_mobile_base_sha="$(git show "${slice_base}:tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png" | shasum -a 256 | awk '{print $1}')"
shell_mobile_head_sha="$(git show 'HEAD:tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png' | shasum -a 256 | awk '{print $1}')"
tarefas_mobile_base_sha="$(git show "${slice_base}:tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-mobile.png" | shasum -a 256 | awk '{print $1}')"
tarefas_mobile_head_sha="$(git show 'HEAD:tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-mobile.png' | shasum -a 256 | awk '{print $1}')"
test "$shell_mobile_base_sha" = "$shell_mobile_head_sha"
test "$tarefas_mobile_base_sha" = "$tarefas_mobile_head_sha"
git diff --exit-code "$slice_base" HEAD -- 'supabase/schema.sql' 'src/lib/database.types.ts' 'supabase/migrations'
git diff --check "$slice_base" HEAD
! lsof -nP -iTCP:4173 -sTCP:LISTEN
```

O Playwright final deve passar sem `--update-snapshots` e sem `--ignore-snapshots`.
O Verify deve abrir os dois PNGs modificados em detalhe original, confirmar suas dimensoes e rejeitar defeitos visiveis mesmo que a comparacao automatica passe.
O Verify deve confirmar que `git diff --name-only "$slice_base" HEAD` contem somente os seis caminhos declarados em `files_modified`.
Nenhum servidor, watcher, worker ou grupo de processos iniciado pela fatia pode permanecer ao final.
