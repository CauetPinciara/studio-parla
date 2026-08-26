---
id: 03-admin-workspace
milestone: m1
status: parked
depends_on: [02-admin-access-boundary]
files_modified: [src/workspaces/index.ts, src/app/navigation.ts, src/app/navigation.test.ts, src/components/Layout.tsx, src/components/Sidebar.tsx, src/components/Sidebar.test.tsx, src/App.tsx, src/features/admin/AdminPage.tsx, tests/e2e/admin.spec.ts, tests/e2e/__screenshots__/admin.spec.ts/admin-desktop.png, tests/e2e/__screenshots__/admin.spec.ts/admin-mobile.png]
acceptance: "Dado o member confirmado cauetpinciara@gmail.com, quando ele usa o seletor ou abre /admin, então vê o workspace Admin, a navegação Administração e a página estática autorizada; identidades pendentes, ausentes ou comuns nunca veem metadados ou conteúdo Admin e o acesso direto redireciona para /relatorios sem flash."
goal: "Expor um workspace Admin estático e visualmente contido sobre a fronteira de acesso entregue pela fatia 02."
must_not_break:
  - "Operação, Cadastros, Tática, seus destinos padrão, links ativos, deep links, reload e fallback para /relatorios."
  - "O seletor acessível, o fallback de visibleWorkspaces, o fechamento do drawer móvel e os fluxos de Relatórios e Tarefas."
  - "AdminAccessBoundary continua externo ao Layout e bloqueia o shell preview, identidades pendentes, ausentes e comuns antes de qualquer metadado Admin renderizar."
rules:
  - "Usar isSuperadminEmail como a única decisão de acesso desta fatia, preservar SUPERADMIN_EMAIL como o único literal autorizado e consumir AdminAccessBoundary sem criar outra regra."
  - "Layout passa member?.email ?? null como a única identidade de autorização para as duas instâncias de Sidebar; session.user.email pode continuar apenas como texto de identificação e nunca autoriza Admin."
  - "Manter /admin fora do mapa lazy e da árvore de rotas comuns, sempre atrás de AdminAccessBoundary."
  - "A página Admin é estática, sem ferramentas, dados, API, Supabase, schema, tipos gerados, migration, RLS, dependência, formulário, botão de ação ou persistência."
  - "Nenhum teste grava flag de autorização em localStorage; o único estado local permitido no E2E é a sessão Supabase controlada e o preview de shell já existente."
verifier_focus: "Tentar expor Admin com identidade pendente, ausente e comum; provar que só member.email confirmado atravessa a fronteira, que o seletor e o drawer funcionam por teclado e reload, que /admin não entra no mapa comum e que os baselines desktop e mobile são legíveis, contidos e sem overflow."
---

# Workspace Admin estático

> **Para o executor Nexo:** usar desenvolvimento guiado por testes nesta fatia e manter os contratos de acesso da fatia 02 bloqueados durante Green e Refactor.

**Goal:** Entregar um quarto workspace Admin estático, visível e navegável somente para o member confirmado que satisfaz a regra única de superadmin.

**Architecture:** A rota `/admin` continua irmã da árvore comum e mantém `AdminAccessBoundary` acima de `Layout`.
Depois da autorização, `Layout` passa somente `member.email` para as duas Sidebars, que filtram Admin pelo helper puro antes de resolver seleção e links.
`AdminPage` permanece um módulo visual raso, sem qualquer acesso a dados.

**Tech Stack:** React 19, React Router, Testing Library, Vitest, Playwright e componentes de Card existentes.

**Spec:** `nexo/runs/2026-08-25-workspace-admin-continuation/run.md` e `nexo/plans/workspace-admin-continuation/00-OVERVIEW.md`.

## Contratos consumidos

Esta fatia começa somente depois de `02-admin-access-boundary` verde e integrado.
Ela consome sem alterar `SUPERADMIN_EMAIL` e `isSuperadminEmail(email)` de `src/app/access.ts`.
Ela consome sem alterar `AdminAccessBoundary({ children })` de `src/components/AdminAccessBoundary.tsx`.
Ela preserva sem alterar o wrapper do shell comum e a rota `/admin` como irmã de topo entregues em `src/App.tsx` pela fatia 02.
Se qualquer caminho ou assinatura divergir no plano ou na implementação da fatia 02, o conjunto de planos deve ser corrigido antes de executar esta fatia.

O `member` de `useAuth()` é a linha confirmada pela consulta de `app_members`.
O e-mail da sessão não substitui esse contrato, inclusive no preview local usado pelos E2E.

## Escopo de workspace e navegação

Estender `WorkspaceId` com `admin` em `src/workspaces/index.ts`.
Adicionar Admin depois de Tática em `WORKSPACES` com `label: "Admin"`, `hint: "Configurações do sistema"` e `defaultPath: "/admin"`.
Preservar a ordem e os destinos de Operação, Cadastros e Tática.

Adicionar `ShieldCheck` e a entrada final de navegação `{ workspace: "admin", path: "/admin", title: "Administração", subtitle: "Configurações e acesso do sistema", icon: ShieldCheck }` em `src/app/navigation.ts`.
Preservar `DEFAULT_ROUTE = "/relatorios"` e o fallback de rota desconhecida.
`getNavigationItem("/admin")` e `getWorkspaceForPath("/admin")` devem resolver Admin para que o Layout autorizado mostre título, subtítulo e link ativo corretos.

Atualizar `src/app/navigation.test.ts` para bloquear as treze rotas na ordem completa e os quatro destinos padrão.
O teste também deve exigir normalização de `/admin/`, workspace `admin` e fallback desconhecido ainda apontando para `/relatorios` em Operação.

## Identidade confirmada no Layout

Adicionar `memberEmail?: string | null` à interface pública de `Sidebar`.
Em `src/components/Layout.tsx`, passar `memberEmail={member?.email ?? null}` tanto para a Sidebar desktop quanto para a Sidebar do drawer.
Não passar `session?.user.email` para `memberEmail` e não usar `userName` como entrada de autorização.
O `userName` existente pode continuar usando o nome confirmado ou o e-mail de sessão apenas para exibição no rodapé.

## Filtro seguro no seletor

Em `src/components/Sidebar.tsx`, importar somente `isSuperadminEmail` como regra de autorização.
Filtrar o workspace Admin antes de calcular o workspace ativo, o valor do seletor e os links visíveis.
Admin permanece disponível somente quando `isSuperadminEmail(memberEmail)` retorna verdadeiro.
`null`, `undefined`, e-mail comum e identidade ainda pendente devem produzir exatamente os três workspaces comuns.

Preservar o contrato de `visibleWorkspaces` da fatia 01.
Primeiro resolver a lista fornecida ou o fallback canônico de `WORKSPACES`, depois remover Admin quando o e-mail confirmado não for superadmin.
Se o filtro produzir uma lista vazia, usar a lista canônica sem Admin para que o `<select>` nunca receba um valor sem `<option>` correspondente.
Uma rota pertencente a um workspace oculto deve usar a primeira opção permitida sem navegar automaticamente.

Ao escolher Admin, o seletor nativo navega para `/admin` e chama `onNavigate` depois da escolha, preservando o fechamento do drawer.
Ao escolher um workspace comum, os destinos continuam `/relatorios`, `/contatos` e `/visao-geral`.
Não adicionar estado local, localStorage, tabs, `aria-selected` ou controle customizado de seleção.

Ampliar a suíte `seletor acessível de workspace` em `src/components/Sidebar.test.tsx`.
O caso `mostra Admin somente para o member superadmin` deve usar caixa e espaços para provar a integração com `isSuperadminEmail`, exigir a opção Admin, selecionar Admin e encontrar o link Administração com `aria-current="page"` em `/admin`.
O caso `omite Admin para member comum ou ausente` deve exigir apenas os três workspaces comuns, nenhum link Administração e nenhum texto administrativo.
O caso de lista filtrada deve cobrir um caller que oferece apenas Admin a um membro comum e exigir fallback comum seguro sem `onNavigate` automático.
Os testes existentes de label, dica, ids únicos, ausência de tabs, destinos padrão e fallback visível continuam bloqueados.

## Rota isolada e página estática

Criar `src/features/admin/AdminPage.tsx` como export default lazy-loadable.
A página usa somente `Card`, `CardHeader`, `CardTitle`, `CardDescription` e `CardContent` existentes.
Ela mostra exatamente `Área administrativa`, `Acesso de superadmin`, `Este espaço está reservado para configurações administrativas do Studio Parla.` e `Nenhuma ferramenta administrativa disponível ainda.`.
O card deve usar largura contida, espaçamento existente, texto legível e nenhuma ação interativa.
Não adicionar tabela, estatística, formulário, status remoto, chamada de dados ou promessa de ferramenta futura além do texto aprovado.

Em `src/App.tsx`, manter o mapa `pages` limitado às rotas comuns já entregues.
Definir `AdminPage` em uma importação lazy separada.
Filtrar `NAVIGATION_ITEMS` para que o mapeamento comum nunca crie `/admin` nem um `ComingSoonPage` administrativo.

Substituir o placeholder autorizado da fatia 02 por uma rota de topo dedicada com esta composição externa para interna:

```tsx
<Route
  path="/admin"
  element={
    <AdminAccessBoundary>
      <Layout />
    </AdminAccessBoundary>
  }
>
  <Route
    index
    element={
      <Suspense fallback={<LoadingState />}>
        <AdminPage />
      </Suspense>
    }
  />
</Route>
```

`AdminAccessBoundary` deve montar antes de `Layout`, e `Layout` deve montar antes de `AdminPage`.
Assim, loading, membership pendente, sessão ausente e membro comum não renderizam título, subtítulo, seletor, link ou conteúdo Admin antes do redirect.
Preservar sem alteração o wrapper de shell comum criado na fatia 02.
O shell preview continua pertencendo somente à árvore comum e nunca envolve `/admin`.
A rota `/admin` permanece irmã de topo da árvore comum, por isso nem `Protected` nem o preview local decidem a autorização administrativa.

## E2E autorizado e não autorizado

Criar `tests/e2e/admin.spec.ts` com relógio fixo, viewport explícito e um helper local de identidade.
O helper deve gravar apenas a sessão de teste esperada pelo cliente Supabase em `sb-placeholder-auth-token` e o preview de shell já existente.
Ele não pode gravar `isAdmin`, `isSuperadmin`, member, role ou qualquer flag de permissão em localStorage.

A sessão deve conter tokens fictícios não secretos, expiração futura e `user.email` controlado.
Interceptar `https://placeholder.supabase.co/rest/v1/app_members**` e devolver uma linha confirmada com `email`, `nome` e `created_at`, `null` para ausência, ou uma resposta adiada para o estado pendente.
Interceptar qualquer outra chamada REST do shell com arrays vazios e nunca acessar um domínio real.

O teste `não expõe Admin para identidade pendente, ausente ou comum` deve executar três cenários isolados.
Enquanto a consulta `app_members` estiver adiada, `/admin` mostra somente `Carregando…` e não monta `Admin`, `Administração`, `Área administrativa` ou `Acesso de superadmin`.
Depois de confirmar um membro comum, a URL termina em `/relatorios`, o seletor não contém Admin e nenhum texto administrativo aparece.
Sem sessão, `/admin` também redireciona para `/relatorios` sem flash de metadado ou conteúdo Admin.

O teste `abre Admin somente para o superadmin pelo seletor, rota direta e reload` deve confirmar uma linha `app_members` com `cauetpinciara@gmail.com`.
Ele deve primeiro abrir `/admin` diretamente e exigir heading `Administração`, subtítulo `Configurações e acesso do sistema`, os quatro textos estáticos e o link Administração com `aria-current="page"`.
Depois, partindo de `/relatorios`, deve focar o seletor Workspace, pressionar `End` para escolher a última opção Admin, exigir valor `admin` e chegar a `/admin` com a navegação desktop no estado correto.
Depois de recarregar `/admin`, todos esses elementos continuam presentes e o seletor continua com valor `admin`.

O teste `mantém Admin contido no celular e fecha o drawer` deve usar 390 por 844.
Ele abre `Navegação principal`, foca o seletor nativo, pressiona `End` para escolher Admin, exige valor `admin`, confirma o fechamento do dialog e confirma a página autorizada.
Ele deve verificar `document.documentElement.scrollWidth <= document.documentElement.clientWidth` e todos os textos do card visíveis sem recorte horizontal.

O caso visual autorizado captura nenhuma lista, nenhuma ferramenta e somente o shell mais o card estático.
Capturar `admin-desktop.png` em 1440 por 900 e `admin-mobile.png` em 390 por 844.
Revisar os PNGs em tamanho original para hierarquia, espaçamento, contraste, quebra de texto, seletor Admin, link ativo, drawer fechado, foco visível e ausência de overflow.

## Red

1. Atualizar primeiro `navigation.test.ts` e `Sidebar.test.tsx` com os casos bloqueados de Admin autorizado e oculto.
2. Criar `admin.spec.ts` com os cenários pendente, ausente, comum, autorizado, teclado, reload, drawer e overflow antes de alterar produção.
3. Rodar exatamente este comando unitário em modo run-once antes de alterar produção:

```bash
npm run test -- src/app/navigation.test.ts src/components/Sidebar.test.tsx
```

O Red válido é FAIL nas novas assertions de Admin: a navegação pré-implementação ainda expõe doze rotas e três destinos, não resolve `/admin` como workspace `admin`, e a Sidebar autorizada ainda não encontra a opção Admin nem o link Administração.
Falha de import, configuração, ambiente ou teste não relacionado não conta como Red válido.

4. Rodar exatamente este comando Playwright funcional com um único worker e snapshots ignorados antes de alterar produção:

```bash
npm run test:e2e -- tests/e2e/admin.spec.ts --project=chromium --workers=1 --ignore-snapshots
```

O Red válido é FAIL nas assertions autorizadas porque o placeholder da fatia 02 ainda redireciona `/admin` para `/relatorios`, o seletor ainda não oferece Admin e `Administração` e `Área administrativa` ainda não existem.
Os cenários negados podem passar nesse estágio, mas falha para iniciar navegador ou servidor, timeout de infraestrutura, porta ocupada ou chamada remota não conta como Red válido.

5. Confirmar `lsof -nP -iTCP:4173 -sTCP:LISTEN` vazio depois do comando Playwright.
6. Registrar ambos os Reds sem relaxar assertions, usar shell preview como autorização ou gerar baselines opacos.

## Green

1. Estender `WorkspaceId`, `WORKSPACES`, navegação e testes sem alterar destinos comuns.
2. Passar `member?.email ?? null` nas duas Sidebars e filtrar Admin com `isSuperadminEmail` antes do fallback do seletor.
3. Criar o card estático Admin sem dados nem ações.
4. Ligar `/admin` na rota dedicada atrás de `AdminAccessBoundary`, fora do mapa comum.
5. Repetir o comando unitário exato do Red e exigir PASS.
6. Repetir o comando Playwright funcional exato do Red, ainda com `--workers=1 --ignore-snapshots`, e exigir PASS antes de criar qualquer baseline.
7. Gerar os dois baselines Admin uma única vez com o comando exato da seção `Geração visual no Green`.
8. Inspecionar ambos em resolução original e executar o comando exato de `Pós-Green` sem `--ignore-snapshots` e sem `--update-snapshots`.

## Refactor

1. Remover duplicação local de listas permitidas sem criar outro helper de autorização.
2. Confirmar que o literal `cauetpinciara@gmail.com` não foi repetido em nenhum arquivo de produção desta fatia.
3. Confirmar que `pages` e o mapeamento de rotas comuns não incluem Admin.
4. Confirmar que não há import ou chamada Supabase em `AdminPage`, `Sidebar`, navegação ou workspaces.
5. Repetir todos os oráculos de Gate 2 com o worktree limpo, incluindo os testes de composição de `App` herdados da fatia 02.

## Oráculos de Gate 2

Executar em modo run-once e nesta ordem:

```bash
npm run test -- src/app/access.test.ts src/components/AdminAccessBoundary.test.tsx src/App.test.tsx src/app/navigation.test.ts src/components/Sidebar.test.tsx
npm run test:e2e -- tests/e2e/admin.spec.ts --project=chromium --workers=1
npm run typecheck
npx eslint src/workspaces/index.ts src/app/navigation.ts src/app/navigation.test.ts src/components/Layout.tsx src/components/Sidebar.tsx src/components/Sidebar.test.tsx src/App.tsx src/features/admin/AdminPage.tsx tests/e2e/admin.spec.ts --max-warnings=0
git diff --check "$(git merge-base main HEAD)" HEAD -- src/workspaces/index.ts src/app/navigation.ts src/app/navigation.test.ts src/components/Layout.tsx src/components/Sidebar.tsx src/components/Sidebar.test.tsx src/App.tsx src/features/admin/AdminPage.tsx tests/e2e/admin.spec.ts tests/e2e/__screenshots__/admin.spec.ts/admin-desktop.png tests/e2e/__screenshots__/admin.spec.ts/admin-mobile.png
git diff --exit-code "$(git merge-base main HEAD)" HEAD -- src/app/access.ts src/components/AdminAccessBoundary.tsx supabase src/lib/database.types.ts package.json package-lock.json
test "$(rg -o --fixed-strings 'cauetpinciara@gmail.com' src --glob '!*.test.ts' --glob '!*.test.tsx' | wc -l | tr -d ' ')" = "1"
```

Os testes de `access`, `AdminAccessBoundary` e composição de `App` da fatia 02 são oráculos de regressão obrigatórios.
O Playwright deve executar uma única vez, com `workers: 1`, sem watch e sem atualização de snapshots no Verify.

## Geração visual no Green

Somente depois de os comandos funcionais Green passarem, gerar os baselines uma única vez com:

```bash
npm run test:e2e -- tests/e2e/admin.spec.ts --project=chromium --workers=1 --update-snapshots
```

Esse comando deve criar ou atualizar somente `admin-desktop.png` e `admin-mobile.png`.
Ele não substitui o E2E funcional Green nem o Gate 2 sem atualização.

## Pós-Green

Inspecionar `admin-desktop.png` e `admin-mobile.png` em resolução original e então executar exatamente:

```bash
npm run test:e2e -- tests/e2e/admin.spec.ts --project=chromium --workers=1
```

O resultado esperado é PASS com os dois baselines verificados, sem `--ignore-snapshots` e sem `--update-snapshots`.
Ao terminar cada execução Playwright, `lsof -nP -iTCP:4173 -sTCP:LISTEN` deve retornar vazio.
Se o processo de teste deixar servidor, navegador, watcher ou worker, encerrar somente o grupo de processos iniciado por esta fatia antes de continuar.

## Revisão objetiva de escopo

O Verify deve confirmar que somente os onze caminhos de `files_modified` mudaram.
O Verify deve confirmar que `src/app/access.ts` e `src/components/AdminAccessBoundary.tsx` foram apenas consumidos e não modificados.
O Verify deve confirmar que `supabase/schema.sql`, `src/lib/database.types.ts`, `supabase/migrations`, `supabase/seed.sql` e `package-lock.json` não mudaram.
O Verify deve buscar qualquer segundo literal de e-mail autorizado, regra por `session.user.email`, flag de permissão em localStorage, entrada Admin no mapa comum, acesso remoto ou ferramenta administrativa e falhar se encontrar um deles.
