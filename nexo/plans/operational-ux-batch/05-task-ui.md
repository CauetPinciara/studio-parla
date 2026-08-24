---
id: 05-task-ui
milestone: m1
status: done
depends_on: [04-task-storage-domain]
files_modified: [src/features/tarefas/TarefaForm.tsx, src/features/tarefas/TarefasPage.tsx, src/features/tarefas/TarefasPage.test.tsx]
acceptance: "Dado um membro autenticado e a API de tarefas, quando ele usa a pagina diretamente em teste de componente, entao cria, edita, conclui, reabre e exclui tarefas, alterna entre Lista e Kanban sobre os mesmos dados e recebe controles rotulados e erros acessiveis sem drag-and-drop."
goal: "Construir o formulario e as visualizacoes Lista e Kanban sobre o contrato persistente da fatia 04."
must_not_break:
  - "As assinaturas, status, datas e query key definidos por 04-task-storage-domain."
  - "Loading, erro, vazio e feedback de mutacao continuam recuperaveis."
  - "A pagina nao depende de rota e nao altera navegacao, App ou testes Playwright."
rules:
  - "Usar Red, Green e Refactor com TarefasPage.test.tsx bloqueado."
  - "Usar componentes, tokens, formatDate, localDateIso e TanStack Query existentes."
  - "Nao usar drag-and-drop, prioridades, filtros, comentarios, anexos, notificacoes ou nova dependencia."
  - "Nao duplicar tarefas em estado local; Lista e Kanban derivam do mesmo resultado da query."
verifier_focus: "Provar o CRUD, as invalidações, a coerencia de data de conclusão, a troca acessivel de visao e status, a semantica das colunas e a recuperacao de falhas sem depender da rota."
---

# Interface de tarefas

## Formulário

`TarefaForm` recebe `open`, `onOpenChange`, `tarefa`, `defaultResponsavel`, `pending`, `mutationError` e `onSubmit` tipado com `Insert<"tarefas">`.
O modal se chama `Nova tarefa` ou `Editar tarefa`.
Os controles têm os rótulos `Status`, `Data de abertura`, `Data de conclusão`, `Responsável`, `Título` e `Descrição`, com `id`, `name` e `htmlFor` associados.

Status, abertura, responsável e título são obrigatórios.
Abertura inicia em `localDateIso()` e responsável inicia no nome ou e-mail do membro somente na criação.
Conclusão fica habilitada somente em `concluida` e usa abertura como `min`.
O submit chama `buildTarefaInput`.
Erro local ou de mutation aparece em `role="alert"`, mantém o modal aberto e preserva os valores.

## Página e visualizações

`TarefasPage` começa em Lista e mostra `Organize as pendências do Studio Parla em lista ou por andamento.` e `Nova tarefa`.
Um grupo `aria-label="Visualização das tarefas"` contém botões `Lista` e `Kanban` com `aria-pressed` e foco visível.

Lista usa `DataTable` em desktop e cards empilhados abaixo de `md`.
Ambos mostram título, descrição, status, responsável, abertura, conclusão e ações.
Kanban usa três seções rotuladas, sempre na ordem `A fazer`, `Em andamento`, `Concluída`, com uma lista semântica em cada coluna.

Cada representação oferece `Alterar status de {titulo}`, `Editar {titulo}` e `Excluir {titulo}`.
A troca de status usa `tarefaStatusPatch` e um select nativo, nunca arraste.
A exclusão confirma `Excluir a tarefa "{titulo}"?`.
O vazio é `Nenhuma tarefa cadastrada.`.

Create, update, status e delete aguardam `invalidateQueries({ queryKey: tarefasQueryKey })`.
O modal fecha somente depois da invalidação bem-sucedida.
Falhas ficam em `role="alert"` e também podem usar o toast existente.

## TDD

### Red

Criar `TarefasPage.test.tsx` com `QueryClientProvider`, `useAuth` mockado, APIs de estado controlado, fake timers em `2026-08-24T12:00:00-03:00`, `userEvent` e `window.confirm` controlado.

O teste `gerencia tarefas em Lista e Kanban com status e datas coerentes` prova, em ordem:

1. Loading, vazio e Lista pressionada por padrão.
2. Modal e os seis campos localizáveis por label.
3. Criação de `Organizar materiais`, `Catarina`, `2026-08-24` e `Separar argila` como `a_fazer` sem conclusão.
4. Invalidação de `["tarefas"]` antes do fechamento.
5. Alternância por teclado e as três regiões Kanban.
6. Mudança para `concluida` com conclusão `2026-08-24` e presença somente na coluna correta.
7. Edição para `Organizar materiais do workshop` preservando a conclusão.
8. Reabertura para `em_andamento` limpando a conclusão.
9. Exclusão confirmada e retorno ao vazio.

O teste `mantém modal aberto e anuncia falha sem perder valores` faz create rejeitar com `falha tarefas`, exige `role="alert"`, o título digitado e `Salvar` novamente disponível.
O teste `renderiza Lista móvel e Kanban com semântica completa` exige cards da Lista fora da tabela duplicada, headings das três colunas, listas e itens nomeados, sem qualquer controle ou texto de arraste.

```bash
npm run test -- src/features/tarefas/TarefasPage.test.tsx
```

O Red esperado é a ausência do formulário e da página.

### Green

Implementar somente os dois componentes com a API e o domínio da fatia 04.
Usar uma única query e filtrar o array em memória para as colunas.
Repetir o oráculo até PASS.

### Refactor

Remover repetição local apenas depois do verde.
Não extrair framework genérico de formulário, CRUD ou Kanban e não alterar componentes compartilhados.

## Oráculos de Gate 2

```bash
npm run test -- src/features/tarefas/TarefasPage.test.tsx src/features/tarefas/domain.test.ts src/features/tarefas/api.test.ts
npm run typecheck
npx eslint src/features/tarefas/TarefaForm.tsx src/features/tarefas/TarefasPage.tsx src/features/tarefas/TarefasPage.test.tsx --max-warnings=0
git diff --check
```

O Verify inspeciona a árvore renderizada nas larguras estruturais previstas pelo CSS, a ausência de drag-and-drop e que somente os três arquivos declarados foram modificados.

```bash
git add src/features/tarefas/TarefaForm.tsx src/features/tarefas/TarefasPage.tsx src/features/tarefas/TarefasPage.test.tsx
git commit -m "feat: add task list and kanban"
```
