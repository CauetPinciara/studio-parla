import type { Insert, Row, Update } from "@/lib/database.types";
import {
  listRelatorios,
  setRelatorioCompletion,
} from "@/features/relatorios/api";

const supabaseMock = vi.hoisted(() => {
  const from = vi.fn();
  const select = vi.fn();
  const order = vi.fn();
  const update = vi.fn();
  const eq = vi.fn();
  const single = vi.fn();
  const query = { select, order, update, eq, single };

  return { from, select, order, update, eq, single, query };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: supabaseMock.from },
}));

const completedAt = "2026-08-24T14:00:00.000Z";
const reportInsert = {
  data: "2026-08-24",
  turma_id: null,
  autor: "Catarina",
  resumo: "Forno e peças conferidos",
  concluido_em: null,
  created_at: "2026-08-24T13:00:00.000Z",
} satisfies Insert<"relatorios">;
const openReport = {
  id: "report-1",
  ...reportInsert,
} satisfies Row<"relatorios">;
const completedReport = {
  ...openReport,
  concluido_em: completedAt,
} satisfies Row<"relatorios">;
const completionPatch = {
  concluido_em: completedAt,
} satisfies Update<"relatorios">;
const reopenPatch = {
  concluido_em: null,
} satisfies Update<"relatorios">;

describe("API de relatórios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.from.mockReturnValue(supabaseMock.query);
    supabaseMock.select.mockReturnValue(supabaseMock.query);
    supabaseMock.update.mockReturnValue(supabaseMock.query);
    supabaseMock.eq.mockReturnValue(supabaseMock.query);
  });

  it("lista por data e criação mais recentes", async () => {
    supabaseMock.order
      .mockReturnValueOnce(supabaseMock.query)
      .mockResolvedValueOnce({ data: [openReport], error: null });

    await expect(listRelatorios()).resolves.toEqual([openReport]);

    expect(supabaseMock.from).toHaveBeenCalledWith("relatorios");
    expect(supabaseMock.select).toHaveBeenCalledWith("*");
    expect(supabaseMock.order).toHaveBeenNthCalledWith(1, "data", {
      ascending: false,
    });
    expect(supabaseMock.order).toHaveBeenNthCalledWith(2, "created_at", {
      ascending: false,
    });
  });

  it("persiste a conclusão e devolve a linha atualizada", async () => {
    supabaseMock.single.mockResolvedValueOnce({
      data: completedReport,
      error: null,
    });

    await expect(
      setRelatorioCompletion(openReport.id, completedAt),
    ).resolves.toEqual(completedReport);

    expect(supabaseMock.update).toHaveBeenCalledWith(completionPatch);
    expect(supabaseMock.eq).toHaveBeenCalledWith("id", openReport.id);
    expect(supabaseMock.select).toHaveBeenCalledWith();
    expect(supabaseMock.single).toHaveBeenCalledWith();
  });

  it("persiste a reabertura com timestamp nulo", async () => {
    supabaseMock.single.mockResolvedValueOnce({
      data: openReport,
      error: null,
    });

    await expect(
      setRelatorioCompletion(openReport.id, null),
    ).resolves.toEqual(openReport);

    expect(supabaseMock.update).toHaveBeenCalledWith(reopenPatch);
    expect(supabaseMock.eq).toHaveBeenCalledWith("id", openReport.id);
  });

  it("propaga o erro da atualização", async () => {
    supabaseMock.single.mockResolvedValueOnce({
      data: null,
      error: { message: "Falha ao concluir relatório" },
    });

    await expect(
      setRelatorioCompletion(openReport.id, completedAt),
    ).rejects.toThrow("Falha ao concluir relatório");
  });
});
