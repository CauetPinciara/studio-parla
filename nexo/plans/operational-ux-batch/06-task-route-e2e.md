---
id: 06-task-route-e2e
milestone: m1
status: done
depends_on: [05-task-ui]
files_modified: [src/app/navigation.ts, src/app/navigation.test.ts, src/App.tsx, tests/e2e/tarefas.spec.ts, tests/e2e/shell.spec.ts, tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png, tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png, tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-mobile.png]
acceptance: "Dado um membro no app real, quando ele escolhe Tarefas em Operacao ou recarrega /tarefas, entao a rota lazy preserva o CRUD, Lista e Kanban; desktop e mobile permanecem legiveis, acessiveis e sem overflow, com snapshots revisados e sem execucao E2E concorrente na porta 4173."
goal: "Integrar Tarefas à navegação e provar a jornada completa no navegador real."
must_not_break:
  - "As rotas, workspaces e entradas já integradas pelas fatias anteriores."
  - "DEFAULT_ROUTE continua /relatorios e rotas desconhecidas continuam voltando para ela."
  - "O seletor de workspace, o drawer móvel, o shell desktop e o item ativo continuam corretos."
  - "Nenhum outro Playwright desta wave pode disputar 127.0.0.1:4173."
rules:
  - "Usar Red, Green e Refactor com navigation.test.ts e tarefas.spec.ts bloqueados."
  - "Este é o único slice de Tarefas que altera navegação, App, Playwright ou snapshots."
  - "Não alterar schema, migration, tipos, domínio, API, formulário ou página nesta fatia."
  - "Não aplicar migration remota, iniciar servidor persistente ou deixar processo após os testes."
verifier_focus: "Provar deep link, reload, menu ativo, CRUD REST, alternância de visões, teclado, screenshots e ausência de overflow em 1440x900 e 390x844; confirmar execução serial do Playwright."
---

# Rota e E2E de tarefas

## Integração

Adicionar `ListTodo` e inserir `/tarefas` logo depois de `/relatorios` em Operação:

```ts
{
  workspace: "operacao",
  path: "/tarefas",
  title: "Tarefas",
  subtitle: "Pendências e responsáveis do dia a dia",
  icon: ListTodo,
}
```

Adicionar ao mapa lazy de `App.tsx` a importação de `@/features/tarefas/TarefasPage`.
Preservar integralmente as entradas integradas desde o início do batch.
Atualizar `navigation.test.ts` para a sequência completa resultante e provar `/tarefas`, barra final, workspace `operacao` e fallback inalterado.

## E2E

`tarefas.spec.ts` fixa o relógio em `2026-08-24T12:00:00-03:00`, habilita o preview do shell e intercepta `https://placeholder.supabase.co/rest/v1/tarefas**` com estado em memória.
GET devolve o array ordenado, POST cria e devolve uma linha, PATCH altera somente o id filtrado e DELETE remove somente esse id.

O teste `persiste CRUD e alterna Lista e Kanban no navegador` deve:

1. Abrir `/tarefas`, confirmar URL, heading, link ativo, Lista e vazio.
2. Criar pelos seis campos e confirmar o payload REST.
3. Alternar para Kanban por teclado e localizar as três regiões.
4. Concluir e exigir `data_conclusao: "2026-08-24"`.
5. Recarregar e confirmar permanência.
6. Editar título e descrição.
7. Reabrir e exigir conclusão nula.
8. Confirmar delete e voltar ao vazio.

O teste `mantém Tarefas legível em desktop e mobile` usa uma fixture com descrição longa.
Ele captura Lista em `1440x900` como `tarefas-desktop.png`, captura Kanban em `390x844` como `tarefas-mobile.png` e exige `scrollWidth <= clientWidth`.
No mobile, abre o drawer, seleciona o workspace Operação, navega por `Tarefas` e confirma o fechamento do dialog.

Adicionar `[/tarefas, Tarefas]` à matriz de `shell.spec.ts`.
Atualizar `shell-desktop.png`, que passa a mostrar o novo item.
Não atualizar baseline que não mudou em pixels.

## TDD

### Red

Primeiro atualizar `navigation.test.ts`, criar `tarefas.spec.ts` e ampliar `shell.spec.ts` sem tocar em produção.

```bash
npm run test -- src/app/navigation.test.ts
npm run test:e2e -- tests/e2e/tarefas.spec.ts tests/e2e/shell.spec.ts --project=chromium
```

O Red esperado é a ausência do metadado, link, heading e rota `/tarefas`.

### Green

Adicionar o metadado e o lazy map sem mudar a página.
Repetir o teste unitário e os fluxos funcionais até PASS.

### Refactor e visual

Gerar baselines somente depois do Green:

```bash
npm run test:e2e -- tests/e2e/tarefas.spec.ts tests/e2e/shell.spec.ts --project=chromium --update-snapshots
```

Inspecionar os PNGs em tamanho original, cobrindo hierarquia, foco, contraste, quebra de descrição, ações, alvos de toque e overflow.
Repetir sem atualização de snapshots.
Se o E2E revelar defeito em arquivo da fatia 05, falhar Verify e solicitar replan em vez de ampliar silenciosamente o ownership.

## Oráculos de Gate 2

Executar Playwright uma única vez e de forma serial nesta wave:

```bash
npm run test -- src/app/navigation.test.ts
npm run test:e2e -- tests/e2e/tarefas.spec.ts tests/e2e/shell.spec.ts --project=chromium
npm run typecheck
npx eslint src/app/navigation.ts src/app/navigation.test.ts src/App.tsx tests/e2e/tarefas.spec.ts tests/e2e/shell.spec.ts --max-warnings=0
npm run build
git diff --check
```

O Verify confirma que nenhum servidor, watcher ou worker ficou em execução e que nenhuma migration remota foi aplicada.

```bash
git add src/app/navigation.ts src/app/navigation.test.ts src/App.tsx tests/e2e/tarefas.spec.ts tests/e2e/shell.spec.ts tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-mobile.png
git commit -m "feat: integrate task route"
```
