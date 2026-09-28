import {
  DEFAULT_ROUTE,
  NAVIGATION_ITEMS,
  WORKSPACES,
  getNavigationItem,
  getWorkspaceForPath,
} from "@/app/navigation";

describe("navegação do Studio Parla", () => {
  it("expõe os 12 destinos do app enxuto na ordem definida", () => {
    expect(
      NAVIGATION_ITEMS.map(({ workspace, path, title }) => [workspace, path, title]),
    ).toEqual([
      ["operacao", "/relatorios", "Relatório do dia"],
      ["operacao", "/confirmacoes", "Aulas & confirmações"],
      ["operacao", "/avisos", "Avisos de falta"],
      ["operacao", "/fechamento", "Fechamento"],
      ["cadastros", "/contatos", "Alunos & contatos"],
      ["cadastros", "/matriculas", "Matrículas"],
      ["cadastros", "/turmas", "Turmas"],
      ["cadastros", "/promocoes", "Promoções & mensalidades"],
      ["cadastros", "/precos", "Preços & serviços"],
      ["financeiro", "/plano-contas", "Plano de Contas"],
      ["financeiro", "/contas-pagar", "Contas a Pagar"],
      ["financeiro", "/contas-receber", "Contas a Receber"],
    ]);
  });

  it("define os três workspaces e seus primeiros destinos", () => {
    expect(DEFAULT_ROUTE).toBe("/relatorios");
    expect(WORKSPACES.map(({ id, defaultPath }) => [id, defaultPath])).toEqual([
      ["operacao", "/relatorios"],
      ["cadastros", "/contatos"],
      ["financeiro", "/plano-contas"],
    ]);
  });

  it("mantém Cadastros ativo na ficha de um contato", () => {
    expect(getNavigationItem("/contatos/aluna-1").path).toBe("/contatos");
    expect(getWorkspaceForPath("/contatos/aluna-1").id).toBe("cadastros");
  });

  it("normaliza a barra final e usa Relatório do dia como fallback", () => {
    expect(getNavigationItem("/confirmacoes/").path).toBe("/confirmacoes");
    expect(getWorkspaceForPath("/contas-receber/").id).toBe("financeiro");
    expect(getNavigationItem("/tarefas").path).toBe(DEFAULT_ROUTE);
    expect(getWorkspaceForPath("/admin").id).toBe("operacao");
  });
});
