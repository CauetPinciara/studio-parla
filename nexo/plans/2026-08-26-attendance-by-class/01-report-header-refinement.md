---
id: 01-report-header-refinement
milestone: m1
status: done
depends_on: []
files_modified: [src/features/relatorios/date-navigation.ts, src/features/relatorios/date-navigation.test.ts, src/features/relatorios/RelatorioDayHeader.tsx, tests/e2e/relatorios.spec.ts, tests/e2e/shell.spec.ts, tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png, tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png, tests/e2e/__screenshots__/shell.spec.ts/shell-report-calendar-open.png, tests/e2e/__screenshots__/shell.spec.ts/shell-workspace-select-open.png]
acceptance: >-
  Dado hoje fixo em 04/08/2026 no fuso America/Sao_Paulo, quando Catarina abre o relatório de 26/08/2026 no desktop, então o header não contém Dia selecionado, a navegação fica centralizada, o calendário mostra exatamente Quarta Feira, 26/08/2026, Ir para hoje aparece como ação textual somente enquanto a data difere de hoje e Tudo anotado! permanece alinhado à direita; no mobile, os mesmos controles úteis permanecem em uma linha sem overflow horizontal e o Calendar shadcn continua abrindo e selecionando datas.
goal: "Refinar somente o header diário para comunicar e navegar a data com a hierarquia visual aprovada em desktop e mobile."
must_not_break:
  - "A URL data=YYYY-MM-DD continua sendo a fonte de verdade, incluindo anterior, próximo, calendário, deep link, reload e normalização para hoje."
  - "A navegação entre datas continua sem POST ou PATCH e sem criar relatórios vazios."
  - "Tudo anotado! preserva posição à direita, aria-label, aria-pressed, estado disabled, mutation, invalidação, toast e persistência atuais."
  - "O Popover e o Calendar shadcn Radix permanecem acessíveis, opacos, não recortados e selecionam no fuso America/Sao_Paulo."
  - "O drawer mobile, o seletor de workspace, o conteúdo do relatório e os quatro baselines compartilhados continuam visualmente íntegros."
rules:
  - "Executar Red, Green e Refactor, mantendo o E2E nomeado como oráculo bloqueado durante toda a implementação."
  - "Usar apenas os Button, Popover e Calendar shadcn já instalados, a base Radix, ícones lucide e tokens semânticos existentes."
  - "Renderizar o texto visível exato Ir para hoje somente quando selectedDate !== today; não substituir por Hoje, ícone isolado, tooltip ou controle nativo."
  - "No desktop, centralizar o grupo de navegação em relação à largura interna do content header, independentemente da largura de Tudo anotado!."
  - "No mobile, priorizar uma única linha, label curta e truncamento local sem esconder Ir para hoje quando aplicável e sem overflow da página."
  - "Não alterar Layout, componentes ui, API, banco, schema, tipos gerados, dependências, conteúdo do relatório ou semântica de completion nesta fatia."
  - "Não aplicar migração, não acessar Supabase remoto e não atualizar qualquer screenshot fora dos quatro caminhos declarados."
  - "Executar Playwright somente em modo run-once, com um worker, e confirmar que a porta 4173 fica livre ao final."
verifier_focus: "Provar o texto desktop exato, a ausência total de Dia selecionado, a centralização geométrica do grupo em 1440x1000, a renderização condicional e textual de Ir para hoje, a borda direita de Tudo anotado!, o calendário shadcn funcional, os quatro baselines inspecionados em tamanho original e ausência de overflow em 390x844."
---

# Refinamento do header do relatório diário

> **Para o executor Nexo:** usar test-driven-development dentro desta fatia e tratar o teste Playwright `refina o header diário com navegação central e retorno condicional a hoje` como oráculo bloqueado.

**Goal:** Refinar o header diário sem alterar dados, conteúdo ou conclusão do relatório.

**Architecture:** `date-navigation.ts` passa a produzir o label desktop determinístico a partir da data ISO já normalizada.
`RelatorioDayHeader` compõe o grupo de navegação em uma coluna central independente e mantém `Tudo anotado!` em uma coluna direita, com fallback flexível no mobile.
Os E2E verificam semântica, geometria, calendário, responsividade e snapshots contra relógio e API locais controlados.

**Tech Stack:** React 19, React Router 7, Tailwind CSS 4, shadcn/ui Radix, React DayPicker, Vitest e Playwright.

**Spec:** `docs/superpowers/specs/2026-08-26-attendance-by-class-design.md` e `nexo/plans/2026-08-26-attendance-by-class/00-OVERVIEW.md`.

## Escopo e ownership canônico

Modificar `src/features/relatorios/date-navigation.ts` para expor somente o formatter desktop novo.
Modificar `src/features/relatorios/date-navigation.test.ts` para bloquear a grafia, capitalização e zero padding do formatter.
Modificar `src/features/relatorios/RelatorioDayHeader.tsx` para remover o label antigo, centralizar a navegação, condicionar a ação de retorno e preservar os contratos existentes de calendário e completion.
Modificar `tests/e2e/relatorios.spec.ts` para transformar o contrato atual do header no oráculo nomeado e ajustar os fluxos que hoje procuram um botão `Hoje` sempre presente.
Modificar `tests/e2e/shell.spec.ts` para remover a expectativa obsoleta, capturar a data representativa 26/08/2026 e manter os fluxos de shell.
Regenerar os quatro PNGs de shell declarados porque todos mostram o header de relatório, inclusive o baseline com o seletor de workspace aberto.

Nenhum outro arquivo pertence a esta fatia.
Em especial, `src/components/Layout.tsx`, `src/components/ui/button.tsx`, `src/components/ui/calendar.tsx`, `src/components/ui/popover.tsx`, APIs, páginas, schema e migrations são somente interfaces consumidas.

## Interfaces consumidas e produzidas

### Produzida por `date-navigation.ts`

```ts
export function formatReportHeaderDate(date: string): string
```

`date` é uma data ISO gregoriana já normalizada no formato `YYYY-MM-DD`.
O retorno é o texto desktop com weekday em português sem hífen, vírgula, espaço e data numérica com zero padding.
Para `2026-08-26`, o retorno exato é `Quarta Feira, 26/08/2026`.
Para `2026-08-04`, o retorno exato é `Terça Feira, 04/08/2026`.
Uma data inválida lança `RangeError`, coerente com `shiftReportDate`, embora o componente consuma apenas datas já normalizadas.

### Consumidas por `RelatorioDayHeader`

- `normalizeReportDate(candidate, today)` continua selecionando a data canônica da URL.
- `reportTodayIso()` continua calculando hoje em `America/Sao_Paulo`.
- `shiftReportDate(selectedDate, days)` continua produzindo anterior e próximo.
- `Popover`, `PopoverTrigger asChild`, `PopoverContent` e `Calendar mode="single"` continuam sendo o date picker oficial.
- `Button`, `CalendarDays`, `ChevronLeft`, `ChevronRight` e `CheckCircle2` continuam usando componentes e ícones instalados.
- `createRelatorio`, `setRelatorioCompletion`, `relatoriosQueryKey`, React Query e Sonner permanecem sem mudança.

### Produzidas por `RelatorioDayHeader`

- Um grupo `role="group"` com `aria-label="Navegação da data"` contém anterior, seletor de data, próximo e, somente fora de hoje, `Ir para hoje`.
- O botão do calendário mantém `aria-label="Selecionar data"` e exibe o formatter novo a partir de `sm`, com o label compacto existente abaixo de `sm`.
- O botão visível `Ir para hoje` usa `variant="ghost"`, `size="sm"`, navega para `today` e não existe no DOM quando `selectedDate === today`.
- O botão `Tudo anotado!` permanece irmão do grupo, à direita, com os mesmos props, handler e conteúdo responsivo atuais.
- O wrapper usa uma grade de três colunas a partir de `lg`, com a navegação na coluna central e completion na coluna direita.
- Abaixo de `lg`, o wrapper e o grupo usam flex, `min-w-0`, larguras flexíveis e gaps compactos para preservar uma única linha.

## Task 1: Red unitário do label desktop

**Files:**

- Modify: `src/features/relatorios/date-navigation.test.ts`
- Modify depois do Red: `src/features/relatorios/date-navigation.ts`

**Interfaces:**

- Consumes: `parseReportDate(candidate: string): ReportDateParts | null`, privado no mesmo módulo.
- Produces: `formatReportHeaderDate(date: string): string` para o header e para o E2E visual.

- [ ] Adicionar o caso `formata o rótulo desktop exato do header` antes de alterar produção.

```ts
it("formata o rótulo desktop exato do header", () => {
  expect(formatReportHeaderDate("2026-08-26")).toBe(
    "Quarta Feira, 26/08/2026",
  );
  expect(formatReportHeaderDate("2026-08-04")).toBe(
    "Terça Feira, 04/08/2026",
  );
  expect(() => formatReportHeaderDate("2026-02-30")).toThrow(
    "Invalid report date: 2026-02-30",
  );
});
```

- [ ] Importar `formatReportHeaderDate` no mesmo bloco de imports das regras existentes.
- [ ] Rodar o teste focado e observar falha pela ausência do export.

```bash
npm run test -- src/features/relatorios/date-navigation.test.ts -t "formata o rótulo desktop exato do header"
```

Um Red válido coleta a suite e falha porque `formatReportHeaderDate` ainda não existe.
Erro de sintaxe, alias, setup ou coleta não é Red válido.

## Task 2: Red E2E do header aprovado

**Files:**

- Modify: `tests/e2e/relatorios.spec.ts`
- Modify: `tests/e2e/shell.spec.ts`
- Test: `tests/e2e/relatorios.spec.ts` com o oráculo nomeado.

**Interfaces:**

- Consumes: relógio Playwright fixo em `2026-08-04T14:00:00-03:00`, `installStudioApi(page)`, rota `/relatorios?data=2026-08-26` e shell preview.
- Produces: contrato de DOM `Navegação da data`, texto exato, geometria desktop, condição de hoje, calendário e ausência de overflow.

- [ ] Renomear e reescrever o caso atual do header para `refina o header diário com navegação central e retorno condicional a hoje`.
- [ ] Abrir desktop em 1440 por 1000 diretamente em `/relatorios?data=2026-08-26`.
- [ ] Exigir zero ocorrências de `Dia selecionado` e uma ocorrência visível exata de `Quarta Feira, 26/08/2026`.
- [ ] Localizar o grupo por `getByRole("group", { name: "Navegação da data" })` e `Tudo anotado!` fora desse grupo.
- [ ] Exigir `Ir para hoje` como botão e texto visível, clicar nele, confirmar URL `data=2026-08-04`, label `Terça Feira, 04/08/2026` e ausência total da ação.
- [ ] Navegar novamente para 26/08/2026, abrir `Selecionar data`, confirmar o grid `agosto 2026`, escolher 05/08/2026 e confirmar a URL.
- [ ] Medir o centro horizontal do grupo contra o centro interno do content header com tolerância máxima de 1 pixel.
- [ ] Medir a borda direita de `Tudo anotado!` contra a borda interna direita do content header com tolerância máxima de 1 pixel.
- [ ] Repetir em 390 por 844 fora de hoje, exigir `Ir para hoje`, anterior, próximo, calendário e completion visíveis, todos na mesma faixa vertical do header e sem overflow horizontal.
- [ ] No estado mobile de hoje, exigir que `Ir para hoje` deixe de existir sem deslocar o conteúdo para fora da viewport.

O núcleo geométrico deve ter esta forma, com guard explícito contra `boundingBox()` nulo antes da aritmética:

```ts
const contentHeader = page.locator("main > header");
const navigation = contentHeader.getByRole("group", {
  name: "Navegação da data",
});
const completion = contentHeader.getByRole("button", {
  name: "Tudo anotado!",
});
const [headerBox, navigationBox, completionBox] = await Promise.all([
  contentHeader.boundingBox(),
  navigation.boundingBox(),
  completion.boundingBox(),
]);

expect(headerBox).not.toBeNull();
expect(navigationBox).not.toBeNull();
expect(completionBox).not.toBeNull();

const headerStyle = await contentHeader.evaluate((element) => {
  const style = getComputedStyle(element);
  return {
    paddingLeft: Number.parseFloat(style.paddingLeft),
    paddingRight: Number.parseFloat(style.paddingRight),
  };
});
const innerLeft = headerBox!.x + headerStyle.paddingLeft;
const innerRight = headerBox!.x + headerBox!.width - headerStyle.paddingRight;
const innerCenter = (innerLeft + innerRight) / 2;
const navigationCenter = navigationBox!.x + navigationBox!.width / 2;

expect(Math.abs(navigationCenter - innerCenter)).toBeLessThanOrEqual(1);
expect(
  Math.abs(completionBox!.x + completionBox!.width - innerRight),
).toBeLessThanOrEqual(1);
```

O guard mobile deve continuar baseado no documento completo:

```ts
expect(
  await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  ),
).toBe(true);
```

- [ ] Atualizar o caso `abre hoje e navega sem criar dias vazios` para provar que `Ir para hoje` não existe em hoje, aparece depois de anterior ou próximo e retorna sem escrita.
- [ ] Atualizar `mantém o relatório diário acessível no celular` com a mesma condição, preservando foco por teclado e `aria-pressed` de completion.
- [ ] Em `shell.spec.ts`, substituir a expectativa positiva de `Dia selecionado` por contagem zero e exigir ausência de `Ir para hoje` no estado inicial de hoje.
- [ ] Rodar somente os contratos funcionais, ignorando snapshots, e confirmar falha contra o header atual.

```bash
npm run test:e2e -- tests/e2e/relatorios.spec.ts tests/e2e/shell.spec.ts --project=chromium --workers=1 --ignore-snapshots --grep "refina o header diário com navegação central e retorno condicional a hoje|abre hoje e navega sem criar dias vazios|mantém o relatório diário acessível no celular|mantém os três workspaces e a rota ativa após recarregar"
```

Um Red válido falha porque o DOM atual ainda contém `Dia selecionado`, mostra `Hoje` sempre, não expõe o grupo nomeado e formata a data por extenso.
Não atualizar screenshots durante Red.

## Task 3: Green do formatter e da composição responsiva

**Files:**

- Modify: `src/features/relatorios/date-navigation.ts`
- Modify: `src/features/relatorios/RelatorioDayHeader.tsx`

**Interfaces:**

- Consumes: contratos descritos na seção Interfaces consumidas e produzidas.
- Produces: formatter determinístico, grupo central acessível e ação condicional, sem mudança de API pública fora do formatter.

- [ ] Implementar `formatReportHeaderDate` sobre `parseReportDate` e UTC, sem depender do locale do navegador.

```ts
const REPORT_WEEKDAY_LABELS = [
  "Domingo",
  "Segunda Feira",
  "Terça Feira",
  "Quarta Feira",
  "Quinta Feira",
  "Sexta Feira",
  "Sábado",
] as const;

export function formatReportHeaderDate(date: string): string {
  const parsed = parseReportDate(date);

  if (!parsed) throw new RangeError(`Invalid report date: ${date}`);

  const weekday = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day),
  ).getUTCDay();
  const day = String(parsed.day).padStart(2, "0");
  const month = String(parsed.month).padStart(2, "0");
  const year = String(parsed.year).padStart(4, "0");

  return `${REPORT_WEEKDAY_LABELS[weekday]}, ${day}/${month}/${year}`;
}
```

- [ ] Remover de `RelatorioDayHeader.tsx` o `Intl.DateTimeFormat` longo e `sentenceCase`, importar `formatReportHeaderDate` e preservar `formatShortDate` somente para mobile.
- [ ] Derivar `const isToday = selectedDate === today` sem criar estado paralelo.
- [ ] Remover por completo o `span` `Dia selecionado`.
- [ ] Envolver os controles de data em `<div role="group" aria-label="Navegação da data">`.
- [ ] Renderizar o botão textual somente dentro de `{!isToday && (...)}` com texto literal `Ir para hoje`.
- [ ] Não renderizar `CalendarDays` dentro de `Ir para hoje`; o texto precisa ser a ação visível e o botão compacto precisa caber no mobile.
- [ ] Preservar `CalendarDays data-icon="inline-start"` no trigger do calendário e escondê-lo abaixo de `sm` se o label compacto precisar da largura para evitar truncamento excessivo.
- [ ] Preservar o `Popover` controlado, `PopoverTrigger asChild`, `PopoverContent`, `Calendar mode="single"`, `selected`, `defaultMonth`, `locale={ptBR}`, timezone, foco e `onSelect` atuais.
- [ ] Usar grade de três colunas a partir de `lg` para que a largura de completion não desloque o centro.
- [ ] Usar flex e `min-w-0` abaixo de `lg`, com trigger flexível, botões `shrink-0`, gaps `gap-1` e label compacto truncável.
- [ ] Mover apenas classes de layout; não sobrescrever cores ou tipografia de `Button`, não usar cores raw, `space-x-*`, z-index manual ou novo CSS global.
- [ ] Manter o bloco `Tudo anotado!` byte por byte igual em props e corpo, mudando somente classes de posicionamento necessárias para a coluna direita.

A estrutura deve seguir este contrato de composição:

```tsx
<div className="flex min-w-0 flex-1 items-center gap-1 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-0">
  <div
    className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2 lg:col-start-2 lg:flex-none"
    role="group"
    aria-label="Navegação da data"
  >
    {/* Dia anterior, Popover do Calendar e Próximo dia existentes. */}
    {!isToday && (
      <Button
        className="shrink-0"
        size="sm"
        variant="ghost"
        onClick={() => goToDate(today)}
      >
        Ir para hoje
      </Button>
    )}
  </div>
  <Button
    className="shrink-0 lg:col-start-3 lg:row-start-1 lg:justify-self-end lg:w-auto lg:px-3"
    size="icon"
    variant={isCompleted ? "default" : "outline"}
    aria-label="Tudo anotado!"
    aria-pressed={isCompleted}
    disabled={relatorios.isLoading || completion.isPending}
    onClick={() => completion.mutate()}
  >
    <CheckCircle2 data-icon="inline-start" />
    <span className="hidden lg:inline">Tudo anotado!</span>
  </Button>
</div>
```

- [ ] Rodar o unitário focado até PASS.
- [ ] Rodar o oráculo E2E nomeado sem snapshots até PASS.
- [ ] Rodar os contratos relacionados sem snapshots até PASS.

```bash
npm run test -- src/features/relatorios/date-navigation.test.ts -t "formata o rótulo desktop exato do header"
npm run test:e2e -- tests/e2e/relatorios.spec.ts --project=chromium --workers=1 --ignore-snapshots --grep "refina o header diário com navegação central e retorno condicional a hoje"
npm run test:e2e -- tests/e2e/relatorios.spec.ts tests/e2e/shell.spec.ts --project=chromium --workers=1 --ignore-snapshots --grep "abre hoje e navega sem criar dias vazios|mantém o relatório diário acessível no celular|mantém os três workspaces e a rota ativa após recarregar"
```

Green existe somente quando o texto, condição, geometria, calendário, foco, URL, zero writes e mobile passam juntos.

## Task 4: Baselines visuais e Refactor

**Files:**

- Modify: `tests/e2e/shell.spec.ts`
- Regenerate: `tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png`
- Regenerate: `tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png`
- Regenerate: `tests/e2e/__screenshots__/shell.spec.ts/shell-report-calendar-open.png`
- Regenerate: `tests/e2e/__screenshots__/shell.spec.ts/shell-workspace-select-open.png`

**Interfaces:**

- Consumes: o header Green e os snapshots Playwright existentes nas dimensões configuradas.
- Produces: quatro baselines atualizados e inspecionáveis para a slice 03 e para Gate 2.

- [ ] No teste `preserva o shell visual em desktop e mobile`, abrir `/relatorios?data=2026-08-26` antes dos screenshots desktop e mobile.
- [ ] Antes do baseline desktop, exigir o texto exato `Quarta Feira, 26/08/2026`, `Ir para hoje` visível e `Tudo anotado!` com `aria-pressed="false"`.
- [ ] Manter a captura do calendário aberto com o mesmo Popover oficial e confirmar fundo opaco antes do screenshot.
- [ ] Manter a captura do seletor de workspace aberto porque ela também registra a integridade do content header.
- [ ] Antes do baseline mobile, exigir `Ir para hoje` visível, completion acessível e ausência de overflow horizontal.
- [ ] Atualizar os quatro snapshots em um único comando depois do Green.

```bash
npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium --workers=1 --update-snapshots --grep "preserva o shell visual em desktop e mobile"
```

- [ ] Confirmar dimensões 1440 por 1000 para os três PNGs desktop e 390 por 844 para o PNG mobile.

```bash
sips -g pixelWidth -g pixelHeight tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png tests/e2e/__screenshots__/shell.spec.ts/shell-report-calendar-open.png tests/e2e/__screenshots__/shell.spec.ts/shell-workspace-select-open.png
```

- [ ] Abrir os quatro PNGs modificados em detalhe original.
- [ ] No desktop, inspecionar centro real do grupo, texto sem clipping, equilíbrio entre área vazia e completion, bordas, foco, contraste e alinhamento vertical.
- [ ] No mobile, inspecionar menu, anterior, data compacta, próximo, `Ir para hoje` e completion em uma linha sem sobreposição ou corte.
- [ ] Com o calendário aberto, inspecionar Popover opaco, inteiro, sem clipping e ancorado ao trigger.
- [ ] Com o workspace aberto, inspecionar simultaneamente o Select e o header refinado sem regressão de camadas.
- [ ] Não executar um segundo update de snapshots.
- [ ] Refatorar somente duplicação local depois dos contratos verdes e repetir unitário, E2E e lint se código mudar.

## Oráculos bloqueados e comandos de Gate 2

O oráculo E2E nomeado desta fatia é:

```text
refina o header diário com navegação central e retorno condicional a hoje
```

O executor não pode apagar, pular, enfraquecer, substituir por screenshot ou mudar a tolerância geométrica acima de 1 pixel para alcançar Green.
O formatter unitário é suporte explícito ao oráculo e também permanece bloqueado.

Depois do commit atômico produzido pelo mecanismo Nexo, o Verify separado define a base uma vez e executa os comandos em modo run-once na ordem abaixo.

```bash
slice_base="$(git merge-base main HEAD)"
npm run test -- src/features/relatorios/date-navigation.test.ts -t "formata o rótulo desktop exato do header"
npm run test:e2e -- tests/e2e/relatorios.spec.ts --project=chromium --workers=1 --grep "refina o header diário com navegação central e retorno condicional a hoje"
npm run test:e2e -- tests/e2e/relatorios.spec.ts tests/e2e/shell.spec.ts --project=chromium --workers=1
npm run typecheck
npx eslint src/features/relatorios/date-navigation.ts src/features/relatorios/date-navigation.test.ts src/features/relatorios/RelatorioDayHeader.tsx tests/e2e/relatorios.spec.ts tests/e2e/shell.spec.ts --max-warnings=0
actual_files="$(git diff --name-only "$slice_base" HEAD | LC_ALL=C sort)"
expected_files="$(printf '%s\n' 'src/features/relatorios/RelatorioDayHeader.tsx' 'src/features/relatorios/date-navigation.test.ts' 'src/features/relatorios/date-navigation.ts' 'tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png' 'tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png' 'tests/e2e/__screenshots__/shell.spec.ts/shell-report-calendar-open.png' 'tests/e2e/__screenshots__/shell.spec.ts/shell-workspace-select-open.png' 'tests/e2e/relatorios.spec.ts' 'tests/e2e/shell.spec.ts' | LC_ALL=C sort)"
test "$actual_files" = "$expected_files"
git diff --exit-code "$slice_base" HEAD -- src/components/Layout.tsx src/components/ui/button.tsx src/components/ui/calendar.tsx src/components/ui/popover.tsx src/features/relatorios/api.ts src/features/relatorios/RelatoriosPage.tsx src/lib/database.types.ts supabase/schema.sql supabase/migrations package.json package-lock.json
git diff --check "$slice_base" HEAD
! rg -n "Dia selecionado|>Hoje<|aria-label=\"Hoje\"" src/features/relatorios/RelatorioDayHeader.tsx
! lsof -nP -iTCP:4173 -sTCP:LISTEN
```

O Playwright final roda sem `--update-snapshots` e sem `--ignore-snapshots`.
O Verify abre os quatro PNGs em detalhe original, confirma suas dimensões e rejeita qualquer desalinhamento, clipping, overflow, Popover transparente ou regressão visual mesmo que a comparação automática passe.
O Verify confirma que navegação não gera writes e que o diff não toca API, banco, componentes shadcn ou conteúdo do relatório.
Na wave integrada, Nexo ainda executa suite completa, lint completo e segurança uma única vez.
Na fronteira da feature, Nexo ainda executa mutation testing uma única vez.

## Handoff para slices dependentes

A slice `03-attendance-blocks` consome `RelatorioDayHeader` já com o grupo central e a ação condicional.
Ela pode adicionar a consulta de presença e alterar somente a condição `disabled` de `Tudo anotado!` para completion gating, preservando sua mutação, e não deve remover `role="group"`, mudar `formatReportHeaderDate`, reintroduzir `Dia selecionado`, voltar a `Hoje` ou deslocar completion da borda direita.
Como a slice 03 adiciona attendance e Empty antes do resumo, ela deverá regenerar novamente qualquer baseline shell cujo conteúdo completo mudar, usando os quatro PNGs desta fatia como ponto de partida Green.

## Entrega Nexo

Quando todos os oráculos da fatia passarem, o mecanismo Nexo cria um único commit convencional sugerido:

```text
feat(relatorios): refinar header diário
```

O executor não aplica migration, não promove ambiente e não corta release.
O Verify separado decide PASS ou FAIL antes da merge queue.
