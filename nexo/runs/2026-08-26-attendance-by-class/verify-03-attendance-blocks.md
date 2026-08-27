# Verify 03 - Attendance blocks

## Veredito

PASS.

A slice `03-attendance-blocks` satisfaz o contrato funcional, visual, de acessibilidade e de isolamento definido no plano.
Nenhum finding bloqueante ou não bloqueante foi encontrado.

## Escopo verificado

- Worktree: `/Users/cauetpinciara/Documents/studio-parla/sistema/.worktrees/2026-08-26-attendance-by-class/03-attendance-blocks`.

- HEAD esperado e observado: `a820655cdfb054c463ed7d6f0b789db3e0e5a571`.

- Merge base com `main`: `e320532cc40ee6d976ce31f830f95137941ed545`.

- O diff contém exatamente os 13 caminhos declarados no plano: sete arquivos textuais e seis PNGs.

- O worktree estava limpo antes e depois do oráculo.

- Os arquivos protegidos de manifests, domínio, persistência, tipos, schema, migration, teste SQL e configuração de mutation testing permaneceram intactos.

## Oráculo combinado bloqueado

O comando combinado definido pelo solicitante foi executado exatamente uma vez, sem watch, na ordem prescrita, e terminou com exit code 0.

- Playwright: 11 de 11 testes passaram em Chromium com um worker, incluindo os quatro oráculos de presença e as regressões de relatório e shell.

- Vitest: quatro arquivos e 41 testes passaram.

- TypeScript: `tsc -b --pretty false` passou.

- ESLint focado: passou com zero warnings.

- `git diff --check`: passou nos arquivos textuais da slice.

- `git diff --exit-code` protegido: passou sem alteração em qualquer interface ou artefato protegido.

## Verificação adversarial

- Conclusão com pessoa pendente: `Tudo anotado!` permanece desabilitado até todas as quatro pessoas esperadas terem status.

- Reabertura de dia concluído: o dia concluído reabre mesmo com pessoa atual pendente e, após a reabertura, volta a bloquear nova conclusão.

- Navegação vazia: a navegação para uma data sem aulas mostra o Empty oficial e não cria aula nem presença.

- Falha de upsert: o erro `Falha ao registrar presença` não pressiona o status, não cria presença e não habilita a conclusão.

- Reload: os quatro status e a conclusão persistem após recarregar a página.

- Teclado: o oráculo opera o ToggleGroup Radix por foco e `Space`, e todos os grupos usam o mesmo primitive `type="single"` com dois itens e nome acessível único.

- Histórico: turma ou contato órfão conserva snapshots, Badge de origem, Badge `Histórico`, status pressionado e controles nativamente desabilitados.

- Origem: `Matrícula`, `Avulsa` e `Histórico` aparecem como texto, portanto a informação não depende somente de cor.

- Persistência e feedback: a primeira escrita de presença ocorre ao marcar um status, a query da data das variáveis é invalidada e Sonner informa sucesso ou erro.

- Estado otimista: não existe `setQueryData` nem outra atualização otimista; a seleção só muda depois da persistência e da recarga da query.

- Navegação sem POST: os cenários bloqueados de navegação passaram sem writes de presença e sem criação de dias vazios.

## Arquitetura e interfaces

- `AttendanceBlocksProps` preserva exatamente `day`, `pending` e `onMark` com os tipos fechados pelo plano.

- `AttendanceBlocks` contém somente composição visual e transformação do callback, sem query, mutation, Supabase, Sonner ou alteração direta de `AttendanceDay`.

- `RelatoriosPage` concentra a única mutation de presença, invalida `attendanceDayQueryKey(variables.data)` e trata loading, erro e pending.

- `RelatorioDayHeader` delega prontidão exclusivamente a `isAttendanceDayReady` e não duplica roster, contagens ou inspeção de status.

- A ordem das turmas e a deduplicação continuam sob responsabilidade do domínio consumido.

- Card, Badge, Empty e ToggleGroup são importados dos componentes shadcn do projeto.

- Os novos Toggle e ToggleGroup usam os primitives oficiais de `radix-ui`, `toggleVariants` e `cn`.

- A estrutura central do header, o grupo `Navegação da data`, o retorno condicional a hoje e a conclusão na borda direita permanecem intactos.

## Revisão visual dos seis PNGs

Os seis PNGs modificados foram inspecionados em resolução original.

- `relatorios-attendance-desktop.png`, 1440 por 1000: header centralizado sem colisão, Cards antes do resumo, horários e contagens legíveis, linhas alinhadas, grupos compactos, estado selecionado perceptível por check e estilo, e conteúdo dentro do main.

- `relatorios-attendance-mobile.png`, 390 por 844: header em uma linha, Cards completos, nomes e Badges com espaço para quebra natural, ToggleGroups inteiros em largura total, resumo abaixo da presença e nenhum clipping horizontal.

- `shell-desktop.png`, 1440 por 1000: Empty centralizado e equilibrado, resumo e tabelas alinhados, sem overflow.

- `shell-mobile.png`, 390 por 844: Empty equilibrado, resumo e ação responsivos, sem corte lateral.

- `shell-report-calendar-open.png`, 1440 por 1000: popover do calendário cabe no viewport, não colide com o header e preserva a hierarquia da página.

- `shell-workspace-select-open.png`, 1440 por 1000: seletor cabe na sidebar, sem clipping ou colisão, e o restante da página preserva alinhamento.

## Higiene final

- A porta TCP 4173 está livre.

- Nenhum servidor, navegador, runner ou watcher iniciado por este Verify permaneceu ativo.

- Nenhum processo encontrado na auditoria final estava associado ao worktree da slice.

## Timestamps

- Início: `2026-08-26T23:44:30Z`.

- Conclusão da verificação: `2026-08-26T23:47:43Z`.
