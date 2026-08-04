export interface ClosingInput { nome: string; mensalidade: number; peso: number; pesoEsmaltado: number; argilaKg: number; biscoitoKg: number; esmalteKg: number }
export interface ClosingLine { label: string; value: number }
const money = (value: number) => `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const kg = (value: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
export function calculateClosing(input: ClosingInput) {
  const argila = input.peso * input.argilaKg; const biscoito = input.peso * input.biscoitoKg; const esmalte = input.pesoEsmaltado * input.esmalteKg; const total = input.mensalidade + argila + biscoito + esmalte;
  const lines: ClosingLine[] = [];
  if (input.mensalidade > 0) lines.push({ label: "Mensalidade", value: input.mensalidade });
  lines.push({ label: "Argila", value: argila }, { label: "1ª queima (biscoito)", value: biscoito });
  if (input.pesoEsmaltado > 0) lines.push({ label: "2ª queima (esmalte)", value: esmalte });
  let message = `Total geral da ${input.nome.trim() || "aluno(a)"}:\n• Peso total: ${kg(input.peso)} kg\n`;
  if (input.mensalidade > 0) message += `• Mensalidade: ${money(input.mensalidade)}\n`;
  message += `• Argila: ${money(argila)}\n• Queima de biscoito: ${money(biscoito)}\n`;
  if (input.pesoEsmaltado > 0) message += `• Queima de esmalte: ${money(esmalte)}\n`;
  message += `• Valor total: ${money(total)}`;
  return { argila, biscoito, esmalte, total, lines, message };
}
export { money as formatClosingMoney };
