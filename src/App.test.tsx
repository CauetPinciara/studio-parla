import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import App from "@/App";
import { DEFAULT_ROUTE } from "@/app/navigation";
import type { Row } from "@/lib/database.types";

interface AuthState {
  loading: boolean;
  membershipChecked: boolean;
  member: Row<"app_members"> | null;
  session: unknown;
}

const appMocks = vi.hoisted(() => {
  const auth: AuthState = {
    loading: false,
    membershipChecked: true,
    member: null,
    session: null,
  };

  return {
    auth,
    layoutPaths: [] as string[],
    protectedRenders: 0,
  };
});

vi.mock("@/lib/auth", () => ({
  useAuth: () => appMocks.auth,
}));

vi.mock("@/components/Protected", () => ({
  Protected: ({ children }: { children: ReactNode }) => {
    appMocks.protectedRenders += 1;
    return children;
  },
}));

vi.mock("@/components/Layout", async () => {
  const { Outlet, useLocation: useRouterLocation } = await import(
    "react-router-dom"
  );
  return {
    Layout: () => {
      const location = useRouterLocation();
      appMocks.layoutPaths.push(location.pathname);
      return (
        <div data-testid="layout">
          <Outlet />
        </div>
      );
    },
  };
});

vi.mock("@/features/relatorios/RelatoriosPage", () => ({
  default: () => <div>Página comum</div>,
}));

function member(email: string): Row<"app_members"> {
  return {
    email,
    nome: "Catarina",
    created_at: "2026-08-26T12:00:00.000Z",
  };
}

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="Rota atual">{location.pathname}</output>;
}

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  );
}

function expectNoAdminSentinel() {
  expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  expect(screen.queryByText("Administração")).not.toBeInTheDocument();
  expect(screen.queryByText("Área administrativa")).not.toBeInTheDocument();
}

describe("posição da fronteira Admin", () => {
  beforeEach(() => {
    localStorage.clear();
    appMocks.auth = {
      loading: false,
      membershipChecked: true,
      member: null,
      session: null,
    };
    appMocks.layoutPaths = [];
    appMocks.protectedRenders = 0;
  });

  afterEach(() => cleanup());

  it("mantém /admin fora do Layout enquanto membership está pendente", () => {
    appMocks.auth.loading = true;
    appMocks.auth.membershipChecked = false;
    renderApp("/admin");

    expect(screen.getByText("Carregando…")).toBeInTheDocument();
    expect(appMocks.layoutPaths).not.toContain("/admin");
    expectNoAdminSentinel();
  });

  it("redireciona /admin para DEFAULT_ROUTE sem flash para identidade ausente ou comum", async () => {
    const absentView = renderApp("/admin");

    await waitFor(() =>
      expect(screen.getByLabelText("Rota atual")).toHaveTextContent(
        DEFAULT_ROUTE,
      ),
    );
    expect(appMocks.layoutPaths).not.toContain("/admin");
    expectNoAdminSentinel();
    absentView.unmount();

    appMocks.auth.member = member("catarina@example.com");
    renderApp("/admin");

    await waitFor(() =>
      expect(screen.getByLabelText("Rota atual")).toHaveTextContent(
        DEFAULT_ROUTE,
      ),
    );
    expect(appMocks.layoutPaths).not.toContain("/admin");
    expectNoAdminSentinel();
  });

  it("não permite que o shell preview contorne a fronteira Admin", async () => {
    localStorage.setItem("studio-parla-shell-preview", "1");
    appMocks.auth.member = member("catarina@example.com");
    renderApp("/admin");

    await waitFor(() =>
      expect(screen.getByLabelText("Rota atual")).toHaveTextContent(
        DEFAULT_ROUTE,
      ),
    );
    expect(appMocks.layoutPaths).not.toContain("/admin");
    expectNoAdminSentinel();
  });

  it("mantém rotas comuns no gate Protected existente", async () => {
    const protectedView = renderApp("/relatorios");

    expect(await screen.findByText("Página comum")).toBeInTheDocument();
    expect(appMocks.protectedRenders).toBeGreaterThan(0);
    expect(appMocks.layoutPaths).toContain("/relatorios");
    protectedView.unmount();

    localStorage.setItem("studio-parla-shell-preview", "1");
    appMocks.protectedRenders = 0;
    appMocks.layoutPaths = [];
    renderApp("/relatorios");

    expect(await screen.findByText("Página comum")).toBeInTheDocument();
    expect(appMocks.protectedRenders).toBe(0);
    expect(appMocks.layoutPaths).toContain("/relatorios");
  });
});
