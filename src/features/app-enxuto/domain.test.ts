import { describe, expect, it } from "vitest";
import {
  absenceStatus,
  classCapacity,
  confirmationStatus,
  financeEntryStatus,
  generateClassName,
  monthsStudying,
  occurrencesForRange,
  reportStepsForRole,
  shiftIsoMonth,
} from "@/features/app-enxuto/domain";

describe("regras integradas do app enxuto", () => {
  it("gera as ocorrências recorrentes no intervalo solicitado", () => {
    const result = occurrencesForRange(
      [
        { id: "argila", nome: "Argila", dia: 3, hora: "15:00", fim: "18:00", capacidade: 6 },
        { id: "esmalte", nome: "Esmalte", dia: 4, hora: "18:00", fim: "21:00", capacidade: 8 },
      ],
      "2026-07-08",
      3,
    );

    expect(result.map(({ data, turma }) => [data, turma.nome])).toEqual([
      ["2026-07-08", "Argila"],
      ["2026-07-09", "Esmalte"],
    ]);
  });

  it("calcula ocupação retirando avisos e somando reposições de destino", () => {
    expect(classCapacity({
      turma: { id: "t1", capacidade: 4 },
      data: "2026-07-15",
      matriculas: [
        { contato_id: "c1", turma_id: "t1", status: "Ativa" },
        { contato_id: "c2", turma_id: "t1", status: "Nova" },
        { contato_id: "c3", turma_id: "t1", status: "Pausada" },
      ],
      avisos: [{ contato_id: "c1", turma_id: "t1", data: "2026-07-15" }],
      reposicoes: [
        { contato_id: "c4", destino_turma_id: "t1", destino_data: "2026-07-15" },
        { contato_id: "c5", destino_turma_id: "t1", destino_data: "2026-07-15" },
      ],
    })).toEqual({ matriculados: 2, avisaram: 1, reposicoes: 2, ocupados: 3, vagas: 1 });
  });

  it("deriva sem resposta de confirmações e usa aviso como não vem", () => {
    expect(confirmationStatus(null, null)).toBe("sem_resposta");
    expect(confirmationStatus(null, { origem: "aviso" })).toBe("nao_vem");
    expect(confirmationStatus({ status: "confirmou" }, { origem: "aviso" })).toBe("confirmou");
  });

  it("deriva o status do aviso pela chamada e pela data", () => {
    expect(absenceStatus("2026-07-01", "faltou", "2026-07-09")).toBe("falta_confirmada");
    expect(absenceStatus("2026-07-01", "presente", "2026-07-09")).toBe("acabou_indo");
    expect(absenceStatus("2026-07-01", null, "2026-07-09")).toBe("sem_chamada");
    expect(absenceStatus("2026-07-10", null, "2026-07-09")).toBe("falta_esperada");
  });

  it("usa passos diferentes para professora/admin e atendimento", () => {
    expect(reportStepsForRole("professora")).toEqual(["Chamada", "Peças", "Observações"]);
    expect(reportStepsForRole("admin")).toEqual(["Chamada", "Peças", "Observações"]);
    expect(reportStepsForRole("atendimento")).toEqual(["Resumo de ontem", "Confirmações", "Pagamentos", "Observações"]);
  });

  it("calcula status financeiro em relação ao dia real", () => {
    expect(financeEntryStatus({ pago: true, vencimento: "2026-07-01" }, "2026-07-09")).toEqual({ key: "pago", label: "Pago" });
    expect(financeEntryStatus({ pago: false, vencimento: "2026-07-07" }, "2026-07-09")).toEqual({ key: "vencido", label: "Vencido há 2 dias" });
    expect(financeEntryStatus({ pago: false, vencimento: "2026-07-09" }, "2026-07-09")).toEqual({ key: "hoje", label: "Vence hoje" });
    expect(financeEntryStatus({ pago: false, vencimento: "2026-07-12" }, "2026-07-09")).toEqual({ key: "aberto", label: "A vencer em 3 dias" });
  });

  it("gera nome de turma e meses completos de estudo", () => {
    expect(generateClassName("", 3, "15:00", "18:00")).toBe("Quarta · 15h–18h");
    expect(generateClassName("Torno", 3, "18:00", "21:00")).toBe("Torno");
    expect(monthsStudying("2026-03-05", "2026-07-04")).toBe(3);
    expect(monthsStudying("2026-03-05", "2026-07-05")).toBe(4);
  });

  it("navega meses sem pular fevereiro ou atravessar dois meses", () => {
    expect(shiftIsoMonth("2026-01-31", 1)).toBe("2026-02-01");
    expect(shiftIsoMonth("2026-03-31", -1)).toBe("2026-02-01");
  });
});
