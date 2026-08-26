# Plan check: attendance by class

## PASS

O conjunto corrigido cobre todo o WHAT aprovado e pode seguir para execução.

## Achados corrigidos

- Normalizei `depends_on` e `files_modified` para arrays inline compatíveis com o parser oficial de `waves.sh`.
Antes da correção, a slice 03 era derivada incorretamente na wave 1 e os overlaps não eram lidos.
- Tornei os contratos públicos de domínio e API da slice 02 textualmente idênticos na slice 03.
- Removi a contradição entre o oráculo que procura a ausência de `Dia selecionado` e o comando de Gate 2 que rejeitava a própria assertion.
- Fechei o handoff de completion para preservar a mutation existente e alterar somente a consulta e a condição `disabled`.
- Acrescentei oráculos para presença histórica após mudança de agenda, histórico órfão visível e reabertura de dia concluído com pessoa ainda pendente.
- Incluí os módulos novos no mutation testing da fronteira da feature sem remover os alvos existentes.
- Declarei `stryker.config.mjs` no ownership da slice 02 e o protegi contra alterações na slice 03.

## Evidência final

- `waves.sh` deriva wave 1 com `01-report-header-refinement` e `02-attendance-domain`, e wave 2 com `03-attendance-blocks`.
- As slices da wave 1 têm conjuntos canônicos e completos de `files_modified` sem overlap.
- Todos os ids de `depends_on` existem e o grafo não tem ciclo.
- Os contratos TypeScript 02 para 03 são idênticos.
- O projeto é Vite, shadcn New York, base Radix, ícones Lucide e alias `@`.
- O dry run oficial de `toggle-group empty` produz somente `empty.tsx`, `toggle.tsx` e `toggle-group.tsx`.
- Os planos proíbem aplicação remota da migration e usam apenas PostgreSQL local temporário para os oráculos SQL.
- Red, Green, Refactor, oráculos bloqueados, revisão visual, Gate 2 por slice, Gate integrado por wave e mutation testing único na fronteira da feature permanecem explícitos.
