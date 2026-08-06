import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Protected } from "@/components/Protected";

const authMocks = vi.hoisted(() => ({
  loading: false,
  signInWithPassword: vi.fn<(email: string, password: string) => Promise<void>>(),
  signOut: vi.fn<() => Promise<void>>(),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    session: null,
    member: null,
    loading: authMocks.loading,
    membershipChecked: true,
    accessError: null,
    signInWithPassword: authMocks.signInWithPassword,
    signOut: authMocks.signOut,
  }),
}));

vi.mock("@/lib/supabase", () => ({ supabaseConfig: { configured: true } }));

describe("gate de autenticação", () => {
  beforeEach(() => {
    authMocks.loading = false;
    authMocks.signInWithPassword.mockReset();
    authMocks.signOut.mockReset();
  });

  it("entra com e-mail e senha sem oferecer Google", async () => {
    const user = userEvent.setup();
    authMocks.signInWithPassword.mockResolvedValue();
    render(<Protected><div>Área protegida</div></Protected>);

    await user.type(screen.getByLabelText("E-mail"), "catarina@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha-segura");
    await user.click(screen.getByRole("button", { name: /^Entrar$/ }));

    expect(authMocks.signInWithPassword).toHaveBeenCalledWith("catarina@example.com", "senha-segura");
    expect(authMocks.signInWithPassword).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/google/i)).not.toBeInTheDocument();
  });

  it("mostra um erro seguro quando as credenciais são inválidas", async () => {
    const user = userEvent.setup();
    authMocks.signInWithPassword.mockRejectedValue(new Error("Invalid login credentials"));
    render(<Protected><div>Área protegida</div></Protected>);

    await user.type(screen.getByLabelText("E-mail"), "catarina@example.com");
    await user.type(screen.getByLabelText("Senha"), "incorreta");
    await user.click(screen.getByRole("button", { name: /^Entrar$/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha inválidos.");
    expect(screen.queryByText("Invalid login credentials")).not.toBeInTheDocument();
  });

  it("mantém o gate de carregamento enquanto recupera a sessão", () => {
    authMocks.loading = true;
    render(<Protected><div>Área protegida</div></Protected>);

    expect(screen.getByText("Verificando seu acesso…")).toBeInTheDocument();
    expect(screen.queryByLabelText("E-mail")).not.toBeInTheDocument();
  });
});
