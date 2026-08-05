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

### B. Login com Google

5. Em **Google Cloud Console**, abra ou crie um projeto, entre em **APIs & Services > OAuth consent screen**, escolha External e adicione seu e-mail como test user.
Depois entre em **Credentials > Create credentials > OAuth client ID > Web application**.
6. Em **Authorized redirect URIs**, adicione `https://<REF>.supabase.co/auth/v1/callback`, onde `<REF>` é o subdomínio da Project URL.
Copie **Client ID** e **Secret**.
7. No Supabase, entre em **Authentication > Providers > Google**, cole Client ID e Secret e clique em **Save**.
8. No Supabase, entre em **Authentication > URL Configuration** e adicione `http://localhost:5173` em **Redirect URLs**.

### C. Rodar local e validar

9. Rode `npm install` e `npm run dev`.
Faça login com um dos e-mails da allowlist e confirme que os dados persistem.
10. Opcionalmente, sincronize os tipos com o banco real:

```bash
npx supabase login
npx supabase gen types typescript --project-id <REF> --schema public > src/lib/database.types.ts
```

### D. Deploy no Cloudflare Pages

11. Suba o repositório no **GitHub**.
12. Em **Cloudflare > Workers & Pages > Create > Pages > Connect to Git**, selecione o repositório.
Use o preset **Vite**, build `npm run build` e output `dist`.
13. Em **Settings > Environment variables** do Pages, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
14. Após o deploy, copie a URL `<URL_PAGES>` com domínio `*.pages.dev`.
No Supabase, em **Authentication > URL Configuration**, defina **Site URL** como `<URL_PAGES>` e adicione a mesma URL em **Redirect URLs**.
No Google Cloud, em **Credentials**, adicione `<URL_PAGES>` em **Authorized JavaScript origins**.

Os valores que precisam ser colados manualmente são os e-mails reais, `<REF>`, `<URL_PAGES>`, Project URL, chave pública `anon`, Google Client ID e Google Secret.
