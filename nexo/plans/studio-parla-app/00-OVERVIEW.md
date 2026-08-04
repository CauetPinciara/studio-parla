# Studio Parla App

## Frame

Transformar o protótipo funcional em uma SPA persistente e multiusuário sem alterar suas regras, identidade ou linguagem.
O resultado deve compilar sem credenciais reais e ficar pronto para o usuário conectar Supabase, Google OAuth e Cloudflare Pages.

## Critérios de aceitação

- O app usa Vite, React, TypeScript estrito, React Router, TanStack Query, Tailwind, shadcn/ui e um cliente Supabase tipado.
- O login Google e o gate de allowlist protegem todas as rotas internas.
- Todas as entidades operacionais do schema possuem operações tipadas e telas CRUD ligadas ao Supabase; `app_members` permanece administrada fora do cliente.
- Peças, relatórios diários, fechamento, calendário, atendimento e KPIs preservam o comportamento do protótipo.
- O seed representa os dados iniciais do protótipo sem alterar o `schema.sql` obrigatório.
- `npm run test`, `npm run lint` e `npm run build` terminam com sucesso.
- O README contém o runbook manual solicitado e o deploy está configurado para Cloudflare Pages.

## Fatias

| Fatia | Entrega | Dependência |
| --- | --- | --- |
| 01-shell-visual | Scaffold, design system, layout, workspaces e rotas | nenhuma |
| 02-supabase-auth | Schema, seed, tipos, cliente e proteção por login/allowlist | 01-shell-visual |
| 03-cadastros | CRUD de contatos, turmas, matrículas, avulsas, workshops e inscrições | 02-supabase-auth |
| 04-operacao | Peças, relatórios diários, calendário e fluxo de status | 03-cadastros |
| 05-tatica-entrega | Fechamento, atendimento, preços, KPIs, documentação, keep-alive e QA | 04-operacao |

## Limites

Não haverá backend próprio, edição da allowlist pelo cliente, envio automático de WhatsApp, tabela adicional de preços ou alteração do schema fechado.
Nenhum deploy, criação de projeto externo ou configuração de credenciais será realizado nesta execução.
