import { getNextPecaStatus, pecaStatusPatch } from "@/features/pecas/domain";

describe("fluxo de status da peça", () => {
  it("avança na ordem e registra a data quando fica pronta", () => {
    expect(getNextPecaStatus("producao")).toBe("pronta");
    expect(getNextPecaStatus("pronta")).toBe("avisado");
    expect(getNextPecaStatus("avisado")).toBe("entregue");
    expect(getNextPecaStatus("entregue")).toBeNull();
    expect(pecaStatusPatch("pronta", "2026-07-11")).toEqual({ status: "pronta", data_pronta: "2026-07-11" });
    expect(pecaStatusPatch("avisado", "2026-07-11")).toEqual({ status: "avisado" });
  });
});
