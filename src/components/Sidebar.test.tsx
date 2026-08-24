import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { WORKSPACES } from "@/workspaces";

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="Caminho atual">{location.pathname}</output>;
}

function renderSidebar(
  initialPath: string,
  sidebar: ReactNode,
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      {sidebar}
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe("seletor acessível de workspace", () => {
  it("associa label e dica, reflete a rota e mantém ids únicos sem tabs", () => {
    renderSidebar(
      "/precos",
      <>
        <Sidebar />
        <Sidebar />
      </>,
    );

    const selectors = screen.getAllByLabelText("Workspace");
    expect(selectors).toHaveLength(2);
    expect(selectors[0]).toHaveValue("cadastros");
    expect(selectors[1]).toHaveValue("cadastros");
    expect(selectors[0].id).not.toBe(selectors[1].id);
    expect(selectors[0].getAttribute("aria-describedby")).not.toBe(
      selectors[1].getAttribute("aria-describedby"),
    );

    for (const selector of selectors) {
      const hintId = selector.getAttribute("aria-describedby");
      expect(hintId).toBeTruthy();
      expect(document.getElementById(hintId!)).toHaveTextContent(
        "Pessoas, turmas e serviços",
      );
    }
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("navega ao primeiro destino de cada opção e depois chama onNavigate", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderSidebar(
      "/tarefas",
      <Sidebar onNavigate={onNavigate} />,
    );
    const selector = screen.getByLabelText("Workspace");

    await user.selectOptions(selector, "cadastros");
    await waitFor(() => expect(screen.getByLabelText("Caminho atual")).toHaveTextContent("/contatos"));
    expect(onNavigate).toHaveBeenCalledTimes(1);

    await user.selectOptions(selector, "tatica");
    await waitFor(() => expect(screen.getByLabelText("Caminho atual")).toHaveTextContent("/visao-geral"));
    expect(onNavigate).toHaveBeenCalledTimes(2);

    await user.selectOptions(selector, "operacao");
    await waitFor(() => expect(screen.getByLabelText("Caminho atual")).toHaveTextContent("/relatorios"));
    expect(onNavigate).toHaveBeenCalledTimes(3);
  });

  it("usa a primeira opção visível em rota oculta sem navegar sozinho", () => {
    const onNavigate = vi.fn();
    renderSidebar(
      "/precos",
      <Sidebar
        visibleWorkspaces={[WORKSPACES[0], WORKSPACES[2]]}
        onNavigate={onNavigate}
      />,
    );

    const selector = screen.getByLabelText("Workspace");
    expect(selector).toHaveValue("operacao");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("option", { name: "Operação" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Tática" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Cadastros" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Relatório do dia" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Preços & serviços" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Caminho atual")).toHaveTextContent("/precos");
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
