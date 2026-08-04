# Verify 04 - Operacao

Status: PASS

Branch verificada: `feat/04-operacao`.

## Evidencias

- `npm run test -- src/features/pecas/domain.test.ts` terminou com exit code 0: 1 arquivo e 1 teste passaram.
- `npm run lint` terminou com exit code 0 e zero warnings permitidos.
- `npm run build` terminou com exit code 0: TypeScript e Vite concluiram o build de producao.
- O aviso do Vite sobre chunk acima de 500 kB nao bloqueou o build.

## Contrato inspecionado

- A API de pecas expoe listagem, criacao, atualizacao e exclusao, e `PecasPage` conecta essas operacoes aos controles de CRUD.
- `getNextPecaStatus` avanca `producao` para `pronta`, `pronta` para `avisado` e `avisado` para `entregue`.
- `setPecaStatus` delega a `pecaStatusPatch`, que inclui `data_pronta` ao entrar em `pronta` e nao a sobrescreve nos status seguintes.
- `RelatoriosPage` apresenta a lista de dias e o detalhe selecionado, permite registrar uma peca com `data_deixou` fixada na data do relatorio e separa as pecas deixadas e prontas nessa data.
- A acao `Ficou pronta hoje` chama `setPecaStatus(id, "pronta", report.data)`, usando a data do relatorio.
- `CalendarioPage` deriva os eventos das consultas persistidas de turmas, workshops, avulsas e contatos, sem uma fonte propria de eventos.

## Veredito

Os comandos exigidos e os criterios de aceitacao informados para esta verificacao passaram.
