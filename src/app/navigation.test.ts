import {
  DEFAULT_ROUTE,
  NAVIGATION_ITEMS,
  WORKSPACES,
  getNavigationItem,
  getWorkspaceForPath,
} from "@/app/navigation";

describe("navegação do Studio Parla", () => {
  it("mantém as 12 rotas na ordem e nos workspaces definidos", () => {
    expect(
      NAVIGATION_ITEMS.map(({ workspace, path, title }) => [workspace, path, title]),
    ).toEqual([
      ["operacao", "/relatorios", "Relatório do dia"],
      ["operacao", "/tarefas", "Tarefas"],
      ["operacao", "/pecas", "Peças & forno"],
      ["operacao", "/calendario", "Calendário"],
      ["operacao", "/atendimento", "Atendimento"],
      ["operacao", "/fechamento", "Fechamento"],
      ["cadastros", "/contatos", "Contatos"],
      ["cadastros", "/matriculas", "Matrículas"],
      ["cadastros", "/turmas", "Turmas"],
      ["cadastros", "/workshops", "Workshops & eventos"],
      ["cadastros", "/precos", "Preços & serviços"],
      ["tatica", "/visao-geral", "Visão geral"],
    ]);
  });

  it("define o primeiro destino de cada workspace", () => {
    expect(DEFAULT_ROUTE).toBe("/relatorios");
    expect(WORKSPACES.map(({ id, defaultPath }) => [id, defaultPath])).toEqual([
      ["operacao", "/relatorios"],
      ["cadastros", "/contatos"],
      ["tatica", "/visao-geral"],
    ]);
  });

  it("normaliza a barra final e usa Relatório do dia como fallback", () => {
    expect(getNavigationItem("/tarefas/").path).toBe("/tarefas");
    expect(getWorkspaceForPath("/tarefas/").id).toBe("operacao");
    expect(getNavigationItem("/pecas/").path).toBe("/pecas");
    expect(getWorkspaceForPath("/precos/").id).toBe("cadastros");
    expect(getNavigationItem("/rota-inexistente").path).toBe(DEFAULT_ROUTE);
    expect(getWorkspaceForPath("/rota-inexistente").id).toBe("operacao");
  });
});
