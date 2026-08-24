---
id: 02-report-completion-storage
milestone: m1
status: done
depends_on: [01-report-date-rules]
files_modified: [supabase/schema.sql, supabase/migrations/20260824140000_add_relatorios_concluido_em.sql, src/lib/database.types.ts, src/features/relatorios/api.ts, src/features/relatorios/api.test.ts]
acceptance: "Dado um relatório aberto ou concluído, o contrato tipado aceita concluido_em nulo ou timestamp, a API persiste ambos os estados e devolve a linha atualizada; bancos novos e existentes recebem somente a coluna nullable concluido_em, sem backfill, mudança de policy ou execução remota."
goal: "Adicionar o armazenamento tipado e aditivo da confirmação Tudo anotado!."
must_not_break:
  - "CRUD, ordenação, RLS, seed e colunas atuais de relatorios."
  - "Linhas existentes continuam válidas com concluido_em nulo."
  - "Nenhuma migration é aplicada a um Supabase remoto."
rules:
  - "A migration adiciona somente concluido_em timestamptz nullable com if not exists."
  - "Testes verificam tipos compiláveis e comportamento da API, nunca texto-fonte de SQL ou TypeScript."
  - "A additividade do SQL é revisada objetivamente no diff pelo Verify separado."
  - "Sem nova tabela, restrição única, default, backfill, alteração de policy ou mudança no seed."
verifier_focus: "Provar payload, retorno e erro da API, compilar Row, Insert e Update com concluido_em e revisar o diff SQL para confirmar uma única alteração nullable e aditiva, sem executar comandos remotos."
---

# Persistência de conclusão do relatório

## Escopo

Adicionar `concluido_em timestamptz` nullable à definição de `relatorios` em `supabase/schema.sql`.
Criar `supabase/migrations/20260824140000_add_relatorios_concluido_em.sql` com apenas:

```sql
alter table public.relatorios
  add column if not exists concluido_em timestamptz;
```

Atualizar `Row`, `Insert` e `Update` de `relatorios` em `database.types.ts` com `string | null` e opcionalidade adequada.
Não alterar `supabase/seed.sql`, RLS, policies ou qualquer outra tabela.

Em `api.ts`, preservar o CRUD e exportar:

```ts
export const relatoriosQueryKey = ["relatorios"] as const;
export async function setRelatorioCompletion(id: string, completedAt: string | null): Promise<Row<"relatorios">>;
```

`listRelatorios()` ordena por `data` descendente e depois `created_at` descendente.
`setRelatorioCompletion` delega a `updateRelatorio(id, { concluido_em: completedAt })` e devolve a linha atualizada.

Não criar UI, regra de data, teste que leia arquivos como strings ou conexão com banco nesta fatia.

## Red, Green e Refactor

### Red

1. Criar `api.test.ts` com mock do cliente Supabase na fronteira do módulo.
2. Declarar fixtures que `satisfies Row<"relatorios">`, `Insert<"relatorios">` e `Update<"relatorios">` usando `concluido_em` nulo e timestamp.
3. Exigir as duas ordenações de `listRelatorios`, o patch `{ concluido_em: timestamp }`, o patch `{ concluido_em: null }`, filtro pelo id, retorno da linha e propagação de erro.
4. Rodar teste e typecheck, confirmando FAIL pela ausência do campo e da operação.

### Green

1. Atualizar schema, migration, tipos e API com o contrato mínimo.
2. Fazer o mock responder como a cadeia real `.update().eq().select().single()`.
3. Rodar teste e typecheck até PASS.

### Refactor

1. Reusar `updateRelatorio` sem duplicar tratamento de erro.
2. Rodar oráculos e lint.
3. Entregar a migration apenas como artefato versionado.

## Oráculos de Gate 2

```bash
npm run test -- src/features/relatorios/api.test.ts
npm run typecheck
npx eslint src/features/relatorios/api.ts src/features/relatorios/api.test.ts src/lib/database.types.ts --max-warnings=0
git diff --check "$(git merge-base main HEAD)" HEAD -- supabase/schema.sql supabase/migrations/20260824140000_add_relatorios_concluido_em.sql src/lib/database.types.ts src/features/relatorios/api.ts src/features/relatorios/api.test.ts
```

Além dos comandos, o Verify separado deve abrir o diff da fatia com:

```bash
git diff --unified=80 "$(git merge-base main HEAD)" HEAD -- supabase/schema.sql supabase/migrations/20260824140000_add_relatorios_concluido_em.sql
```

O veredito só pode ser PASS se o diff adicionar apenas a coluna nullable `concluido_em`, sem remover ou reescrever dados, constraints, tabelas, policies ou seed.
Essa revisão de diff é a verificação do SQL quando não há Postgres efêmero disponível e não deve ser substituída por busca textual em teste.

Execute e Verify não rodam `supabase db push`, `supabase migration up` em projeto vinculado, SQL Editor, `psql` remoto, deploy ou promoção.
A aplicação manual posterior deve revisar a migration, fazer backup, aplicá-la antes do frontend e conferir a coluna por leitura.

O teste de API é bloqueado.
O commit sugerido é `feat: persistir conclusão dos relatórios`.
