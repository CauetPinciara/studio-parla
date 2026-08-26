# Gate 2 - 01-report-header-refinement

## Veredito

PASS para o commit `956a6b71ac4b35fa3bb963ec84924858111d3156`.

## Preflight

- O HEAD verificado corresponde exatamente ao commit solicitado.
- A branch verificada é `feat/2026-08--01-report-header-refinement`.
- A árvore de trabalho estava limpa antes do Gate 2.
- A porta 4173 estava livre antes do Gate 2.

## Auditoria adversarial do diff

O diff `main..HEAD` contém um commit e nove arquivos: o header diário, o formatador e seu teste unitário, dois arquivos E2E e quatro screenshots aprovados.
Não há mudanças em banco, API, dependências, componentes de shell ou componentes de workspace.
`git diff --check main..HEAD` não encontrou erros de whitespace.

A data selecionada continua derivada de `useSearchParams`, e todas as mudanças de dia escrevem somente o parâmetro `data` na URL.
O E2E instrumenta todas as requisições de escrita e comprova `state.writes` vazio após navegar por anterior, próximo, Calendar e `Ir para hoje`.
A mutation de `Tudo anotado!` foi preservada, e o botão permanece fora do grupo de navegação e alinhado à direita no desktop.
O Popover continua usando o primitivo Radix de `radix-ui`, com `PopoverTrigger asChild`, e o Calendar shadcn continua composto sobre `react-day-picker`.

## Critérios observados

- Com o relógio fixo em 04/08/2026 no fuso America/Sao_Paulo e a URL em 26/08/2026, `Dia selecionado` não existe no header.
- O rótulo desktop é exatamente `Quarta Feira, 26/08/2026`.
- O grupo `Navegação da data` fica centralizado no espaço interno do header com tolerância máxima de 1 px.
- `Ir para hoje` aparece textualmente fora de hoje e desaparece ao retornar a 04/08/2026.
- `Tudo anotado!` termina no limite direito do header e não faz parte do grupo central.
- Em 390 por 844, os cinco controles ficam na mesma linha, dentro da altura do header e sem overflow horizontal.
- O Calendar abre em agosto de 2026, aceita a seleção de 05/08/2026, atualiza a URL e fecha o Popover.
- O shell e o seletor de workspace permanecem visualmente íntegros.

## Evidências visuais

Os quatro PNGs versionados foram inspecionados em resolução original.

- `shell-desktop.png`: 1440 por 1000; navegação central, label exato e conclusão à direita.
- `shell-mobile.png`: 390 por 844; controles em uma linha, sem recorte horizontal.
- `shell-report-calendar-open.png`: 1440 por 1000; Calendar visível, opaco e com 26 selecionado.
- `shell-workspace-select-open.png`: 1440 por 1000; seletor de workspace visível e shell preservado.

## Gate 2 executado uma vez

```text
npm run test -- src/features/relatorios/date-navigation.test.ts -t "formata o rótulo desktop exato do header" && npm run test:e2e -- tests/e2e/relatorios.spec.ts --project=chromium --workers=1 --grep "refina o header diário com navegação central e retorno condicional a hoje" && npx eslint src/features/relatorios/RelatorioDayHeader.tsx src/features/relatorios/date-navigation.ts src/features/relatorios/date-navigation.test.ts tests/e2e/relatorios.spec.ts tests/e2e/shell.spec.ts --max-warnings=0
```

Resultado da cadeia: exit 0.

- Vitest: 1 arquivo passou; 1 teste passou e 3 foram ignorados pelo filtro.
- Playwright Chromium: 1 teste passou em 2,6 s.
- ESLint: exit 0, sem saída, erros ou warnings.

## Pós-condições

O HEAD permaneceu em `956a6b71ac4b35fa3bb963ec84924858111d3156`.
A árvore de trabalho permaneceu limpa.
A porta 4173 ficou livre e nenhum processo iniciado por esta verificação permaneceu ativo.
Nenhum código, teste, snapshot ou commit foi alterado por este Verify.
