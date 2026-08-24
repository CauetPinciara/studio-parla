import type { Insert, Row, Update } from "@/lib/database.types";
import {
  buildTarefaInput,
  tarefaStatusLabels,
  tarefaStatusPatch,
  type TarefaDraft,
} from "@/features/tarefas/domain";

const today = "2026-08-24";
const existingCompletion = "2026-08-22";
const openRow = {
  id: "tarefa-1",
  status: "em_andamento",
  data_abertura: "2026-08-20",
  data_conclusao: null,
  responsavel: "Catarina",
  titulo: "Conferir forno",
  descricao: null,
  created_at: "2026-08-20T12:00:00.000Z",
} satisfies Row<"tarefas">;
const openInput = {
  status: "em_andamento",
  data_abertura: "2026-08-20",
  data_conclusao: null,
  responsavel: "Catarina",
  titulo: "Conferir forno",
  descricao: null,
} satisfies Insert<"tarefas">;
const completedPatch = {
  status: "concluida",
  data_conclusao: today,
} satisfies Update<"tarefas">;

function draft(overrides: Partial<TarefaDraft> = {}): TarefaDraft {
  return {
    status: "em_andamento",
    data_abertura: "2026-08-20",
    data_conclusao: null,
    responsavel: "  Catarina  ",
    titulo: "  Conferir forno  ",
    descricao: "   ",
    ...overrides,
  };
}

describe("domínio de tarefas", () => {
  it("normaliza campos e mantém tarefa aberta sem conclusão", () => {
    expect(buildTarefaInput(draft(), today)).toEqual(openInput);
    expect(tarefaStatusLabels).toEqual({
      a_fazer: "A fazer",
      em_andamento: "Em andamento",
      concluida: "Concluída",
    });
  });

  it("registra hoje ao concluir e preserva uma conclusão existente", () => {
    const completedDraft = draft({ status: "concluida" });

    expect(buildTarefaInput(completedDraft, today)).toEqual({
      ...openInput,
      status: "concluida",
      data_conclusao: today,
    });
    expect(
      buildTarefaInput(completedDraft, today, existingCompletion),
    ).toEqual({
      ...openInput,
      status: "concluida",
      data_conclusao: existingCompletion,
    });
    expect(tarefaStatusPatch(openRow, "concluida", today)).toEqual(
      completedPatch,
    );
    expect(
      tarefaStatusPatch(
        { ...openRow, data_conclusao: existingCompletion },
        "concluida",
        today,
      ),
    ).toEqual({
      status: "concluida",
      data_conclusao: existingCompletion,
    });
  });

  it("limpa a conclusão ao reabrir", () => {
    expect(
      buildTarefaInput(
        draft({ status: "a_fazer", data_conclusao: existingCompletion }),
        today,
        existingCompletion,
      ),
    ).toEqual({
      ...openInput,
      status: "a_fazer",
      data_conclusao: null,
    });
    expect(
      tarefaStatusPatch(
        { ...openRow, data_conclusao: existingCompletion },
        "em_andamento",
        today,
      ),
    ).toEqual({ status: "em_andamento", data_conclusao: null });
  });

  it("rejeita título, responsável e intervalo de datas inválidos", () => {
    expect(() =>
      buildTarefaInput(draft({ titulo: "   " }), today),
    ).toThrow("Título é obrigatório");
    expect(() =>
      buildTarefaInput(draft({ responsavel: "   " }), today),
    ).toThrow("Responsável é obrigatório");
    expect(() =>
      buildTarefaInput(
        draft({ status: "concluida", data_conclusao: "2026-08-19" }),
        today,
      ),
    ).toThrow("Conclusão não pode ser anterior à abertura");
    expect(() =>
      tarefaStatusPatch(
        { data_abertura: "2026-08-23", data_conclusao: existingCompletion },
        "concluida",
        today,
      ),
    ).toThrow("Conclusão não pode ser anterior à abertura");
  });
});
