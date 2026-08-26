import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { DEFAULT_ROUTE } from "@/app/navigation";
import { AdminAccessBoundary } from "@/components/AdminAccessBoundary";
import type { Row } from "@/lib/database.types";

interface AuthState {
  loading: boolean;
  membershipChecked: boolean;
  member: Row<"app_members"> | null;
  session: unknown;
}

const authMocks = vi.hoisted(() => {
  const state: AuthState = {
    loading: false,
    membershipChecked: true,
    member: null,
    session: null,
  };

  return { state };
});

vi.mock("@/lib/auth", () => ({
  useAuth: () => authMocks.state,
}));

function member(email: string, nome: string | null = null): Row<"app_members"> {
  return {
    email,
    nome,
    created_at: "2026-08-26T12:00:00.000Z",
  };
}

const AdminChild = vi.fn(function AdminChild() {
  return (
    <div>
      <span>Admin</span>
      <span>Administração</span>
      <span>Área administrativa</span>
    </div>
  );
});

function LocationProbe() {
  const location = useLocation();
  return (
    <output aria-label="Local atual">
      {location.pathname}
      {location.search}
    </output>
  );
}

function renderBoundary(initialPath = "/admin") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AdminAccessBoundary>
        <AdminChild />
      </AdminAccessBoundary>
      <LocationProbe />
    </MemoryRouter>,
  );
}

function expectNoAdminContent() {
  expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  expect(screen.queryByText("Administração")).not.toBeInTheDocument();
  expect(screen.queryByText("Área administrativa")).not.toBeInTheDocument();
  expect(AdminChild).not.toHaveBeenCalled();
}

describe("fronteira de acesso Admin", () => {
  beforeEach(() => {
    localStorage.clear();
    AdminChild.mockClear();
    authMocks.state = {
      loading: false,
      membershipChecked: true,
      member: null,
      session: null,
    };
  });

  afterEach(() => cleanup());

  it("oculta os filhos enquanto autenticação ou membership estão pendentes", () => {
    authMocks.state.loading = true;
    const loadingView = renderBoundary();

    expect(screen.getByText("Carregando…")).toBeInTheDocument();
    expectNoAdminContent();
    loadingView.unmount();

    authMocks.state.loading = false;
    authMocks.state.membershipChecked = false;
    renderBoundary();

    expect(screen.getByText("Carregando…")).toBeInTheDocument();
    expectNoAdminContent();
  });

  it("redireciona identidade ausente ou membro comum sem montar filhos", async () => {
    const absentView = renderBoundary();

    await waitFor(() =>
      expect(screen.getByLabelText("Local atual")).toHaveTextContent(
        DEFAULT_ROUTE,
      ),
    );
    expectNoAdminContent();
    absentView.unmount();

    authMocks.state.member = member("catarina@example.com");
    renderBoundary();

    await waitFor(() =>
      expect(screen.getByLabelText("Local atual")).toHaveTextContent(
        DEFAULT_ROUTE,
      ),
    );
    expectNoAdminContent();
  });

  it("ignora sessão, nome, localStorage e URL como sinais de autorização", async () => {
    localStorage.setItem("admin-email", "cauetpinciara@gmail.com");
    authMocks.state.session = {
      user: { email: "cauetpinciara@gmail.com" },
    };
    authMocks.state.member = member(
      "catarina@example.com",
      "cauetpinciara@gmail.com",
    );
    renderBoundary("/admin?email=cauetpinciara@gmail.com");

    await waitFor(() =>
      expect(screen.getByLabelText("Local atual")).toHaveTextContent(
        DEFAULT_ROUTE,
      ),
    );
    expectNoAdminContent();
  });

  it("renderiza o filho somente para member.email confirmado e normalizado", () => {
    authMocks.state.member = member("  CauetPinciara@GMAIL.COM  ");
    renderBoundary();

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Administração")).toBeInTheDocument();
    expect(screen.getByText("Área administrativa")).toBeInTheDocument();
    expect(screen.getByLabelText("Local atual")).toHaveTextContent("/admin");
    expect(AdminChild).toHaveBeenCalledTimes(1);
  });
});
