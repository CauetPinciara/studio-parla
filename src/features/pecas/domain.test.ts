import { getNextPecaStatus, pecaActionLabels, pecaStatusLabels, pecaStatusPatch, todayIso } from "@/features/pecas/domain";

describe("fluxo de status da peça", () => {
  it("avança na ordem e registra a data quando fica pronta", () => {
    expect(getNextPecaStatus("producao")).toBe("pronta");
    expect(getNextPecaStatus("pronta")).toBe("avisado");
    expect(getNextPecaStatus("avisado")).toBe("entregue");
    expect(getNextPecaStatus("entregue")).toBeNull();
    expect(pecaStatusPatch("pronta", "2026-07-11")).toEqual({ status: "pronta", data_pronta: "2026-07-11" });
    expect(pecaStatusPatch("avisado", "2026-07-11")).toEqual({ status: "avisado" });
    expect(pecaStatusLabels).toEqual({ producao: "Em produção", pronta: "Pronta · avisar", avisado: "Aguardando retirada", entregue: "Entregue" });
    expect(pecaActionLabels).toEqual({ producao: "Marcar pronta", pronta: "Marcar avisada", avisado: "Marcar entregue" });
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-05T01:30:00.000Z"));
    expect(todayIso()).toBe("2026-08-04");
    vi.useRealTimers();
  });
});
