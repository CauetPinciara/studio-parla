import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { getNavigationItem } from "@/app/navigation";
import { Sidebar } from "@/components/Sidebar";
import { RelatorioDayHeader } from "@/features/relatorios/RelatorioDayHeader";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { member, session, signOut } = useAuth();
  const page = getNavigationItem(location.pathname);
  const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }).format(new Date());
  const isDailyReport = page.path === "/relatorios";

  return <div className="min-h-screen bg-background text-foreground md:flex"><div className="hidden md:block"><Sidebar memberEmail={member?.email ?? null} onSignOut={() => void signOut()} userName={member?.nome ?? session?.user.email} /></div><Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 bg-foreground/40 md:hidden" /><Dialog.Content className="fixed inset-y-0 left-0 w-[min(86vw,300px)] bg-card shadow-2xl md:hidden"><Dialog.Title className="sr-only">Navegação principal</Dialog.Title><Dialog.Close className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground"><X /></Dialog.Close><Sidebar className="h-full border-0 pr-10" memberEmail={member?.email ?? null} onNavigate={() => setMobileOpen(false)} onSignOut={() => void signOut()} userName={member?.nome ?? session?.user.email} /></Dialog.Content></Dialog.Portal></Dialog.Root><main className="min-w-0 flex-1"><header className="sticky top-0 flex h-16 items-center gap-2 border-b bg-card px-5 md:h-20 md:gap-3 md:px-8"><Button className="shrink-0 md:hidden" size="icon" variant="outline" aria-label="Abrir menu" onClick={() => setMobileOpen(true)}><Menu /></Button>{isDailyReport ? <RelatorioDayHeader /> : <><h1 className="min-w-0 truncate text-xl font-semibold tracking-tight">{page.title}</h1><div className="ml-auto hidden text-xs capitalize text-muted-foreground sm:block">{today} · Vitória/ES</div></>}</header><div className="mx-auto max-w-[1080px] p-5 pb-16 md:p-8"><Outlet /></div></main></div>;
}
