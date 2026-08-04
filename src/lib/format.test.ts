import { formatCurrency, formatDate } from "@/lib/format";

describe("formatação pública", () => {
  it("formata moeda e datas no padrão do protótipo", () => {
    expect(formatCurrency(520)).toBe("R$ 520,00");
    expect(formatDate("2026-07-09")).toBe("09/07/2026");
    expect(formatDate(null)).toBe("—");
  });
});
