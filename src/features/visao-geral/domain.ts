import type { Row } from "@/lib/database.types";

export interface DashboardInput {
  contatos: Row<"contatos">[];
  turmas: Row<"turmas">[];
  matriculas: Row<"matriculas">[];
  pecas: Row<"pecas">[];
  workshops: Row<"workshops">[];
  avulsas: Row<"avulsas">[];
}

export interface DashboardPendingItem {
  title: string;
  text: string;
  critical: boolean;
}

export interface DashboardEvent {
  id: string;
  date: string;
  title: string;
}

export function deriveDashboard(input: DashboardInput) {
  const active = input.matriculas.filter((item) => item.status === "Ativa");
  const ready = input.pecas.filter((item) => item.status === "pronta");
  const name = (id: string) => input.contatos.find((item) => item.id === id)?.nome ?? "?";
  const pendencias: DashboardPendingItem[] = [
    ...ready.map((item) => ({ title: `Peça pronta de ${name(item.contato_id)}`, text: "Avisar o cliente para retirada.", critical: true })),
    ...input.matriculas.filter((item) => item.status === "Nova").map((item) => ({ title: `Confirmar pagamento — ${name(item.contato_id)}`, text: "Matrícula nova, pagamento antecipado.", critical: false })),
  ];
  const eventos: DashboardEvent[] = [
    ...input.workshops.map((item) => ({ id: `workshop-${item.id}`, date: item.datas || "Data a definir", title: item.nome })),
    ...input.avulsas.map((item) => ({ id: `avulsa-${item.id}`, date: item.data || "Data a definir", title: `Aula avulsa · ${name(item.contato_id)}` })),
  ];

  return {
    kpis: {
      alunosAtivos: new Set(active.map((item) => item.contato_id)).size,
      turmasSemanais: input.turmas.length,
      receitaMensal: active.reduce((sum, item) => sum + (item.mensalidade ?? 0), 0),
      pecasProntas: ready.length,
    },
    producao: {
      producao: input.pecas.filter((item) => item.status === "producao").length,
      pronta: ready.length,
      avisado: input.pecas.filter((item) => item.status === "avisado").length,
    },
    pendencias,
    eventos,
  };
}
