---
id: 09-admin-workspace
milestone: m1
status: parked
depends_on: [08-admin-access]
files_modified: [src/workspaces/index.ts, src/app/navigation.ts, src/app/navigation.test.ts, src/components/Layout.tsx, src/components/Sidebar.tsx, src/components/Sidebar.test.tsx, src/App.tsx, src/features/admin/AdminPage.tsx, tests/e2e/admin.spec.ts]
acceptance: "Dado o member confirmado cauetpinciara@gmail.com, quando ele usa o seletor ou abre /admin, entao ve o workspace Admin, a navegacao Administracao e a pagina estatica; qualquer outro member nunca ve essas opcoes e o acesso direto redireciona para /relatorios; os fluxos funcionam por teclado, reload e viewport movel."
goal: "Adicionar o workspace Admin estatico sobre a fronteira segura da fatia 08."
must_not_break: ["Os tres workspaces comuns, o seletor da fatia 07, Tarefas, rotas comuns e fallback para /relatorios.", "Nenhum Layout ou conteudo Admin aparece antes da fronteira de acesso."]
rules: ["Layout passa somente member.email confirmado para a Sidebar.", "SUPERADMIN_EMAIL e isSuperadminEmail sao a unica regra de autorizacao.", "Nao adicionar dados, ferramentas administrativas, schema, tipos, RLS, migration ou chamada Supabase."]
verifier_focus: "Provar visibilidade e rota para superadmin, ocultacao e redirect para membro comum, ausencia de bypass no shell preview e responsividade sem overflow."
---

# Workspace Admin estatico

## Escopo

Adicionar `admin` a `WorkspaceId`, com label `Admin`, dica `Configurações do sistema` e destino `/admin`.
Adicionar a entrada `Administração` em `NAVIGATION_ITEMS` com o icone `ShieldCheck`.

`Layout` deve passar `member?.email ?? null` para as duas instancias de `Sidebar`.
Esse `member` ja e o resultado confirmado pela consulta da allowlist.
`Sidebar` filtra o workspace Admin antes de resolver o fallback da fatia 07 e nunca consulta `session.user.email` para autorizar.
Membros comuns continuam com exatamente Operacao, Cadastros e Tatica.

Em `App.tsx`, manter Admin fora do mapa de rotas comuns.
Substituir o placeholder da fatia 08 por uma rota `/admin` cujo `AdminAccessBoundary` envolve `Layout`, `Suspense` e `AdminPage`, nessa ordem externa para interna.

`AdminPage` e estatica e usa os componentes `Card` existentes.
Ela mostra `Área administrativa`, `Acesso de superadmin`, `Este espaço está reservado para configurações administrativas do Studio Parla.` e `Nenhuma ferramenta administrativa disponível ainda.`.

## Red

1. Atualizar `navigation.test.ts` para incluir Admin sem perder as rotas entregues ate a fatia 06.
2. Acrescentar em `Sidebar.test.tsx` os casos `mostra Admin somente para o member superadmin` e `omite Admin para member comum`.
3. Criar `admin.spec.ts` com sessao local controlada e interceptacao de `app_members`, sem alterar codigo de producao para facilitar o teste.
4. Provar no E2E que membro comum nao recebe a opcao Admin e que `/admin` redireciona sem qualquer texto administrativo.
5. Provar que o superadmin seleciona Admin, chega a `/admin`, ve a pagina estatica, recarrega e preserva `aria-current="page"`.
6. Repetir a navegacao por teclado em 390 por 844 e exigir ausencia de overflow horizontal.
7. Registrar FAIL antes de adicionar workspace, rota e pagina.

## Green

1. Estender workspace e navegacao de forma aditiva.
2. Passar `member.email` confirmado e filtrar Admin na `Sidebar` usando `isSuperadminEmail`, sem repetir o literal.
3. Ligar a pagina na rota de topo ja protegida, garantindo que a rota comum nunca renderize Admin por engano.
4. Implementar apenas o card estatico e nenhum acesso a dados.
5. Refatorar somente depois dos testes unitarios e E2E verdes.

## Oraculos de Gate 2

```bash
npm run test -- src/app/navigation.test.ts src/components/Sidebar.test.tsx
npm run test:e2e -- tests/e2e/admin.spec.ts --project=chromium
npm run typecheck
npx eslint src/workspaces/index.ts src/app/navigation.ts src/app/navigation.test.ts src/components/Layout.tsx src/components/Sidebar.tsx src/components/Sidebar.test.tsx src/App.tsx src/features/admin/AdminPage.tsx tests/e2e/admin.spec.ts --max-warnings=0
git diff --check
```

O E2E deve interceptar todas as chamadas REST usadas pelo shell, devolver apenas o member correspondente na consulta `app_members` e nunca gravar permissao em localStorage.
O Verify deve confirmar que `supabase/schema.sql`, `src/lib/database.types.ts` e `supabase/migrations` nao foram alterados nesta fatia.
