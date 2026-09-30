import {
  Calculator,
  CircleCheckBig,
  ClipboardList,
  ContactRound,
  Folder,
  GraduationCap,
  ListTodo,
  PanelsTopLeft,
  Percent,
  Tags,
  createLucideIcon,
  type LucideIcon,
} from "lucide-react";
import { WORKSPACES, type WorkspaceId } from "@/workspaces";

export type { WorkspaceId } from "@/workspaces";
export { WORKSPACES } from "@/workspaces";

export interface NavigationItem {
  workspace: WorkspaceId;
  path: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export const DEFAULT_ROUTE = "/relatorios";

const CalendarX2 = createLucideIcon("CalendarX2", [
  ["path", { d: "M8 2v4", key: "start" }],
  ["path", { d: "M16 2v4", key: "end" }],
  ["rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", key: "calendar" }],
  ["path", { d: "M3 10h18", key: "divider" }],
  ["path", { d: "m17 22 5-5", key: "x-forward" }],
  ["path", { d: "m17 17 5 5", key: "x-back" }],
]);

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { workspace: "operacao", path: "/relatorios", title: "Relatório do dia", subtitle: "Presenças que a Catarina registra na aula", icon: ClipboardList },
  { workspace: "operacao", path: "/confirmacoes", title: "Aulas & confirmações", subtitle: "Quem confirmou presença nas próximas aulas", icon: CircleCheckBig },
  { workspace: "operacao", path: "/avisos", title: "Avisos de falta", subtitle: "O que a Isabela recebe pelo WhatsApp", icon: CalendarX2 },
  { workspace: "operacao", path: "/fechamento", title: "Fechamento", subtitle: "Calculadora do mês - gera a mensagem pronta", icon: Calculator },
  { workspace: "cadastros", path: "/contatos", title: "Alunos & contatos", subtitle: "Todo mundo - a lista mestre de pessoas", icon: ContactRound },
  { workspace: "cadastros", path: "/matriculas", title: "Matrículas", subtitle: "Vínculo aluno e turma", icon: GraduationCap },
  { workspace: "cadastros", path: "/turmas", title: "Turmas", subtitle: "As turmas fixas e quem está em cada uma", icon: PanelsTopLeft },
  { workspace: "cadastros", path: "/promocoes", title: "Promoções & mensalidades", subtitle: "O que a Isabela pode oferecer", icon: Percent },
  { workspace: "cadastros", path: "/precos", title: "Preços & serviços", subtitle: "A tabela de venda do ateliê", icon: Tags },
  { workspace: "financeiro", path: "/plano-contas", title: "Plano de Contas", subtitle: "Grupos, subgrupos e categorias do ateliê", icon: Folder },
  { workspace: "financeiro", path: "/contas-pagar", title: "Contas a Pagar", subtitle: "O que sai - vencimentos e pagamentos", icon: ListTodo },
  { workspace: "financeiro", path: "/contas-receber", title: "Contas a Receber", subtitle: "O que entra - mensalidades, queimas e workshops", icon: Tags },
];

function normalizePath(pathname: string) {
  return pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
}

export function getNavigationItem(pathname: string) {
  const normalized = normalizePath(pathname);
  return NAVIGATION_ITEMS.find(
    (item) => normalized === item.path || normalized.startsWith(`${item.path}/`),
  ) ?? NAVIGATION_ITEMS[0];
}

export function getWorkspaceForPath(pathname: string) {
  const item = getNavigationItem(pathname);
  return WORKSPACES.find((workspace) => workspace.id === item.workspace) ?? WORKSPACES[0];
}
