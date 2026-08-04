---
id: 01-shell-visual
milestone: m1
status: todo
depends_on: []
files_modified:
  - .gitignore
  - package.json
  - package-lock.json
  - index.html
  - tsconfig.json
  - tsconfig.app.json
  - tsconfig.node.json
  - vite.config.ts
  - vitest.config.ts
  - eslint.config.js
  - components.json
  - playwright.config.ts
  - parla.html
  - reference/parla.html
  - src/main.tsx
  - src/app.tsx
  - src/index.css
  - src/vite-env.d.ts
  - src/app/navigation.ts
  - src/app/navigation.test.ts
  - src/app/router.tsx
  - src/components/layout/app-shell.tsx
  - src/components/layout/sidebar-navigation.tsx
  - src/components/layout/mobile-navigation.tsx
  - src/components/pages/route-placeholder.tsx
  - src/components/ui/button.tsx
  - src/components/ui/card.tsx
  - src/components/ui/separator.tsx
  - src/components/ui/sheet.tsx
  - src/lib/utils.ts
  - src/test/setup.ts
  - tests/e2e/shell.spec.ts
  - tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png
  - tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png
acceptance: >-
  Dado o app aberto em desktop ou em 390 px, quando a usuária alterna Operação, Cadastros e Tática e navega diretamente ou após recarregar qualquer uma das 11 URLs, então marca e título ativos acompanham a URL, o shell preserva a identidade visual do protótipo, a navegação móvel permanece acessível, os dois snapshots aprovados não mudam e test, lint, typecheck, E2E e build passam.
---

# Shell visual do Studio Parla

> Para agentes executores: usar TDD e executar este plano somente após o Gate 1 do Nexo.

**Objetivo:** Criar a base Vite/React tipada e o shell responsivo que organiza todos os workspaces e rotas do protótipo.
**Arquitetura:** `navigation.ts` será a fonte única de metadados, `router.tsx` mapeará esses dados para páginas placeholder e `AppShell` consumirá a URL para montar cabeçalho e navegação.
**Stack:** Vite, React, TypeScript estrito, React Router, TanStack Query, Tailwind CSS, shadcn/ui, Vitest, Testing Library e Playwright.

## Escopo e limites

- Inclui scaffold, providers, tokens, componentes shadcn mínimos, layout desktop/mobile, 11 rotas, placeholders e preservação do protótipo em `reference/parla.html`.
- Exclui Supabase, autenticação, dados, CRUD, regras operacionais, deploy e conteúdo funcional das páginas.
- Preservar `#FAFAF8`, `#FFFFFF`, `#2A2724`, `#8B847A`, `#B5623C`, `#F4E9E2`, `#ECE7DF`, raio de 12 px, tipografia de sistema, textos em português e sidebar desktop de 242 px.
- Não registrar credenciais, não adicionar backend e não criar workflow hospedado.

## Interfaces fechadas

```ts
export type WorkspaceId = "operacao" | "cadastros" | "tatica";
export type NavigationItem = { id: string; workspace: WorkspaceId; path: `/${string}`; title: string; subtitle: string; icon: LucideIcon };
export type Workspace = { id: WorkspaceId; label: string; hint: string; defaultPath: `/${string}` };
export const DEFAULT_ROUTE = "/relatorios" as const;
export const NAVIGATION_ITEMS: readonly NavigationItem[];
export const WORKSPACES: readonly Workspace[];
export function getNavigationItem(pathname: string): NavigationItem;
export function getWorkspaceForPath(pathname: string): Workspace;
```

- Rotas de Operação: `/relatorios`, `/pecas`, `/calendario`, `/atendimento` e `/fechamento`.
- Rotas de Cadastros: `/contatos`, `/matriculas`, `/turmas`, `/workshops` e `/precos`.
- Rota de Tática: `/visao-geral`.
- `src/app/router.tsx` exporta `appRoutes: RouteObject[]` e `appRouter`; `src/app.tsx` exporta `App` e compõe `QueryClientProvider` com `RouterProvider`.
- `AppShell` renderiza `Outlet`; `SidebarNavigation` recebe `onNavigate?: () => void`; `MobileNavigation` fecha o `Sheet` após navegação; `RoutePlaceholder` recebe `title` e `description`.
- `Button`, `Card`, `Separator` e `Sheet` mantêm as APIs geradas pelo shadcn, e `cn(...inputs: ClassValue[]): string` fica em `src/lib/utils.ts`.

## Arquivos e responsabilidades

- Configuração raiz: manifests, TypeScript estrito, Vite com React e Tailwind, ESLint sem warnings, Vitest jsdom, Playwright Chromium e aliases `@/*`.
- `src/index.css`: tokens semânticos, reset, foco visível, fundo, superfícies e breakpoints derivados do protótipo.
- `src/app/navigation.ts`: workspaces, ordem, rótulos, subtítulos, ícones Lucide, defaults e resolução da URL.
- `src/app/router.tsx`: redirect de `/` e `*` para `/relatorios`, layout compartilhado e placeholders das 11 rotas.
- `src/components/layout/*`: marca Studio Parla, tabs de workspace, links ativos, cabeçalho, data em pt-BR e drawer móvel acessível.
- `tests/e2e/shell.spec.ts`: oráculo semântico e visual; `snapshotPathTemplate` gera exatamente os dois PNGs listados no frontmatter.

## Contrato TDD e execução

### 1. Preparar o harness sem implementar o shell

- [ ] Mover `parla.html` para `reference/parla.html` sem alterar bytes e criar os arquivos de configuração listados no frontmatter.
- [ ] Instalar React, Router, Query, Lucide, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-dialog`, `@radix-ui/react-separator`; instalar como dev Vite, TypeScript, Tailwind, ESLint, Vitest, jsdom, Testing Library, user-event e Playwright.
- [ ] Definir scripts `dev`, `build: tsc -b && vite build`, `lint: eslint . --max-warnings=0`, `test: vitest run`, `test:e2e: playwright test`, `typecheck: tsc -b --pretty false` e `preview`.
- [ ] Executar `npm install` e `npx playwright install chromium` para materializar `package-lock.json` e o navegador local.

### 2. Red: travar o oráculo

- [ ] Em `navigation.test.ts`, exigir a lista exata das 11 tuplas workspace/path/title, defaults de cada workspace, normalização de barra final e fallback para `/relatorios`.
- [ ] Em `shell.spec.ts`, nomear os testes `mantém os três workspaces e a rota ativa após recarregar`, `oferece navegação móvel sem perder contexto` e `preserva o shell visual em desktop e mobile`.
- [ ] O E2E deve abrir `/relatorios`, alternar para Cadastros e Tática, confirmar `/contatos` e `/visao-geral`, recarregar, testar deep link, nomes acessíveis, foco, drawer a 390x844 e snapshots a 1440x1000 e 390x844.
- [ ] Rodar `npm run test -- src/app/navigation.test.ts` e confirmar FAIL por módulo ausente; rodar `npm run test:e2e -- tests/e2e/shell.spec.ts` e confirmar FAIL pela ausência da marca `Studio Parla`.

### 3. Green: implementar o mínimo do contrato

- [ ] Implementar `navigation.ts`, `RoutePlaceholder`, `appRoutes`, redirects, `appRouter`, `App`, `main.tsx` e os providers conforme as interfaces fechadas.
- [ ] Implementar tokens, primitives shadcn e layout com `<aside>` desktop, `Sheet` móvel, `NavLink`, `aria-current`, tablist de workspaces, título/subtítulo por rota e `Vitória/ES`.
- [ ] Fazer o seletor levar ao `defaultPath`, preservar deep links e fechar o drawer depois de qualquer link.
- [ ] Rodar os dois comandos Red novamente e confirmar PASS sem afrouxar asserções.

### 4. Refactor, visual e Verify

- [ ] Com testes verdes, remover duplicação entre desktop e mobile mantendo `SidebarNavigation` como composição compartilhada.
- [ ] Gerar baselines com `npm run test:e2e -- --update-snapshots --grep "preserva o shell visual"`, inspecionar os dois PNGs contra `reference/parla.html` e então rodar o mesmo teste sem `--update-snapshots`.
- [ ] Um agente Verify separado roda `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` e `npm audit --omit=dev --audit-level=high`.
- [ ] Após Gate 2 verde, o Nexo cria um único commit convencional: `feat: add Studio Parla application shell`.
