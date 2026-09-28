import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import App from "@/App";

const appMocks = vi.hoisted((): {
  layoutPaths: string[];
  role: "admin" | "professora" | "atendimento";
} => ({
  layoutPaths: [] as string[],
  role: "admin",
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    loading: false,
    membershipChecked: true,
    member: { papel: appMocks.role },
  }),
}));

vi.mock("@/components/Protected", () => ({
  Protected: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/Layout", async () => {
  const { Outlet, useLocation: useRouterLocation } = await import("react-router-dom");
  return {
    Layout: () => {
      const location = useRouterLocation();
      appMocks.layoutPaths.push(location.pathname);
      return <Outlet />;
    },
  };
});

vi.mock("@/features/relatorios/RelatoriosPage", () => ({
  default: () => <div>Página de relatórios</div>,
}));

vi.mock("@/features/contatos/ContatoDetailPage", () => ({
  default: () => <div>Ficha do aluno</div>,
}));

function LocationProbe() {
  return <output aria-label="Rota atual">{useLocation().pathname}</output>;
}

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe("rotas do app enxuto", () => {
  beforeEach(() => {
    localStorage.clear();
    appMocks.layoutPaths = [];
    appMocks.role = "admin";
  });

  afterEach(() => cleanup());

  it.each(["/tarefas", "/pecas", "/calendario", "/atendimento", "/workshops", "/visao-geral", "/admin"])(
    "redireciona a rota removida %s para relatórios",
    async (path) => {
      renderApp(path);
      await waitFor(() =>
        expect(screen.getByLabelText("Rota atual")).toHaveTextContent("/relatorios"),
      );
    },
  );

  it("mantém a rota de ficha do contato fora do menu", async () => {
    renderApp("/contatos/aluna-1");
    expect(await screen.findByText("Ficha do aluno")).toBeInTheDocument();
    expect(screen.getByLabelText("Rota atual")).toHaveTextContent("/contatos/aluna-1");
  });

  it("redireciona atendimento em todas as rotas financeiras", async () => {
    appMocks.role = "atendimento";
    for (const path of ["/plano-contas", "/contas-pagar", "/contas-receber"]) {
      const view = renderApp(path);
      await waitFor(() =>
        expect(screen.getByLabelText("Rota atual")).toHaveTextContent("/relatorios"),
      );
      view.unmount();
    }
  });
});
