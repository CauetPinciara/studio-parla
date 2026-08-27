# Verify independente da wave 2 recuperada

## Veredito

**PASS** para a wave 2 recuperada do run `2026-08-26-attendance-by-class`.

A verificação foi feita em `main` no commit exato `8a59517197c58e22e43d5c9da7369e27b876d1e4`.
O plano `03-attendance-blocks.md` foi lido integralmente.
Os relatórios de Execute, recuperação, verifies anteriores e o context-pack não foram lidos.
Nenhum código, teste, snapshot, schema, manifest ou commit foi alterado por este Verify.

## Precondições

- Branch: `main`.
- HEAD esperado e observado: `8a59517197c58e22e43d5c9da7369e27b876d1e4`.
- Worktree do run antes dos testes: ausente.
- `git worktree list --porcelain`: somente o checkout principal em `main`.
- Porta TCP 4173 antes dos testes: livre.
- `origin/main` local e remoto: `2c2dfb724ffd4b547c0a6e0771d863e0e81d16ab`.
- Relação `origin/main...HEAD`: 0 commits somente no remoto e 10 commits somente no local.
- Artefatos Nexo ainda não capturados e arquivos preexistentes do usuário foram ignorados e preservados.

## Comando bloqueado

O comando abaixo foi executado exatamente uma vez, em modo run-once:

```bash
npm test && npm run test:e2e && npm run lint && npm run build && npm audit --omit=dev --audit-level=high
```

Resultado integral: exit code 0.

- Vitest: 18 arquivos passaram, 91 testes passaram e 0 falharam.
- Playwright Chromium: 16 testes passaram, com 1 worker, e 0 falharam.
- ESLint completo: 0 erros e 0 avisos.
- Build: TypeScript e Vite passaram, com 3.096 módulos transformados.
- Audit de produção: 0 vulnerabilidades.

## Critérios funcionais do plano 03

O header preserva 80 px no desktop, fundo branco opaco, navegação da data centralizada no pixel, conclusão na borda direita, ausência de `Dia selecionado`, formatação aprovada, `Ir para hoje` somente fora de hoje e uma única linha de controles no mobile.
A navegação por URL, calendário, reload e data inválida passou sem criar registros durante a navegação.

A seção `Presenças` aparece antes de `Resumo do dia`.
Os dois Cards aparecem em ordem determinística, `Modelagem livre` às `15h00` com três pessoas e `Torno iniciante` às `18h00` com uma pessoa.
Ana, Beatriz e Diego aparecem como `Matrícula`, Clara aparece como `Avulsa`, e as fontes Pausada e A confirmar são excluídas.
Cada pessoa tem um ToggleGroup single com nome acessível único e dois botões com `aria-pressed` persistente.

A falha simulada de `presencas` mostra `Falha ao registrar presença`, não deixa o toggle pressionado, não altera a coleção persistida e não habilita a conclusão.
As quatro marcações bem-sucedidas gravam `aulas` antes de `presencas`, usam os conflitos `data,turma_id` e `aula_id,contato_id`, preservam snapshots e ids de origem e refazem a query da data.
Os status e a conclusão permanecem após reload.

`Tudo anotado!` começa bloqueado enquanto há uma pessoa sem status, habilita somente após a quarta marcação, conclui o relatório e permite reabertura.
Um relatório já concluído continua reabrível com presença atual pendente e fica bloqueado novamente após a reabertura.

O Empty oficial usa `data-slot="empty"`, título e descrição fechados.
A navegação para a data vazia não cria `aulas` nem `presencas`.
O dia vazio continua concluível porque `isAttendanceDayReady` retorna verdadeiro para um roster vazio.

O teclado marca um ToggleGroup com foco e Space, o estado é refetchado e `aria-pressed` muda para verdadeiro.
Desktop e mobile provaram `scrollWidth <= clientWidth`.

O histórico órfão mantém os snapshots `Turma arquivada` e `Helena histórica`, os Badges `Avulsa` e `Histórico`, o status salvo pressionado e os controles desabilitados.
Reabrir esse dia não grava `aulas` nem `presencas`.

## Contraste recuperado

O oráculo mede `getComputedStyle(element).color`, converte a cor por canvas, compõe os backgrounds do elemento e de todos os ancestrais até alpha 1 e calcula luminância relativa WCAG.
A cor computada comum às três amostras é `oklab(0.271841 0.00276099 0.00664715 / 0.7)`, convertida pelo canvas em RGB 41, 38, 36 com alpha 0,7019607843.

| Amostra | Fundo efetivo | Alpha do fundo | Ratio |
|---|---:|---:|---:|
| Heading `Presenças` | `rgb(251, 250, 249)` | 1 | 5,5427:1 |
| `CardDescription` | `rgb(255, 255, 255)` | 1 | 5,6541:1 |
| `EmptyDescription` | `rgb(251, 250, 249)` | 1 | 5,5427:1 |

As três amostras superam 4,5:1.
O E2E filtra toda amostra cujo `ratio < 4.5` e exige que o resultado seja vazio.
Portanto 3,58:1, 3,73:1 e 3,58:1 produziriam três falhas e fariam o oráculo falhar com a mensagem `WCAG AA contrast failures`.
A cadeia E2E foi executada somente uma vez.
Os números acima foram materializados separadamente com o mesmo algoritmo de cor computada e os tokens CSS efetivos, sem repetir a suíte.

## Contratos de domínio, API e banco

O diff protegido entre `e320532` e HEAD é vazio para manifests, domínio, API de attendance, tipos de banco, schema, migration, teste SQL e configuração de mutação.
`deriveAttendanceDay` continua centralizando data válida, recorrência, fontes Ativa ou Nova, avulsa Confirmada, precedência de matrícula, histórico, snapshots e ordenação determinística.
`isAttendanceDayReady` continua sendo a única autoridade de prontidão e exige status para toda pessoa, retornando verdadeiro para roster vazio.

`loadAttendanceDay` continua somente leitura e carrega fontes em duas fases.
`upsertAula` reutiliza `data,turma_id`.
`upsertAttendance` valida a fonte, espera a aula e usa `aula_id,contato_id`, preservando nome, origem e ids snapshot.

O SQL preserva as duas unicidades, os checks de status e origem, deletes que mantêm snapshots quando aplicável, RLS habilitado e uma policy `membros full` baseada em `public.is_member()` para cada tabela.
Nenhum comando Supabase remoto foi executado e nenhum arquivo remoto, migration ou schema foi alterado nesta wave recuperada.

## Diff efetivo e histórico append-only

O range efetivo `e320532..8a59517` contém exatamente 13 caminhos, 1.272 inserções e 24 remoções.
`git diff --check e320532 HEAD` passou.

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

O histórico alcançável preserva a integração inicial, o revert e a recuperação sem reset ou reescrita:

1. `a820655` - implementação `feat: add attendance blocks to daily reports`.
2. `3becdc6` - merge `feat: integrate attendance blocks`.
3. `b6a441d` - revert append-only da integração.
4. `08342d0` - recuperação `fix: meet attendance contrast requirements`.
5. `8a59517` - merge `fix: integrate attendance contrast recovery`.

## Inspeção dos seis PNGs em resolução original

| PNG | Resolução | Inspeção |
|---|---:|---|
| `relatorios-attendance-desktop.png` | 1440 x 1000 | Header centrado e contido, Cards antes do resumo, nomes, Badges e toggles alinhados, seleção perceptível por ícone e estado, hierarquia clara e nenhum clipping, overflow ou colisão. |
| `relatorios-attendance-mobile.png` | 390 x 844 | Header em uma linha, Cards inteiros, nomes e Badges com fluxo natural, ToggleGroups completos em duas colunas, resumo abaixo das presenças e nenhum overflow horizontal. |
| `shell-desktop.png` | 1440 x 1000 | Empty equilibrado, heading visível, resumo e tabelas em hierarquia consistente, conteúdo dentro dos 1080 px e sem cortes. |
| `shell-mobile.png` | 390 x 844 | Empty, resumo, ação e tabela empilham com ritmo legível, alvos cabem na viewport e não há colisão ou overflow horizontal. |
| `shell-report-calendar-open.png` | 1440 x 1000 | Popover do calendário opaco, contido, sem clipping, controles e seleção legíveis e header preservado. |
| `shell-workspace-select-open.png` | 1440 x 1000 | Overlay de workspace opaco, alinhado ao trigger, opções e seleção legíveis e sem colisão, clipping ou overflow. |

Os seis arquivos permanecem byte-identical ao HEAD após o E2E sem atualização de snapshots.

## Pós-condições

- Branch final: `main`.
- HEAD final: `8a59517197c58e22e43d5c9da7369e27b876d1e4`.
- Produto, testes, snapshots, manifests e schema: sem alteração de working tree causada pelo Verify.
- Worktree do run: ausente.
- Porta TCP 4173: livre.
- Head remoto observado após a verificação: `2c2dfb724ffd4b547c0a6e0771d863e0e81d16ab`, idêntico à precondição.
- Processos Playwright, Chromium headless, Vite 4173 e npm iniciados por este Verify: nenhum restante.
- Containers iniciados por este Verify: nenhum.
- O Vite preexistente PID 13949 em 5173, iniciado em 25 de agosto, os Playwright MCP preexistentes e os quatro containers da linha de base permaneceram intocados.

Início UTC: `2026-08-27T00:26:52Z`.
Fim UTC: `2026-08-27T00:32:10Z`.
