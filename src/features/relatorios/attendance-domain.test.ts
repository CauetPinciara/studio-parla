import { describe, expect, it } from "vitest";
import type { Row } from "@/lib/database.types";
import {
  deriveAttendanceDay,
  isAttendanceDayReady,
  type AttendanceDay,
  type AttendanceDayInput,
} from "@/features/relatorios/attendance-domain";

const ids = {
  turmaQuarta: "00000000-0000-0000-0000-000000000001",
  turmaQuinta: "00000000-0000-0000-0000-000000000002",
  turmaTarde: "00000000-0000-0000-0000-000000000003",
  turmaSemHora: "00000000-0000-0000-0000-000000000004",
  turmaMesmoNomeA: "00000000-0000-0000-0000-000000000005",
  turmaMesmoNomeB: "00000000-0000-0000-0000-000000000006",
  contatoAna: "00000000-0000-0000-0000-000000000101",
  contatoBia: "00000000-0000-0000-0000-000000000102",
  contatoCaio: "00000000-0000-0000-0000-000000000103",
  contatoDora: "00000000-0000-0000-0000-000000000104",
  contatoEva: "00000000-0000-0000-0000-000000000105",
  matriculaAna: "00000000-0000-0000-0000-000000000201",
  matriculaBia: "00000000-0000-0000-0000-000000000202",
  matriculaCaio: "00000000-0000-0000-0000-000000000203",
  matriculaDora: "00000000-0000-0000-0000-000000000204",
  matriculaEva: "00000000-0000-0000-0000-000000000205",
  avulsaAna: "00000000-0000-0000-0000-000000000301",
  avulsaAnaExtra: "00000000-0000-0000-0000-000000000302",
  avulsaBia: "00000000-0000-0000-0000-000000000303",
  avulsaCaio: "00000000-0000-0000-0000-000000000304",
  aulaQuarta: "00000000-0000-0000-0000-000000000401",
  aulaQuinta: "00000000-0000-0000-0000-000000000402",
  aulaHistorica: "00000000-0000-0000-0000-000000000403",
  presencaAna: "00000000-0000-0000-0000-000000000501",
  presencaBia: "00000000-0000-0000-0000-000000000502",
  presencaHistorica: "00000000-0000-0000-0000-000000000503",
} as const;

const turmaFixture = {
  id: ids.turmaQuarta,
  nome: "Quarta Cerâmica",
  dia: 3,
  hora: "15:00",
} satisfies Row<"turmas">;

const matriculaFixture = {
  id: ids.matriculaAna,
  contato_id: ids.contatoAna,
  turma_id: ids.turmaQuarta,
  mensalidade: 520,
  pagamento: "Pix",
  status: "Ativa",
  created_at: "2026-01-01T00:00:00.000Z",
} satisfies Row<"matriculas">;

const avulsaFixture = {
  id: ids.avulsaAna,
  contato_id: ids.contatoAna,
  turma_id: ids.turmaQuinta,
  data: "2026-08-26",
  status: "Confirmada",
} satisfies Row<"avulsas">;

const contatoFixture = {
  id: ids.contatoAna,
  nome: "Ana",
  tel: null,
  origem: null,
  obs: null,
  created_at: "2026-01-01T00:00:00.000Z",
} satisfies Row<"contatos">;

const aulaFixture = {
  id: ids.aulaQuarta,
  data: "2026-08-26",
  turma_id: ids.turmaQuarta,
  turma_nome: "Quarta Cerâmica",
  created_at: "2026-08-26T12:00:00.000Z",
  updated_at: "2026-08-26T12:00:00.000Z",
} satisfies Row<"aulas">;

const presencaFixture = {
  id: ids.presencaAna,
  aula_id: ids.aulaQuarta,
  contato_id: ids.contatoAna,
  contato_nome: "Ana no dia",
  status: "presente",
  origem: "matricula",
  matricula_id: ids.matriculaAna,
  avulsa_id: null,
  created_at: "2026-08-26T12:00:00.000Z",
  updated_at: "2026-08-26T12:00:00.000Z",
} satisfies Row<"presencas">;

function turma(overrides: Partial<Row<"turmas">> = {}): Row<"turmas"> {
  return { ...turmaFixture, ...overrides };
}

function matricula(
  overrides: Partial<Row<"matriculas">> = {},
): Row<"matriculas"> {
  return { ...matriculaFixture, ...overrides };
}

function avulsa(overrides: Partial<Row<"avulsas">> = {}): Row<"avulsas"> {
  return { ...avulsaFixture, ...overrides };
}

function contato(overrides: Partial<Row<"contatos">> = {}): Row<"contatos"> {
  return { ...contatoFixture, ...overrides };
}

function aula(overrides: Partial<Row<"aulas">> = {}): Row<"aulas"> {
  return { ...aulaFixture, ...overrides };
}

function presenca(
  overrides: Partial<Row<"presencas">> = {},
): Row<"presencas"> {
  return { ...presencaFixture, ...overrides };
}

function attendanceInput(
  overrides: Partial<AttendanceDayInput> = {},
): AttendanceDayInput {
  return {
    data: "2026-08-26",
    turmas: [],
    matriculas: [],
    avulsas: [],
    contatos: [],
    aulas: [],
    presencas: [],
    ...overrides,
  };
}

describe("deriveAttendanceDay", () => {
  it("creates only the recurring class that matches the selected UTC weekday", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        turmas: [
          turma(),
          turma({
            id: ids.turmaQuinta,
            nome: "Quinta Cerâmica",
            dia: 4,
            hora: "18:00",
          }),
        ],
      }),
    );

    expect(result).toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `turma:${ids.turmaQuarta}`,
          aulaId: null,
          turmaId: ids.turmaQuarta,
          turmaNome: "Quarta Cerâmica",
          hora: "15:00",
          pessoas: [],
        },
      ],
    });
  });

  it("creates a class and person from a confirmed one-off booking on the selected date", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        turmas: [
          turma({
            id: ids.turmaQuinta,
            nome: "Quinta Cerâmica",
            dia: 4,
            hora: "18:00",
          }),
        ],
        avulsas: [avulsa()],
        contatos: [contato()],
      }),
    );

    expect(result).toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `turma:${ids.turmaQuinta}`,
          aulaId: null,
          turmaId: ids.turmaQuinta,
          turmaNome: "Quinta Cerâmica",
          hora: "18:00",
          pessoas: [
            {
              key: `contato:${ids.contatoAna}`,
              presencaId: null,
              contatoId: ids.contatoAna,
              nome: "Ana",
              origem: "avulsa",
              matriculaId: null,
              avulsaId: ids.avulsaAna,
              status: null,
            },
          ],
        },
      ],
    });
  });

  it("ignores unconfirmed, other-date, and classless one-off bookings", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        turmas: [
          turma({
            id: ids.turmaQuinta,
            nome: "Quinta Cerâmica",
            dia: 4,
            hora: "18:00",
          }),
        ],
        avulsas: [
          avulsa({ status: "A confirmar" }),
          avulsa({ id: ids.avulsaBia, data: "2026-08-27" }),
          avulsa({ id: ids.avulsaCaio, turma_id: null }),
        ],
        contatos: [contato()],
      }),
    );

    expect(result).toEqual({ data: "2026-08-26", turmas: [] });
  });

  it("includes only active and new enrollments with resolvable contacts", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        turmas: [turma()],
        matriculas: [
          matricula(),
          matricula({
            id: ids.matriculaBia,
            contato_id: ids.contatoBia,
            status: "Nova",
          }),
          matricula({
            id: ids.matriculaCaio,
            contato_id: ids.contatoCaio,
            status: "Pausada",
          }),
          matricula({
            id: ids.matriculaDora,
            contato_id: ids.contatoDora,
            status: "Saiu",
          }),
          matricula({
            id: ids.matriculaEva,
            contato_id: ids.contatoEva,
            turma_id: null,
          }),
          matricula({
            id: "00000000-0000-0000-0000-000000000206",
            contato_id: "00000000-0000-0000-0000-000000000199",
          }),
        ],
        contatos: [
          contato(),
          contato({ id: ids.contatoBia, nome: "Bia" }),
          contato({ id: ids.contatoCaio, nome: "Caio" }),
          contato({ id: ids.contatoDora, nome: "Dora" }),
          contato({ id: ids.contatoEva, nome: "Eva" }),
        ],
      }),
    );

    expect(result).toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `turma:${ids.turmaQuarta}`,
          aulaId: null,
          turmaId: ids.turmaQuarta,
          turmaNome: "Quarta Cerâmica",
          hora: "15:00",
          pessoas: [
            {
              key: `contato:${ids.contatoAna}`,
              presencaId: null,
              contatoId: ids.contatoAna,
              nome: "Ana",
              origem: "matricula",
              matriculaId: ids.matriculaAna,
              avulsaId: null,
              status: null,
            },
            {
              key: `contato:${ids.contatoBia}`,
              presencaId: null,
              contatoId: ids.contatoBia,
              nome: "Bia",
              origem: "matricula",
              matriculaId: ids.matriculaBia,
              avulsaId: null,
              status: null,
            },
          ],
        },
      ],
    });
  });

  it("deduplicates contacts with enrollment precedence while merging saved status", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        turmas: [turma()],
        matriculas: [matricula()],
        avulsas: [
          avulsa({ turma_id: ids.turmaQuarta }),
          avulsa({
            id: ids.avulsaAnaExtra,
            turma_id: ids.turmaQuarta,
          }),
        ],
        contatos: [contato()],
        aulas: [aula()],
        presencas: [
          presenca({
            origem: "avulsa",
            matricula_id: null,
            avulsa_id: ids.avulsaAna,
            status: "faltou",
          }),
        ],
      }),
    );

    expect(result).toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `turma:${ids.turmaQuarta}`,
          aulaId: ids.aulaQuarta,
          turmaId: ids.turmaQuarta,
          turmaNome: "Quarta Cerâmica",
          hora: "15:00",
          pessoas: [
            {
              key: `contato:${ids.contatoAna}`,
              presencaId: ids.presencaAna,
              contatoId: ids.contatoAna,
              nome: "Ana no dia",
              origem: "matricula",
              matriculaId: ids.matriculaAna,
              avulsaId: null,
              status: "faltou",
            },
          ],
        },
      ],
    });
  });

  it("keeps saved-only attendance with its persisted name and source", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        turmas: [turma()],
        contatos: [contato({ nome: "Ana atual" })],
        aulas: [aula()],
        presencas: [
          presenca({ matricula_id: null, contato_nome: "Ana histórica" }),
        ],
      }),
    );

    expect(result).toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `turma:${ids.turmaQuarta}`,
          aulaId: ids.aulaQuarta,
          turmaId: ids.turmaQuarta,
          turmaNome: "Quarta Cerâmica",
          hora: "15:00",
          pessoas: [
            {
              key: `contato:${ids.contatoAna}`,
              presencaId: ids.presencaAna,
              contatoId: ids.contatoAna,
              nome: "Ana histórica",
              origem: "matricula",
              matriculaId: null,
              avulsaId: null,
              status: "presente",
            },
          ],
        },
      ],
    });
  });

  it("keeps orphaned class and contact attendance from snapshots", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        aulas: [
          aula({
            id: ids.aulaHistorica,
            turma_id: null,
            turma_nome: "Turma removida",
          }),
        ],
        presencas: [
          presenca({
            id: ids.presencaHistorica,
            aula_id: ids.aulaHistorica,
            contato_id: null,
            contato_nome: "Pessoa removida",
            origem: "avulsa",
            matricula_id: null,
            avulsa_id: null,
            status: "faltou",
          }),
        ],
      }),
    );

    expect(result).toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `aula:${ids.aulaHistorica}`,
          aulaId: ids.aulaHistorica,
          turmaId: null,
          turmaNome: "Turma removida",
          hora: null,
          pessoas: [
            {
              key: `presenca:${ids.presencaHistorica}`,
              presencaId: ids.presencaHistorica,
              contatoId: null,
              nome: "Pessoa removida",
              origem: "avulsa",
              matriculaId: null,
              avulsaId: null,
              status: "faltou",
            },
          ],
        },
      ],
    });
  });

  it("keeps saved attendance for a current class that is no longer expected", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        turmas: [
          turma({
            id: ids.turmaQuinta,
            nome: "Nome atual da turma",
            dia: 4,
            hora: "18:00",
          }),
        ],
        contatos: [contato({ id: ids.contatoBia, nome: "Bia atual" })],
        aulas: [
          aula({
            id: ids.aulaQuinta,
            turma_id: ids.turmaQuinta,
            turma_nome: "Nome histórico da turma",
          }),
        ],
        presencas: [
          presenca({
            id: ids.presencaBia,
            aula_id: ids.aulaQuinta,
            contato_id: ids.contatoBia,
            contato_nome: "Bia histórica",
            matricula_id: null,
          }),
        ],
      }),
    );

    expect(result).toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `turma:${ids.turmaQuinta}`,
          aulaId: ids.aulaQuinta,
          turmaId: ids.turmaQuinta,
          turmaNome: "Nome histórico da turma",
          hora: "18:00",
          pessoas: [
            {
              key: `contato:${ids.contatoBia}`,
              presencaId: ids.presencaBia,
              contatoId: ids.contatoBia,
              nome: "Bia histórica",
              origem: "matricula",
              matriculaId: null,
              avulsaId: null,
              status: "presente",
            },
          ],
        },
      ],
    });
  });

  it("does not render an empty saved class without a current expected source", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        turmas: [
          turma({
            id: ids.turmaQuinta,
            nome: "Quinta Cerâmica",
            dia: 4,
            hora: "18:00",
          }),
        ],
        aulas: [
          aula({
            id: ids.aulaQuinta,
            turma_id: ids.turmaQuinta,
            turma_nome: "Quinta Cerâmica",
          }),
        ],
      }),
    );

    expect(result).toEqual({ data: "2026-08-26", turmas: [] });
  });

  it("sorts classes by non-null time, normalized name, stable key, and null time last", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        turmas: [
          turma({
            id: ids.turmaSemHora,
            nome: "Amanhecer",
            hora: null,
          }),
          turma({
            id: ids.turmaTarde,
            nome: "Tarde",
            hora: "18:00",
          }),
          turma({
            id: ids.turmaMesmoNomeB,
            nome: "Álvaro",
            hora: "15:00",
          }),
          turma({
            id: ids.turmaMesmoNomeA,
            nome: "alvaro",
            hora: "15:00",
          }),
        ],
      }),
    );

    expect(result).toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `turma:${ids.turmaMesmoNomeA}`,
          aulaId: null,
          turmaId: ids.turmaMesmoNomeA,
          turmaNome: "alvaro",
          hora: "15:00",
          pessoas: [],
        },
        {
          key: `turma:${ids.turmaMesmoNomeB}`,
          aulaId: null,
          turmaId: ids.turmaMesmoNomeB,
          turmaNome: "Álvaro",
          hora: "15:00",
          pessoas: [],
        },
        {
          key: `turma:${ids.turmaTarde}`,
          aulaId: null,
          turmaId: ids.turmaTarde,
          turmaNome: "Tarde",
          hora: "18:00",
          pessoas: [],
        },
        {
          key: `turma:${ids.turmaSemHora}`,
          aulaId: null,
          turmaId: ids.turmaSemHora,
          turmaNome: "Amanhecer",
          hora: null,
          pessoas: [],
        },
      ],
    });
  });

  it("sorts people by normalized Portuguese name and stable key", () => {
    const result = deriveAttendanceDay(
      attendanceInput({
        turmas: [turma()],
        matriculas: [
          matricula({
            id: ids.matriculaCaio,
            contato_id: ids.contatoCaio,
          }),
          matricula({
            id: ids.matriculaBia,
            contato_id: ids.contatoBia,
          }),
          matricula(),
        ],
        contatos: [
          contato({ nome: "ábaco" }),
          contato({ id: ids.contatoBia, nome: "Abaco" }),
          contato({ id: ids.contatoCaio, nome: "Bruno" }),
        ],
      }),
    );

    expect(result).toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `turma:${ids.turmaQuarta}`,
          aulaId: null,
          turmaId: ids.turmaQuarta,
          turmaNome: "Quarta Cerâmica",
          hora: "15:00",
          pessoas: [
            {
              key: `contato:${ids.contatoAna}`,
              presencaId: null,
              contatoId: ids.contatoAna,
              nome: "ábaco",
              origem: "matricula",
              matriculaId: ids.matriculaAna,
              avulsaId: null,
              status: null,
            },
            {
              key: `contato:${ids.contatoBia}`,
              presencaId: null,
              contatoId: ids.contatoBia,
              nome: "Abaco",
              origem: "matricula",
              matriculaId: ids.matriculaBia,
              avulsaId: null,
              status: null,
            },
            {
              key: `contato:${ids.contatoCaio}`,
              presencaId: null,
              contatoId: ids.contatoCaio,
              nome: "Bruno",
              origem: "matricula",
              matriculaId: ids.matriculaCaio,
              avulsaId: null,
              status: null,
            },
          ],
        },
      ],
    });
  });

  it.each(["2026-02-29", "2026-8-26", "2026-13-01", "not-a-date"])(
    "rejects invalid attendance date %s without local-time coercion",
    (data) => {
      expect(() => deriveAttendanceDay(attendanceInput({ data }))).toThrow(
        new RangeError(`Invalid attendance date: ${data}`),
      );
    },
  );
});

describe("isAttendanceDayReady", () => {
  const unmarkedDay = {
    data: "2026-08-26",
    turmas: [
      {
        key: `turma:${ids.turmaQuarta}`,
        aulaId: null,
        turmaId: ids.turmaQuarta,
        turmaNome: "Quarta Cerâmica",
        hora: "15:00",
        pessoas: [
          {
            key: `contato:${ids.contatoAna}`,
            presencaId: null,
            contatoId: ids.contatoAna,
            nome: "Ana",
            origem: "matricula",
            matriculaId: ids.matriculaAna,
            avulsaId: null,
            status: null,
          },
        ],
      },
    ],
  } satisfies AttendanceDay;

  it("is false for an unmarked person, true when all are marked, and true when empty", () => {
    expect(isAttendanceDayReady(unmarkedDay)).toBe(false);
    expect(
      isAttendanceDayReady({
        ...unmarkedDay,
        turmas: unmarkedDay.turmas.map((attendanceClass) => ({
          ...attendanceClass,
          pessoas: attendanceClass.pessoas.map((person) => ({
            ...person,
            status: "presente" as const,
          })),
        })),
      }),
    ).toBe(true);
    expect(
      isAttendanceDayReady({ data: "2026-08-26", turmas: [] }),
    ).toBe(true);
  });
});
