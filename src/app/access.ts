import { WORKSPACES, type Workspace, type WorkspaceId } from "@/workspaces";

export const SUPERADMIN_EMAIL = "cauetpinciara@gmail.com" as const;

export type MemberRole = "professora" | "atendimento" | "admin";

export function canAccessWorkspace(
  role: MemberRole | null | undefined,
  workspace: WorkspaceId,
): boolean {
  if (!role) return false;
  return workspace !== "financeiro" || role !== "atendimento";
}

export function visibleWorkspacesForRole(
  role: MemberRole | null | undefined,
): Workspace[] {
  return WORKSPACES.filter((workspace) => canAccessWorkspace(role, workspace.id));
}

export function isSuperadminEmail(
  email: string | null | undefined,
): boolean {
  return email?.trim().toLowerCase() === SUPERADMIN_EMAIL;
}
