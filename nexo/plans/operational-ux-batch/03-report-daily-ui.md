---
id: 03-report-daily-ui
milestone: m1
status: done
depends_on: [02-report-completion-storage]
files_modified: [src/features/relatorios/RelatorioForm.tsx, src/features/relatorios/RelatoriosPage.tsx, tests/e2e/relatorios.spec.ts, tests/e2e/shell.spec.ts, tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png, tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png]
acceptance: "Dado que Catarina abre /relatorios, a página mostra diretamente o dia indicado por ?data=YYYY-MM-DD ou hoje em America/Sao_Paulo, navega por dia anterior, próximo e Hoje sem criar registros ao apenas visitar datas, remove Novo dia, salva e edita as anotações do dia, persiste e reabre Tudo anotado!, e mantém registro e conclusão de peças presos à data selecionada."
goal: "Entregar a experiência diária de relatórios com URL canônica, conclusão manual e fluxo de peças preservado."
must_not_break:
  - "Turma, autor, resumo e correção da data de um relatório existente."
  - "Os três blocos de peças, Registrar peça e Ficou pronta hoje."
  - "Loading, erro, feedback, rota /relatorios, shell desktop e drawer mobile."
  - "Visitar um dia vazio não insere nem atualiza dados."
rules:
  - "Consumir somente as regras de data da fatia 01 e o contrato de storage da fatia 02."
  - "Usar português, componentes e tokens existentes, aria-label, aria-pressed e foco visível."
  - "A URL é a fonte de verdade do dia; não manter seleção paralela em estado local."
  - "Sem lista histórica, calendário mensal, nova tabela, dependência, notificação ou migração remota."
verifier_focus: "Usar a interface real para provar hoje, URL e reload, ausência de escrita ao navegar, criação sob demanda, conclusão persistente e reversível, correção de data e payloads de peças com a data escolhida, incluindo mobile e snapshots."
---

# Interface diária de relatórios

## Escopo

Substituir a lista e o estado `selected` por `useSearchParams()` com `data=YYYY-MM-DD`.
Parâmetro ausente ou inválido é substituído por hoje com `replace: true`.
Os controles `Dia anterior`, `Próximo dia` e `Hoje` atualizam somente a URL.

A página procura o primeiro relatório da data na ordem estável recebida da API.
Se não existir linha, mostra o dia vazio, `Sem resumo.` e todos os blocos de peças sem escrever no banco.
`Anotar este dia` cria a linha somente ao salvar.
`Editar dia` mantém turma, resumo e correção da data; se a data mudar, a URL acompanha a linha devolvida.

`Tudo anotado!` é um botão de alternância com `aria-pressed`.
Ao concluir, usa timestamp ISO; ao reabrir, usa `null`.
Se o dia ainda não tiver linha, concluir cria a linha mínima com data selecionada, autor Catarina, turma e resumo nulos e timestamp.

Preservar exatamente:

- `Peças deixadas neste dia` e `Registrar peça` com `data_deixou` igual à data da URL;
- `Marcar peças como prontas hoje` e `Ficou pronta hoje` com `data_pronta` igual à data da URL;
- `Peças que ficaram prontas neste dia`, filtrado por essa mesma data.

Não alterar schema, migration, tipos, API, regras de data, peças ou navegação global nesta fatia.

## Red, Green e Refactor

### Red

1. Criar `tests/e2e/relatorios.spec.ts` antes da página nova, com relógio fixo em `2026-08-04T14:00:00-03:00`, shell preview e REST do Supabase interceptado por fixtures mutáveis.
2. No caso `abre hoje e navega sem criar dias vazios`, exigir URL canônica, ausência de `Novo dia`, anterior, próximo, Hoje, deep link, reload e zero POST ou PATCH durante navegação.
3. No caso `persiste o dia, Tudo anotado e as peças na data selecionada`, salvar um dia vazio, editar data, turma e resumo, concluir, recarregar, reabrir, registrar peça e marcar outra pronta, conferindo os payloads REST.
4. No caso `mantém o relatório diário acessível no celular`, usar 390 por 844, teclado, nomes acessíveis, `aria-pressed`, alvos visíveis e ausência de overflow horizontal.
5. Atualizar as expectativas funcionais de `shell.spec.ts` para o novo estado diário e confirmar FAIL antes de tocar na página.

### Green

1. Adaptar `RelatorioForm` para o dia selecionado, sem qualquer título ou ação `Novo dia`, preservando edição de data, turma, autor e resumo.
2. Reescrever `RelatoriosPage` com data derivada da URL e registro opcional.
3. Criar ou atualizar o relatório somente em salvar ou alternar conclusão, invalidando `relatoriosQueryKey` após sucesso e mantendo a ação disponível em erro.
4. Manter os três blocos de peças visíveis e substituir toda dependência de `report.data` pela data selecionada quando não houver linha.
5. Rodar os E2E até PASS.

### Refactor

1. Remover lista, `selected`, `Voltar aos dias`, imports e branches mortos.
2. Atualizar os dois snapshots do shell uma vez, inspecionar 1440 por 1000 e 390 por 844 e repetir o teste sem atualização.
3. Rodar E2E e lint novamente.

## Oráculos de Gate 2

```bash
npm run test:e2e -- tests/e2e/relatorios.spec.ts --project=chromium
npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium
npx eslint src/features/relatorios/RelatorioForm.tsx src/features/relatorios/RelatoriosPage.tsx tests/e2e/relatorios.spec.ts tests/e2e/shell.spec.ts --max-warnings=0
```

Os três casos nomeados são bloqueados e não podem ser apagados, pulados, afrouxados ou substituídos por snapshots opacos.
Durante Green, os baselines são atualizados uma vez com:

```bash
npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium --update-snapshots
```

O Verify roda sem `--update-snapshots` e inspeciona os PNGs.
Na wave integrada, Nexo ainda executa suite completa, lint completo e segurança.
O commit sugerido é `feat: abrir relatórios diretamente por dia`.
