import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Row } from "@/lib/database.types";
import {
  attendanceDayQueryKey,
  loadAttendanceDay,
  upsertAula,
  upsertAttendance,
  type UpsertAttendanceInput,
  type UpsertAulaInput,
} from "@/features/relatorios/attendance-api";

const databaseMock = vi.hoisted(() => {
  const turmas = { select: vi.fn() };
  const matriculas = { select: vi.fn(), in: vi.fn() };
  const avulsas = { select: vi.fn(), eq: vi.fn() };
  const aulas = {
    select: vi.fn(),
    eq: vi.fn(),
    upsert: vi.fn(),
    single: vi.fn(),
  };
  const contatos = { select: vi.fn(), in: vi.fn() };
  const presencas = {
    select: vi.fn(),
    in: vi.fn(),
    upsert: vi.fn(),
    single: vi.fn(),
  };
  const tables = { turmas, matriculas, avulsas, aulas, contatos, presencas };
  const from = vi.fn((tableName: keyof typeof tables) => tables[tableName]);

  return { from, tables };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: databaseMock.from },
}));

const ids = {
  turma: "00000000-0000-0000-0000-000000000001",
  contatoAna: "00000000-0000-0000-0000-000000000101",
  contatoBia: "00000000-0000-0000-0000-000000000102",
  matriculaBia: "00000000-0000-0000-0000-000000000201",
  avulsaAna: "00000000-0000-0000-0000-000000000301",
  avulsaBia: "00000000-0000-0000-0000-000000000302",
  aula: "00000000-0000-0000-0000-000000000401",
  presenca: "00000000-0000-0000-0000-000000000501",
} as const;

const turmaRow = {
  id: ids.turma,
  nome: "Quarta Cerâmica",
  dia: 3,
  hora: "15:00",
} satisfies Row<"turmas">;

const matriculaRow = {
  id: ids.matriculaBia,
  contato_id: ids.contatoBia,
  turma_id: ids.turma,
  mensalidade: 520,
  pagamento: "Pix",
  status: "Ativa",
  created_at: "2026-01-01T00:00:00.000Z",
} satisfies Row<"matriculas">;

const avulsaAnaRow = {
  id: ids.avulsaAna,
  contato_id: ids.contatoAna,
  turma_id: ids.turma,
  data: "2026-08-26",
  status: "Confirmada",
} satisfies Row<"avulsas">;

const avulsaBiaRow = {
  id: ids.avulsaBia,
  contato_id: ids.contatoBia,
  turma_id: ids.turma,
  data: "2026-08-26",
  status: "Confirmada",
} satisfies Row<"avulsas">;

const contatoAnaRow = {
  id: ids.contatoAna,
  nome: "Ana",
  tel: null,
  origem: null,
  obs: null,
  created_at: "2026-01-01T00:00:00.000Z",
} satisfies Row<"contatos">;

const contatoBiaRow = {
  ...contatoAnaRow,
  id: ids.contatoBia,
  nome: "Bia",
} satisfies Row<"contatos">;

const aulaRow = {
  id: ids.aula,
  data: "2026-08-26",
  turma_id: ids.turma,
  turma_nome: "Quarta Cerâmica",
  created_at: "2026-08-26T12:00:00.000Z",
  updated_at: "2026-08-26T12:00:00.000Z",
} satisfies Row<"aulas">;

const presencaRow = {
  id: ids.presenca,
  aula_id: ids.aula,
  contato_id: ids.contatoAna,
  contato_nome: "Ana no dia",
  status: "faltou",
  origem: "avulsa",
  matricula_id: null,
  avulsa_id: ids.avulsaAna,
  created_at: "2026-08-26T12:00:00.000Z",
  updated_at: "2026-08-26T12:00:00.000Z",
} satisfies Row<"presencas">;

const aulaInput = {
  data: "2026-08-26",
  turmaId: ids.turma,
  turmaNome: "Quarta Cerâmica",
} satisfies UpsertAulaInput;

const attendanceInput = {
  ...aulaInput,
  contatoId: ids.contatoAna,
  contatoNome: "Ana no dia",
  status: "faltou",
  origem: "avulsa",
  matriculaId: null,
  avulsaId: ids.avulsaAna,
} satisfies UpsertAttendanceInput;

type ReadTable = keyof typeof databaseMock.tables;

function resultFor<T>(table: ReadTable, failAt: ReadTable | null, data: T) {
  return table === failAt
    ? { data: null, error: { message: `read failed at ${table}` } }
    : { data, error: null };
}

function configureReadQueries(failAt: ReadTable | null = null) {
  const { turmas, matriculas, avulsas, aulas, contatos, presencas } =
    databaseMock.tables;

  turmas.select.mockResolvedValue(
    resultFor("turmas", failAt, [turmaRow]),
  );

  matriculas.select.mockReturnValue(matriculas);
  matriculas.in.mockResolvedValue(
    resultFor("matriculas", failAt, [matriculaRow]),
  );

  avulsas.select.mockReturnValue(avulsas);
  avulsas.eq
    .mockReturnValueOnce(avulsas)
    .mockResolvedValueOnce(
      resultFor("avulsas", failAt, [avulsaBiaRow, avulsaAnaRow]),
    );

  aulas.select.mockReturnValue(aulas);
  aulas.eq.mockResolvedValue(resultFor("aulas", failAt, [aulaRow]));

  contatos.select.mockReturnValue(contatos);
  contatos.in.mockResolvedValue(
    resultFor("contatos", failAt, [contatoBiaRow, contatoAnaRow]),
  );

  presencas.select.mockReturnValue(presencas);
  presencas.in.mockResolvedValue(
    resultFor("presencas", failAt, [presencaRow]),
  );
}

function configureSuccessfulAulaUpsert() {
  const { aulas } = databaseMock.tables;
  aulas.upsert.mockResolvedValue({ data: null, error: null });
  aulas.select.mockReturnValue(aulas);
  aulas.eq.mockReturnValueOnce(aulas).mockReturnValueOnce(aulas);
  aulas.single.mockResolvedValue({ data: aulaRow, error: null });
}

function configureSuccessfulAttendanceUpsert() {
  const { presencas } = databaseMock.tables;
  presencas.upsert.mockReturnValue(presencas);
  presencas.select.mockReturnValue(presencas);
  presencas.single.mockResolvedValue({ data: presencaRow, error: null });
}

beforeEach(() => {
  vi.resetAllMocks();
  databaseMock.from.mockImplementation(
    (tableName) => databaseMock.tables[tableName],
  );
});

describe("loadAttendanceDay", () => {
  it("uses the stable date-scoped query key", () => {
    expect(attendanceDayQueryKey("2026-08-26")).toEqual([
      "attendance-day",
      "2026-08-26",
    ]);
  });

  it("loads filtered sources in two read-only phases and returns the derived day", async () => {
    configureReadQueries();

    await expect(loadAttendanceDay("2026-08-26")).resolves.toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `turma:${ids.turma}`,
          aulaId: ids.aula,
          turmaId: ids.turma,
          turmaNome: "Quarta Cerâmica",
          hora: "15:00",
          pessoas: [
            {
              key: `contato:${ids.contatoAna}`,
              presencaId: ids.presenca,
              contatoId: ids.contatoAna,
              nome: "Ana no dia",
              origem: "avulsa",
              matriculaId: null,
              avulsaId: ids.avulsaAna,
              status: "faltou",
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

    const { turmas, matriculas, avulsas, aulas, contatos, presencas } =
      databaseMock.tables;
    expect(turmas.select).toHaveBeenCalledWith("*");
    expect(matriculas.select).toHaveBeenCalledWith("*");
    expect(matriculas.in).toHaveBeenCalledWith("status", ["Ativa", "Nova"]);
    expect(avulsas.select).toHaveBeenCalledWith("*");
    expect(avulsas.eq).toHaveBeenNthCalledWith(1, "data", "2026-08-26");
    expect(avulsas.eq).toHaveBeenNthCalledWith(2, "status", "Confirmada");
    expect(aulas.select).toHaveBeenCalledWith("*");
    expect(aulas.eq).toHaveBeenCalledWith("data", "2026-08-26");
    expect(contatos.in).toHaveBeenCalledWith("id", [
      ids.contatoAna,
      ids.contatoBia,
    ]);
    expect(presencas.in).toHaveBeenCalledWith("aula_id", [ids.aula]);
    expect(aulas.upsert).not.toHaveBeenCalled();
    expect(presencas.upsert).not.toHaveBeenCalled();
  });

  it("skips empty id filters and passes empty secondary sources to the domain", async () => {
    const { turmas, matriculas, avulsas, aulas, contatos, presencas } =
      databaseMock.tables;
    turmas.select.mockResolvedValue({ data: [turmaRow], error: null });
    matriculas.select.mockReturnValue(matriculas);
    matriculas.in.mockResolvedValue({ data: [], error: null });
    avulsas.select.mockReturnValue(avulsas);
    avulsas.eq
      .mockReturnValueOnce(avulsas)
      .mockResolvedValueOnce({ data: [], error: null });
    aulas.select.mockReturnValue(aulas);
    aulas.eq.mockResolvedValue({ data: [], error: null });

    await expect(loadAttendanceDay("2026-08-26")).resolves.toEqual({
      data: "2026-08-26",
      turmas: [
        {
          key: `turma:${ids.turma}`,
          aulaId: null,
          turmaId: ids.turma,
          turmaNome: "Quarta Cerâmica",
          hora: "15:00",
          pessoas: [],
        },
      ],
    });

    expect(contatos.select).not.toHaveBeenCalled();
    expect(contatos.in).not.toHaveBeenCalled();
    expect(presencas.select).not.toHaveBeenCalled();
    expect(presencas.in).not.toHaveBeenCalled();
  });

  it.each([
    "turmas",
    "matriculas",
    "avulsas",
    "aulas",
    "contatos",
    "presencas",
  ] satisfies ReadTable[])(
    "propagates the original message from the %s read boundary",
    async (table) => {
      configureReadQueries(table);

      await expect(loadAttendanceDay("2026-08-26")).rejects.toThrow(
        `read failed at ${table}`,
      );
    },
  );
});

describe("upsertAula", () => {
  it("inserts without overwriting snapshots and reads the canonical conflict row", async () => {
    configureSuccessfulAulaUpsert();

    await expect(upsertAula(aulaInput)).resolves.toBe(aulaRow);

    const { aulas } = databaseMock.tables;
    expect(aulas.upsert).toHaveBeenCalledWith(
      {
        data: "2026-08-26",
        turma_id: ids.turma,
        turma_nome: "Quarta Cerâmica",
      },
      { onConflict: "data,turma_id", ignoreDuplicates: true },
    );
    expect(aulas.select).toHaveBeenCalledWith("*");
    expect(aulas.eq).toHaveBeenNthCalledWith(1, "data", "2026-08-26");
    expect(aulas.eq).toHaveBeenNthCalledWith(2, "turma_id", ids.turma);
    expect(aulas.single).toHaveBeenCalledWith();
  });

  it("rejects a missing canonical row", async () => {
    const { aulas } = databaseMock.tables;
    aulas.upsert.mockResolvedValue({ data: null, error: null });
    aulas.select.mockReturnValue(aulas);
    aulas.eq.mockReturnValueOnce(aulas).mockReturnValueOnce(aulas);
    aulas.single.mockResolvedValue({ data: null, error: null });

    await expect(upsertAula(aulaInput)).rejects.toThrow(
      "Attendance class was not found after upsert",
    );
  });
});

describe("upsertAttendance", () => {
  it("awaits the class occurrence and upserts the exact attendance snapshot", async () => {
    configureSuccessfulAulaUpsert();
    configureSuccessfulAttendanceUpsert();

    await expect(upsertAttendance(attendanceInput)).resolves.toBe(presencaRow);

    const { aulas, presencas } = databaseMock.tables;
    expect(presencas.upsert).toHaveBeenCalledWith(
      {
        aula_id: ids.aula,
        contato_id: ids.contatoAna,
        contato_nome: "Ana no dia",
        status: "faltou",
        origem: "avulsa",
        matricula_id: null,
        avulsa_id: ids.avulsaAna,
      },
      { onConflict: "aula_id,contato_id" },
    );
    expect(presencas.select).toHaveBeenCalledWith("*");
    expect(presencas.single).toHaveBeenCalledWith();
    expect(aulas.single.mock.invocationCallOrder[0]).toBeLessThan(
      presencas.upsert.mock.invocationCallOrder[0],
    );
  });

  it("propagates a presence failure after leaving the reusable class occurrence", async () => {
    configureSuccessfulAulaUpsert();
    const { presencas } = databaseMock.tables;
    presencas.upsert.mockReturnValue(presencas);
    presencas.select.mockReturnValue(presencas);
    presencas.single.mockResolvedValue({
      data: null,
      error: { message: "presence write failed" },
    });

    await expect(upsertAttendance(attendanceInput)).rejects.toThrow(
      "presence write failed",
    );
    expect(databaseMock.tables.aulas.upsert).toHaveBeenCalledOnce();
  });

  it.each(["upsert", "lookup"] as const)(
    "does not write attendance when the class %s fails",
    async (failure) => {
      const { aulas, presencas } = databaseMock.tables;

      if (failure === "upsert") {
        aulas.upsert.mockResolvedValue({
          data: null,
          error: { message: "class upsert failed" },
        });
      } else {
        aulas.upsert.mockResolvedValue({ data: null, error: null });
        aulas.select.mockReturnValue(aulas);
        aulas.eq.mockReturnValueOnce(aulas).mockReturnValueOnce(aulas);
        aulas.single.mockResolvedValue({
          data: null,
          error: { message: "class lookup failed" },
        });
      }

      await expect(upsertAttendance(attendanceInput)).rejects.toThrow(
        failure === "upsert" ? "class upsert failed" : "class lookup failed",
      );
      expect(presencas.upsert).not.toHaveBeenCalled();
    },
  );

  it.each([
    {
      ...attendanceInput,
      origem: "matricula",
      matriculaId: ids.matriculaBia,
      avulsaId: ids.avulsaAna,
    },
    {
      ...attendanceInput,
      origem: "avulsa",
      matriculaId: ids.matriculaBia,
      avulsaId: ids.avulsaAna,
    },
  ] satisfies UpsertAttendanceInput[])(
    "rejects cross-origin source ids before any write",
    async (invalidInput) => {
      await expect(upsertAttendance(invalidInput)).rejects.toBeInstanceOf(
        RangeError,
      );
      expect(databaseMock.tables.aulas.upsert).not.toHaveBeenCalled();
      expect(databaseMock.tables.presencas.upsert).not.toHaveBeenCalled();
    },
  );
});
