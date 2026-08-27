---
id: 03-attendance-blocks
milestone: m1
status: done
depends_on: [01-report-header-refinement, 02-attendance-domain]
files_modified: [src/components/ui/empty.tsx, src/components/ui/toggle.tsx, src/components/ui/toggle-group.tsx, src/features/relatorios/AttendanceBlocks.tsx, src/features/relatorios/RelatoriosPage.tsx, src/features/relatorios/RelatorioDayHeader.tsx, tests/e2e/relatorios.spec.ts, tests/e2e/__screenshots__/relatorios.spec.ts/relatorios-attendance-desktop.png, tests/e2e/__screenshots__/relatorios.spec.ts/relatorios-attendance-mobile.png, tests/e2e/__screenshots__/shell.spec.ts/shell-desktop.png, tests/e2e/__screenshots__/shell.spec.ts/shell-mobile.png, tests/e2e/__screenshots__/shell.spec.ts/shell-report-calendar-open.png, tests/e2e/__screenshots__/shell.spec.ts/shell-workspace-select-open.png]
acceptance: >-
  Dada uma data com duas turmas esperadas, quando Catarina abre o relatório, então vê antes do resumo dois Cards shadcn ordenados por horário, cada pessoa automática com Badge de origem e ToggleGroup Radix single Presente ou Faltou; ao marcar, a escolha persiste via aulas e presencas, atualiza após reload e produz feedback Sonner, enquanto falhas não fingem sucesso; Tudo anotado! fica indisponível até todas as pessoas esperadas terem status, continua permitindo reabrir um dia concluído e mantém o comportamento atual quando não há pessoas; uma data sem turma mostra o Empty oficial; os E2E com Supabase mock e os baselines desktop e mobile passam sem overflow.
goal: "Integrar a presença automática por turma ao relatório diário com marcação persistente, feedback e conclusão segura."
must_not_break:
  - "O cabeçalho da slice 01 continua sem Dia selecionado, mantém Navegação da data centralizada, usa a formatação aprovada, mostra Ir para hoje apenas fora de hoje e deixa Tudo anotado! na borda direita."
  - "Resumo do dia, edição de relatório, registro de peças, transição de peças para pronta, navegação por URL, calendário e reload continuam funcionando."
  - "A derivação de turmas, deduplicação, ordenação, histórico órfão e prontidão permanecem centralizadas nos módulos da slice 02."
  - "Nenhuma navegação cria aula ou presença; a primeira escrita continua ocorrendo somente ao marcar Presente ou Faltou."
  - "Schema, migration, tipos de banco e módulos de domínio e persistência da slice 02 não são alterados nem aplicados ao Supabase remoto."
rules:
  - "Adicionar ToggleGroup, sua dependência Toggle e Empty somente com npx shadcn@latest add toggle-group empty, depois revisar integralmente os três arquivos gerados e seus imports."
  - "Usar a base Radix instalada, portanto ToggleGroup recebe type=single, value string e onValueChange string; ignorar o valor vazio para impedir que clicar novamente apague uma presença salva."
  - "Usar Card, Badge, Empty e ToggleGroup oficiais, ícones Lucide, tokens semânticos e composição com gap; não criar controles, badges ou empty states manuais."
  - "Não duplicar na UI regras de roster ou de conclusão; consumir AttendanceDay e isAttendanceDayReady da slice 02."
  - "Invalidar attendanceDayQueryKey das variáveis da mutation após sucesso e usar Sonner para sucesso e erro, sem estado otimista que possa exibir uma gravação rejeitada."
  - "Controles de histórico com turmaId ou contatoId nulo permanecem visíveis com o status salvo, identificados como Histórico e desabilitados para escrita."
  - "Executar Playwright uma vez por comando com project chromium e workers 1, nunca em watch, e encerrar qualquer processo do teste que sobreviva ao comando."
verifier_focus: >-
  Tentar concluir com uma pessoa sem status, reabrir um dia concluído, navegar por uma data vazia sem causar escrita, falhar a upsert de presencas, recarregar depois de uma marcação, operar todos os ToggleGroups por teclado e procurar overflow ou regressão visual nos seis baselines afetados.
---

# Blocos de presença por turma

> **Para o executor Nexo:** usar TDD nesta slice, manter o E2E nomeado como oráculo bloqueado e executar somente depois das slices 01 e 02 estarem verdes e integradas.

**Goal:** Mostrar e persistir a chamada de cada turma no relatório diário antes do resumo, usando os módulos de domínio já verificados.

**Architecture:** `RelatoriosPage` consulta o `AttendanceDay`, coordena uma única mutation de presença e entrega um callback tipado para o módulo visual `AttendanceBlocks`.
`AttendanceBlocks` fica responsável apenas pela composição acessível de Cards, linhas, Badges, Empty e ToggleGroups.
`RelatorioDayHeader` consulta a mesma query key e delega toda a decisão de prontidão a `isAttendanceDayReady`, o que mantém roster e conclusão fora da camada visual.

**Tech Stack:** React 19, TypeScript 6, TanStack Query 5, Vite, shadcn/ui New York sobre Radix, Lucide, Sonner e Playwright com Supabase REST mockado.

**Spec:** `docs/superpowers/specs/2026-08-26-attendance-by-class-design.md` e `nexo/plans/2026-08-26-attendance-by-class/00-OVERVIEW.md`.

## Pré-condições e interfaces consumidas

Esta slice começa somente depois de `01-report-header-refinement` e `02-attendance-domain` verdes e integradas.
Se algum caminho, nome, literal ou nulabilidade abaixo divergir da implementação integrada, o plano-set deve ser corrigido antes da execução desta slice.

A slice 01 entrega `formatReportHeaderDate(date: string): string` em `src/features/relatorios/date-navigation.ts` e uma `RelatorioDayHeader` com estas invariantes:

- O grupo central tem `role="group"` e `aria-label="Navegação da data"`.
- O texto `Dia selecionado` não existe.
- O botão `Ir para hoje` existe somente quando `selectedDate !== today`.
- O botão `Tudo anotado!` continua na borda direita, mantém `aria-pressed` e conserva a mutation atual de conclusão.

A slice 02 entrega exatamente estas interfaces em `src/features/relatorios/attendance-domain.ts`:

```ts
import type { Row } from "@/lib/database.types";

export type AttendanceStatus = "presente" | "faltou";
export type AttendanceOrigin = "matricula" | "avulsa";

export interface AttendancePerson {
  key: string;
  presencaId: string | null;
  contatoId: string | null;
  nome: string;
  origem: AttendanceOrigin;
  matriculaId: string | null;
  avulsaId: string | null;
  status: AttendanceStatus | null;
}

export interface AttendanceClass {
  key: string;
  aulaId: string | null;
  turmaId: string | null;
  turmaNome: string;
  hora: string | null;
  pessoas: AttendancePerson[];
}

export interface AttendanceDay {
  data: string;
  turmas: AttendanceClass[];
}

export interface AttendanceDayInput {
  data: string;
  turmas: Row<"turmas">[];
  matriculas: Row<"matriculas">[];
  avulsas: Row<"avulsas">[];
  contatos: Row<"contatos">[];
  aulas: Row<"aulas">[];
  presencas: Row<"presencas">[];
}

export function deriveAttendanceDay(input: AttendanceDayInput): AttendanceDay;
export function isAttendanceDayReady(day: AttendanceDay): boolean;
```

`isAttendanceDayReady` retorna `true` quando não há pessoas e exige `status !== null` para todas as pessoas quando há roster.
Essa função é a única autoridade de completion gating desta slice.

A slice 02 entrega exatamente estas interfaces em `src/features/relatorios/attendance-api.ts`:

```ts
import type { Row } from "@/lib/database.types";
import type {
  AttendanceDay,
  AttendanceOrigin,
  AttendanceStatus,
} from "@/features/relatorios/attendance-domain";

export interface UpsertAulaInput {
  data: string;
  turmaId: string;
  turmaNome: string;
}

export interface UpsertAttendanceInput extends UpsertAulaInput {
  contatoId: string;
  contatoNome: string;
  status: AttendanceStatus;
  origem: AttendanceOrigin;
  matriculaId: string | null;
  avulsaId: string | null;
}

export const attendanceDayQueryKey = (data: string) =>
  ["attendance-day", data] as const;

export async function loadAttendanceDay(data: string): Promise<AttendanceDay>;
export async function upsertAula(input: UpsertAulaInput): Promise<Row<"aulas">>;
export async function upsertAttendance(
  input: UpsertAttendanceInput,
): Promise<Row<"presencas">>;
```

`loadAttendanceDay` faz GETs simples de `turmas`, matrículas Ativa ou Nova, avulsas Confirmada da data, aulas da data, contatos referenciados e presenças das aulas encontradas.
`upsertAttendance` cria ou reutiliza a aula por `data,turma_id` e então faz upsert da presença por `aula_id,contato_id`.
Navegação e leitura não fazem POST nem PATCH.

Os rows usados pelo mock E2E são exatamente:

```ts
type AulaRow = {
  id: string;
  data: string;
  turma_id: string | null;
  turma_nome: string;
  created_at: string;
  updated_at: string;
};

type PresencaRow = {
  id: string;
  aula_id: string;
  contato_id: string | null;
  contato_nome: string;
  status: AttendanceStatus;
  origem: AttendanceOrigin;
  matricula_id: string | null;
  avulsa_id: string | null;
  created_at: string;
  updated_at: string;
};
```

Esta slice consome sem modificar `attendance-domain.ts`, `attendance-api.ts`, seus testes, `src/lib/database.types.ts`, `supabase/schema.sql`, `supabase/migrations/20260826220000_add_aulas_presencas.sql` e `supabase/tests/attendance-schema.sql`.

## Interface do novo módulo visual

Criar `src/features/relatorios/AttendanceBlocks.tsx` com a seguinte interface pública e nenhuma consulta ou mutation interna:

```ts
export interface AttendanceBlocksProps {
  day: AttendanceDay;
  pending: boolean;
  onMark: (input: UpsertAttendanceInput) => void;
}

export function AttendanceBlocks({
  day,
  pending,
  onMark,
}: AttendanceBlocksProps): React.ReactElement;
```

Essa interface mantém as regras de rede em `RelatoriosPage` e permite que o módulo visual esconda do caller a transformação de turma e pessoa em `UpsertAttendanceInput`.
O callback só é chamado quando `turma.turmaId` e `pessoa.contatoId` são strings.
O módulo nunca inventa id para histórico órfão e nunca altera diretamente o objeto `AttendanceDay`.

## Composição visual fechada

Renderizar uma `<section aria-labelledby="attendance-heading">` antes do Card `Resumo do dia`.
O heading de nível 2 tem `id="attendance-heading"` e texto exato `Presenças`.

Quando `day.turmas.length === 0`, renderizar o Empty oficial com esta composição e estes textos:

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <CalendarX2 />
    </EmptyMedia>
    <EmptyTitle>Nenhuma aula esperada</EmptyTitle>
    <EmptyDescription>
      Não há turmas recorrentes nem aulas avulsas confirmadas para esta data.
    </EmptyDescription>
  </EmptyHeader>
</Empty>
```

Não esconder a seção nem substituir o Empty por Card, parágrafo solto ou markup manual.

Quando houver turmas, preservar exatamente a ordem recebida de `AttendanceDay.turmas`, pois o domínio já ordena por horário.
Cada turma usa `Card`, `CardHeader`, `CardTitle`, `CardDescription` e `CardContent`.
O Card recebe `role="region"` e `aria-labelledby` apontando para o `id` estável do `CardTitle`, derivado de `turma.key` sem usar índice visual.
O título mostra `turma.turmaNome`.
O `CardDescription` mostra o horário normalizado para `15h00` a partir de `15:00` ou `15:00:00`, seguido por `1 pessoa esperada` ou `<n> pessoas esperadas`.
Quando `hora` for nula, o texto de horário é `Horário não informado`.

Cada `AttendancePerson` vira um `<li key={pessoa.key}>` dentro de uma lista semântica.
A linha mostra o nome snapshot, um `Badge` com `Matrícula` para `origem === "matricula"` ou `Avulsa` para `origem === "avulsa"`, e o ToggleGroup.
Use `variant="secondary"` para Matrícula e `variant="outline"` para Avulsa.
Quando a turma ou o contato estiver órfão, mostrar também `<Badge variant="outline">Histórico</Badge>` e manter o status salvo visível em modo desabilitado.

Cada controle usa esta forma Radix:

```tsx
<ToggleGroup
  type="single"
  variant="outline"
  value={pessoa.status ?? ""}
  aria-label={`Presença de ${pessoa.nome} em ${turma.turmaNome}`}
  disabled={pending || turma.turmaId === null || pessoa.contatoId === null}
  onValueChange={(nextStatus) => {
    if (nextStatus !== "presente" && nextStatus !== "faltou") return;
    if (turma.turmaId === null || pessoa.contatoId === null) return;

    onMark({
      data: day.data,
      turmaId: turma.turmaId,
      turmaNome: turma.turmaNome,
      contatoId: pessoa.contatoId,
      contatoNome: pessoa.nome,
      status: nextStatus,
      origem: pessoa.origem,
      matriculaId: pessoa.matriculaId,
      avulsaId: pessoa.avulsaId,
    });
  }}
>
  <ToggleGroupItem value="presente">Presente</ToggleGroupItem>
  <ToggleGroupItem value="faltou">Faltou</ToggleGroupItem>
</ToggleGroup>
```

Ignorar `nextStatus === ""` é obrigatório porque o Radix single permite desmarcar o item ativo por padrão, mas o domínio persistido não possui status nulo nem operação de apagar nesta slice.
Em mobile, o ToggleGroup ocupa a largura da linha e cada item divide o espaço disponível.
Em `sm` ou maior, nome e Badges ficam à esquerda e o grupo volta à largura do conteúdo à direita.
Use somente classes de layout e tokens semânticos, `flex` ou `grid` com `gap`, e nunca `space-x-*`, `space-y-*`, cor crua, controle nativo ou botão que imite toggle.

## Consulta, persistência e feedback

Em `RelatoriosPage`, adicionar:

```ts
const attendanceDay = useQuery({
  queryKey: attendanceDayQueryKey(selectedDate),
  queryFn: () => loadAttendanceDay(selectedDate),
});

const attendance = useMutation({
  mutationFn: upsertAttendance,
  onSuccess: (_saved, variables) => {
    void client.invalidateQueries({
      queryKey: attendanceDayQueryKey(variables.data),
    });
    toast.success(
      variables.status === "presente"
        ? "Presença registrada"
        : "Falta registrada",
    );
  },
  onError: (error: Error) => toast.error(error.message),
});
```

Invalidar pela `variables.data`, e não pelo `selectedDate` capturado, evita deixar cache antigo se a usuária navegar enquanto a request está em andamento.
Não atualizar o cache de forma otimista.
Enquanto `attendance.isPending`, passar `pending={true}` para todos os ToggleGroups para serializar a interação e impedir requests concorrentes sobre a mesma aula.

Incluir `attendanceDay.isLoading` no estado `LoadingState` da página.
Incluir `attendanceDay.error` na prioridade do `ErrorState` da página.
Renderizar `<AttendanceBlocks day={attendanceDay.data!} pending={attendance.isPending} onMark={attendance.mutate} />` imediatamente antes de `Resumo do dia`.

## Completion gating no cabeçalho

Em `RelatorioDayHeader`, manter integralmente a estrutura central e os textos da slice 01.
Adicionar a query da data selecionada com `attendanceDayQueryKey(selectedDate)` e `loadAttendanceDay(selectedDate)`.
Calcular:

```ts
const attendanceReady = attendanceDay.data
  ? isAttendanceDayReady(attendanceDay.data)
  : false;

const completionDisabled =
  relatorios.isLoading ||
  completion.isPending ||
  (!isCompleted && !attendanceReady);
```

Usar `disabled={completionDisabled}` no botão `Tudo anotado!`.
Um dia aberto não pode ser concluído enquanto a query carrega, falha ou retorna qualquer pessoa sem status.
Um dia concluído continua reabrível mesmo se a query de presença estiver carregando ou falhar, porque `!isCompleted` é falso.
Uma data carregada sem pessoas continua concluível porque `isAttendanceDayReady` retorna `true`.
Não reproduzir contagens ou inspeções de `status` dentro do cabeçalho.
Após cada presença bem-sucedida, a invalidação da mesma query key deve atualizar o botão sem reload.

## Mock Supabase do E2E

Ampliar o helper local `installStudioApi` em `tests/e2e/relatorios.spec.ts` sem extrair um segundo servidor ou compartilhar estado com outros specs.
O seed passa a aceitar arrays tipados de `contatos`, `turmas`, `matriculas`, `avulsas`, `aulas` e `presencas`, além de `relatorios` e `pecas` já existentes.
Os defaults dos testes atuais devem continuar equivalentes aos dados que eles já enxergam.

Ampliar `RestWrite.table` para `"relatorios" | "pecas" | "aulas" | "presencas"`.
Continuar registrando método, id, body e adicionar os campos de conflito relevantes quando presentes na URL para provar os upserts corretos.

O mock de GET deve devolver a coleção da tabela pedida e respeitar pelo menos estes filtros usados pela slice 02:

- `matriculas.status=in.(Ativa,Nova)`.
- `avulsas.data=eq.<data>` e `avulsas.status=eq.Confirmada`.
- `aulas.data=eq.<data>`.
- `contatos.id=in.(...)`.
- `presencas.aula_id=in.(...)`.

O mock de POST em `aulas` deve reutilizar ou criar a row por `data,turma_id`, preservar `turma_nome` e responder no formato esperado pela leitura posterior.
O mock de POST em `presencas` deve reutilizar ou criar a row por `aula_id,contato_id`, preservar snapshots, origem e ids de fonte, e atualizar `status` e `updated_at`.
O objeto de estado retornado pelo helper deve permitir `failNextAttendance = true`.
Quando essa flag estiver ativa, o próximo POST em `presencas` responde 500 com `{ "message": "Falha ao registrar presença" }`, não altera `state.presencas` e volta a flag para falso.

O cenário principal usa a quarta-feira `2026-08-05` com duas turmas de nomes `Modelagem livre` às `15:00` e `Torno iniciante` às `18:00`.
O roster inclui Ana por matrícula Ativa e avulsa Confirmada duplicada, Beatriz por matrícula Nova, Clara somente por avulsa Confirmada e Diego por matrícula Ativa na segunda turma.
Adicionar uma matrícula Pausada e uma avulsa A confirmar que nunca devem aparecer.
Isso bloqueia duas turmas, ordenação, filtros, deduplicação, precedência de Matrícula e os dois Badges de origem no navegador.

## Oráculos E2E bloqueados

O oráculo principal tem o nome exato:

`lista turmas automáticas, persiste presença e bloqueia a conclusão até tudo ser anotado`

Ele deve provar, na ordem:

1. A seção `Presenças` aparece antes de `Resumo do dia` e os headings dos Cards são `Modelagem livre` e `Torno iniciante` nessa ordem.
2. Os Cards mostram `15h00`, `18h00`, `3 pessoas esperadas` e `1 pessoa esperada`.
3. Ana aparece uma vez com Badge `Matrícula`, Beatriz com `Matrícula`, Clara com `Avulsa`, Diego com `Matrícula`, e os registros Pausada ou A confirmar não aparecem.
4. Cada grupo tem nome acessível `Presença de <pessoa> em <turma>`, dois botões e `aria-pressed="false"` antes da marcação.
5. `Tudo anotado!` começa desabilitado.
6. Com `failNextAttendance = true`, marcar Clara como Faltou mostra o toast `Falha ao registrar presença`, não deixa Faltou pressionado e não habilita conclusão.
7. Marcar Ana, Beatriz e Diego como Presente e Clara como Faltou grava primeiro aula e depois presença com os snapshots, origens e ids de fonte exatos.
8. Cada sucesso mostra `Presença registrada` ou `Falta registrada`, a query é recarregada e o status correspondente passa a ter `aria-pressed="true"`.
9. Depois da quarta pessoa, `Tudo anotado!` fica habilitado, conclui o relatório e recebe `aria-pressed="true"`.
10. Após reload, os quatro status e a conclusão continuam visíveis, e clicar `Tudo anotado!` reabre o dia mesmo com pessoas esperadas.

O segundo oráculo tem o nome exato:

`mostra Empty oficial sem escrever ao navegar por uma data sem aulas`

Ele abre uma data sem turma recorrente nem avulsa confirmada, exige `data-slot="empty"`, `Nenhuma aula esperada` e a descrição fechada, confirma que `Tudo anotado!` mantém o comportamento atual por não haver pessoas e prova que navegar não adicionou write em `aulas` ou `presencas`.

O terceiro oráculo tem o nome exato:

`mantém os blocos de presença legíveis em desktop e mobile`

Ele usa o mesmo seed determinístico de duas turmas, captura desktop em 1440 por 1000 e mobile em 390 por 844, opera um ToggleGroup por teclado e prova `document.documentElement.scrollWidth <= document.documentElement.clientWidth` nas duas larguras.
Ele gera exatamente `relatorios-attendance-desktop.png` e `relatorios-attendance-mobile.png`.

O quarto oráculo tem o nome exato:

`mantém histórico órfão e permite reabrir dia concluído com presença pendente`

Ele usa um relatório concluído, pelo menos uma pessoa atual ainda sem status e uma aula salva com `turma_id: null` cuja presença tem `contato_id: null`.
Ele exige o nome snapshot da turma e da pessoa, Badge de origem, Badge `Histórico`, o status salvo pressionado e o ToggleGroup desabilitado para escrita.
Mesmo com a pessoa atual pendente, `Tudo anotado!` começa habilitado por o dia já estar concluído, reabre o relatório ao ser acionado e fica desabilitado em seguida enquanto a pessoa continuar sem status.
O cenário confirma que nenhuma escrita em `aulas` ou `presencas` ocorreu.

## Red

1. Ampliar primeiro `installStudioApi`, seus tipos e seus seeds em `tests/e2e/relatorios.spec.ts`.
2. Escrever os quatro oráculos com todas as assertions funcionais antes de adicionar componentes shadcn ou alterar produção.
3. Rodar em modo run-once:

```bash
npm run test:e2e -- tests/e2e/relatorios.spec.ts --project=chromium --workers=1 --ignore-snapshots --grep "lista turmas automáticas, persiste presença e bloqueia a conclusão até tudo ser anotado|mostra Empty oficial sem escrever ao navegar por uma data sem aulas|mantém os blocos de presença legíveis em desktop e mobile|mantém histórico órfão e permite reabrir dia concluído com presença pendente"
```

O Red válido falha porque `Presenças`, os Cards, o Empty e os ToggleGroups ainda não existem, `Tudo anotado!` ainda aceita conclusão incompleta e não há writes de aula ou presença pela UI.
Falha de navegador, servidor, porta, TypeScript, import da slice 02 ou chamada remota não conta como Red válido.
Não reduzir dados, assertions, filtros ou o requisito de reload para obter o Red.

## Green

1. Confirmar o projeto com `npx shadcn@latest info --json` e verificar `framework: Vite`, `base: radix`, `iconLibrary: lucide`, alias `@` e ausência de `toggle-group`, `toggle` e `empty` na lista instalada.
2. Executar exatamente:

```bash
npx shadcn@latest add toggle-group empty
```

3. Revisar integralmente `src/components/ui/empty.tsx`, `src/components/ui/toggle.tsx` e `src/components/ui/toggle-group.tsx`.
4. Confirmar que `toggle-group.tsx` importa `ToggleGroup` de `radix-ui`, `toggleVariants` de `@/components/ui/toggle` e `cn` de `@/lib/utils`, que `empty.tsx` usa o alias correto e que nenhum arquivo aponta para `@/registry`.
5. Confirmar com `git diff -- package.json package-lock.json` que o CLI não alterou manifests, pois `radix-ui` já existe como dependência de produção.
6. Criar `AttendanceBlocks.tsx` conforme a interface e a composição fechadas.
7. Integrar query, mutation, invalidação e feedback em `RelatoriosPage` e colocar o módulo antes de `Resumo do dia`.
8. Integrar somente a query e `isAttendanceDayReady` em `RelatorioDayHeader`, preservando a estrutura da slice 01 e a mutation existente.
9. Repetir o comando funcional do Red com `--ignore-snapshots` e exigir PASS antes de gerar qualquer PNG.
10. Rodar os testes de domínio e API consumidos para provar que a UI não os quebrou:

```bash
npm run test -- src/features/relatorios/attendance-domain.test.ts src/features/relatorios/attendance-api.test.ts src/features/relatorios/date-navigation.test.ts src/features/relatorios/api.test.ts
```

11. Gerar os baselines somente depois dos oráculos funcionais verdes, seguindo a seção visual.

## Refactor

1. Com os oráculos verdes, concentrar formatação de horário, pluralização e construção de `UpsertAttendanceInput` dentro de `AttendanceBlocks.tsx` sem exportar helpers rasos.
2. Remover qualquer inspeção de matrícula, avulsa, status ou contagem duplicada de `RelatoriosPage` e `RelatorioDayHeader`.
3. Confirmar que não existe mutation, query, Supabase ou Sonner dentro de `AttendanceBlocks.tsx`.
4. Confirmar que clicar no item ativo não gera nova request nem apaga o status.
5. Confirmar que histórico órfão mostra snapshots e estado selecionado, mas nenhum controle habilitado para mutation.
6. Repetir os oráculos funcionais e os comandos focados de Gate 2 depois do refactor.

## Acessibilidade e interação por teclado

- O heading `Presenças` nomeia a seção, e cada Card tem região nomeada pelo título da turma.
- A lista de pessoas usa `ul` e `li`, sem tabela visual improvisada.
- Cada ToggleGroup tem nome único incluindo pessoa e turma, evitando a ambiguidade de vários botões `Presente` e `Faltou` na página.
- Radix mantém roving focus e seleção single; o E2E deve focar o grupo, usar Tab ou setas conforme o comportamento do primitive, pressionar Space ou Enter e confirmar `aria-pressed`.
- O disabled de histórico e pending é nativo do primitive e nunca depende apenas de cor.
- Badges carregam texto visível completo e não usam somente cor para origem.
- O layout móvel não exige scroll horizontal, não trunca nomes sem alternativa e mantém os dois itens do grupo alcançáveis.
- O Empty possui ícone decorativo acompanhado por título e descrição textual.
- Toasts não são a única evidência do resultado; o controle persistido também atualiza `aria-pressed` após a refetch.

## Geração e revisão visual

Depois do Green funcional, gerar os dois baselines dedicados com:

```bash
npm run test:e2e -- tests/e2e/relatorios.spec.ts --project=chromium --workers=1 --update-snapshots --grep "mantém os blocos de presença legíveis em desktop e mobile"
```

Como o Empty passa a aparecer no relatório vazio usado por `shell.spec.ts`, regenerar também os quatro baselines existentes do shell sobre a integração final:

```bash
npm run test:e2e -- tests/e2e/shell.spec.ts --project=chromium --workers=1 --update-snapshots --grep "preserva o shell visual em desktop e mobile"
```

O segundo comando atualiza somente `shell-desktop.png`, `shell-mobile.png`, `shell-report-calendar-open.png` e `shell-workspace-select-open.png`.
Nenhum outro snapshot pode mudar.

Inspecionar os seis PNGs em resolução original.
No desktop, exigir cabeçalho centrado e sem colisão, Cards antes do resumo, horários e contagens legíveis, linhas alinhadas, grupos sem largura excessiva, contraste dos estados selecionados e conteúdo dentro dos 1080 px do main.
No mobile, exigir header em uma linha, Cards sem corte, nomes e Badges com quebra natural, ToggleGroups inteiros, foco visível, Empty equilibrado, resumo abaixo da presença e nenhum overflow horizontal.
Falhar a revisão se origem ou estado depender apenas de cor, se o segundo item do ToggleGroup sair da tela, se um nome colidir com o controle, se o Empty parecer markup desconectado ou se a hierarquia visual esconder `Presenças`.

Depois da inspeção, rodar sem atualização:

```bash
npm run test:e2e -- tests/e2e/relatorios.spec.ts tests/e2e/shell.spec.ts --project=chromium --workers=1
```

O resultado esperado é PASS usando os seis baselines versionados.

## Oráculos de Gate 2

Um agente Verify separado executa em modo run-once e nesta ordem:

```bash
npm run test:e2e -- tests/e2e/relatorios.spec.ts tests/e2e/shell.spec.ts --project=chromium --workers=1
npm run test -- src/features/relatorios/attendance-domain.test.ts src/features/relatorios/attendance-api.test.ts src/features/relatorios/date-navigation.test.ts src/features/relatorios/api.test.ts
npm run typecheck
npx eslint src/components/ui/empty.tsx src/components/ui/toggle.tsx src/components/ui/toggle-group.tsx src/features/relatorios/AttendanceBlocks.tsx src/features/relatorios/RelatoriosPage.tsx src/features/relatorios/RelatorioDayHeader.tsx tests/e2e/relatorios.spec.ts --max-warnings=0
git diff --check "$(git merge-base main HEAD)" HEAD -- src/components/ui/empty.tsx src/components/ui/toggle.tsx src/components/ui/toggle-group.tsx src/features/relatorios/AttendanceBlocks.tsx src/features/relatorios/RelatoriosPage.tsx src/features/relatorios/RelatorioDayHeader.tsx tests/e2e/relatorios.spec.ts
git diff --exit-code "$(git merge-base main HEAD)" HEAD -- package.json package-lock.json src/features/relatorios/attendance-domain.ts src/features/relatorios/attendance-domain.test.ts src/features/relatorios/attendance-api.ts src/features/relatorios/attendance-api.test.ts src/lib/database.types.ts supabase/schema.sql supabase/migrations/20260826220000_add_aulas_presencas.sql supabase/tests/attendance-schema.sql stryker.config.mjs
```

O primeiro comando executa o oráculo bloqueado da slice e a regressão visual do shell, incluindo persistência, erro, reload, gating, Empty, teclado, overflow e os seis baselines pertencentes à integração.
O comando unitário bloqueia regressões nas interfaces consumidas das slices 01 e 02.
O lint focado cobre todos os arquivos textuais pertencentes à slice.
O diff protegido prova que o CLI não alterou manifests e que a UI não reabriu domínio, banco ou migration.

O Verify também inspeciona:

```bash
git diff --name-only "$(git merge-base main HEAD)" HEAD
git diff --unified=80 "$(git merge-base main HEAD)" HEAD -- src/features/relatorios/AttendanceBlocks.tsx src/features/relatorios/RelatoriosPage.tsx src/features/relatorios/RelatorioDayHeader.tsx tests/e2e/relatorios.spec.ts
lsof -nP -iTCP:4173 -sTCP:LISTEN
```

PASS exige somente os treze caminhos declarados em `files_modified`, nenhum servidor ou navegador sobrevivente, nenhum POST durante navegação, nenhum estado otimista residual, nenhuma duplicação das regras do domínio e nenhum afrouxamento dos testes existentes de relatório.
No boundary da wave integrada, o Nexo ainda executa uma única vez a suíte completa, lint completo, build e segurança conforme o contrato do projeto.
Mutation testing permanece uma única execução no boundary da feature, não nesta slice.

O commit atômico sugerido depois do Gate 2 verde é `feat: add attendance blocks to daily reports`.
