import { Calculator, Folder, Zap, type LucideIcon } from "lucide-react";

export type WorkspaceId = "operacao" | "cadastros" | "financeiro";

export interface Workspace {
  id: WorkspaceId;
  label: string;
  hint: string;
  defaultPath: string;
  icon: LucideIcon;
}

export const WORKSPACES: Workspace[] = [
  {
    id: "operacao",
    label: "Operação",
    hint: "Uso diário do ateliê",
    defaultPath: "/relatorios",
    icon: Zap,
  },
  {
    id: "cadastros",
    label: "Cadastros",
    hint: "Pessoas, turmas e serviços",
    defaultPath: "/contatos",
    icon: Folder,
  },
  {
    id: "financeiro",
    label: "Financeiro",
    hint: "Plano de contas, pagar e receber",
    defaultPath: "/plano-contas",
    icon: Calculator,
  },
];
