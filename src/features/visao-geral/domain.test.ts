import { describe, expect, it } from "vitest";
import type { Row } from "@/lib/database.types";
import { deriveDashboard } from "@/features/visao-geral/domain";

const contato = (id: string, nome: string): Row<"contatos"> => ({ id, nome, tel: null, origem: null, obs: null, created_at: "2026-07-01T00:00:00Z" });
const matricula = (id: string, contato_id: string, status: string, mensalidade: number | null): Row<"matriculas"> => ({ id, contato_id, turma_id: null, mensalidade, pagamento: null, status, created_at: "2026-07-01T00:00:00Z" });
const peca = (id: string, contato_id: string, status: string): Row<"pecas"> => ({ id, contato_id, status, descricao: null, data_deixou: null, estimativa: null, data_pronta: null, created_at: "2026-07-01T00:00:00Z" });

describe("painel tático derivado dos dados persistidos", () => {
  it("calcula KPIs distintos, produção e pendências sem nomes fixos", () => {
    const model = deriveDashboard({
      contatos: [contato("c1", "Ana"), contato("c2", "Bia"), contato("c3", "Caio")],
      turmas: [{ id: "t1", nome: "Quarta", dia: 3, hora: "15:00" }],
      matriculas: [
        matricula("m1", "c1", "Ativa", 520),
        matricula("m2", "c1", "Ativa", 500),
        matricula("m3", "c2", "Nova", null),
        matricula("m4", "c2", "Ativa", 520),
        matricula("m5", "c3", "Pausada", 999),
      ],
      pecas: [peca("p1", "c1", "producao"), peca("p2", "c2", "pronta"), peca("p3", "c1", "avisado"), peca("p4", "c1", "entregue")],
      workshops: [{ id: "w1", nome: "Sábado", datas: "12/07", preco: null, created_at: "2026-07-01T00:00:00Z" }],
      avulsas: [{ id: "a1", contato_id: "c1", turma_id: null, data: "2026-07-16", status: "A confirmar" }],
    });

    expect(model.kpis).toEqual({ alunosAtivos: 2, turmasSemanais: 1, receitaMensal: 1540, pecasProntas: 1 });
    expect(model.producao).toEqual({ producao: 1, pronta: 1, avisado: 1 });
    expect(model.pendencias).toEqual([
      { title: "Peça pronta de Bia", text: "Avisar o cliente para retirada.", critical: true },
      { title: "Confirmar pagamento — Bia", text: "Matrícula nova, pagamento antecipado.", critical: false },
    ]);
    expect(model.eventos).toEqual([
      { id: "workshop-w1", date: "12/07", title: "Sábado" },
      { id: "avulsa-a1", date: "2026-07-16", title: "Aula avulsa · Ana" },
    ]);
  });

  it("usa rótulos seguros para referências ausentes e eventos sem data", () => {
    const model = deriveDashboard({
      contatos: [],
      turmas: [],
      matriculas: [matricula("m1", "ausente", "Nova", 520)],
      pecas: [peca("p1", "ausente", "pronta")],
      workshops: [{ id: "w1", nome: "Workshop", datas: null, preco: null, created_at: "2026-07-01T00:00:00Z" }],
      avulsas: [{ id: "a1", contato_id: "ausente", turma_id: null, data: null, status: null }],
    });

    expect(model.pendencias.map((item) => item.title)).toEqual(["Peça pronta de ?", "Confirmar pagamento — ?"]);
    expect(model.eventos).toEqual([
      { id: "workshop-w1", date: "Data a definir", title: "Workshop" },
      { id: "avulsa-a1", date: "Data a definir", title: "Aula avulsa · ?" },
    ]);
  });
});
