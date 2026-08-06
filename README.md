# Studio Parla

Painel interno multiusuário para o ateliê de cerâmica Studio Parla.
O app migra o protótipo original para Vite, React, TypeScript e Supabase, mantendo o arquivo de referência em `reference/parla.html`.

## Desenvolvimento

Requisitos: Node.js 22 ou mais recente e npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Os comandos de qualidade são:

```bash
npm run test
npm run lint
npm run build
npm run test:e2e
```

Sem as variáveis reais, o build funciona e o navegador mostra a orientação de configuração.
O frontend usa somente a chave pública `anon`.

## Banco e dados iniciais

Execute `supabase/schema.sql` primeiro.
Antes de executar, troque os três e-mails de exemplo da tabela `app_members` pelos e-mails reais.
Para carregar os registros que existiam no protótipo, execute `supabase/seed.sql` depois do schema.
O seed é idempotente e usa UUIDs fixos somente para os dados de referência.

Para adicionar um membro depois:

```sql
insert into app_members (email, nome)
values ('novo@gmail.com', 'Nome da pessoa')
on conflict (email) do update set nome = excluded.nome;
```

## GitHub Action de keep-alive

O workflow semanal faz uma leitura leve da tabela `turmas`.
No repositório GitHub, crie os secrets `SUPABASE_URL` e `SUPABASE_ANON_KEY` com os mesmos valores públicos usados no frontend.

## Runbook manual

### A. Supabase

1. Em **supabase.com**, crie conta, clique em **New project** e escolha a região **South America (São Paulo)** se houver.
Guarde a senha do banco.
2. Em **SQL Editor > New query**, cole `supabase/schema.sql`.
Antes de rodar, troque os 3 e-mails em `app_members` pelos reais.
Clique em **Run**.
Depois, para carregar os dados do protótipo, rode `supabase/seed.sql` em uma nova query.
3. Em **Project Settings > API**, copie **Project URL** e a chave **`anon` `public`**.
4. Crie `.env.local` na raiz com os valores abaixo preenchidos:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### B. Contas de acesso

5. No Supabase, entre em **Authentication > Sign In / Providers > Email** e mantenha o login por e-mail habilitado.
Desative **Allow new users to sign up** para impedir cadastros públicos.
6. Entre em **Authentication > Users > Add user > Create new user**.
Crie um usuário confirmado para cada e-mail presente em `app_members` e atribua uma senha inicial forte a cada pessoa.
7. O aplicativo não envia e-mails nem oferece recuperação de senha.
Se alguém esquecer a senha, redefina ou recrie a conta em **Authentication > Users**.

### C. Rodar local e validar

8. Rode `npm install` e `npm run dev`.
Faça login com um dos e-mails da allowlist e confirme que os dados persistem.
9. Opcionalmente, sincronize os tipos com o banco real:

```bash
npx supabase login
npx supabase gen types typescript --project-id <REF> --schema public > src/lib/database.types.ts
```

### D. Deploy no Cloudflare Pages

10. Suba o repositório no **GitHub**.
11. Em **Cloudflare > Workers & Pages > Create > Pages > Connect to Git**, selecione o repositório.
Use o preset **Vite**, build `npm run build` e output `dist`.
12. Em **Settings > Environment variables** do Pages, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
13. Após o deploy, abra a URL `<URL_PAGES>` com domínio `*.pages.dev` e entre com uma das contas criadas no Supabase.

Os valores que precisam ser colados manualmente são os e-mails reais, `<REF>`, `<URL_PAGES>`, Project URL e chave pública `anon`.
