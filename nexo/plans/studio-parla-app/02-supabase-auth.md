---
id: 02-supabase-auth
milestone: m1
status: todo
depends_on: [01-shell-visual]
files_modified:
  - package.json
  - package-lock.json
  - .env.example
  - supabase/schema.sql
  - supabase/seed.sql
  - src/env.d.ts
  - src/lib/database.types.ts
  - src/lib/supabase.ts
  - src/lib/supabase-contract.test.ts
  - src/features/auth/auth-context.tsx
  - src/features/auth/login-page.tsx
  - src/features/auth/protected-route.tsx
  - src/features/auth/auth.test.tsx
  - src/app/router.tsx
  - src/app.tsx
acceptance: "Dado um build sem variaveis Supabase, ele compila e mostra orientacao sem fazer chamadas remotas; dadas credenciais publicas, o login usa Google OAuth; dada uma sessao, somente um email aceito por is_member() acessa qualquer rota interna, enquanto um email fora da allowlist recebe Acesso nao autorizado; schema e seed preservam literalmente o contrato SQL e os dados iniciais idempotentes do prototipo."
---

# Supabase e autenticação por allowlist

> **Para agentes executores:** use `superpowers:test-driven-development` e execute cada ciclo Red, Green e Refactor abaixo sem enfraquecer os testes-oráculo.

## Objetivo

Adicionar o contrato persistente do Supabase e bloquear toda a aplicação interna atrás de Google OAuth e da allowlist protegida por RLS.

## Arquitetura e contratos

`supabase/schema.sql` deve ser uma cópia literal, sem reformatação, do bloco SQL da seção 5 do pedido original fornecido ao executor.
Esse bloco é a autoridade sobre constraints, defaults, função `is_member()`, três turmas iniciais, RLS e policies de acesso completo apenas para membros.
`supabase/seed.sql` é separado do schema e contém somente os dados do protótipo, com UUIDs fixos e `insert ... on conflict ... do update` para que duas execuções produzam o mesmo estado.
O frontend usa somente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, nunca `service_role`.
`src/lib/database.types.ts` exporta `Database`, `Tables<T>`, `TablesInsert<T>` e `TablesUpdate<T>`.
`src/lib/supabase.ts` exporta `supabase: SupabaseClient<Database>` e `isSupabaseConfigured: boolean`.
`src/features/auth/auth-context.tsx` exporta `AuthProvider`, `useAuth` e o estado discriminado `AuthStatus` com os valores `unconfigured`, `loading`, `signed_out`, `checking_member`, `authorized` e `forbidden`.
`AuthProvider` observa `getSession()` e `onAuthStateChange()`, chama `supabase.rpc("is_member")` para cada sessão e descarta respostas antigas quando a sessão muda.
`ProtectedRoute` renderiza configuração, carregamento, login, negação ou `<Outlet />` de acordo com o estado, e nenhuma rota interna fica fora desse gate.
`src/app.tsx` mantém `QueryClientProvider` e envolve `RouterProvider` em `AuthProvider`.
`src/app/router.tsx` preserva os exports `appRoutes` e `appRouter` definidos pela fatia 01 e envolve o elemento raiz existente com `ProtectedRoute`.

## Limites

Esta fatia não cria projeto Supabase, credenciais, usuários, membro inicial, tela de edição da allowlist, backend próprio ou APIs CRUD de domínio.
Esta fatia não altera o SQL obrigatório, não move as três turmas para o seed e não armazena preços ou mensagens no banco.
As telas autenticadas continuam sendo as páginas do shell da fatia 01.

## Testes-oráculo bloqueados

O oráculo principal é `src/features/auth/auth.test.tsx` com a suíte `auth gate protects every internal route`.
O oráculo de dados é `src/lib/supabase-contract.test.ts` com a suíte `closed Supabase contract`.
O executor pode adicionar casos, mas não pode apagar, pular, afrouxar ou substituir esses dois oráculos.

### Tarefa 1: Bloquear o contrato SQL e de seed

**Arquivos:** `src/lib/supabase-contract.test.ts`, `supabase/schema.sql` e `supabase/seed.sql`.

- [ ] **Red 1: escrever o teste de contrato antes dos arquivos SQL.**

O teste deve ler os dois arquivos com `readFileSync(new URL(..., import.meta.url), "utf8")`.
Ele deve exigir `app_members`, `contatos`, `turmas`, `matriculas`, `workshops`, `inscricoes`, `avulsas`, `pecas` e `relatorios`, a função `is_member`, RLS habilitada e policies baseadas em membros para todas as tabelas.
Ele deve exigir no seed os 13 contatos, 7 matrículas, 3 workshops, 2 inscrições, 1 avulsa, 2 peças e 1 relatório do objeto `db` de `parla.html`.
Ele deve exigir UUID explícito para cada registro do seed, `on conflict` para cada grupo inserido e ausência de insert em `app_members` e `turmas`.

- [ ] **Red 2: executar `npm run test -- src/lib/supabase-contract.test.ts`.**

O resultado esperado é FAIL porque `supabase/schema.sql` e `supabase/seed.sql` ainda não existem.

- [ ] **Green 1: copiar literalmente o schema fechado.**

Copie byte por byte o bloco SQL da seção 5 do pedido original para `supabase/schema.sql`.
Não normalize espaços, nomes, policies, seeds das três turmas, defaults ou constraints.

- [ ] **Green 2: escrever o seed idempotente do protótipo.**

Use os UUIDs `10000000-0000-4000-8000-000000000011` até `10000000-0000-4000-8000-000000000023` para os contatos de ids locais 11 até 23.
Use o prefixo `20000000` para as matrículas 1 até 7, `30000000` para os workshops 1 até 3, `40000000` para as inscrições 1 e 2, `50000000` para a avulsa 1, `60000000` para as peças 1 e 2 e `70000000` para o relatório 1, sempre mantendo `-0000-4000-8000-` e o id local nos 12 dígitos finais.
Resolva `turma_id` pelas três linhas já criadas pelo schema, usando o nome exato da turma, sem reinseri-las.
Preserve literalmente nomes, telefones, origens, observações, valores, pagamentos, status, datas, descrições e texto do relatório presentes em `parla.html`.
Mantenha `data_pronta` nula na peça inicial de Ana Carolina, pois o protótipo não atribui uma data a ela.
Use listas explícitas de colunas e `on conflict (id) do update set` com todos os campos mutáveis iguais a `excluded` em cada insert.

- [ ] **Green 3: executar `npm run test -- src/lib/supabase-contract.test.ts`.**

O resultado esperado é PASS.

- [ ] **Verificação de integração local do seed.**

Quando Docker e Supabase CLI estiverem disponíveis, execute `npx supabase start`, `npx supabase db reset --local`, `npx supabase db reset --local` novamente e consulte as contagens esperadas sem duplicatas.
Se essa infraestrutura local não estiver disponível, o teste estático continua obrigatório e a impossibilidade do ensaio SQL deve ser registrada no relatório de Verify, nunca ocultada.

### Tarefa 2: Criar tipos manuais e cliente seguro sem chaves

**Arquivos:** `package.json`, `package-lock.json`, `.env.example`, `src/env.d.ts`, `src/lib/database.types.ts` e `src/lib/supabase.ts`.

- [ ] **Red 1: ampliar `closed Supabase contract` para importar o cliente e os helpers de tipo.**

O teste deve confirmar em runtime que `isSupabaseConfigured` é `false` quando as duas variáveis estão ausentes e deve usar atribuições TypeScript que exercitem `Tables`, `TablesInsert` e `TablesUpdate`.

- [ ] **Red 2: executar `npm run test -- src/lib/supabase-contract.test.ts` e `npm run typecheck`.**

O resultado esperado é FAIL por módulos ou exports inexistentes.

- [ ] **Green 1: instalar `@supabase/supabase-js` como dependência de produção.**

Execute `npm install @supabase/supabase-js` para atualizar `package.json` e `package-lock.json` juntos.

- [ ] **Green 2: declarar o ambiente público.**

`.env.example` deve conter apenas `VITE_SUPABASE_URL=` e `VITE_SUPABASE_ANON_KEY=`.
`src/env.d.ts` deve tipar ambas como strings opcionais e manter a referência de tipos do Vite.

- [ ] **Green 3: representar todas as tabelas com fidelidade ao SQL.**

Em `Database["public"]["Tables"]`, declare `Row`, `Insert`, `Update` e `Relationships` para todas as nove tabelas.
Use exatamente estas colunas: `app_members(email,nome,created_at)`, `contatos(id,nome,tel,origem,obs,created_at)`, `turmas(id,nome,dia,hora)`, `matriculas(id,contato_id,turma_id,mensalidade,pagamento,status,created_at)`, `workshops(id,nome,datas,preco,created_at)`, `inscricoes(id,contato_id,workshop_id,status)`, `avulsas(id,contato_id,turma_id,data,status)`, `pecas(id,contato_id,descricao,data_deixou,estimativa,data_pronta,status,created_at)` e `relatorios(id,data,turma_id,autor,resumo,created_at)`.
Mapeie `uuid`, `text`, `date`, `time` e `timestamptz` para `string`, e mapeie `integer` e `numeric` para `number`.
Em `Row`, marque como `null` somente colunas anuláveis no SQL literal.
Em `Insert`, torne opcionais colunas com default e colunas anuláveis, e mantenha obrigatórias as colunas `not null` sem default.
Em `Update`, torne todas as propriedades opcionais e preserve a mesma nulabilidade de `Insert`.
Declare os relacionamentos de todas as foreign keys e `Functions.is_member` com `Args: Record<PropertyKey, never>` e `Returns: boolean`.

- [ ] **Green 4: criar o singleton configurável.**

Leia e remova espaços das duas variáveis.
Defina `isSupabaseConfigured` como verdadeiro somente quando ambas existirem.
Passe para `createClient<Database>` valores locais sintaticamente válidos quando faltarem chaves, como `https://placeholder.supabase.co` e `placeholder-anon-key`, para que import, teste e build nunca lancem erro.
Configure persistência de sessão, renovação automática e detecção de callback OAuth.
Nenhum fluxo pode chamar esse cliente remoto quando `isSupabaseConfigured` for falso.

- [ ] **Green 5: executar `npm run test -- src/lib/supabase-contract.test.ts`, `npm run typecheck` e `npm run build`.**

Os três comandos devem terminar com PASS ou exit code 0 sem arquivo `.env` local.

### Tarefa 3: Implementar o gate de Google OAuth e allowlist

**Arquivos:** `src/features/auth/auth.test.tsx`, `src/features/auth/auth-context.tsx`, `src/features/auth/login-page.tsx`, `src/features/auth/protected-route.tsx`, `src/app/router.tsx` e `src/app.tsx`.

- [ ] **Red 1: escrever os cenários visíveis do gate com o cliente Supabase mockado.**

A suíte `auth gate protects every internal route` deve cobrir os estados abaixo usando `createMemoryRouter` e uma rota interna sentinela chamada `Conteúdo privado`.
Sem configuração, a tela mostra `Configure o Supabase` e a sentinela não aparece, sem chamar `auth.getSession`, `rpc` ou OAuth.
Sem sessão, a tela mostra `Entrar com Google`, e o clique chama `signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })` uma vez.
Com sessão e `rpc("is_member")` retornando `true`, a sentinela aparece.
Com sessão e `rpc("is_member")` retornando `false`, a tela mostra `Acesso não autorizado` e a sentinela não aparece.
Com erro do RPC, o resultado permanece negado, mostra feedback recuperável e nunca libera a sentinela.
O botão `Sair` chama `supabase.auth.signOut()` e retorna ao estado sem sessão.

- [ ] **Red 2: executar `npm run test -- src/features/auth/auth.test.tsx`.**

O resultado esperado é FAIL porque os componentes de autenticação ainda não existem.

- [ ] **Green 1: implementar a máquina de estado de sessão.**

Quando não configurado, publique `unconfigured` sem tocar na rede.
Quando configurado, carregue a sessão atual, assine mudanças de auth e cancele a assinatura no cleanup.
Para cada sessão, publique `checking_member`, execute `rpc("is_member")` e publique `authorized` somente para retorno estritamente igual a `true` sem erro.
Trate retorno falso, nulo ou erro como negação por padrão.
Exponha `signInWithGoogle`, `signOut` e `retryMembership` pelo contexto.

- [ ] **Green 2: implementar as telas de autenticação.**

`LoginPage` deve preservar a identidade do shell, explicar que o acesso é interno e oferecer `Entrar com Google`.
A orientação sem configuração deve citar somente os nomes das duas variáveis públicas e nunca sugerir `service_role`.
A negação deve mostrar `Acesso não autorizado`, o email da sessão quando disponível, `Tentar novamente` e `Sair`.
Estados de carregamento devem ter texto acessível e não exibir conteúdo interno em segundo plano.

- [ ] **Green 3: proteger o roteador inteiro e compor o provider.**

Preserve `appRoutes` e `appRouter`.
Coloque `ProtectedRoute` acima do layout compartilhado e de todos os filhos internos, usando `<Outlet />` apenas em `authorized`.
Em `src/app.tsx`, mantenha a instância estável do `QueryClient`, envolva o roteador com `AuthProvider` e não duplique providers nos testes.

- [ ] **Green 4: executar `npm run test -- src/features/auth/auth.test.tsx`, `npm run test`, `npm run lint`, `npm run typecheck` e `npm run build`.**

Todos os comandos devem terminar com PASS ou exit code 0.

- [ ] **Refactor: remover duplicação somente com a suíte verde.**

Extraia apenas helpers de transição ou apresentação que já estejam duplicados.
Não crie store global adicional, camada de backend, abstração genérica de autorização ou APIs de domínio.

### Tarefa 4: Verify separado e captura

- [ ] **Gate 2 por agente diferente.**

Um agente Verify sem o context pack deve executar os dois oráculos nomeados, lint no diff e busca de segredos com `rg -n "service_role|SUPABASE_SERVICE_ROLE|eyJ" src .env.example supabase`.
O Verify deve confirmar que todas as rotas internas atravessam `ProtectedRoute`, que nenhum conteúdo interno pisca antes da allowlist e que o build sem `.env` termina com sucesso.
No limite da onda, o Verify deve executar `npm run test`, `npm run lint`, `npm run typecheck` e `npm run build` completos.

- [ ] **Commit atômico após PASS.**

Execute `git add package.json package-lock.json .env.example supabase src/env.d.ts src/lib src/features/auth src/app/router.tsx src/app.tsx`.
Execute `git commit -m "feat: add Supabase auth and member gate"`.
Não corte release e não configure serviços externos nesta fatia.
