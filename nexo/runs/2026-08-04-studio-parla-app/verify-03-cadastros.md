# Verify 03 - Cadastros

Status: PASS

Branch verificada: `feat/03-cadastros`.

## Evidências

- `npm run test -- src/lib/format.test.ts` terminou com exit code 0: 1 arquivo e 1 teste passaram.
- `npm run lint` terminou com exit code 0 e zero warnings permitidos.
- `npm run build` terminou com exit code 0.

## Contrato inspecionado

- As seis features exigidas possuem `api.ts`: contatos, turmas, matriculas, avulsas, workshops e inscricoes.
- Cada `api.ts` oferece operações de listar, criar, atualizar e excluir com entradas tipadas por `Insert` e `Update`.
- Todas as operações propagam falhas do Supabase por `ensureNoError`.
- As páginas de contatos, turmas, matriculas e workshops exibem estados de loading e error para suas queries.
- As mutations de criação, atualização e exclusão tratam erros com `onError` e invalidam as query keys correspondentes após sucesso.
- Avulsas e inscricoes são integradas, respectivamente, às páginas de matriculas e workshops com o mesmo tratamento.

## Observação

O build emitiu apenas o aviso não bloqueante de chunk maior que 500 kB.
A inspeção foi limitada à presença dos módulos de API e ao tratamento de erros, conforme solicitado.
