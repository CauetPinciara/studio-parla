import { useState } from "react";
import { LogOut, PanelLeft } from "lucide-react";
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
        "sticky top-0 flex h-screen w-full shrink-0 flex-col gap-3 overflow-hidden bg-background transition-[width,padding] duration-[260ms] ease-[cubic-bezier(.4,0,.2,1)] md:w-[254px] md:pt-3.5 md:pr-2 md:pb-0 md:pl-3.5",
        isCollapsed && "md:w-[72px] md:pr-2.5 md:pl-3.5",
        className,
      )}
    >
      <header className="flex min-h-10 shrink-0 items-center px-0.5 pt-0.5">
        <div className="relative flex h-[34px] w-full items-center">
          <img
            src="/brand/studio-parla-wordmark.png"
            alt="Studio Parla"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              display: "block",
              width: 150,
              height: "auto",
              transition: "opacity .2s ease, transform .26s cubic-bezier(.4,0,.2,1)",
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? "translate(-50%,-50%) scale(.94)" : "translate(-50%,-50%)",
              pointerEvents: isCollapsed ? "none" : undefined,
            }}
          />
          <img
            src="/brand/studio-parla-mark.png"
            alt=""
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              display: "block",
              width: "auto",
              height: 30,
              transition: "opacity .2s ease, transform .26s cubic-bezier(.4,0,.2,1)",
              opacity: isCollapsed ? 1 : 0,
              transform: isCollapsed ? "translate(-50%,-50%)" : "translate(-50%,-50%) scale(.9)",
              pointerEvents: isCollapsed ? undefined : "none",
            }}
          />
        </div>
      </header>

      <div className="border-sidebar-divider border-t border-dashed" />

      <div className="flex flex-col gap-1.5">
        <Select value={activeWorkspace.id} onValueChange={(value) => selectWorkspace(value as WorkspaceId)}>
          <SelectTrigger aria-label="Workspace" className={cn("h-auto w-full rounded-xl border-border bg-card text-left text-foreground leading-[1.5] shadow-none outline-none data-[size=default]:h-auto focus-visible:border-border focus-visible:ring-0 [&>svg:last-child]:!text-foreground [&>svg:last-child]:opacity-45", isCollapsed ? "justify-center px-0 py-1.5 [&>svg:last-child]:hidden" : "px-3 py-2")}>
            <span className={cn("flex min-w-0 items-center gap-2.5", isCollapsed && "justify-center")}>
              <span className="bg-workspace-icon-background text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-[9px]"><ActiveWorkspaceIcon size={16} className="text-secondary-foreground" /></span>
              <span className={cn("flex min-w-0 flex-1 flex-col items-start", isCollapsed && "sr-only")}>
                <span className="text-quiet-foreground text-[10px] font-semibold tracking-[.1em] uppercase">{activeWorkspace.hint}</span>
                <strong className="max-w-full truncate text-sm leading-[1.5] font-semibold">{activeWorkspace.label}</strong>
              </span>
            </span>
          </SelectTrigger>
          <SelectContent position="popper" align="start" className="w-[200px] min-w-[200px] rounded-lg shadow-[0_12px_32px_rgba(30,20,10,.16)]" viewportClassName="h-auto min-w-0">
            <SelectGroup>
              {safeWorkspaces.map((workspace) => {
                const Icon = workspace.icon;
                return <SelectItem className="focus:bg-white focus:text-foreground" key={workspace.id} value={workspace.id}><Icon size={16} />{workspace.label}</SelectItem>;
              })}
            </SelectGroup>
          </SelectContent>
        </Select>

      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
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
                "text-nav-foreground flex items-center gap-2.5 rounded-[9px] border border-transparent px-2.5 py-[7px] text-[13px] font-medium no-underline",
                isCollapsed && "justify-center px-0 py-2",
                active && "border-border bg-card text-foreground shadow-[0_1px_2px_rgba(24,20,18,.05)]",
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className={isCollapsed ? "sr-only" : "flex min-w-0 flex-col truncate"}>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {collapsible && <div className={cn("flex shrink-0 p-0", isCollapsed && "justify-center")}>
        <Button type="button" variant="ghost" className={cn("text-toggle-foreground h-[38px] w-full justify-start gap-2.5 rounded-[9px] px-2.5 text-[13px] font-medium focus-visible:ring-0", isCollapsed && "w-[38px] justify-center px-0")} aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"} onClick={toggleCollapsed}>
          <span className="text-muted-foreground flex shrink-0"><PanelLeft size={16} /></span>
          <span className={cn("min-w-0 overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-[260ms]", isCollapsed && "max-w-0 opacity-0")}>{isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}</span>
        </Button>
      </div>}

      <footer className={cn("flex h-16 shrink-0 items-center gap-2 border-t", isCollapsed && "justify-center")}>
        <div className={cn("flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1 text-left", isCollapsed && "justify-center")}>
          <span
            style={{
              display: "flex",
              width: 28,
              height: 28,
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              borderRadius: 999,
              background: "hsl(340 72% 64%)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              lineHeight: "18px",
            }}
          ><span>{initial}</span></span>
          {!isCollapsed && <span className="flex min-w-0 flex-col items-start text-left"><span className="max-w-full truncate text-[13px] font-semibold">{displayName}</span><span className="text-quiet-foreground text-[11px] whitespace-nowrap">{roleLabel}</span></span>}
        </div>
        {!isCollapsed && onSignOut && <Button type="button" variant="ghost" className="text-muted-foreground size-[30px] shrink-0 rounded-lg p-0 focus-visible:ring-0" aria-label="Sair" title="Sair" onClick={onSignOut}><LogOut size={16} /></Button>}
      </footer>
    </aside>
  );
}
