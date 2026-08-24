import type { Insert, Row, Update } from "@/lib/database.types";
import {
  createTarefa,
  deleteTarefa,
  listTarefas,
  tarefasQueryKey,
  updateTarefa,
} from "@/features/tarefas/api";

const supabaseMock = vi.hoisted(() => {
  const from = vi.fn();
  const select = vi.fn();
  const order = vi.fn();
  const insert = vi.fn();
  const update = vi.fn();
  const remove = vi.fn();
  const eq = vi.fn();
  const single = vi.fn();
  const query = { select, order, insert, update, delete: remove, eq, single };

  return { from, select, order, insert, update, remove, eq, single, query };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: supabaseMock.from },
}));

const persisted = {
  id: "tarefa-1",
  status: "a_fazer",
  data_abertura: "2026-08-24",
  data_conclusao: null,
  responsavel: "Catarina",
  titulo: "Conferir forno",
  descricao: null,
  created_at: "2026-08-24T12:00:00.000Z",
} satisfies Row<"tarefas">;
const input = {
  responsavel: "Catarina",
  titulo: "Conferir forno",
} satisfies Insert<"tarefas">;
const patch = {
  status: "em_andamento",
} satisfies Update<"tarefas">;

describe("API de tarefas", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    supabaseMock.from.mockReturnValue(supabaseMock.query);
    supabaseMock.select.mockReturnValue(supabaseMock.query);
    supabaseMock.insert.mockReturnValue(supabaseMock.query);
    supabaseMock.update.mockReturnValue(supabaseMock.query);
    supabaseMock.remove.mockReturnValue(supabaseMock.query);
    supabaseMock.eq.mockReturnValue(supabaseMock.query);
  });

  it("lista tarefas por abertura e criação decrescentes", async () => {
    supabaseMock.order
      .mockReturnValueOnce(supabaseMock.query)
      .mockResolvedValueOnce({ data: [persisted], error: null });

    await expect(listTarefas()).resolves.toEqual([persisted]);

    expect(tarefasQueryKey).toEqual(["tarefas"]);
    expect(supabaseMock.from).toHaveBeenCalledWith("tarefas");
    expect(supabaseMock.select).toHaveBeenCalledWith("*");
    expect(supabaseMock.order).toHaveBeenNthCalledWith(1, "data_abertura", {
      ascending: false,
    });
    expect(supabaseMock.order).toHaveBeenNthCalledWith(2, "created_at", {
      ascending: false,
    });
  });

  it("cria e atualiza retornando a linha persistida", async () => {
    supabaseMock.single.mockResolvedValue({ data: persisted, error: null });

    await expect(createTarefa(input)).resolves.toBe(persisted);
    await expect(updateTarefa(persisted.id, patch)).resolves.toBe(persisted);

    expect(supabaseMock.insert).toHaveBeenCalledWith(input);
    expect(supabaseMock.update).toHaveBeenCalledWith(patch);
    expect(supabaseMock.eq).toHaveBeenCalledWith("id", persisted.id);
    expect(supabaseMock.select).toHaveBeenCalledTimes(2);
    expect(supabaseMock.single).toHaveBeenCalledTimes(2);
  });

  it("exclui somente o id solicitado", async () => {
    supabaseMock.eq.mockResolvedValueOnce({ error: null });

    await expect(deleteTarefa(persisted.id)).resolves.toBeUndefined();

    expect(supabaseMock.from).toHaveBeenCalledWith("tarefas");
    expect(supabaseMock.remove).toHaveBeenCalledWith();
    expect(supabaseMock.eq).toHaveBeenCalledWith("id", persisted.id);
  });

  it("propaga o erro original em cada operação", async () => {
    const error = new Error("falha tarefas");
    supabaseMock.order
      .mockReturnValueOnce(supabaseMock.query)
      .mockResolvedValueOnce({ data: null, error });
    supabaseMock.single
      .mockResolvedValueOnce({ data: null, error })
      .mockResolvedValueOnce({ data: null, error });
    supabaseMock.eq
      .mockReturnValueOnce(supabaseMock.query)
      .mockResolvedValueOnce({ error });

    await expect(listTarefas()).rejects.toBe(error);
    await expect(createTarefa(input)).rejects.toBe(error);
    await expect(updateTarefa(persisted.id, patch)).rejects.toBe(error);
    await expect(deleteTarefa(persisted.id)).rejects.toBe(error);
  });
});
