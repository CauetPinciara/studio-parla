import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { getNavigationItem } from "@/app/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { member, session, signOut } = useAuth();
  const page = getNavigationItem(location.pathname);
  const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }).format(new Date());
  return <div className="min-h-screen bg-background text-foreground md:flex"><div className="hidden md:block"><Sidebar onSignOut={() => void signOut()} userName={member?.nome ?? session?.user.email} /></div><Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 bg-foreground/40 md:hidden" /><Dialog.Content className="fixed inset-y-0 left-0 w-[min(86vw,300px)] bg-card shadow-2xl md:hidden"><Dialog.Title className="sr-only">Navegação principal</Dialog.Title><Dialog.Close className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground"><X /></Dialog.Close><Sidebar className="h-full border-0 pr-10" onNavigate={() => setMobileOpen(false)} onSignOut={() => void signOut()} userName={member?.nome ?? session?.user.email} /></Dialog.Content></Dialog.Portal></Dialog.Root><main className="min-w-0 flex-1"><header className="sticky top-0 flex items-center justify-between gap-4 border-b bg-background/95 px-5 py-4 backdrop-blur md:px-8 md:py-5"><div className="flex items-center gap-3"><Button className="md:hidden" size="icon" variant="outline" aria-label="Abrir menu" onClick={() => setMobileOpen(true)}><Menu /></Button><div><h1 className="text-xl font-semibold tracking-tight">{page.title}</h1><p className="mt-0.5 text-xs text-muted-foreground">{page.subtitle}</p></div></div><div className="hidden text-xs capitalize text-muted-foreground sm:block">{today} · Vitória/ES</div></header><div className="mx-auto max-w-[1080px] p-5 pb-16 md:p-8"><Outlet /></div></main></div>;
}
