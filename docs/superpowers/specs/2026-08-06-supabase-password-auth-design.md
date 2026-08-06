# Autenticação por e-mail e senha no Supabase

## Objetivo

Remover integralmente a dependência do Google OAuth e autenticar os três membros do Studio Parla somente com e-mail e senha gerenciados pelo Supabase.
A mudança deve preservar a allowlist existente, as políticas RLS e as variáveis públicas já configuradas em `.env.local`.

## Abordagens consideradas

### Contas administradas no painel do Supabase

O administrador cria manualmente cada usuário em Authentication > Users e fornece uma senha inicial.
O cadastro público permanece desativado e o aplicativo oferece apenas o formulário de entrada.
Essa é a abordagem escolhida porque não depende de Google, SMTP, convites ou links enviados por e-mail.

### Cadastro público com confirmação de e-mail

Cada membro criaria sua própria conta e confirmaria o endereço por e-mail.
Essa opção exige um serviço SMTP confiável em produção e adiciona uma superfície de cadastro desnecessária para uma equipe de três pessoas.

### Magic link ou código por e-mail

Cada acesso usaria um link ou código enviado por e-mail.
Essa opção também exige SMTP e torna a disponibilidade do login dependente da entrega de mensagens.

## Fluxo escolhido

1. O administrador mantém os e-mails autorizados em `app_members`.
2. O administrador cria no painel do Supabase um usuário confirmado para cada um desses mesmos e-mails.
3. O membro informa e-mail e senha na tela de entrada do Studio Parla.
4. O frontend chama `supabase.auth.signInWithPassword`.
5. Depois que o Supabase cria a sessão, o aplicativo consulta `app_members`.
6. Uma conta autenticada cujo e-mail não esteja na allowlist continua bloqueada pela interface e pelo RLS.
7. O logout continua encerrando a sessão pelo Supabase.

Não haverá cadastro, convite, recuperação de senha, alteração de senha ou autenticação social no aplicativo nesta entrega.
Caso uma senha seja esquecida, o administrador redefine ou recria a conta pelo painel do Supabase.

## Interface

A tela protegida manterá a identidade visual atual e exibirá os campos `E-mail` e `Senha` e o botão `Entrar`.
O formulário terá labels visíveis, preenchimento automático apropriado, envio por teclado, estado de carregamento e mensagem de erro em português.
Uma falha de credenciais não revelará se o e-mail existe.
A tela de acesso não autorizado e o botão de sair permanecerão como estão.

## Código

`src/lib/auth.tsx` substituirá `signInWithGoogle` por uma operação tipada `signInWithPassword(email, password)`.
`src/components/Protected.tsx` será responsável apenas pela apresentação do formulário e pelos seus estados locais de envio e erro.
Nenhuma chave administrativa ou `service_role` será adicionada ao frontend.
O schema e a função `is_member()` não precisam mudar.

## Configuração e documentação

O README removerá todas as etapas do Google Cloud Console.
O novo runbook instruirá o administrador a manter Email habilitado no Supabase, desabilitar novos cadastros públicos e criar manualmente os três usuários confirmados com os mesmos e-mails da allowlist.
As etapas já concluídas de criação do projeto, execução do schema e preenchimento de `.env.local` continuarão válidas.
O deploy no Cloudflare Pages continuará usando apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Testes e aceite

Um teste de comportamento deve falhar primeiro enquanto a tela ainda oferecer Google OAuth.
O teste deve preencher e-mail e senha como um usuário final, enviar o formulário e confirmar que `signInWithPassword` recebe as credenciais corretas.
Também deve cobrir carregamento, credenciais inválidas e ausência completa de textos ou chamadas de Google OAuth.
Os testes existentes, lint, typecheck, build e E2E devem permanecer verdes.
Um agente Verify separado executará o contrato de autenticação e a suíte local antes da integração na `main`.

## Fora de escopo

Não serão configurados SMTP, magic link, OTP, Google OAuth, recuperação de senha, cadastro público ou administração de usuários dentro do aplicativo.
Nenhuma conta ou senha real será criada pelo agente.
