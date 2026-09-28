import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FinanceAccessBoundary } from "@/components/FinanceAccessBoundary";

const auth = vi.hoisted((): {
  loading: boolean;
  membershipChecked: boolean;
  member: { papel: "admin" | "professora" | "atendimento" } | null;
} => ({
  loading: false,
  membershipChecked: true,
  member: { papel: "admin" },
}));

vi.mock("@/lib/auth", () => ({ useAuth: () => auth }));

function Probe() {
  const location = useLocation();
  return <output aria-label="Rota atual">{location.pathname}</output>;
}

function renderBoundary() {
  render(
    <MemoryRouter initialEntries={["/contas-pagar"]}>
      <Routes>
        <Route path="/relatorios" element={<><div>Relatórios</div><Probe /></>} />
        <Route
          path="/contas-pagar"
          element={
            <FinanceAccessBoundary>
              <div>Financeiro</div>
            </FinanceAccessBoundary>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("proteção do Financeiro", () => {
  beforeEach(() => {
    auth.loading = false;
    auth.membershipChecked = true;
    auth.member = { papel: "admin" };
  });

  it("permite professora e admin", () => {
    auth.member = { papel: "professora" };
    renderBoundary();
    expect(screen.getByText("Financeiro")).toBeInTheDocument();
  });

  it("redireciona atendimento para relatórios", async () => {
    auth.member = { papel: "atendimento" };
    renderBoundary();
    expect(await screen.findByText("Relatórios")).toBeInTheDocument();
    expect(screen.getByLabelText("Rota atual")).toHaveTextContent("/relatorios");
  });

  it("não mostra conteúdo enquanto a associação está pendente", () => {
    auth.membershipChecked = false;
    renderBoundary();
    expect(screen.getByText("Carregando…")).toBeInTheDocument();
    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
  });
});
