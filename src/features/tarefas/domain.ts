import type { Insert, Row, Update } from "@/lib/database.types";

export const TAREFA_STATUS = ["a_fazer", "em_andamento", "concluida"] as const;
export type TarefaStatus = (typeof TAREFA_STATUS)[number];

export const tarefaStatusLabels: Record<TarefaStatus, string> = {
  a_fazer: "A fazer",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export interface TarefaDraft {
  status: TarefaStatus;
  data_abertura: string;
  data_conclusao: string | null;
  responsavel: string;
  titulo: string;
  descricao: string | null;
}

function validateCompletion(dataAbertura: string, dataConclusao: string) {
  if (dataConclusao < dataAbertura) {
    throw new Error("Conclusão não pode ser anterior à abertura");
  }
}

function completionForStatus(
  status: TarefaStatus,
  dataAbertura: string,
  today: string,
  currentCompletion: string | null,
) {
  if (status !== "concluida") return null;

  const dataConclusao = currentCompletion ?? today;
  validateCompletion(dataAbertura, dataConclusao);
  return dataConclusao;
}

export function buildTarefaInput(
  draft: TarefaDraft,
  today: string,
  previousCompletion: string | null = null,
): Insert<"tarefas"> {
  const titulo = draft.titulo.trim();
  const responsavel = draft.responsavel.trim();
  const descricao = draft.descricao?.trim() || null;

  if (!titulo) throw new Error("Título é obrigatório");
  if (!responsavel) throw new Error("Responsável é obrigatório");

  return {
    status: draft.status,
    data_abertura: draft.data_abertura,
    data_conclusao: completionForStatus(
      draft.status,
      draft.data_abertura,
      today,
      draft.data_conclusao ?? previousCompletion,
    ),
    responsavel,
    titulo,
    descricao,
  };
}

export function tarefaStatusPatch(
  task: Pick<Row<"tarefas">, "data_abertura" | "data_conclusao">,
  status: TarefaStatus,
  today: string,
): Update<"tarefas"> {
  return {
    status,
    data_conclusao: completionForStatus(
      status,
      task.data_abertura,
      today,
      task.data_conclusao,
    ),
  };
}
