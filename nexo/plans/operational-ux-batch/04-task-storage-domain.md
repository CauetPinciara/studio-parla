---
id: 04-task-storage-domain
milestone: m1
status: done
depends_on: [03-report-daily-ui]
files_modified: [supabase/schema.sql, supabase/migrations/20260824134500_add_tarefas.sql, src/lib/database.types.ts, src/features/tarefas/domain.ts, src/features/tarefas/domain.test.ts, src/features/tarefas/api.ts, src/features/tarefas/api.test.ts]
acceptance: "Dado o contrato local de tarefas, quando uma tarefa e criada, listada, atualizada, concluida, reaberta ou excluida, entao o Supabase recebe payloads tipados, erros sao propagados, a conclusao recebe uma data coerente e schema, migration e RLS permanecem aditivos sem qualquer aplicacao remota."
goal: "Criar a persistencia tipada, as regras puras e a API de tarefas sem interface ou rota."
must_not_break:
  - "As tabelas, policies, tipos e APIs existentes, inclusive relatorios alterados pelas fatias anteriores."
  - "A funcao is_member() e o modelo atual de RLS por allowlist."
  - "O banco remoto nao pode ser acessado ou migrado por Execute ou Verify."
rules:
  - "Usar Red, Green e Refactor com domain.test.ts e api.test.ts bloqueados."
  - "A migration deve ser somente aditiva e nao pode conter drop, truncate, delete, update de dados ou substituicao de policy."
  - "Nao criar teste que leia SQL ou TypeScript como texto; Verify revisa o diff SQL e o compilador valida os tipos."
  - "Nao alterar documentacao publica, seed.sql, navegacao, componentes ou instalar dependencias."
verifier_focus: "Revisar o SQL linha a linha para additividade, constraints e RLS; provar por testes a normalizacao de status e datas, o contrato encadeado do Supabase e a propagacao das mesmas instancias de erro."
---

# Persistência, domínio e API de tarefas

## Contrato de dados

Adicionar `public.tarefas` a `supabase/schema.sql` e à migration versionada.
A tabela possui `id`, `status`, `data_abertura`, `data_conclusao`, `responsavel`, `titulo`, `descricao` e `created_at`.
Os status permitidos são `a_fazer`, `em_andamento` e `concluida`.
`titulo` e `responsavel` são textos não vazios.
`data_conclusao` é obrigatória somente em `concluida`, deve ser nula nos outros status e não pode preceder `data_abertura`.

A migration usa apenas `create table if not exists`, `alter table public.tarefas enable row level security` e um bloco condicional que cria a policy `membros full` somente quando ela ainda não consta em `pg_policies`.
Ela não remove nem substitui policies existentes.
`schema.sql` recebe a criação simples da policy para instalações novas.

Adicionar `tarefas` de forma localizada a `Database["public"]["Tables"]`.
Row exige todos os campos, Insert exige somente `responsavel` e `titulo`, e Update deixa todos opcionais.
Preservar quaisquer campos já adicionados a `relatorios`.

## Domínio puro

`domain.ts` exporta:

```ts
export const TAREFA_STATUS = ["a_fazer", "em_andamento", "concluida"] as const;
export type TarefaStatus = (typeof TAREFA_STATUS)[number];
export const tarefaStatusLabels: Record<TarefaStatus, string>;

export interface TarefaDraft {
  status: TarefaStatus;
  data_abertura: string;
  data_conclusao: string | null;
  responsavel: string;
  titulo: string;
  descricao: string | null;
}

export function buildTarefaInput(draft: TarefaDraft, today: string, previousCompletion?: string | null): Insert<"tarefas">;
export function tarefaStatusPatch(task: Pick<Row<"tarefas">, "data_abertura" | "data_conclusao">, status: TarefaStatus, today: string): Update<"tarefas">;
```

Os rótulos são `A fazer`, `Em andamento` e `Concluída`.
`buildTarefaInput` apara título, responsável e descrição, transforma descrição vazia em `null`, completa a data ao concluir, preserva uma conclusão existente e limpa a conclusão ao reabrir.
Ele lança erros em português para título vazio, responsável vazio ou conclusão anterior à abertura.
`tarefaStatusPatch` aplica as mesmas regras ao status rápido e não lê relógio global.

## API

`api.ts` exporta `tarefasQueryKey = ["tarefas"] as const`, `listTarefas`, `createTarefa`, `updateTarefa` e `deleteTarefa` com `Row`, `Insert` e `Update`.
List ordena por `data_abertura` decrescente e depois por `created_at` decrescente.
Create e update terminam em `.select().single()`.
Update e delete filtram com `.eq("id", id)`.
Todas as operações passam o erro a `ensureNoError` e list devolve `[]` para data nula.

## TDD

### Red 1: regras puras e tipos

Criar `domain.test.ts` com os testes nomeados:

- `normaliza campos e mantém tarefa aberta sem conclusão`.
- `registra hoje ao concluir e preserva uma conclusão existente`.
- `limpa a conclusão ao reabrir`.
- `rejeita título, responsável e intervalo de datas inválidos`.

Usar `2026-08-24` como hoje e `2026-08-22` como conclusão existente.
As fixtures declaradas como `Row<"tarefas">`, `Insert<"tarefas">` e `Update<"tarefas">` bloqueiam a forma dos tipos pelo compilador.

```bash
npm run test -- src/features/tarefas/domain.test.ts
```

O Red esperado é a ausência de `tarefas` nos tipos e de `domain.ts`.

### Green 1: fonte local, tipos e domínio

Adicionar a tabela, RLS, migration, tipos e `domain.ts` conforme este contrato.
Não executar a migration.
Repetir o teste de domínio e `npm run typecheck` até PASS.

### Red 2: API

Criar `api.test.ts` com um mock encadeável do cliente e estes testes:

- `lista tarefas por abertura e criação decrescentes`.
- `cria e atualiza retornando a linha persistida`.
- `exclui somente o id solicitado`.
- `propaga o erro original em cada operação`.

Observar as chamadas exatas a `from("tarefas")`, `select`, `order`, `insert`, `update`, `delete`, `eq` e `single`.
Exigir `tarefasQueryKey` igual a `["tarefas"]` e rejeição com a mesma instância `new Error("falha tarefas")`.

```bash
npm run test -- src/features/tarefas/api.test.ts
```

O Red esperado é a ausência de `api.ts`.

### Green 2 e Refactor

Implementar a API mínima e repetir ambos os testes.
Refatorar somente com tudo verde e sem criar uma camada genérica de CRUD.

## Oráculos de Gate 2

```bash
npm run test -- src/features/tarefas/domain.test.ts src/features/tarefas/api.test.ts
npm run typecheck
npx eslint src/lib/database.types.ts src/features/tarefas/domain.ts src/features/tarefas/domain.test.ts src/features/tarefas/api.ts src/features/tarefas/api.test.ts --max-warnings=0
git diff --check
```

O Verify separado deve revisar o diff de `schema.sql` e da migration e registrar objetivamente: tabela e constraints presentes, RLS habilitada, policy baseada em `is_member()`, ausência de instrução destrutiva e ausência de credencial ou comando remoto.
Nenhum teste de busca textual substitui essa revisão.

## Handoff de migration

A migration permanece versionada e não aplicada.
O run registra `migration pending: supabase/migrations/20260824134500_add_tarefas.sql` para aplicação posterior por operador autorizado antes da publicação da tela.

```bash
git add supabase/schema.sql supabase/migrations/20260824134500_add_tarefas.sql src/lib/database.types.ts src/features/tarefas/domain.ts src/features/tarefas/domain.test.ts src/features/tarefas/api.ts src/features/tarefas/api.test.ts
git commit -m "feat: add task storage and domain"
```
