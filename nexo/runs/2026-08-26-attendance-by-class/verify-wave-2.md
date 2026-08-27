# Verify independente - wave 2

## Veredito

**FAIL**

O pipeline integrado passou integralmente, mas a revisão visual e de acessibilidade encontrou um bloqueador de contraste nos novos conteúdos da presença.
O Gate 2 exige PASS em testes e na inspeção visual, portanto o resultado da wave é FAIL.

## Escopo verificado

- Branch: `main`.
- HEAD esperado e observado: `3becdc65078beef59790d85089aa0822ea05f9a0`.
- Diff integrado: `e320532...3becdc65078beef59790d85089aa0822ea05f9a0`.
- Caminhos alterados no diff: 13 de 13 declarados na slice 03.
- Compatibilidade revisada com `01-report-header-refinement` e `02-attendance-domain`.
- Início: `2026-08-26T23:52:47Z`.
- Encerramento das verificações: `2026-08-26T23:56:21Z`.

## Bloqueador

### Contraste insuficiente em texto pequeno novo

Os horários e as contagens dos Cards usam `CardDescription`, que aplica `text-sm text-muted-foreground` sobre `--card: 0 0% 100%`.
O Empty também aplica `text-sm/relaxed text-muted-foreground`, e o heading `Presenças` aplica `text-xs ... text-muted-foreground`.
Com `--muted-foreground: 34 8% 51%`, o contraste calculado é 3,71:1 sobre o Card branco e 3,57:1 sobre o fundo da página.
Esses textos têm 12 a 14 px e não são texto grande, portanto ficam abaixo do mínimo de 4,5:1 para texto normal.
O problema é visível nos seis baselines afetados, especialmente em `15h00 · 3 pessoas esperadas`, `18h00 · 1 pessoa esperada` e na descrição do Empty.
Não foram encontrados clipping, overflow, colisão ou controles cortados, mas o requisito explícito manda falhar a inspeção por contraste insuficiente.

## Pipeline integrado

O comando abaixo foi executado exatamente uma vez e terminou com código 0:

```bash
npm test && npm run test:e2e && npm run lint && npm run build && npm audit --omit=dev --audit-level=high
```

Contagens observadas:

- Vitest: 18 arquivos passaram, 91 testes passaram e 0 falharam.
- Playwright: 16 testes passaram e 0 falharam, usando 1 worker.
- ESLint: 0 erros e 0 warnings.
- Build: TypeScript e Vite concluíram com sucesso.
- Auditoria: 0 vulnerabilidades encontradas no conjunto de produção.
- Pipeline: 5 de 5 etapas concluíram com sucesso.

## Critérios funcionais

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Header centralizado, formato exato e `Ir para hoje` condicional | PASS | O E2E confirmou geometria com tolerância de 1 px, `Quarta Feira, 26/08/2026`, ausência de `Dia selecionado`, ação condicional e uma linha no mobile. |
| Cards por turma e ordem | PASS | O E2E confirmou `Modelagem livre` antes de `Torno iniciante`, horários, contagens e quatro pessoas derivadas. |
| Persistência, reload e erro | PASS | O E2E confirmou upserts `aulas` depois `presencas`, snapshots, feedback, refetch, falha sem estado otimista e persistência após reload. |
| Gating e reabertura | PASS | O E2E confirmou bloqueio com pessoa pendente, habilitação após quatro marcações e reabertura de dia concluído. |
| Empty sem writes de presença | PASS | O E2E confirmou o Empty oficial e nenhuma escrita em `aulas` ou `presencas` durante navegação. |
| Teclado e semântica | PASS | O E2E operou o ToggleGroup Radix por teclado, e a inspeção confirmou regiões nomeadas, lista semântica, nomes únicos, `aria-pressed`, disabled nativo e identificação textual de origem e histórico. |
| Histórico órfão | PASS | O E2E confirmou snapshots, Badges `Avulsa` e `Histórico`, status salvo pressionado, controles desabilitados e reabertura sem escrita de presença. |
| Contratos de domínio e API | PASS | Os módulos protegidos não mudaram na wave, os testes unitários passaram e a UI consome `AttendanceDay`, `attendanceDayQueryKey`, `upsertAttendance` e `isAttendanceDayReady` sem duplicar as regras do domínio. |
| Acessibilidade visual | FAIL | O novo texto pequeno muted mede 3,57:1 a 3,71:1, abaixo de 4,5:1. |

## Revisão estática e proteção das slices 01 e 02

- `git diff --check e320532...HEAD` passou.
- O diff contém somente os 13 caminhos declarados na slice 03.
- `package.json`, `package-lock.json`, domínio, API, testes unitários de presença, tipos de banco, schema, migration, teste SQL e `stryker.config.mjs` não mudaram nesta wave.
- `AttendanceBlocks` não contém query, mutation, Supabase ou Sonner.
- `RelatoriosPage` invalida `attendanceDayQueryKey(variables.data)` após sucesso e não atualiza o cache de forma otimista.
- `RelatorioDayHeader` delega prontidão exclusivamente a `isAttendanceDayReady` e preserva a reabertura de dias concluídos.
- O valor vazio do ToggleGroup single é ignorado, impedindo apagar uma presença ao clicar novamente no item ativo.

## Baselines em resolução original

Foram inspecionados 6 de 6 PNGs afetados em resolução original:

- `shell-desktop.png`: 1440 por 1000.
- `shell-report-calendar-open.png`: 1440 por 1000.
- `shell-workspace-select-open.png`: 1440 por 1000.
- `shell-mobile.png`: 390 por 844.
- `relatorios-attendance-desktop.png`: 1440 por 1000.
- `relatorios-attendance-mobile.png`: 390 por 844.

O header permanece centralizado no desktop e em uma linha no mobile.
Calendário, seletor de workspace, Cards, nomes, Badges, ToggleGroups, Empty e resumo não apresentam clipping, overflow ou colisão.
Os ToggleGroups mobile permanecem inteiros, e o item selecionado tem check visível além de `aria-pressed`, sem depender apenas de cor.
A única reprovação visual é o contraste do texto pequeno muted descrito acima.

## Isolamento e estado final

- Antes dos testes havia somente o worktree principal do repositório, em `main` no HEAD esperado.
- Depois dos testes continua existindo somente esse worktree.
- A porta 4173 estava livre antes e permanece livre depois.
- Nenhum processo de Vitest, Playwright ou Vite iniciado por esta verificação permaneceu ativo.
- Existe um `npm run dev` preexistente na porta 5173 desde 25/08/2026, e ele não foi iniciado nem alterado por esta verificação.
- Nenhum container foi iniciado, parado ou alterado por esta verificação.
- `origin/main` permaneceu em `2c2dfb724ffd4b547c0a6e0771d863e0e81d16ab` do início ao fim.
- Nenhum push, migration remota ou chamada ao Supabase remoto foi executado.
- Os testes E2E interceptaram o Supabase com mock local.
- O Verify não alterou código, testes, snapshots, schema, manifests ou commits.
- Permaneceram intocados os arquivos preexistentes do usuário e os artefatos Nexo fora deste relatório e do result file.

## Contagem final

- Critérios funcionais e contratuais: 8 PASS, 0 FAIL.
- Critério visual e de acessibilidade: 0 PASS, 1 FAIL.
- Baselines inspecionados: 6.
- Bloqueadores: 1.
- Veredito final: FAIL.
