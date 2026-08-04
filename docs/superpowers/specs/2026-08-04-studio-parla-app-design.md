# Studio Parla App Design

## Objetivo

Migrar o protótipo local `parla.html` para uma aplicação web multiusuário, persistente e pronta para configuração no Supabase e publicação no Cloudflare Pages.
O protótipo permanece como referência viva em `reference/parla.html`.

## Arquitetura

A aplicação será uma SPA Vite com React e TypeScript em modo estrito.
O React Router organizará as telas, e um layout compartilhado manterá a sidebar com os três workspaces do protótipo.
O TanStack Query será a única camada de cache e sincronização de dados remotos.
Cada feature terá um `api.ts` tipado, formulários isolados e páginas com estados explícitos de carregamento, erro e vazio.

O Supabase será o backend completo.
O cliente usará apenas URL e chave pública `anon`, lidas de variáveis `VITE_*`.
O Google OAuth criará a sessão, enquanto a função `is_member()` e as políticas RLS limitarão o acesso aos e-mails presentes em `app_members`.

## Interface

A linguagem visual seguirá as cores e densidade do protótipo: fundo bege claro, superfícies brancas, destaque terracota, bordas suaves e tipografia de sistema.
A sidebar terá seletor segmentado para Operação, Cadastros e Tática, com navegação adaptada para telas estreitas.
Cards, tabelas, badges, modais, campos e feedbacks usarão componentes shadcn/ui compostos com tokens semânticos.
Os textos, emojis, rótulos, mensagens prontas e tom em português serão preservados.

## Dados e comportamento

As tabelas e relacionamentos seguirão literalmente `supabase/schema.sql` fornecido na tarefa.
Os tipos manuais representarão `Row`, `Insert` e `Update` de cada tabela no formato esperado pelo cliente Supabase.
O contato será a entidade mestre para matrículas, inscrições, avulsas e peças.

O fluxo de peças seguirá `producao`, `pronta`, `avisado` e `entregue`.
Ao entrar em `pronta`, a peça recebe `data_pronta`.
O relatório diário listará dias em ordem decrescente e permitirá registrar peças deixadas e marcar peças prontas na data do relatório.

A calculadora aplicará mensalidade, argila, primeira queima e segunda queima com as mesmas regras, formatação e mensagem do protótipo.
O calendário combinará recorrências das turmas com workshops e aulas avulsas persistidos.
Os KPIs serão derivados das consultas, sem tabelas agregadas adicionais.

## Seeds

O schema manterá exatamente o SQL obrigatório da tarefa.
Um arquivo separado `supabase/seed.sql` migrará os contatos, matrículas, workshops, inscrições, avulsas, peças e relatórios do protótipo usando UUIDs determinísticos e operações idempotentes.
As três turmas continuarão no `schema.sql`, conforme o contrato fornecido.
As mensagens prontas e preços serão constantes do frontend, pois não possuem tabelas no schema fechado.

## Erros e segurança

Toda função de API lançará um erro quando o Supabase retornar `error`.
As páginas mostrarão carregamento, falha recuperável e estados vazios.
As mutações invalidarão as queries dependentes.
O app compilará sem credenciais reais por meio de placeholders locais seguros, mas exibirá uma orientação de configuração em runtime.
Nenhuma chave `service_role` será usada ou documentada no frontend.

## Testes

As regras puras de fechamento, status de peças, calendário e KPIs terão testes unitários escritos antes da implementação.
Os fluxos principais terão testes de componentes que representam a experiência do usuário com dados controlados.
O contrato final inclui testes, lint, build, verificação de segredos e uma inspeção visual responsiva local.

