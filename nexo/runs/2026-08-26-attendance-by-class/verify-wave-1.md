# Verify wave 1

## Veredito

**FAIL**

A Gate 2 integrada não ficou verde porque o comando bloqueado terminou com `exit 1` na etapa inicial `npm test`.
O problema observado foi coleta indevida de arquivos Playwright dentro de dois worktrees Nexo residuais sob `.worktrees/`.

## Escopo verificado

- Branch: `main`.
- HEAD esperado e observado: `5bfa56097a4160447f6501484a6e9b24229f2761`.
- Base integrada: `2c2dfb724ffd4b547c0a6e0771d863e0e81d16ab`.
- O diff integrado contém exatamente os 18 caminhos canônicos declarados pelas slices 01 e 02, com nove caminhos por slice e sem sobreposição.
- Os arquivos de orquestração e os arquivos preexistentes indicados no contrato permaneceram fora da avaliação de código e não foram alterados por este verifier.
- Nenhum arquivo da wave apresenta modificação não commitada em relação ao HEAD.

## Comando bloqueado

O comando abaixo foi executado exatamente uma vez:

```bash
npm test && npm run test:e2e && npm run lint && npm run build && npm audit --omit=dev --audit-level=high
```

Resultado: `exit 1` em `npm test`.

O Vitest informou 52 arquivos de teste passados e 239 testes passados, mas marcou oito suites como falhas de coleta.
As oito suites são arquivos Playwright sob os worktrees residuais `.worktrees/2026-08-26-attendance-by-class/01-report-header-refinement/tests/e2e/` e `.worktrees/2026-08-26-attendance-by-class/02-attendance-domain/tests/e2e/`.
Todas falharam com `Playwright Test did not expect test() to be called here` ou a variante para `test.beforeEach()`.
O `vitest.config.ts` exclui `tests/e2e/**`, mas essa expressão não cobre os mesmos caminhos quando aninhados sob `.worktrees/`.
Como o comando usa `&&`, `npm run test:e2e`, `npm run lint`, `npm run build` e `npm audit --omit=dev --audit-level=high` não foram iniciados.
O comando bloqueado não foi repetido.

## Critérios das slices e integração

### Header do relatório

- `formatReportHeaderDate` produz os rótulos determinísticos exigidos e rejeita datas inválidas.
- `RelatorioDayHeader` remove `Dia selecionado`, expõe o grupo acessível `Navegação da data`, mostra `Ir para hoje` somente fora de hoje e preserva o calendário shadcn e a mutation de `Tudo anotado!`.
- O layout desktop usa três colunas para manter o grupo no centro interno e completion na borda direita.
- Os E2E integrados bloqueiam tolerância geométrica de 1 pixel, URL como fonte de verdade, calendário, teclado, ausência de overflow mobile e ausência de writes durante a navegação.
- O estado de writes do oráculo permanece vazio após anterior, próximo, retorno a hoje, deep link, reload e normalização.

### Domínio, API e banco de presença

- O domínio filtra turmas pelo weekday UTC, matrículas `Ativa` ou `Nova` e avulsas `Confirmada` na data selecionada.
- A derivação aplica precedência de matrícula, deduplicação por contato, snapshots históricos, ordenação determinística de turmas e pessoas e readiness por status.
- `loadAttendanceDay` contém somente selects filtrados e não chama `upsertAula` nem `upsertAttendance`.
- As escritas ficam isoladas nas duas mutations explícitas, com upsert de aula por `data,turma_id` e upsert de presença por `aula_id,contato_id`.
- Schema e migration declaram as duas unicidades, snapshots, `ON DELETE SET NULL` para fontes removíveis, cascade da presença pela aula, timestamps atualizados por trigger e RLS member-only por `public.is_member()`.
- O contrato público TypeScript exigido pela slice 03 está presente e `stryker.config.mjs` preserva os alvos anteriores enquanto adiciona os dois módulos de presença.
- A inspeção do diff não encontrou comando de aplicação remota de migration, `supabase db push`, `--linked`, project ref ou mudança de dependência.

O oráculo SQL local suplementar foi tentado uma vez com a imagem `postgres:17-alpine` já disponível localmente.
Ele não produziu evidência válida porque um PostgreSQL deixou de aceitar conexão ainda durante o bootstrap, antes de carregar o schema ou a migration.
O trap removeu ambos os containers, e nenhum comando Supabase remoto foi executado.

## Inspeção visual em resolução original

| Baseline | Dimensão | Resultado visual |
| --- | --- | --- |
| `shell-desktop.png` | 1440 x 1000 | Grupo de data visualmente centralizado, texto completo, completion à direita, sem clipping ou sobreposição. |
| `shell-mobile.png` | 390 x 844 | Menu, anterior, data compacta, próximo, `Ir para hoje` e completion permanecem em uma linha; o truncamento é local ao label e não há corte ou sobreposição. |
| `shell-report-calendar-open.png` | 1440 x 1000 | Popover opaco, completo, ancorado ao trigger e sem clipping. |
| `shell-workspace-select-open.png` | 1440 x 1000 | Listbox opaco e completo, sem regressão de camadas; header refinado permanece íntegro. |

Não foi observada regressão visual nos quatro baselines.

## Integridade e cleanup

- `git diff --check` no diff integrado passou.
- O HEAD final permaneceu exatamente `5bfa56097a4160447f6501484a6e9b24229f2761` no branch `main`.
- A porta 4173 está livre.
- Nenhum Vitest, Playwright, build, watcher ou container iniciado por este verifier permaneceu em execução.
- Não existe container com nome `parla-attendance` após o cleanup.
- Há um Vite preexistente na porta 5173, iniciado em 25/08/2026, que não pertence a esta verificação e não foi tocado.
- Os dois worktrees Nexo das slices continuam registrados e são a causa direta da coleta indevida pelo Vitest.

## Condição para novo Gate 2

O orquestrador precisa limpar os worktrees Nexo residuais ou garantir que o Vitest ignore `.worktrees/**` antes de consumir uma nova tentativa de wave verify.
Depois disso, a Gate 2 precisa executar novamente o comando bloqueado completo e obter evidência para E2E, lint, build e audit, que não rodaram nesta tentativa.
