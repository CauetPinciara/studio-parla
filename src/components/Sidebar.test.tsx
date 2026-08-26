import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { WORKSPACES, type Workspace } from "@/workspaces";

const adminWorkspace: Workspace = {
  id: "admin",
  label: "Admin",
  hint: "Configurações do sistema",
  defaultPath: "/admin",
};

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
  const selector = screen.getByLabelText("Workspace");
  await user.click(selector);
  await user.click(screen.getByRole("option", { name: label }));
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
    expect(selectors[0].tagName).toBe("BUTTON");
    expect(selectors[1].tagName).toBe("BUTTON");
    expect(selectors[0]).toHaveTextContent("Cadastros");
    expect(selectors[1]).toHaveTextContent("Cadastros");
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
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(document.querySelector('select[name="workspace"]')).toBeNull();
    expect(document.querySelector("[aria-selected]")).not.toBeInTheDocument();
  });

  it("navega ao primeiro destino de cada opção e depois chama onNavigate", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderSidebar("/tarefas", <Sidebar onNavigate={onNavigate} />);
    await chooseWorkspace(user, "Cadastros");
    await waitFor(() =>
      expect(screen.getByLabelText("Caminho atual")).toHaveTextContent(
        "/contatos",
      ),
    );
    expect(onNavigate).toHaveBeenCalledTimes(1);

    await chooseWorkspace(user, "Tática");
    await waitFor(() =>
      expect(screen.getByLabelText("Caminho atual")).toHaveTextContent(
        "/visao-geral",
      ),
    );
    expect(onNavigate).toHaveBeenCalledTimes(2);

    await chooseWorkspace(user, "Operação");
    await waitFor(() =>
      expect(screen.getByLabelText("Caminho atual")).toHaveTextContent(
        "/relatorios",
      ),
    );
    expect(onNavigate).toHaveBeenCalledTimes(3);
  });

  it("usa a primeira opção visível em rota oculta sem navegar sozinho", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderSidebar(
      "/precos",
      <Sidebar
        visibleWorkspaces={[WORKSPACES[0], WORKSPACES[2]]}
        onNavigate={onNavigate}
      />,
    );

    const selector = screen.getByLabelText("Workspace");
    expect(selector).toHaveTextContent("Operação");
    expect(
      screen.getByRole("link", { name: "Relatório do dia" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Preços & serviços" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Caminho atual")).toHaveTextContent(
      "/precos",
    );
    expect(onNavigate).not.toHaveBeenCalled();

    await user.click(selector);
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(
      screen.getByRole("option", { name: "Operação" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Tática" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Cadastros" }),
    ).not.toBeInTheDocument();
  });

  it("mostra Admin somente para o member superadmin", async () => {
    const user = userEvent.setup();
    renderSidebar(
      "/admin",
      <Sidebar memberEmail="  CauetPinciara@GMAIL.COM  " />,
    );

    const selector = screen.getByLabelText("Workspace");
    expect(selector).toHaveTextContent("Admin");
    expect(
      screen.getByRole("link", { name: "Administração" }),
    ).toHaveAttribute("aria-current", "page");

    await user.click(selector);
    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect(screen.getByRole("option", { name: "Admin" })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Operação" }));
    await chooseWorkspace(user, "Admin");
    await waitFor(() =>
      expect(screen.getByLabelText("Caminho atual")).toHaveTextContent(
        "/admin",
      ),
    );
  });

  it("omite Admin para member comum ou ausente", async () => {
    const user = userEvent.setup();
    const absentView = renderSidebar("/admin", <Sidebar />);

    expect(
      screen.queryByRole("link", { name: "Administração" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Configurações do sistema")).not.toBeInTheDocument();
    const absentSelector = screen.getByLabelText("Workspace");
    await user.click(absentSelector);
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(
      screen.queryByRole("option", { name: "Admin" }),
    ).not.toBeInTheDocument();
    absentView.unmount();

    renderSidebar(
      "/admin",
      <Sidebar memberEmail="catarina@example.com" />,
    );
    expect(
      screen.queryByRole("link", { name: "Administração" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Configurações do sistema")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Workspace"));
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(
      screen.queryByRole("option", { name: "Admin" }),
    ).not.toBeInTheDocument();
  });

  it("recupera uma lista somente Admin para member comum sem navegar", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderSidebar(
      "/admin",
      <Sidebar
        memberEmail="catarina@example.com"
        visibleWorkspaces={[adminWorkspace]}
        onNavigate={onNavigate}
      />,
    );

    const selector = screen.getByLabelText("Workspace");
    expect(selector).toHaveTextContent("Operação");
    expect(
      screen.getByRole("link", { name: "Relatório do dia" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Admin" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Caminho atual")).toHaveTextContent("/admin");
    expect(onNavigate).not.toHaveBeenCalled();

    await user.click(selector);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });
});
