import { calculateClosing } from "@/features/fechamento/domain";

describe("fechamento mensal", () => {
  it("reproduz valores e mensagem do protótipo", () => {
    const result = calculateClosing({ nome: "Isadora", mensalidade: 500, peso: 0.296, pesoEsmaltado: 0, argilaKg: 14, biscoitoKg: 30, esmalteKg: 36 });
    expect(result.total).toBeCloseTo(513.024);
    expect(result.lines).toEqual([
      { label: "Mensalidade", value: 500 },
      { label: "Argila", value: 4.144 },
      { label: "1ª queima (biscoito)", value: 8.879999999999999 },
    ]);
    expect(result.message).toBe("Total geral da Isadora:\n• Peso total: 0,296 kg\n• Mensalidade: R$ 500,00\n• Argila: R$ 4,14\n• Queima de biscoito: R$ 8,88\n• Valor total: R$ 513,02");
  });

  it("omite mensalidade zerada e esmalte sem peso", () => {
    const result = calculateClosing({ nome: "Mariana", mensalidade: 0, peso: 0.792, pesoEsmaltado: 0, argilaKg: 14, biscoitoKg: 30, esmalteKg: 36 });
    expect(result.lines.map((line) => line.label)).toEqual(["Argila", "1ª queima (biscoito)"]);
    expect(result.message).not.toContain("Mensalidade");
    expect(result.message).not.toContain("Queima de esmalte");
  });

  it("inclui esmalte, peso com três casas e nome padrão", () => {
    const result = calculateClosing({ nome: "   ", mensalidade: 0, peso: 1, pesoEsmaltado: 0.5, argilaKg: 14, biscoitoKg: 30, esmalteKg: 36 });
    expect(result.esmalte).toBe(18);
    expect(result.total).toBe(62);
    expect(result.lines).toEqual([
      { label: "Argila", value: 14 },
      { label: "1ª queima (biscoito)", value: 30 },
      { label: "2ª queima (esmalte)", value: 18 },
    ]);
    expect(result.message).toBe("Total geral da aluno(a):\n• Peso total: 1,000 kg\n• Argila: R$ 14,00\n• Queima de biscoito: R$ 30,00\n• Queima de esmalte: R$ 18,00\n• Valor total: R$ 62,00");
  });
});
