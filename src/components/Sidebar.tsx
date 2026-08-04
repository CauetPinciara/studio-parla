import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { NAVIGATION_ITEMS, WORKSPACES, getWorkspaceForPath, type WorkspaceId } from "@/app/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps { onSignOut?: () => void; userName?: string | null }

export function Sidebar({ onSignOut, userName }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeWorkspace = getWorkspaceForPath(location.pathname);
  const selectWorkspace = (id: WorkspaceId) => { const workspace = WORKSPACES.find((item) => item.id === id); if (workspace) void navigate(workspace.defaultPath); };
  return <aside className="sticky top-0 flex h-screen w-full shrink-0 flex-col border-r bg-card px-3 py-5 md:w-[242px]">
    <div className="flex items-center gap-2 px-2 pb-5"><div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">◡</div><div><div className="text-[15px] font-semibold">Studio Parla</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Painel interno</div></div></div>
    <div className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Workspace</div>
    <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1" aria-label="Workspace">{WORKSPACES.map((workspace) => <button key={workspace.id} onClick={() => selectWorkspace(workspace.id)} className={cn("rounded-lg px-1 py-2 text-xs font-semibold text-muted-foreground transition", activeWorkspace.id === workspace.id && "bg-background text-primary shadow-sm")}>{workspace.label}</button>)}</div>
    <div className="px-2 py-2 text-[11px] text-muted-foreground">{activeWorkspace.hint}</div>
    <nav className="flex flex-col gap-1">{NAVIGATION_ITEMS.filter((item) => item.workspace === activeWorkspace.id).map((item) => { const Icon = item.icon; const active = location.pathname === item.path; return <Link key={item.path} to={item.path} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground", active && "bg-primary/10 text-primary")}><Icon />{item.title}</Link>; })}</nav>
    <div className="mt-auto flex flex-col gap-2 border-t pt-3"><div className="truncate px-2 text-xs text-muted-foreground">{userName ?? "Dados persistidos no Supabase"}</div>{onSignOut && <Button variant="ghost" size="sm" onClick={onSignOut}><LogOut data-icon="inline-start" />Sair</Button>}</div>
  </aside>;
}
