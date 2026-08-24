import {
  CalendarDays,
  Calculator,
  CircleGauge,
  ClipboardList,
  ContactRound,
  Flame,
  GraduationCap,
  ListTodo,
  MessageCircle,
  PanelsTopLeft,
  Sparkles,
  Tags,
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

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { workspace: "operacao", path: "/relatorios", title: "Relatório do dia", subtitle: "O que a Catarina registra no fim de cada aula", icon: ClipboardList },
  { workspace: "operacao", path: "/tarefas", title: "Tarefas", subtitle: "Pendências e responsáveis do dia a dia", icon: ListTodo },
  { workspace: "operacao", path: "/pecas", title: "Peças & forno", subtitle: "Produção, estimativas e retiradas", icon: Flame },
  { workspace: "operacao", path: "/calendario", title: "Calendário", subtitle: "Turmas, workshops, avulsas e eventos", icon: CalendarDays },
  { workspace: "operacao", path: "/atendimento", title: "Atendimento", subtitle: "Mensagens prontas no tom do Studio Parla", icon: MessageCircle },
  { workspace: "operacao", path: "/fechamento", title: "Fechamento", subtitle: "Calculadora do mês — gera a mensagem pronta", icon: Calculator },
  { workspace: "cadastros", path: "/contatos", title: "Contatos", subtitle: "Todo mundo — a lista mestre de pessoas", icon: ContactRound },
  { workspace: "cadastros", path: "/matriculas", title: "Matrículas", subtitle: "Vínculo aluno ↔ turma", icon: GraduationCap },
  { workspace: "cadastros", path: "/turmas", title: "Turmas", subtitle: "As turmas fixas e quem está em cada uma", icon: PanelsTopLeft },
  { workspace: "cadastros", path: "/workshops", title: "Workshops & eventos", subtitle: "Eventos pontuais e inscritos", icon: Sparkles },
  { workspace: "cadastros", path: "/precos", title: "Preços & serviços", subtitle: "A tabela de venda do ateliê", icon: Tags },
  { workspace: "tatica", path: "/visao-geral", title: "Visão geral", subtitle: "Retrato 360 do ateliê num lugar só", icon: CircleGauge },
];

function normalizePath(pathname: string) {
  return pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
}

export function getNavigationItem(pathname: string) {
  const normalized = normalizePath(pathname);
  return NAVIGATION_ITEMS.find((item) => item.path === normalized) ?? NAVIGATION_ITEMS[0];
}

export function getWorkspaceForPath(pathname: string) {
  const item = getNavigationItem(pathname);
  return WORKSPACES.find((workspace) => workspace.id === item.workspace) ?? WORKSPACES[0];
}
