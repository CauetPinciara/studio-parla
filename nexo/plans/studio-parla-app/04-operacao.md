---
id: 04-operacao
milestone: m1
status: todo
depends_on: [03-cadastros]
files_modified:
  - src/app/router.tsx
  - src/features/operacao/api-contract.test.ts
  - src/features/operacao/operacao-flow.test.tsx
  - src/features/pecas/api.ts
  - src/features/pecas/peca-form.tsx
  - src/features/pecas/pecas-page.tsx
  - src/features/pecas/status.ts
  - src/features/pecas/status.test.ts
  - src/features/relatorios/api.ts
  - src/features/relatorios/relatorio-form.tsx
  - src/features/relatorios/relatorios-page.tsx
  - src/features/relatorios/relatorio-detail-page.tsx
  - src/features/calendario/calendar.ts
  - src/features/calendario/calendar.test.ts
  - src/features/calendario/calendario-page.tsx
acceptance: "Dado um membro autenticado em Operação, quando ele faz CRUD de peças e avança produção, pronta, avisado e entregue, então as mudanças persistem e a primeira entrada em pronta grava data_pronta; quando abre relatórios em lista e detalhe, então registra uma peça na data do dia e marca uma peça em produção como pronta nessa data; e quando navega pelo calendário, então vê ocorrências derivadas apenas de turmas, workshops e avulsas persistidos."
---

# Operação diária persistente

> **Para agentes executores:** use `superpowers:test-driven-development` em Red, Green e Refactor e `superpowers:verification-before-completion` antes de declarar a fatia pronta.

## Objetivo e limites

Substituir os placeholders de `/relatorios`, `/pecas` e `/calendario` pelos fluxos persistentes do protótipo sem alterar schema, seed, tipos de banco ou componentes herdados.
Não adicionar tabelas, backend, notificações, eventos hardcoded, parser genérico de linguagem natural ou funções das fatias de Atendimento, Fechamento, Preços e Tática.
`parla.html` permanece somente como referência e não deve ser modificado.

## Interfaces e regras

`src/features/pecas/api.ts` deve exportar `pecasQueryKey = ["pecas"] as const`, `listPecas()`, `createPeca(input)`, `updatePeca(id, input)` e `deletePeca(id)` com `Tables`, `TablesInsert` e `TablesUpdate`.
`listPecas()` deve ordenar por `data_deixou` e `created_at`, ambos decrescentes.
Create e update devem usar `.select().single()`, update e delete devem usar `.eq("id", id)`, e toda operação deve lançar imediatamente o erro do Supabase.
`PecaForm` deve oferecer contato, descrição, data em que deixou, estimativa e status, enquanto `PecasPage` deve oferecer lista, badges, create, edit, exclusão confirmada e avanço rápido.
Os nomes de contatos devem vir de `contatosQueryKey` e `listContatos()` herdados da fatia 03.

`src/features/pecas/status.ts` deve exportar `PecaStatus`, `PECA_STATUS`, `dateInTimeZone(now?, timeZone?)`, `nextPecaStatus(status)` e `transitionPecaStatus(current, next, readyDate)` como funções puras.
`PecaStatus` deve aceitar somente `producao`, `pronta`, `avisado` e `entregue`, e o avanço rápido deve seguir exatamente essa ordem.
`dateInTimeZone()` deve retornar `YYYY-MM-DD` e usar `America/Sao_Paulo` por padrão, sem depender de corte de string UTC.
Ao entrar em `pronta`, a transição deve gravar `readyDate`, e os avanços seguintes devem preservar a primeira `data_pronta`.
Uma linha legada pronta sem data deve receber `readyDate` no próximo avanço, e uma correção explícita para `producao` deve limpar `data_pronta`.
Toda criação ou edição que altere status deve passar pelo mesmo contrato de transição.

`src/features/relatorios/api.ts` deve exportar `relatoriosQueryKey = ["relatorios"] as const`, `listRelatorios()`, `createRelatorio(input)`, `updateRelatorio(id, input)` e `deleteRelatorio(id)`.
`listRelatorios()` deve ordenar por `data` e `created_at`, ambos decrescentes, e as demais garantias do CRUD de peças também valem para relatórios.
`RelatorioForm` deve editar data, turma opcional, autor e resumo, com o dia de Vitória e `Catarina` como valores iniciais editáveis.
`RelatoriosPage` deve ser o primeiro nível e mostrar os dias em ordem decrescente, com turma ou `Geral`, resumo e contagens derivadas de `data_deixou` e `data_pronta`.
Cada card deve navegar para `/relatorios/:relatorioId`, preservando o segundo nível ao recarregar a URL.
`RelatorioDetailPage` deve mostrar autor, resumo, edição, exclusão confirmada e retorno para a lista, sem excluir peças junto com o relatório.
O detalhe deve ter os blocos `Peças deixadas neste dia`, `Marcar peças como prontas hoje` e `Peças que ficaram prontas neste dia`.
`Registrar peça` deve fixar `data_deixou` na data do relatório e criar a peça em `producao` com `data_pronta: null`.
`Ficou pronta hoje` deve listar somente peças em produção e persistir `status: "pronta"` e `data_pronta: relatorio.data` pelo contrato puro.
O último bloco deve filtrar por `data_pronta === relatorio.data`, mesmo quando a peça já estiver avisada ou entregue.

`src/features/calendario/calendar.ts` deve exportar `CalendarEventKind`, `CalendarEvent` e `deriveCalendarEvents({ year, month, turmas, workshops, avulsas, contatos })` sem depender de React.
Cada turma deve gerar uma ocorrência em todo dia do mês que corresponda a `turma.dia`, usando `turma.hora` e `turma.nome`.
Cada avulsa do mês deve gerar uma ocorrência com o nome do contato e a hora da turma quando disponível.
Workshops devem aceitar `DD/MM`, `DD/MM/YYYY` e a lista compacta `D, D e D/MM`, inclusive `16, 23 e 30/07 · 14h-17h30`.
Datas sem ano devem usar o ano exibido, textos não reconhecidos devem ser ignorados, e o resultado deve ser ordenado de modo determinístico por data, hora, tipo e id.
`CalendarioPage` deve iniciar no mês corrente de Vitória, manter `?ano=YYYY&mes=MM` na URL, navegar entre meses e exibir grade dominical, destaque do dia atual e legenda acessível.
As fontes devem ser `turmasQueryKey`, `workshopsQueryKey`, `avulsasQueryKey` e `contatosQueryKey`, sem uma query remota própria de calendário.

## Invalidação e estados

| Mutação | Queries a invalidar |
| --- | --- |
| Criar, editar, excluir, avançar ou registrar peça no dia | `pecas`, `relatorios` |
| Marcar `Ficou pronta hoje` | `pecas`, `relatorios` |
| Criar, editar ou excluir relatório | `relatorios` |

As invalidações devem ocorrer em `onSuccess` antes de fechar o modal, e erros devem manter a ação disponível com feedback em `role="alert"`.
As páginas devem usar os estados herdados de carregamento, erro recuperável e vazio, com `Nenhuma peça cadastrada.`, `Nenhum dia registrado ainda.` e `Nenhum evento neste mês.`.

## Teste-oráculo bloqueado

O oráculo é `src/features/operacao/operacao-flow.test.tsx`, no caso `gerencia peças e relatórios em dois níveis e mantém o calendário derivado`.
Ele deve montar as rotas com `createMemoryRouter`, `QueryClientProvider`, APIs mockadas com estado controlado e `userEvent`.
Ele deve observar loading, retry e vazio, fazer CRUD de uma peça, avançar todos os status e provar que `data_pronta` nasce uma vez e permanece estável.
Ele deve provar ordem e contagens da lista de relatórios, navegação por URL, registro de peça no dia e `Ficou pronta hoje` com a data do relatório.
Ele deve navegar o mês e provar eventos de turma, workshop e avulsa derivados das fixtures, além da ausência de evento hardcoded.
Ele deve verificar as query keys exatas após cada mutação e não pode ser apagado, pulado, afrouxado ou substituído.

## Plano TDD Red-Green-Refactor

1. **Red:** criar `api-contract.test.ts` para tabela, ordenação, payload, filtro, retorno e erro dos dois CRUDs, rodar `npm run test -- src/features/operacao/api-contract.test.ts` e confirmar FAIL por módulos ausentes.
2. **Green:** implementar os dois `api.ts`, repetir o comando e confirmar PASS.
3. **Red:** criar `status.test.ts` para sequência, timezone, gravação, preservação, reparo e limpeza de `data_pronta`, rodar `npm run test -- src/features/pecas/status.test.ts` e confirmar FAIL.
4. **Green:** implementar `status.ts` sem dependências de UI ou rede, repetir o comando e confirmar PASS.
5. **Red:** criar `calendar.test.ts` para recorrência, virada de mês, ano bissexto, três formatos de workshop, texto inválido e ordem, rodar `npm run test -- src/features/calendario/calendar.test.ts` e confirmar FAIL.
6. **Green:** implementar a derivação pura com datas locais e ids estáveis, repetir o comando e confirmar PASS.
7. **Red:** criar o teste-oráculo nomeado e rodar `npm run test -- src/features/operacao/operacao-flow.test.tsx`, confirmando FAIL por telas e rotas ausentes.
8. **Green:** implementar `PecaForm` e `PecasPage` com CRUD, transições, invalidações e estados acessíveis.
9. **Green:** implementar os dois níveis de relatórios, fixar a data nas ações do detalhe e manter os três blocos visíveis quando vazios.
10. **Green:** implementar o calendário e trocar apenas os três placeholders em `router.tsx`, adicionando `/relatorios/:relatorioId` sob o gate existente.
11. **Refactor:** rodar `npm run test -- src/features/operacao/api-contract.test.ts src/features/pecas/status.test.ts src/features/calendario/calendar.test.ts src/features/operacao/operacao-flow.test.tsx`, extrair somente repetição comprovada e repetir até PASS.

## Verify e commit

Um agente Verify separado deve executar o oráculo, os três testes auxiliares, `npm run typecheck`, `npm run lint`, `npm run build` e `rg -n "eventosData|service_role|SUPABASE_SERVICE_ROLE|sk-[A-Za-z0-9]" src`.
O agente deve inspecionar `/relatorios`, o detalhe, `/pecas` e `/calendario` em 1440 por 900 e 390 por 844, encerrar o grupo do servidor local e registrar PASS ou FAIL objetivo.
Depois de Gate 2 verde, o fluxo Nexo deve executar o commit atômico abaixo.

```bash
git add src/app/router.tsx src/features/calendario src/features/operacao src/features/pecas src/features/relatorios
git commit -m "feat: add persistent studio operations"
```
