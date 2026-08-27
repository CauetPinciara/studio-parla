# Execute 03 - Attendance blocks

## Resultado

Status: PASS.

Commit: `a820655cdfb054c463ed7d6f0b789db3e0e5a571` (`feat: add attendance blocks to daily reports`).

Branch: `feat/2026-08--03-attendance-blocks`.

Worktree: `/Users/cauetpinciara/Documents/studio-parla/sistema/.worktrees/2026-08-26-attendance-by-class/03-attendance-blocks`.

Nenhum merge, push, rebase, mutation testing, suíte completa da wave ou operação remota no Supabase foi executado.

## TDD

O mock Supabase local de `tests/e2e/relatorios.spec.ts` foi ampliado antes de qualquer alteração de produção.

O seed passou a cobrir contatos, turmas, matrículas, avulsas, aulas e presenças, com filtros REST, conflitos de upsert, persistência em memória e falha única de presença.

Os quatro oráculos bloqueados foram escritos antes dos componentes e das integrações.

O Red foi executado com o comando aprovado e falhou 4 de 4 vezes pelos motivos esperados: ausência de `Presenças`, Empty, ToggleGroups e histórico visual.

Não houve falha de TypeScript, navegador, servidor, porta, import da slice 02 ou chamada remota durante o Red.

Depois da implementação mínima, os mesmos quatro oráculos passaram 4 de 4.

Após o refactor, os mesmos quatro oráculos passaram novamente 4 de 4.

## Implementação

- `ToggleGroup`, `Toggle` e `Empty` foram adicionados somente por `npx shadcn@latest add toggle-group empty`.
- O contexto confirmado pelo CLI foi Vite, Radix, Lucide, alias `@` e componentes ainda ausentes antes da instalação.
- Os três arquivos gerados foram revisados integralmente e usam `radix-ui`, `toggleVariants`, `cn` e aliases corretos.
- `package.json` e `package-lock.json` permaneceram inalterados.
- `AttendanceBlocks` renderiza a seção antes do resumo, Cards oficiais por turma, lista semântica de pessoas, Badges de origem, histórico somente leitura e ToggleGroups single.
- O horário e a pluralização permanecem locais ao módulo visual, sem duplicar roster, ordenação, deduplicação ou prontidão do domínio.
- O valor vazio do Radix é ignorado, portanto clicar no item ativo não apaga nem regrava presença.
- Os estados selecionados mantêm `aria-pressed` e exibem um check Lucide, portanto não dependem apenas de cor.
- `RelatoriosPage` carrega `AttendanceDay`, serializa mutations, invalida a query pela data das variáveis, mostra Sonner em sucesso e erro e não usa estado otimista.
- `RelatorioDayHeader` preserva a estrutura integrada da slice 01 e delega o bloqueio de conclusão somente a `isAttendanceDayReady`.
- Dias concluídos continuam reabríveis mesmo com presença atual pendente.
- Histórico com turma ou contato órfão permanece visível, selecionado e desabilitado para escrita.
- A navegação continua somente leitura e os E2E confirmam ausência de POST em `aulas` e `presencas` ao navegar.

## Verificação visual

Foram gerados somente os seis baselines autorizados.

- `relatorios-attendance-desktop.png`, 1440 por 1000.
- `relatorios-attendance-mobile.png`, 390 por 844.
- `shell-desktop.png`, 1440 por 1000.
- `shell-mobile.png`, 390 por 844.
- `shell-report-calendar-open.png`, 1440 por 1000.
- `shell-workspace-select-open.png`, 1440 por 1000.

Os seis PNGs foram inspecionados em resolução original.

O header permanece em uma linha, centralizado no desktop e sem colisão no mobile.

Cards, nomes, Badges e ToggleGroups permanecem dentro do main e da viewport, sem clipping ou overflow horizontal.

O Empty mantém ícone, título, descrição e equilíbrio visual antes do resumo.

O check selecionado, o texto e `aria-pressed` tornam o estado identificável sem depender apenas de cor.

Calendário e seletor de workspace preservam superfície, contraste e posicionamento.

## Gate 2 da slice

`npm run test:e2e -- tests/e2e/relatorios.spec.ts tests/e2e/shell.spec.ts --project=chromium --workers=1` passou 11 de 11 testes.

`npm run test -- src/features/relatorios/attendance-domain.test.ts src/features/relatorios/attendance-api.test.ts src/features/relatorios/date-navigation.test.ts src/features/relatorios/api.test.ts` passou 41 de 41 testes em 4 arquivos.

`npm run typecheck` passou.

O lint focado dos sete arquivos textuais passou com zero warnings.

`git diff --check` focado passou.

O diff protegido contra `main` passou para manifests, domínio, API da slice 02, tipos, schema, migration, teste SQL e configuração do Stryker.

O diff pós-commit contém exatamente os 13 caminhos declarados no plano.

O worktree ficou limpo após o commit.

`lsof -nP -iTCP:4173 -sTCP:LISTEN` não encontrou servidor sobrevivente.

## Caminhos do commit

1. `src/components/ui/empty.tsx`
2. `src/components/ui/toggle-group.tsx`
3. `src/components/ui/toggle.tsx`
4. `src/features/relatorios/AttendanceBlocks.tsx`
5. `src/features/relatorios/RelatorioDayHeader.tsx`
6. `src/features/relatorios/RelatoriosPage.tsx`
7. `tests/e2e/__screenshots__/relatorios.spec.ts/relatorios-attendance-desktop.png`
8. `tests/e2e/__screenshots__/relatorios.spec.ts/relatorios-attendance-mobile.png`
9. `tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png`
10. `tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png`
11. `tests/e2e/__screenshots__/shell.spec.ts/shell-report-calendar-open.png`
12. `tests/e2e/__screenshots__/shell.spec.ts/shell-workspace-select-open.png`
13. `tests/e2e/relatorios.spec.ts`
