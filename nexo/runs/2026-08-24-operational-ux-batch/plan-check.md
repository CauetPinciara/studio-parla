# Plan check: operational-ux-batch

## Veredito

FAIL

O plano cobre a intencao principal dos quatro itens, mas ainda nao pode passar pelo Gate 1.
As fatias 01, 02 e 04 nao sao quick-sized, a ordem declarada permite conflitos, a migracao de tarefas contem uma operacao nao aditiva e o guard proposto para Admin fica abaixo de metadados visiveis do layout.

## Cobertura do contrato de aceitacao

| WHAT | Estado | Evidencia |
| --- | --- | --- |
| Relatorios diarios | Coberto no plano | A fatia 01 abre em hoje usando `America/Sao_Paulo`, canoniza `?data=YYYY-MM-DD`, remove todo o fluxo `Novo dia`, nao cria linha ao navegar e persiste `Tudo anotado!` em `concluido_em`. |
| Tarefas | Coberto no plano | A fatia 02 inclui Status, Data de Abertura, Data de Conclusao, Responsavel, Titulo e Descricao, com Lista e Kanban sobre a mesma consulta e as mesmas mutacoes. |
| Seletor de workspace | Coberto no plano | A fatia 03 substitui as tabs por um unico `NativeSelect` acessivel e controlado pela rota, inclusive no drawer movel. |
| Admin | Bloqueado | A regra usa `member.email` confirmado pela allowlist e o unico e-mail permitido, mas envolver apenas o elemento filho de `/admin` nao impede o `Layout` de calcular e renderizar `Administracao` antes do redirect. |

## Problemas encontrados

### Criticos

1. As fatias nao estao quick-sized como exige o flow batch.

A fatia 01 declara 13 arquivos e combina migracao, tipos, regras de calendario, API, formulario, pagina diaria, E2E e regressao visual.
A fatia 02 declara 20 arquivos e combina schema, RLS, tipos, dominio, API, formulario, duas visualizacoes, CRUD, rota, E2E e snapshots.
A fatia 04 declara 15 arquivos e combina regra de acesso, workspace, navegacao, guard, layout, sidebar, pagina, E2E e snapshots.
Cada uma contem varios ciclos Red, Green e Refactor independentes e deve ser decomposta, ou reclassificada como feature dedicada, antes da execucao.
A fatia 03 esta em tamanho compativel com quick.

2. A ordem atual nao representa os conflitos reais.

O helper atual deriva `wave 1: 01-relatorios-por-dia 02-tarefas-operacao 03-workspace-selector` e `wave 2: 04-admin-superadmin`.
Essa atribuicao nao e segura.

| Par | Arquivos compartilhados |
| --- | --- |
| 01 e 02 | `supabase/schema.sql`, `src/lib/database.types.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png` |
| 01 e 03 | `tests/e2e/shell.spec.ts`, `shell-desktop.png`, `shell-mobile.png` |
| 02 e 03 | `tests/e2e/shell.spec.ts`, `shell-desktop.png` |
| 02 e 04 | `src/app/navigation.ts`, `src/app/navigation.test.ts`, `src/App.tsx` |
| 03 e 04 | `src/components/Sidebar.tsx`, `src/components/Sidebar.test.tsx` |

Todos os caminhos declarados sao canonicos e relativos ao repositorio, mas todas as listas `files_modified` usam YAML em bloco.
O `waves.sh` instalado le apenas valores na mesma linha de `files_modified:` e, por isso, nao emite nenhum aviso para os conflitos acima.
As listas precisam ser convertidas ao formato inline aceito pelo helper, ou o helper precisa ganhar suporte ao formato em bloco antes de derivar waves.
Somente editar `depends_on` sem corrigir essa leitura ainda deixa a verificacao de seguranca paralela cega.

Ha tambem uma colisao de recurso fora de `files_modified`.
Todas as fatias executam Playwright e `playwright.config.ts` fixa o servidor em `127.0.0.1:4173` com `reuseExistingServer: false`.
Duas verificacoes E2E concorrentes em worktrees diferentes disputariam a mesma porta.
Enquanto a configuracao nao oferecer portas isoladas por worktree, deve existir no maximo uma fatia com E2E por wave.

### Altos

3. A migracao de tarefas nao e totalmente aditiva.

A fatia 02 prescreve `drop policy if exists "membros full" on tarefas;` antes de recriar a policy.
Mesmo aplicada a uma tabela nova, essa instrucao e destrutiva e viola o requisito de migracao aditiva.
Como a migration roda uma vez, ela deve criar a policy sem `drop`, ou usar um bloco condicional que apenas a crie quando ausente.
As duas fatias proíbem corretamente `supabase db push`, SQL Editor, `psql` remoto, deploy e promocao durante Execute e Verify.
Esse bloqueio remoto deve permanecer.

4. O guard de Admin nao protege toda a superficie visivel da rota.

Hoje `App.tsx` coloca todas as rotas sob `<Route element={<Layout />}>`, e `Layout.tsx` resolve o titulo por `getNavigationItem(location.pathname)` antes de renderizar o `Outlet`.
O plano 04 manda envolver somente o elemento de `/admin` com `AdminRoute`.
Um membro comum ou uma identidade ainda nao verificada pode, portanto, renderizar o cabecalho `Administracao` enquanto o filho redireciona.
O plano deve mover a decisao de acesso para um nivel anterior a qualquer metadado Admin, ou tornar o layout inteiro consciente da lista autorizada sem renderizar titulo, workspace, item ou conteudo Admin antes de `membershipChecked` e da verificacao de `member.email`.
O seletor filtrado tambem precisa definir o comportamento quando a rota atual pertence a um workspace ausente de `visibleWorkspaces`, para nunca receber um `value` sem `<option>` correspondente.
Os testes devem observar a primeira renderizacao de `/admin` para identidade pendente e membro comum e exigir ausencia de `Administracao`, `Admin`, `Area administrativa` e qualquer item associado antes e depois do redirect.

### Medios

5. Os testes de contrato SQL e de tipos dependem de texto-fonte fragil.

`schema-contract.test.ts` na fatia 01 e a parte SQL de `database-contract.test.ts` na fatia 02 leem arquivos de producao como strings e procuram trechos ou palavras exatas.
Esses testes podem falhar por formatacao ou comentario sem mudanca de comportamento e podem passar sobre SQL sintaticamente invalido.
Substitua as assercoes de texto por fixtures TypeScript compiladas para Row, Insert e Update e, quando houver infraestrutura local, aplique schema e migrations em Postgres efemero nao vinculado para inspecionar colunas, constraints e policies.
Se o banco local nao estiver disponivel, mantenha a additividade como verificacao objetiva do diff pelo Verify separado, sem fingir que busca textual e teste comportamental.
Os testes puros de calendario, dominio, API, componentes e E2E continuam bons oraculos Red e devem permanecer bloqueados.

6. A edicao de `README.md` nao pertence ao WHAT aprovado.

O handoff da migration de tarefas ja pertence ao registro do run e ao relatorio de entrega.
Remova `README.md` de `files_modified`, dos passos, do grep e do commit da fatia 02.
Nao ha pedido para ampliar documentacao publica do produto neste batch.

## Mudancas obrigatorias nos planos

1. Decompor 01 em persistencia de conclusao, regras de data e integracao da pagina diaria.
2. Decompor 02 em persistencia, dominio e API, pagina com Lista e Kanban, e integracao de rota e E2E.
3. Decompor 04 em uma fundacao de autorizacao testavel e uma integracao segura de rota, seletor, layout e pagina, sem deixar nenhum estado intermediario expor Admin a outros membros.
4. Preservar Red antes de Green em cada nova fatia e nomear somente oraculos comportamentais ou de compilacao.
5. Remover o `drop policy`, manter as duas migrations versionadas e nao executar nenhuma migration remota neste run.
6. Remover toda mudanca de README.
7. Corrigir o formato consumido de `files_modified`, declarar os novos `depends_on` e executar novamente `waves.sh` ate nao haver conflito intrawave oculto.
8. Fechar no plano de Admin o guard acima dos metadados e o fallback do seletor filtrado, sempre usando apenas `member.email` confirmado pela allowlist e `SUPERADMIN_EMAIL = "cauetpinciara@gmail.com"`.

## Waves recomendadas

Se os quatro arquivos atuais forem apenas reduzidos e mantidos como unidades, a ordem segura minima e totalmente serial:

| Wave | Fatia | Dependencia exigida |
| --- | --- | --- |
| 1 | `01-relatorios-por-dia` | nenhuma |
| 2 | `02-tarefas-operacao` | `01-relatorios-por-dia` |
| 3 | `03-workspace-selector` | `02-tarefas-operacao` |
| 4 | `04-admin-superadmin` | `03-workspace-selector` |

Essa ordem faz o segundo escritor absorver as mudancas compartilhadas de schema, tipos, shell, navegacao e sidebar, e evita a disputa da porta E2E.

Depois da decomposicao recomendada, funcoes puras e testes unitarios sem arquivos compartilhados podem executar em paralelo.
As mudancas de `supabase/schema.sql` e `src/lib/database.types.ts` devem permanecer seriais, os escritores de `shell.spec.ts` e de seus baselines devem permanecer seriais, e cada wave deve conter no maximo uma fatia Playwright enquanto a porta 4173 for fixa.
Admin deve continuar depois da integracao final do seletor e da navegacao de Tarefas.

## Condicao para novo check

O novo plan-check pode passar quando todas as fatias forem quick-sized e test-first, `waves.sh` enxergar os caminhos, cada overlap tiver ordem declarada, as migrations forem somente aditivas e locais ao repositorio, o README sair do escopo e nenhum estado de `/admin` revelar a area para outra identidade.
