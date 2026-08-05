export type WorkspaceId = "operacao" | "cadastros" | "tatica";
export interface Workspace { id: WorkspaceId; label: string; hint: string; defaultPath: string }
export const WORKSPACES: Workspace[] = [
  { id: "operacao", label: "Operação", hint: "Uso diário do ateliê", defaultPath: "/relatorios" },
  { id: "cadastros", label: "Cadastros", hint: "Pessoas, turmas e serviços", defaultPath: "/contatos" },
  { id: "tatica", label: "Tática", hint: "Visão geral e estratégia", defaultPath: "/visao-geral" },
];
