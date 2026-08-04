---
id: 05-tatica-entrega
milestone: m1
status: todo
depends_on: [04-operacao]
files_modified:
  - package.json
  - package-lock.json
  - .env.example
  - README.md
  - public/_redirects
  - .github/workflows/keep-alive.yml
  - stryker.config.mjs
  - src/app/router.tsx
  - src/features/fechamento/calculator.ts
  - src/features/fechamento/calculator.test.ts
  - src/features/fechamento/fechamento-page.tsx
  - src/features/atendimento/messages.ts
  - src/features/atendimento/atendimento-page.tsx
  - src/features/precos/pricing.ts
  - src/features/precos/precos-page.tsx
  - src/features/tatica/dashboard.ts
  - src/features/tatica/visao-geral-page.tsx
  - src/features/tatica/tatica-entrega-flow.test.tsx
  - src/features/delivery/delivery-contract.test.ts
acceptance: "Dado um membro autenticado, Fechamento reproduz os valores, a formatacao e a mensagem exata do prototipo, Atendimento preserva e copia as oito mensagens, Precos preserva a tabela comercial, e Visao geral deriva KPIs e pendencias dos dados persistidos; sem credenciais reais, testes, lint, typecheck, build, busca de segredos, mutacao e inspecao responsiva passam, enquanto README, fallback SPA e keep-alive semanal e manual deixam a entrega configuravel."
---

# Tática e entrega final

> **Para agentes executores:** use `superpowers:test-driven-development` em Red, Green e Refactor e `superpowers:verification-before-completion` antes de concluir.

## Objetivo e limites

Completar Fechamento, Atendimento, Preços e Visão geral e encerrar a feature com documentação, Cloudflare Pages, keep-alive e QA.
As APIs, query keys, tipos, autenticação e estados de dados das fatias anteriores são contratos herdados.
Não altere o schema, não crie backend ou tabelas de mensagens, preços ou KPIs, não envie WhatsApp e não persista tarifas locais.
Não faça deploy, não configure credenciais e não modifique `parla.html`.
O único workflow hospedado permitido é o keep-alive exigido, nunca CI, teste, build, deploy ou release.

## Interfaces fechadas

`pricing.ts` exporta `DEFAULT_PRODUCTION_RATES`, `CLASS_PRICES`, `HOLIDAY_CAMP_PRICES` e `PAYMENT_INSTRUCTIONS` como constantes somente de leitura.
As tarifas por kg são argila `14`, primeira queima `30` e segunda queima `36`.
Os preços são mensal `520`, PIX até `500`, avulsa `180`, e colônia `220` por um dia, `210` por dia em dois e `200` por dia em três.
As instruções preservam PIX `27 99879-8726 (Maria Catarina)`, InfinitePay, débito, antecipação e pedido de comprovante.
`calculator.ts` exporta `ClosingInput`, `ClosingResult`, `calculateClosing`, `formatBRL` e `formatKg` sem React, DOM ou Supabase.
`ClosingInput` contém `name`, `monthlyFee`, `clayWeightKg`, `glazedWeightKg`, `clayPerKg`, `bisquePerKg` e `glazePerKg`.
`ClosingResult` contém `monthlyFee`, `clay`, `bisque`, `glaze`, `total` e `message`.
Argila é `clayWeightKg * clayPerKg`, primeira queima é `clayWeightKg * bisquePerKg`, segunda queima é `glazedWeightKg * glazePerKg`, e o total soma valores não arredondados.
Valores vazios, negativos ou não finitos viram zero, nome vazio vira `aluno(a)`, BRL tem duas casas e peso tem três casas.
A mensagem omite mensalidade zero e segunda queima zero, enquanto o detalhamento visual sempre mostra mensalidade, argila, primeira queima e total.
Para Isadora, com `500`, `0.296` e `0`, a mensagem exata é `Total geral da Isadora:\n• Peso total: 0,296 kg\n• Mensalidade: R$ 500,00\n• Argila: R$ 4,14\n• Queima de biscoito: R$ 8,88\n• Valor total: R$ 513,02`.
O preset Mariana usa `520`, `0.792` e `0`, e o preset Isadora usa `500`, `0.296` e `0`.
`messages.ts` exporta `STUDIO_TONE_GUIDELINES` e `READY_MESSAGES` com as quatro diretrizes e os oito títulos, corpos, emojis, `[nome]` e quebras literais de `parla.html`.
Os títulos permanecem `Primeiro contato / divulgação`, `Aula avulsa`, `Pedir comprovante`, `Falta / puxar de volta`, `Cobrança da mensalidade` e `Follow-up 1` a `3`.
`dashboard.ts` exporta `DashboardInput`, `DashboardKpis`, `DashboardPendingItem`, `DashboardModel` e a função pura `deriveDashboard`.
O input recebe contatos, turmas, matrículas, workshops, avulsas e peças já carregados pelas APIs existentes.
Alunos ativos contam `contato_id` distintos em matrículas `Ativa`, receita soma apenas essas matrículas, e os demais KPIs contam turmas e peças `pronta`.
Produção conta separadamente `producao`, `pronta` e `avisado`.
Cada peça `pronta` gera `Peça pronta de {nome}` e `Avisar o cliente para retirada.`.
Cada matrícula `Nova` gera `Confirmar pagamento - {nome}` e `Matrícula nova, pagamento antecipado.`.
Nenhuma pendência usa nome fixo, índice ou interpretação de observação, e próximos eventos derivam de workshops e avulsas persistidos.

## Testes-oráculo bloqueados

O oráculo principal é `tatica-entrega-flow.test.tsx` com o caso `preserva fechamento, atendimento, preços, KPIs e pendências em todas as rotas finais`.
O oráculo puro é `calculator.test.ts` com a suíte `calculadora e mensagem exata do fechamento`.
O contrato operacional é `delivery-contract.test.ts` com a suíte `entrega configurável sem credenciais reais`.
O executor não pode apagar, pular, afrouxar ou substituir esses oráculos por snapshots opacos.

## Plano TDD

### 1. Red e Green da calculadora

- [ ] Escreva primeiro `calculator.test.ts` cobrindo a mensagem exata, ambos os presets, arredondamento final, segunda queima, mensalidade zero, nome vazio, negativos e não finitos, e confirme FAIL.
- [ ] Implemente `pricing.ts`, `calculator.ts` e `FechamentoPage` com campos, detalhamento, presets, textarea somente leitura, Clipboard API e feedback acessível, e confirme PASS.

### 2. Red e Green das páginas finais

- [ ] Escreva primeiro o oráculo principal com `createMemoryRouter`, `QueryClientProvider`, APIs mockadas e `userEvent`, e confirme FAIL nos placeholders.
- [ ] Teste as rotas `/fechamento`, `/atendimento`, `/precos` e `/visao-geral`, os valores e textos literais, as cópias, loading, erro com retry, vazio e atualização após invalidação do cache.
- [ ] Use fixtures com contato repetido, matrículas `Ativa` e `Nova`, e peças nos quatro status para bloquear contagem distinta, receita, produção e pendências.
- [ ] Implemente `AtendimentoPage`, `PrecosPage`, `deriveDashboard` e `VisaoGeralPage`, usando queries existentes sem duplicar API ou converter erro em zero.
- [ ] Ligue somente as quatro rotas em `router.tsx`, preservando autenticação, layout, workspaces, demais caminhos e exports.
- [ ] Execute `npm run test -- src/features/fechamento/calculator.test.ts src/features/tatica/tatica-entrega-flow.test.tsx` até PASS.

### 3. Red e Green do contrato de entrega

- [ ] Faça `delivery-contract.test.ts` ler arquivos e exigir `.env.example` somente com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, sem valores reais.
- [ ] Exija `public/_redirects` exatamente como `/* /index.html 200` seguido de newline.
- [ ] Exija no README a reprodução literal da seção 7 do pedido original, com seções A a D, passos 1 a 14 e placeholders `<REF>` e `<URL_PAGES>` intactos.
- [ ] Confirme FAIL antes de criar os artefatos, depois escreva `.env.example`, `README.md` e `_redirects` até PASS, sem executar o runbook externo.
- [ ] Crie `keep-alive.yml` com `schedule` semanal, `workflow_dispatch`, `permissions: contents: read` e um job em `ubuntu-latest`.
- [ ] Faça um GET com `curl --fail --silent --show-error` para `${SUPABASE_URL%/}/rest/v1/turmas?select=id&limit=1`.
- [ ] Envie `apikey: ${SUPABASE_ANON_KEY}` e `Authorization: Bearer ${SUPABASE_ANON_KEY}`, lendo somente `secrets.SUPABASE_URL` e `secrets.SUPABASE_ANON_KEY`.
- [ ] Não use `service_role`, não altere dados e não adicione checkout, CI ou deploy.

### 4. Refactor, mutação e Gate 2

- [ ] Refatore apenas no verde e mantenha regras puras, queries nas páginas e conteúdo literal em constantes.
- [ ] Instale `@stryker-mutator/core` e `@stryker-mutator/vitest-runner`, adicione `test:mutation` e configure `stryker.config.mjs` com Vitest, limiar de quebra 80 e mutação apenas de `calculator.ts` e `dashboard.ts`.
- [ ] Mate todos os mutantes das fórmulas, omissões, filtros, contagem distinta, receita e pendências.
- [ ] Um agente Verify separado e sem context pack executa os três oráculos, `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` e `npm run test:mutation`.
- [ ] O Verify executa `rg -n "service_role|SUPABASE_SERVICE_ROLE|sb_secret_|sk-[A-Za-z0-9]" src public .github .env.example README.md --glob '!node_modules/**' --glob '!dist/**'` e confirma ausência de segredo privilegiado; referências textuais nos artefatos Nexo não fazem parte dessa varredura.
- [ ] O Verify confirma build sem `.env`, nenhum secret no bundle e nenhum workflow além do keep-alive, que é exceção explícita e não substitui o Gate 2 local.

### 5. Inspeção visual responsiva

- [ ] Inspecione as quatro rotas autenticadas em 1440 por 900, 768 por 1024 e 390 por 844 contra `parla.html`.
- [ ] Confira hierarquia, cores, densidade, textos, cards, tabelas, foco, labels, teclado, toque, feedback, empilhamento e ausência de corte ou scroll horizontal.
- [ ] Corrija defeitos encontrados, repita os checks afetados e encerre o preview e todo processo filho antes de concluir.

## Commit atômico

Após Gate 2 verde, execute `git add package.json package-lock.json .env.example README.md public/_redirects .github/workflows/keep-alive.yml stryker.config.mjs src/app/router.tsx src/features`.
Execute `git commit -m "feat: complete studio operations and delivery setup"`.
Não corte release, faça deploy, configure secrets ou execute o runbook externo.
