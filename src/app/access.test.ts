import { canAccessWorkspace, visibleWorkspacesForRole } from "@/app/access";

describe("acesso por papel", () => {
  it.each(["professora", "admin"] as const)(
    "permite todos os workspaces para %s",
    (role) => {
      expect(visibleWorkspacesForRole(role).map(({ id }) => id)).toEqual([
        "operacao",
        "cadastros",
        "financeiro",
      ]);
      expect(canAccessWorkspace(role, "financeiro")).toBe(true);
    },
  );

  it("oculta Financeiro de atendimento", () => {
    expect(visibleWorkspacesForRole("atendimento").map(({ id }) => id)).toEqual([
      "operacao",
      "cadastros",
    ]);
    expect(canAccessWorkspace("atendimento", "financeiro")).toBe(false);
  });

  it("nega acesso quando o papel ainda não foi carregado", () => {
    expect(canAccessWorkspace(null, "financeiro")).toBe(false);
    expect(canAccessWorkspace(undefined, "operacao")).toBe(false);
  });
});
