---
id: 01-report-date-rules
milestone: m1
status: done
depends_on: []
files_modified: [src/features/relatorios/date-navigation.ts, src/features/relatorios/date-navigation.test.ts]
acceptance: "Dado um instante qualquer, uma data candidata e um deslocamento em dias, as regras de relatório retornam hoje em America/Sao_Paulo, aceitam somente datas ISO reais e avançam ou recuam datas sem erro de fuso, mês, ano ou ano bissexto."
goal: "Criar regras puras e testadas para a data selecionada do relatório diário."
must_not_break:
  - "Nenhuma regra existente de peças ou formatação global de datas."
  - "O resultado sempre usa o formato YYYY-MM-DD."
rules:
  - "Sem React, DOM, Supabase, dependência nova ou efeito colateral."
  - "Usar America/Sao_Paulo para hoje e componentes UTC para a aritmética de calendário."
verifier_focus: "Exercitar meia-noite de Vitória, valores inválidos, viradas de mês e ano e ano bissexto, sem aceitar conversão implícita de datas impossíveis."
---

# Regras de data do relatório

## Escopo

Criar `date-navigation.ts` com esta interface:

```ts
export const REPORT_TIME_ZONE = "America/Sao_Paulo" as const;
export function reportTodayIso(now?: Date): string;
export function normalizeReportDate(candidate: string | null, today?: string): string;
export function shiftReportDate(date: string, days: number): string;
```

`reportTodayIso` usa `Intl.DateTimeFormat().formatToParts()` no fuso declarado.
`normalizeReportDate` aceita somente `YYYY-MM-DD` gregoriano real e retorna o `today` injetado para parâmetro ausente, formato incompleto ou data impossível.
`shiftReportDate` soma dias com `Date.UTC` e getters UTC.

Não alterar URL, página, API, banco, formulário ou utilitários globais nesta fatia.

## Red, Green e Refactor

### Red

1. Criar `date-navigation.test.ts` primeiro.
2. Exigir que `2026-08-05T01:30:00.000Z` produza `2026-08-04` em Vitória.
3. Exigir fallback para `null`, `2026-2-4` e `2026-02-30`, mas aceitar `2024-02-29`.
4. Exigir `2026-03-01` menos um dia igual a `2026-02-28`, `2024-02-28` mais um dia igual a `2024-02-29` e `2026-12-31` mais um dia igual a `2027-01-01`.
5. Rodar o oráculo e confirmar FAIL porque o módulo ainda não existe.

### Green

1. Implementar somente as três funções puras e a constante.
2. Validar a reconstrução de ano, mês e dia em vez de confiar no rollover silencioso de `Date`.
3. Rodar o oráculo até PASS.

### Refactor

1. Remover duplicação interna sem ampliar a API.
2. Rodar teste e lint novamente.

## Oráculos de Gate 2

```bash
npm run test -- src/features/relatorios/date-navigation.test.ts
npx eslint src/features/relatorios/date-navigation.ts src/features/relatorios/date-navigation.test.ts --max-warnings=0
```

O teste é bloqueado e não pode ser apagado, pulado ou afrouxado.
O commit sugerido é `feat: definir regras de data dos relatórios`.
