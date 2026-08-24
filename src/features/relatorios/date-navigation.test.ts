import {
  normalizeReportDate,
  reportTodayIso,
  shiftReportDate,
} from "@/features/relatorios/date-navigation";

describe("regras de data do relatório diário", () => {
  it("calcula hoje no fuso de São Paulo antes da meia-noite local", () => {
    expect(reportTodayIso(new Date("2026-08-05T01:30:00.000Z"))).toBe("2026-08-04");
  });

  it("aceita somente datas ISO gregorianas reais", () => {
    const today = "2026-08-04";

    expect(normalizeReportDate(null, today)).toBe(today);
    expect(normalizeReportDate("2026-2-4", today)).toBe(today);
    expect(normalizeReportDate("2026-02-30", today)).toBe(today);
    expect(normalizeReportDate("2024-02-29", today)).toBe("2024-02-29");
  });

  it("desloca dias entre meses, anos e anos bissextos", () => {
    expect(shiftReportDate("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftReportDate("2024-02-28", 1)).toBe("2024-02-29");
    expect(shiftReportDate("2026-12-31", 1)).toBe("2027-01-01");
  });
});
