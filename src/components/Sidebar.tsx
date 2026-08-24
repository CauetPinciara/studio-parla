import { useId } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { NAVIGATION_ITEMS, getWorkspaceForPath } from "@/app/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect } from "@/features/shared/FormParts";
import { cn } from "@/lib/utils";
import {
  WORKSPACES,
  type Workspace,
  type WorkspaceId,
} from "@/workspaces";

interface SidebarProps {
  onSignOut?: () => void;
  userName?: string | null;
  onNavigate?: () => void;
  className?: string;
  visibleWorkspaces?: readonly Workspace[];
}

export function Sidebar({
  onSignOut,
  userName,
  onNavigate,
  className,
  visibleWorkspaces = WORKSPACES,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const selectId = useId();
  const hintId = useId();
  const workspaces = visibleWorkspaces.length > 0
    ? visibleWorkspaces
    : WORKSPACES;
  const routeWorkspace = getWorkspaceForPath(location.pathname);
  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === routeWorkspace.id,
  ) ?? workspaces[0];

  const selectWorkspace = (id: WorkspaceId) => {
    const workspace = workspaces.find((item) => item.id === id);
    if (!workspace) return;

    void navigate(workspace.defaultPath);
    onNavigate?.();
  };

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen w-full shrink-0 flex-col border-r bg-card px-3 py-5 md:w-[242px]",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-2 pb-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          ◡
        </div>
        <div>
          <h2 className="text-[15px] font-semibold">Studio Parla</h2>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Painel interno
          </div>
        </div>
      </div>

      <Field className="px-2">
        <FieldLabel htmlFor={selectId}>Workspace</FieldLabel>
        <NativeSelect
          id={selectId}
          name="workspace"
          value={activeWorkspace.id}
          aria-describedby={hintId}
          onChange={(event) =>
            selectWorkspace(event.target.value as WorkspaceId)
          }
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <div
        id={hintId}
        className="px-2 py-2 text-[11px] text-muted-foreground"
      >
        {activeWorkspace.hint}
      </div>

      <nav className="flex flex-col gap-1">
        {NAVIGATION_ITEMS.filter(
          (item) => item.workspace === activeWorkspace.id,
        ).map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground",
                active && "bg-primary/10 text-primary",
              )}
            >
              <Icon />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t pt-3">
        <div className="truncate px-2 text-xs text-muted-foreground">
          {userName ?? "Dados persistidos no Supabase"}
        </div>
        {onSignOut && (
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut data-icon="inline-start" />
            Sair
          </Button>
        )}
      </div>
    </aside>
  );
}
