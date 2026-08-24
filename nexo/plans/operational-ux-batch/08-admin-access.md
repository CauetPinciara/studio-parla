---
id: 08-admin-access
milestone: m1
status: parked
depends_on: [07.1-workspace-selector-task-snapshot]
files_modified: [src/app/access.ts, src/app/access.test.ts, src/components/AdminAccessBoundary.tsx, src/components/AdminAccessBoundary.test.tsx, src/App.tsx]
acceptance: "Dado /admin, quando a sessao ou a allowlist ainda esta pendente, entao nenhum filho ou metadado Admin renderiza; quando o member confirmado nao e cauetpinciara@gmail.com, entao ocorre redirect para /relatorios sem flash; somente o member confirmado com esse e-mail atravessa a fronteira."
goal: "Criar uma unica regra de superadmin e bloquear /admin antes de qualquer Layout ou metadado administrativo."
must_not_break: ["Protected continua sendo o gate geral de sessao e allowlist.", "Rotas comuns e shell preview continuam funcionando."]
rules: ["Autorizar somente por member.email confirmado, nunca por session.user.email, nome, localStorage ou URL.", "Nao adicionar workspace, item de menu, pagina Admin ou chamada Supabase nesta fatia.", "Nao alterar schema, tipos, RLS ou migrations."]
verifier_focus: "Tentar renderizar filhos com identidade pendente, comum, ausente e superadmin, garantindo zero flash antes do redirect."
---

# Fronteira de acesso Admin

## Escopo

Criar `SUPERADMIN_EMAIL = "cauetpinciara@gmail.com"` e `isSuperadminEmail(email)` em um modulo puro.
A funcao deve aparar espacos, normalizar caixa e rejeitar `null`, `undefined` e qualquer outro e-mail.

Criar `AdminAccessBoundary` com `children: ReactNode`.
Enquanto `loading` ou a verificacao de membership estiver pendente, a fronteira mostra `LoadingState` e nunca monta os filhos.
Depois da verificacao, ela monta os filhos somente quando `isSuperadminEmail(member?.email)` for verdadeira e redireciona os demais para `DEFAULT_ROUTE` com `replace`.

Em `App.tsx`, reservar `/admin` em uma rota de topo envolvida por `AdminAccessBoundary`, fora da arvore cujo elemento e `Layout`.
Nesta fatia, o filho autorizado ainda redireciona para `DEFAULT_ROUTE`.
A fatia 09 substituira esse placeholder pela superficie Admin sem mover a fronteira para baixo do Layout.

## Red

1. Criar `access.test.ts` cobrindo o e-mail exato, caixa, espacos, `null`, `undefined` e um membro comum.
2. Criar `AdminAccessBoundary.test.tsx` com um filho que contenha os textos `Administração` e `Área administrativa`.
3. Provar que identidade pendente exibe somente loading e que membro comum ou sessao ausente redireciona sem o filho aparecer em nenhum render.
4. Provar que apenas um `member.email` confirmado com o valor permitido renderiza o filho.
5. Registrar FAIL pela ausencia da regra e da fronteira.

## Green

1. Implementar a regra pura sem React, Router ou Supabase.
2. Implementar a fronteira usando somente o estado atual de `useAuth()` e o `member.email` confirmado.
3. Colocar a rota reservada antes do `Layout`, preservando o gate `Protected` e o bypass local existente sem criar bypass para Admin.
4. Refatorar somente duplicacao interna depois de todos os testes verdes.

## Oraculos de Gate 2

```bash
npm run test -- src/app/access.test.ts src/components/AdminAccessBoundary.test.tsx
npm run typecheck
npx eslint src/app/access.ts src/app/access.test.ts src/components/AdminAccessBoundary.tsx src/components/AdminAccessBoundary.test.tsx src/App.tsx --max-warnings=0
git diff --check
```

O Verify deve confirmar que o literal do e-mail aparece uma unica vez em `src`, na constante `SUPERADMIN_EMAIL`.
Nenhum teste pode autorizar por `session.user.email` ou montar o filho durante loading ou membership pendente.
