# Recuperação da slice 03-attendance-blocks

- Agente: execute.
- Slice: `03-attendance-blocks`.
- Base: `b6a441dce1468a058d302c2acb2e0818b00346ee`.
- Commit reaplicado sem commit intermediário: `a820655cdfb054c463ed7d6f0b789db3e0e5a571`.
- Commit final: `08342d02bf336429beea0c8865594a8d3ad06bba`.
- Mensagem: `fix: meet attendance contrast requirements`.
- Status: PASS.

## Red

O E2E real `mantém os blocos de presença legíveis em desktop e mobile` passou a medir estilos computados, converter qualquer cor CSS serializada pelo Chromium para sRGB, compor camadas transparentes até o fundo opaco efetivo e calcular a razão WCAG.
O oráculo acumula as três amostras antes de falhar, portanto o Red registrou toda a evidência em uma execução run-once.

- Heading `Presenças`: 3,5762:1, com `rgb(140, 131, 120)` sobre `rgb(251, 250, 249)`.
- `CardDescription`: 3,7281:1, com `rgb(140, 131, 120)` sobre `rgb(255, 255, 255)`.
- `EmptyDescription`: 3,5762:1, com `rgb(140, 131, 120)` sobre `rgb(251, 250, 249)`.

O comando falhou pelo limite WCAG AA de 4,5:1, sem erro de navegador, servidor, porta, TypeScript ou rede.

## Hipótese confirmada

Os três textos novos usavam localmente `text-muted-foreground` em 12 px ou 14 px.
O token global produz `rgb(140, 131, 120)` e não alcança 4,5:1 nos fundos da página e do Card.
O token global não foi alterado porque isso mudaria telas fora da slice.

## Mudança mínima

Somente `AttendanceBlocks.tsx` recebeu `text-foreground/70` no heading, no `CardDescription` e no `EmptyDescription`.
Esse token semântico shadcn mantém os textos visualmente secundários e aumenta o contraste local sem alterar componentes oficiais, tema global ou outras telas.
Nenhuma refatoração lateral foi feita.

O helper de teste inicialmente encontrou `oklab(...)` após a mudança de token.
O Chromium passou a fazer a conversão da cor CSS para sRGB por canvas antes do cálculo, eliminando uma leitura incorreta dos canais e cobrindo a serialização real do navegador.

## Green

- Heading `Presenças`: 5,5427:1 sobre `rgb(251, 250, 249)`.
- `CardDescription`: 5,6541:1 sobre `rgb(255, 255, 255)`.
- `EmptyDescription`: 5,5427:1 sobre `rgb(251, 250, 249)`.

As três razões ficam acima de 4,5:1 nos fundos opacos efetivos.
Os quatro oráculos funcionais bloqueados passaram em 6,6 segundos antes da revisão visual.

## Snapshots e inspeção visual

Os dois comandos aprovados de atualização foram executados somente para os seis baselines permitidos.
Os arquivos ficaram byte a byte iguais aos snapshots reaplicados, pois esses PNGs já representavam a renderização corrigida.
Nenhum snapshot adicional foi criado ou modificado.

- `relatorios-attendance-desktop.png`, 1440x1000: o cabeçalho permanece centrado, os dois Cards antecedem o resumo, horários e contagens estão legíveis, linhas e ToggleGroups estão alinhados e todo o conteúdo permanece dentro do main.
- `relatorios-attendance-mobile.png`, 390x844: o cabeçalho permanece em uma linha, nomes e Badges têm espaço, os dois ToggleGroups ficam inteiros, o resumo aparece abaixo das presenças e não há corte horizontal.
- `shell-desktop.png`, 1440x1000: o Empty fica equilibrado, o heading mantém a hierarquia e o resumo e as tabelas permanecem alinhados sem colisão.
- `shell-mobile.png`, 390x844: o Empty, resumo e tabelas permanecem contidos, com leitura clara e sem overflow horizontal.
- `shell-report-calendar-open.png`, 1440x1000: o calendário fica contido e alinhado ao controle de data, sem colisão com o restante do shell.
- `shell-workspace-select-open.png`, 1440x1000: o seletor de workspace fica contido na navegação lateral e mantém as opções e o estado selecionado legíveis.

Todas as seis imagens foram inspecionadas em resolução original.
Origem e presença continuam identificadas por texto e estado acessível, não somente por cor.

## Gate 2 e verificações adicionais

- E2E focado final de relatórios e shell: 11 de 11 testes passaram com os seis baselines versionados.
- E2E integral final: 16 de 16 testes passaram em Chromium com um worker.
- Oráculos unitários focados: 41 de 41 testes passaram em quatro arquivos.
- Suíte unitária integral: 91 de 91 testes passaram em 18 arquivos.
- Typecheck: `tsc -b --pretty false` passou.
- Lint focado nos sete arquivos textuais da slice passou com zero warnings.
- Lint integral passou com zero warnings.
- Build de produção passou com 3096 módulos transformados.
- Audit de dependências de produção encontrou zero vulnerabilidades.
- `git diff --check` passou no diff final.
- O diff final contém exatamente os 13 caminhos declarados no plano.
- Os diffs protegidos estão vazios para manifests, domínio, API, banco, migration, tipos e Stryker.
- O worktree ficou limpo após o único commit.
- Nenhum servidor ou navegador iniciado pela recuperação permaneceu ativo.
- Nenhuma operação Supabase remota foi executada.
- Nenhum gerador shadcn foi executado novamente.

## Caminhos finais

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

Concluído em `2026-08-27T00:15:32Z`.
