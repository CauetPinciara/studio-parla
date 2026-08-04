---
id: 03-cadastros
milestone: m1
status: todo
depends_on: [02-supabase-auth]
files_modified:
  - src/app/router.tsx
  - src/components/data-state.tsx
  - src/components/mutation-feedback.tsx
  - src/components/ui/alert.tsx
  - src/components/ui/badge.tsx
  - src/components/ui/dialog.tsx
  - src/components/ui/input.tsx
  - src/components/ui/label.tsx
  - src/components/ui/select.tsx
  - src/components/ui/skeleton.tsx
  - src/components/ui/table.tsx
  - src/components/ui/textarea.tsx
  - src/features/cadastros/api-contract.test.ts
  - src/features/cadastros/cadastros-flow.test.tsx
  - src/features/contatos/api.ts
  - src/features/contatos/contato-form.tsx
  - src/features/contatos/contatos-page.tsx
  - src/features/turmas/api.ts
  - src/features/turmas/turma-form.tsx
  - src/features/turmas/turmas-page.tsx
  - src/features/matriculas/api.ts
  - src/features/matriculas/matricula-form.tsx
  - src/features/matriculas/matriculas-page.tsx
  - src/features/avulsas/api.ts
  - src/features/avulsas/avulsa-form.tsx
  - src/features/workshops/api.ts
  - src/features/workshops/workshop-form.tsx
  - src/features/workshops/workshops-page.tsx
  - src/features/inscricoes/api.ts
  - src/features/inscricoes/inscricao-form.tsx
acceptance: "Dado um membro autenticado nas rotas de Cadastros, quando ele lista, cria, edita ou exclui contatos, turmas, matrículas, aulas avulsas, workshops e inscrições, então as alterações persistem pelo cliente Supabase tipado, todas as visões dependentes são invalidadas e recarregadas, e cada tela oferece estados acessíveis de carregamento, erro recuperável e vazio sem perder a linguagem do protótipo."
---

# Cadastros persistentes

> **Para agentes executores:** use `superpowers:test-driven-development` durante Red, Green e Refactor e use `superpowers:verification-before-completion` antes de declarar a fatia pronta.

## Objetivo

Substituir os placeholders de Contatos, Matrículas, Turmas e Workshops por telas persistentes que preservem a organização e os textos do protótipo.
Entregar CRUD completo das seis entidades do domínio de Cadastros sem alterar o schema fechado nem criar uma camada de backend própria.

## Contratos herdados

- `src/lib/supabase.ts` exporta `supabase: SupabaseClient<Database>` e é a única conexão de dados desta fatia.
- `src/lib/database.types.ts` exporta `Tables<T>`, `TablesInsert<T>` e `TablesUpdate<T>`.
- `src/app/router.tsx` exporta `appRoutes` e `appRouter` e já protege as rotas internas por autenticação.
- As rotas a substituir são `/contatos`, `/matriculas`, `/turmas` e `/workshops`.
- As tabelas e colunas são `contatos(id,nome,tel,origem,obs,created_at)`, `turmas(id,nome,dia,hora)`, `matriculas(id,contato_id,turma_id,mensalidade,pagamento,status,created_at)`, `avulsas(id,contato_id,turma_id,data,status)`, `workshops(id,nome,datas,preco,created_at)` e `inscricoes(id,contato_id,workshop_id,status)`.
- O protótipo `parla.html` permanece apenas como referência e não deve ser modificado.

## Limites

- Não alterar `supabase/schema.sql`, `supabase/seed.sql` nem `src/lib/database.types.ts`.
- Não adicionar paginação, busca remota, upload, edição da allowlist ou novas tabelas nesta fatia.
- Não duplicar contatos ao criar vínculos.
- Não permitir exclusão pela interface de contato, turma ou workshop enquanto houver vínculos visíveis dependentes.
- Deixar violações de RLS, restrições de banco e falhas de rede como erros recuperáveis na própria tela.
- Preservar os rótulos em português, a densidade de tabelas, os badges de situação e os formulários em modal do protótipo.

## Interfaces de dados

Cada `api.ts` deve exportar uma chave de query estável e quatro operações tipadas.
O padrão é `list<Entity>()`, `create<Entity>(input: TablesInsert<"tabela">)`, `update<Entity>(id: string, input: TablesUpdate<"tabela">)` e `delete<Entity>(id: string)`.
Toda operação deve verificar `error` imediatamente e lançar esse erro, e toda criação ou atualização deve retornar o registro com `.select().single()`.
As listagens devem usar ordenação determinística: contatos e workshops por `nome`, turmas por `dia` e `hora`, matrículas por `created_at`, avulsas por `data` e inscrições por chave primária.
As APIs devem consultar somente a própria tabela.
As páginas devem combinar os resultados tipados em memória para resolver nomes e vínculos, aproveitando o cache do TanStack Query e evitando contratos implícitos de joins gerados.

```ts
export const contatosQueryKey = ["contatos"] as const;
export async function listContatos(): Promise<Tables<"contatos">[]>;
export async function createContato(input: TablesInsert<"contatos">): Promise<Tables<"contatos">>;
export async function updateContato(id: string, input: TablesUpdate<"contatos">): Promise<Tables<"contatos">>;
export async function deleteContato(id: string): Promise<void>;
```

O mesmo contrato deve existir em `turmas/api.ts`, `matriculas/api.ts`, `avulsas/api.ts`, `workshops/api.ts` e `inscricoes/api.ts`, com os nomes e tipos da entidade correspondente.

## Matriz de invalidação

| Mutação | Queries a invalidar |
| --- | --- |
| contato | `contatos` |
| turma | `turmas`, `matriculas`, `avulsas` |
| matrícula | `matriculas`, `contatos`, `turmas` |
| avulsa | `avulsas`, `contatos`, `turmas` |
| workshop | `workshops`, `inscricoes` |
| inscrição | `inscricoes`, `contatos`, `workshops` |

As invalidações devem ocorrer em `onSuccess`, antes de fechar o modal e exibir a confirmação.
Em erro, o modal deve permanecer aberto com a mensagem disponível em `role="alert"`.

## Teste-oráculo bloqueado

O teste-oráculo da fatia é `src/features/cadastros/cadastros-flow.test.tsx` com o caso `permite criar, editar e excluir os seis cadastros e atualiza todas as visões dependentes`.
O teste deve montar as quatro páginas com `QueryClientProvider`, APIs mockadas com estado controlado e `userEvent`.
Ele deve navegar pelas quatro rotas, observar o carregamento, resolver uma lista vazia, tentar novamente após uma rejeição e completar criar, editar e excluir em cada uma das seis entidades.
Após cada salvamento, ele deve verificar o novo valor visível e as chaves exatas passadas a `invalidateQueries` de acordo com a matriz acima.
O teste deve também comprovar que um contato, turma ou workshop com vínculo mostra a ação de exclusão desabilitada e a orientação para remover o vínculo primeiro.
Esse arquivo é o oráculo bloqueado de Gate 2 e não deve ser enfraquecido para acomodar a implementação.

## Plano TDD

### 1. Red: fixar o contrato das seis APIs

- [ ] Criar `src/features/cadastros/api-contract.test.ts` com um cliente Supabase encadeável controlado.
- [ ] Cobrir tabela selecionada, payload, filtro `.eq("id", id)`, retorno de linha e lançamento do objeto `error` para list, insert, update e delete das seis entidades.
- [ ] Rodar `npm run test -- src/features/cadastros/api-contract.test.ts`.
- [ ] Confirmar falha porque os seis módulos `api.ts` ainda não existem.

### 2. Green: implementar uma API tipada por entidade

- [ ] Criar os seis arquivos `api.ts` com as assinaturas descritas em Interfaces de dados.
- [ ] Usar somente `supabase` e os helpers `Tables*` herdados da fatia 02.
- [ ] Garantir que delete conclua apenas quando o Supabase não retornar erro.
- [ ] Rodar `npm run test -- src/features/cadastros/api-contract.test.ts`.
- [ ] Confirmar todos os casos verdes antes de iniciar componentes.

### 3. Red: escrever o teste-oráculo do fluxo visível

- [ ] Criar `src/features/cadastros/cadastros-flow.test.tsx` com o nome de caso bloqueado acima.
- [ ] Preparar fixtures mínimas com um registro livre e um registro vinculado para cada mestre.
- [ ] Simular promises pendentes, rejeitadas e resolvidas para observar loading, retry e empty.
- [ ] Exercitar os campos e rótulos do protótipo, inclusive WhatsApp, origem, observações, mensalidade, pagamento, situação, data, encaixe, datas, preço e pessoa inscrita.
- [ ] Rodar `npm run test -- src/features/cadastros/cadastros-flow.test.tsx`.
- [ ] Confirmar falha porque páginas, formulários e estados compartilhados ainda não existem.

### 4. Green: criar os estados e primitives compartilhados

- [ ] Adicionar os primitives shadcn listados em `files_modified`, seguindo os tokens já existentes em `src/index.css` sem editar o stylesheet nesta fatia.
- [ ] Criar `LoadingState`, `ErrorState` e `EmptyState` em `src/components/data-state.tsx`.
- [ ] Fazer `LoadingState` usar skeletons com texto acessível, `ErrorState` receber `onRetry`, e `EmptyState` receber título, descrição e ação opcional.
- [ ] Criar `MutationFeedback` em `src/components/mutation-feedback.tsx` com mensagens em `role="status"` ou `role="alert"`.

### 5. Green: contatos e turmas

- [ ] Implementar `ContatoForm` com create e edit para `nome`, `tel`, `origem` e `obs`.
- [ ] Implementar `ContatosPage` com contagem, tabela, badges de vínculos derivados de matrículas, avulsas e inscrições, e CRUD de contatos.
- [ ] Usar a mensagem vazia `Nenhum contato cadastrado.` e a orientação `Remova matrículas, avulsas e inscrições antes de excluir este contato.`.
- [ ] Implementar `TurmaForm` com create e edit para `nome`, `dia` e `hora`.
- [ ] Implementar `TurmasPage` com cards semanais, alunos de matrículas, alunos avulsos e CRUD de turmas.
- [ ] Usar a mensagem vazia `Nenhuma turma cadastrada.` e mostrar `Sem alunos` dentro de uma turma sem vínculos.
- [ ] Aplicar a matriz de invalidação para contato e turma.

### 6. Green: matrículas e aulas avulsas

- [ ] Implementar `MatriculaForm` com selects de contato e turma e campos `mensalidade`, `pagamento` e `status`.
- [ ] Implementar `AvulsaForm` com selects de contato e turma e campos `data` e `status`.
- [ ] Implementar `MatriculasPage` com as seções `Matrículas` e `Aulas avulsas`, mantendo tabelas e ações independentes.
- [ ] Oferecer create, edit, confirmação de delete, erro no modal e mensagens vazias separadas para as duas entidades.
- [ ] Formatar mensalidade em `pt-BR` somente na exibição e enviar número ao Supabase.
- [ ] Aplicar a matriz de invalidação para matrícula e avulsa.

### 7. Green: workshops e inscrições

- [ ] Implementar `WorkshopForm` com `nome`, `datas` e `preco` como campos textuais fiéis ao schema e ao protótipo.
- [ ] Implementar `InscricaoForm` com selects de contato e workshop e o campo `status`.
- [ ] Implementar `WorkshopsPage` com as seções `Workshops` e `Inscrições`, contagem derivada de inscritos e CRUD independente das duas entidades.
- [ ] Usar as mensagens vazias `Nenhum workshop cadastrado.` e `Nenhuma inscrição cadastrada.`.
- [ ] Impedir na interface a exclusão de workshop que ainda possua inscrições.
- [ ] Aplicar a matriz de invalidação para workshop e inscrição.

### 8. Green: ligar as rotas sem quebrar autenticação

- [ ] Substituir somente os quatro elementos `RoutePlaceholder` de Cadastros em `src/app/router.tsx`.
- [ ] Mapear `/contatos` para `ContatosPage`, `/matriculas` para `MatriculasPage`, `/turmas` para `TurmasPage` e `/workshops` para `WorkshopsPage`.
- [ ] Preservar `appRoutes`, `appRouter`, o `ProtectedRoute`, o `AppShell` e todos os outros caminhos exatamente como vieram das fatias 01 e 02.

### 9. Refactor: remover duplicação com a suíte verde

- [ ] Rodar o oráculo e o contrato juntos com `npm run test -- src/features/cadastros/api-contract.test.ts src/features/cadastros/cadastros-flow.test.tsx`.
- [ ] Extrair apenas padrões já repetidos de modal, feedback e estados nos dois componentes compartilhados declarados.
- [ ] Manter regras e invalidações perto da página que conhece suas dependências.
- [ ] Rodar novamente os dois testes e confirmar PASS.

### 10. Verificação da fatia

- [ ] Um agente Verify separado deve rodar `npm run test -- src/features/cadastros/cadastros-flow.test.tsx` como oráculo bloqueado.
- [ ] O mesmo agente deve rodar `npm run test -- src/features/cadastros/api-contract.test.ts`.
- [ ] O mesmo agente deve rodar `npm run lint`.
- [ ] O mesmo agente deve rodar `npm run build`.
- [ ] O mesmo agente deve executar `rg -n "service_role|SUPABASE_SERVICE_ROLE|sk-[A-Za-z0-9]" src` e confirmar ausência de segredo privilegiado.
- [ ] O mesmo agente deve registrar PASS ou FAIL objetivo no relatório de Gate 2.

## Commit atômico

Depois de Gate 2 verde, o fluxo Nexo deve preparar um único commit com todos os arquivos declarados.

```bash
git add src/app/router.tsx src/components src/features
git commit -m "feat: add persistent registration workflows"
```

O executor não deve modificar `parla.html`, arquivos Supabase, tipos gerados ou documentação fora desta fatia.
