import { Outlet, useLocation } from "react-router-dom";
import { getNavigationItem } from "@/app/navigation";
import { Sidebar } from "@/components/Sidebar";

interface LayoutProps { onSignOut?: () => void; userName?: string | null }
export function Layout({ onSignOut, userName }: LayoutProps) {
  const location = useLocation();
  const page = getNavigationItem(location.pathname);
  const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }).format(new Date());
  return <div className="min-h-screen bg-background text-foreground md:flex"><Sidebar onSignOut={onSignOut} userName={userName} /><main className="min-w-0 flex-1"><header className="sticky top-0 flex items-baseline justify-between gap-4 border-b bg-background/95 px-5 py-4 backdrop-blur md:px-8 md:py-5"><div><h1 className="text-xl font-semibold tracking-tight">{page.title}</h1><p className="mt-0.5 text-xs text-muted-foreground">{page.subtitle}</p></div><div className="hidden text-xs capitalize text-muted-foreground sm:block">{today} · Vitória/ES</div></header><div className="mx-auto max-w-[1080px] p-5 pb-16 md:p-8"><Outlet /></div></main></div>;
}
