import { useState } from "react";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { visibleWorkspacesForRole, type MemberRole } from "@/app/access";
import { NAVIGATION_ITEMS, getWorkspaceForPath } from "@/app/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { WORKSPACES, type Workspace, type WorkspaceId } from "@/workspaces";

const COLLAPSED_KEY = "studio-parla-sidebar-collapsed";
const ROLE_LABELS: Record<MemberRole, string> = {
  professora: "Professora",
  atendimento: "Atendimento",
  admin: "Admin",
};

interface SidebarProps {
  onSignOut?: () => void;
  userName?: string | null;
  onNavigate?: () => void;
  className?: string;
  visibleWorkspaces?: readonly Workspace[];
  memberRole?: MemberRole | null;
  collapsible?: boolean;
}

export function Sidebar({
  onSignOut,
  userName,
  onNavigate,
  className,
  visibleWorkspaces = WORKSPACES,
  memberRole,
  collapsible = true,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === "1");
  const isCollapsed = collapsible && collapsed;
  const allowedWorkspaceIds = new Set(visibleWorkspacesForRole(memberRole).map(({ id }) => id));
  const workspaces = visibleWorkspaces.filter(({ id }) => allowedWorkspaceIds.has(id));
  const safeWorkspaces = workspaces.length > 0 ? workspaces : WORKSPACES.filter(({ id }) => id !== "financeiro");
  const routeWorkspace = getWorkspaceForPath(location.pathname);
  const activeWorkspace = safeWorkspaces.find(({ id }) => id === routeWorkspace.id) ?? safeWorkspaces[0];
  const ActiveWorkspaceIcon = activeWorkspace.icon;
  const roleLabel = memberRole ? ROLE_LABELS[memberRole] : "Equipe";
  const displayName = userName ?? "Studio Parla";
  const initial = displayName.trim().slice(0, 1).toUpperCase() || "S";

  const selectWorkspace = (id: WorkspaceId) => {
    const workspace = safeWorkspaces.find((item) => item.id === id);
    if (!workspace) return;
    void navigate(workspace.defaultPath);
    onNavigate?.();
  };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
  };

  return (
    <aside
      data-collapsed={String(isCollapsed)}
      className={cn(
        "sticky top-0 flex h-screen w-full shrink-0 flex-col overflow-hidden bg-background px-2.5 pt-3 transition-[width,padding] duration-300",
        isCollapsed ? "md:w-[72px] md:px-2.5" : "md:w-[254px] md:pl-3.5 md:pr-2",
        className,
      )}
    >
      <header className="flex min-h-11 shrink-0 items-center gap-2 px-1">
        <div className="relative h-9 min-w-0 flex-1">
          <img src="/brand/studio-parla-wordmark.png" alt="Studio Parla" className={cn("absolute left-1 top-1/2 h-auto w-[150px] -translate-y-1/2 object-contain transition", isCollapsed && "pointer-events-none scale-95 opacity-0")} />
          <img src="/brand/studio-parla-mark.png" alt="" className={cn("absolute left-1/2 top-1/2 h-[30px] w-auto -translate-x-1/2 -translate-y-1/2 object-contain transition", !isCollapsed && "pointer-events-none scale-90 opacity-0")} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 py-2">
        <Select value={activeWorkspace.id} onValueChange={(value) => selectWorkspace(value as WorkspaceId)}>
          <SelectTrigger aria-label="Workspace" className={cn("h-auto min-h-12 w-full rounded-xl bg-card shadow-none", isCollapsed ? "justify-center px-0 [&>svg:last-child]:hidden" : "px-3 py-2")}>
            <ActiveWorkspaceIcon />
            <span className={cn("flex min-w-0 flex-1 flex-col items-start leading-tight", isCollapsed && "sr-only")}>
              <strong className="text-[13px]">{activeWorkspace.label}</strong>
              <span className="max-w-full truncate text-[10px] font-normal text-muted-foreground">{activeWorkspace.hint}</span>
            </span>
          </SelectTrigger>
          <SelectContent position="popper" align="start" className="min-w-[226px]">
            <SelectGroup>
              {safeWorkspaces.map((workspace) => {
                const Icon = workspace.icon;
                return <SelectItem key={workspace.id} value={workspace.id}><Icon />{workspace.label}</SelectItem>;
              })}
            </SelectGroup>
          </SelectContent>
        </Select>

        <nav className="flex flex-col gap-1">
          {NAVIGATION_ITEMS.filter((item) => item.workspace === activeWorkspace.id).map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.title : undefined}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex min-h-9 items-center gap-2.5 rounded-[9px] border border-transparent px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition hover:bg-card hover:text-foreground",
                  isCollapsed && "justify-center px-0",
                  active && "border-border bg-card text-foreground shadow-sm",
                )}
              >
                <Icon />
                <span className={isCollapsed ? "sr-only" : "truncate"}>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {collapsible && <div className="mt-auto">
          <Button type="button" variant="ghost" className={cn("w-full", isCollapsed ? "px-0" : "justify-start")} aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"} onClick={toggleCollapsed}>
            {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            {!isCollapsed && "Recolher sidebar"}
          </Button>
        </div>}
      </div>

      <footer className={cn("flex min-h-16 shrink-0 items-center gap-2 border-t", isCollapsed && "justify-center")}>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{initial}</span>
        {!isCollapsed && <span className="min-w-0 flex-1 leading-tight"><strong className="block truncate text-xs">{displayName}</strong><small className="text-[10px] text-muted-foreground">{roleLabel}</small></span>}
        {onSignOut && <Button type="button" variant="ghost" size="icon" aria-label="Sair" title="Sair" onClick={onSignOut}><LogOut /></Button>}
      </footer>
    </aside>
  );
}
