# Replan 07.1: snapshot desktop de Tarefas

## Resultado

PASS.
Foi adicionada a fatia gap-aware `07.1-workspace-selector-task-snapshot` entre `07-workspace-selector` e `08-admin-access`.
A fatia e deliberadamente snapshot-only e possui apenas `tests/e2e/__screenshots__/tarefas.spec.ts/tarefas-desktop.png`.

## Motivo e decisao

A falha deterministica da Wave 07 mostrou que o seletor de workspace altera pixels do shell compartilhado pelo screenshot desktop de Tarefas.
O teste existente `mantém Tarefas legível em desktop e mobile` ja captura desktop em 1440x900 e mobile em 390x844, entao ele e suficiente como oraculo visual bloqueado.
Nao foi incluido ownership de `tests/e2e/tarefas.spec.ts`, nem de codigo de produto.

## Aceitacao planejada

O Red roda o oraculo existente sem update depois da integracao da fatia 07 e exige que a unica causa da falha seja o baseline desktop obsoleto.
O Green registra o checksum mobile, atualiza snapshots uma unica vez, exige que somente o PNG desktop mude, confirma suas dimensoes 1440x900 e requer inspecao visual em tamanho original.
O Gate 2 repete o mesmo E2E sem update, prova que o teste e o baseline mobile nao mudaram e confirma que a porta 4173 esta livre.

## Dependencias

A cadeia verificada permanece estritamente serial:

`01 -> 02 -> 03 -> 04 -> 05 -> 06 -> 07 -> 07.1 -> 08 -> 09`

`07.1-workspace-selector-task-snapshot` depende de `07-workspace-selector`.
`08-admin-access` agora depende de `07.1-workspace-selector-task-snapshot`.
`09-admin-workspace` continua dependendo de `08-admin-access`.

## Evidencia de planejamento

- O oraculo existente contem as assercoes `tarefas-desktop.png` e `tarefas-mobile.png` no mesmo teste visual nomeado.
- O baseline desktop atual mede 1440x900.
- O baseline mobile atual mede 390x844 e teve checksum SHA-256 `d088884337324e3156ac1a06373814cbb998fa04c883180694f1018caf348fad` antes desta fatia.
- A declaracao `files_modified` da nova fatia contem somente o PNG desktop.
- `git diff --check` passou.
- A busca pelo caractere em dash nos planos alterados nao encontrou ocorrencias.

## Arquivos de planejamento alterados

- `nexo/plans/operational-ux-batch/07.1-workspace-selector-task-snapshot.md`
- `nexo/plans/operational-ux-batch/08-admin-access.md`, somente a dependencia da fatia.

Nenhum produto, teste, snapshot, migration ou banco remoto foi alterado ou executado neste replan.
