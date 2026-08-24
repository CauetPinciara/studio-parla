import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Insert, Row, Update } from "@/lib/database.types";
import TarefasPage from "@/features/tarefas/TarefasPage";

const apiMock = vi.hoisted(() => ({
  listTarefas: vi.fn(),
  createTarefa: vi.fn(),
  updateTarefa: vi.fn(),
  deleteTarefa: vi.fn(),
}));

vi.mock("@/features/tarefas/api", () => ({
  tarefasQueryKey: ["tarefas"] as const,
  ...apiMock,
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    member: {
      email: "catarina@studioparla.com.br",
      nome: "Catarina",
      created_at: "2026-08-01T12:00:00.000Z",
    },
  }),
}));

const createdAt = "2026-08-24T15:00:00.000Z";
const confirmMock = vi.fn();
let rows: Row<"tarefas">[];

function persisted(
  overrides: Partial<Row<"tarefas">> = {},
): Row<"tarefas"> {
  return {
    id: "tarefa-1",
    status: "a_fazer",
    data_abertura: "2026-08-24",
    data_conclusao: null,
    responsavel: "Catarina",
    titulo: "Organizar materiais",
    descricao: "Separar argila",
    created_at: createdAt,
    ...overrides,
  };
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderPage(client = createClient()) {
  render(
    <QueryClientProvider client={client}>
      <TarefasPage />
    </QueryClientProvider>,
  );
  return client;
}

function configureStateApi() {
  apiMock.listTarefas.mockImplementation(() => Promise.resolve([...rows]));
  apiMock.createTarefa.mockImplementation(
    (input: Insert<"tarefas">) => {
      const created = persisted({ ...input, id: "tarefa-1", created_at: createdAt });
      rows = [created];
      return Promise.resolve(created);
    },
  );
  apiMock.updateTarefa.mockImplementation(
    (id: string, patch: Update<"tarefas">) => {
      rows = rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
      return Promise.resolve(rows.find((row) => row.id === id)!);
    },
  );
  apiMock.deleteTarefa.mockImplementation((id: string) => {
    rows = rows.filter((row) => row.id !== id);
    return Promise.resolve();
  });
}

describe("TarefasPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-08-24T12:00:00-03:00"));
    vi.resetAllMocks();
    rows = [];
    configureStateApi();
    confirmMock.mockReturnValue(true);
    vi.stubGlobal("confirm", confirmMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("gerencia tarefas em Lista e Kanban com status e datas coerentes", async () => {
    const user = userEvent.setup();
    const client = createClient();
    const originalInvalidate = client.invalidateQueries.bind(client);
    let releaseInvalidation: () => void = () => undefined;
    const invalidationGate = new Promise<void>((resolve) => {
      releaseInvalidation = resolve;
    });
    const invalidate = vi
      .spyOn(client, "invalidateQueries")
      .mockImplementation(async (filters) => {
        await invalidationGate;
        return originalInvalidate(filters);
      });

    renderPage(client);

    expect(screen.getByText("Carregando…")).toBeInTheDocument();
    expect(await screen.findByText("Nenhuma tarefa cadastrada.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lista" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Nova tarefa" }));
    const dialog = screen.getByRole("dialog", { name: "Nova tarefa" });
    const status = within(dialog).getByLabelText("Status");
    const opening = within(dialog).getByLabelText("Data de abertura");
    const completion = within(dialog).getByLabelText("Data de conclusão");
    const responsible = within(dialog).getByLabelText("Responsável");
    const title = within(dialog).getByLabelText("Título");
    const description = within(dialog).getByLabelText("Descrição");

    expect(status).toHaveValue("a_fazer");
    expect(opening).toHaveValue("2026-08-24");
    expect(completion).toBeDisabled();
    expect(responsible).toHaveValue("Catarina");
    await user.type(title, "Organizar materiais");
    await user.type(description, "Separar argila");
    await user.click(within(dialog).getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(apiMock.createTarefa).toHaveBeenCalledWith({
        status: "a_fazer",
        data_abertura: "2026-08-24",
        data_conclusao: null,
        responsavel: "Catarina",
        titulo: "Organizar materiais",
        descricao: "Separar argila",
      }),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["tarefas"] });
    expect(screen.getByRole("dialog", { name: "Nova tarefa" })).toBeInTheDocument();

    releaseInvalidation();
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Nova tarefa" })).not.toBeInTheDocument(),
    );

    const kanbanButton = screen.getByRole("button", { name: "Kanban" });
    kanbanButton.focus();
    await user.keyboard("{Enter}");
    expect(kanbanButton).toHaveAttribute("aria-pressed", "true");
    const todo = screen.getByRole("region", { name: "A fazer" });
    const doing = screen.getByRole("region", { name: "Em andamento" });
    const done = screen.getByRole("region", { name: "Concluída" });
    expect(within(todo).getByRole("listitem", { name: "Organizar materiais" })).toBeInTheDocument();
    expect(within(doing).queryByRole("listitem")).not.toBeInTheDocument();
    expect(within(done).queryByRole("listitem")).not.toBeInTheDocument();

    await user.selectOptions(
      within(todo).getByLabelText("Alterar status de Organizar materiais"),
      "concluida",
    );
    await waitFor(() =>
      expect(apiMock.updateTarefa).toHaveBeenLastCalledWith("tarefa-1", {
        status: "concluida",
        data_conclusao: "2026-08-24",
      }),
    );
    const completedItem = await within(done).findByRole("listitem", {
      name: "Organizar materiais",
    });
    expect(within(todo).queryByRole("listitem")).not.toBeInTheDocument();
    expect(
      within(completedItem).getByText("Conclusão").parentElement,
    ).toHaveTextContent("24/08/2026");

    await user.click(
      within(completedItem).getByRole("button", {
        name: "Editar Organizar materiais",
      }),
    );
    const editDialog = screen.getByRole("dialog", { name: "Editar tarefa" });
    const editTitle = within(editDialog).getByLabelText("Título");
    await user.clear(editTitle);
    await user.type(editTitle, "Organizar materiais do workshop");
    await user.click(within(editDialog).getByRole("button", { name: "Salvar" }));
    await waitFor(() =>
      expect(apiMock.updateTarefa).toHaveBeenLastCalledWith("tarefa-1", {
        status: "concluida",
        data_abertura: "2026-08-24",
        data_conclusao: "2026-08-24",
        responsavel: "Catarina",
        titulo: "Organizar materiais do workshop",
        descricao: "Separar argila",
      }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Editar tarefa" })).not.toBeInTheDocument(),
    );

    const editedItem = await within(done).findByRole("listitem", {
      name: "Organizar materiais do workshop",
    });
    await user.selectOptions(
      within(editedItem).getByLabelText(
        "Alterar status de Organizar materiais do workshop",
      ),
      "em_andamento",
    );
    await waitFor(() =>
      expect(apiMock.updateTarefa).toHaveBeenLastCalledWith("tarefa-1", {
        status: "em_andamento",
        data_conclusao: null,
      }),
    );
    const reopenedItem = await within(doing).findByRole("listitem", {
      name: "Organizar materiais do workshop",
    });
    expect(within(reopenedItem).getByText("Sem conclusão")).toBeInTheDocument();

    await user.click(
      within(reopenedItem).getByRole("button", {
        name: "Excluir Organizar materiais do workshop",
      }),
    );
    expect(confirmMock).toHaveBeenCalledWith(
      'Excluir a tarefa "Organizar materiais do workshop"?',
    );
    expect(await screen.findByText("Nenhuma tarefa cadastrada.")).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledTimes(5);
  });

  it("mantém modal aberto e anuncia falha sem perder valores", async () => {
    const user = userEvent.setup();
    apiMock.createTarefa.mockRejectedValueOnce(new Error("falha tarefas"));
    renderPage();

    await screen.findByText("Nenhuma tarefa cadastrada.");
    await user.click(screen.getByRole("button", { name: "Nova tarefa" }));
    const dialog = screen.getByRole("dialog", { name: "Nova tarefa" });
    await user.type(within(dialog).getByLabelText("Título"), "Organizar materiais");
    await user.click(within(dialog).getByRole("button", { name: "Salvar" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent("falha tarefas");
    expect(within(dialog).getByLabelText("Título")).toHaveValue("Organizar materiais");
    expect(within(dialog).getByRole("button", { name: "Salvar" })).toBeEnabled();
  });

  it("renderiza Lista móvel e Kanban com semântica completa", async () => {
    const user = userEvent.setup();
    rows = [persisted()];
    renderPage();

    const mobileList = await screen.findByRole("list", {
      name: "Lista móvel de tarefas",
    });
    expect(screen.getAllByRole("table")).toHaveLength(1);
    expect(mobileList.closest("table")).toBeNull();
    expect(
      within(mobileList).getByRole("listitem", { name: "Organizar materiais" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Kanban" }));
    for (const label of ["A fazer", "Em andamento", "Concluída"]) {
      const region = screen.getByRole("region", { name: label });
      expect(within(region).getByRole("heading", { name: label })).toBeInTheDocument();
      expect(within(region).getByRole("list")).toBeInTheDocument();
    }
    expect(
      screen.getByRole("listitem", { name: "Organizar materiais" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/arrast/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /arrast/i })).not.toBeInTheDocument();
  });
});
