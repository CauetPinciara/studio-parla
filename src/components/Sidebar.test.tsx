import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="Caminho atual">{location.pathname}</output>;
}

function renderSidebar(initialPath: string, sidebar: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      {sidebar}
      <LocationProbe />
    </MemoryRouter>,
  );
}

async function chooseWorkspace(user: UserEvent, label: string) {
  await user.click(screen.getByLabelText("Workspace"));
  await user.click(screen.getByRole("option", { name: label }));
}

describe("sidebar do app enxuto", () => {
  it("reflete o workspace da rota e usa um seletor não nativo", () => {
    renderSidebar("/contatos/aluna-1", <Sidebar memberRole="admin" />);

    const selector = screen.getByLabelText("Workspace");
    expect(selector.tagName).toBe("BUTTON");
    expect(selector).toHaveTextContent("Cadastros");
    expect(screen.getByRole("link", { name: "Alunos & contatos" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(document.querySelector('select[name="workspace"]')).toBeNull();
  });

  it("navega aos primeiros destinos dos três workspaces", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderSidebar("/relatorios", <Sidebar memberRole="admin" onNavigate={onNavigate} />);

    await chooseWorkspace(user, "Cadastros");
    await waitFor(() =>
      expect(screen.getByLabelText("Caminho atual")).toHaveTextContent("/contatos"),
    );

    await chooseWorkspace(user, "Financeiro");
    await waitFor(() =>
      expect(screen.getByLabelText("Caminho atual")).toHaveTextContent("/plano-contas"),
    );

    await chooseWorkspace(user, "Operação");
    await waitFor(() =>
      expect(screen.getByLabelText("Caminho atual")).toHaveTextContent("/relatorios"),
    );
    expect(onNavigate).toHaveBeenCalledTimes(3);
  });

  it("mostra somente os itens do workspace selecionado", async () => {
    const user = userEvent.setup();
    renderSidebar("/relatorios", <Sidebar memberRole="admin" />);

    expect(screen.getByRole("link", { name: "Aulas & confirmações" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Tarefas" })).not.toBeInTheDocument();

    await chooseWorkspace(user, "Financeiro");
    expect(screen.getByRole("link", { name: "Plano de Contas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contas a Pagar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contas a Receber" })).toBeInTheDocument();
  });

  it("não oferece o workspace Financeiro para atendimento", async () => {
    const user = userEvent.setup();
    renderSidebar("/relatorios", <Sidebar memberRole="atendimento" />);

    await user.click(screen.getByLabelText("Workspace"));
    expect(screen.queryByRole("option", { name: "Financeiro" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });
});
