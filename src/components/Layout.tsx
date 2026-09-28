import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { getNavigationItem } from "@/app/navigation";
import { Sidebar } from "@/components/Sidebar";
import { PageHeaderActionProvider } from "@/components/PageHeaderAction";
import { Button } from "@/components/ui/button";
import { RelatorioDayHeader } from "@/features/relatorios/RelatorioDayHeader";
import { useAuth } from "@/lib/auth";

export function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerActionTarget, setHeaderActionTarget] = useState<HTMLDivElement | null>(null);
  const { member, session, signOut } = useAuth();
  const page = getNavigationItem(location.pathname);
  const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }).format(new Date());
  const isDailyReport = page.path === "/relatorios";
  const PageIcon = page.icon;
  const sidebar = <Sidebar memberRole={member?.papel} onSignOut={() => void signOut()} userName={member?.nome ?? session?.user.email} />;

  return (
    <PageHeaderActionProvider target={headerActionTarget}>
    <div className="min-h-screen bg-background text-foreground md:flex">
      <div className="hidden md:block">{sidebar}</div>
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-foreground/40 md:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(86vw,300px)] bg-background shadow-2xl md:hidden">
            <Dialog.Title className="sr-only">Navegação principal</Dialog.Title>
            <Dialog.Close className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground"><X /></Dialog.Close>
            <Sidebar className="h-full pr-10" collapsible={false} memberRole={member?.papel} onNavigate={() => setMobileOpen(false)} onSignOut={() => void signOut()} userName={member?.nome ?? session?.user.email} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <main className="min-w-0 flex-1 bg-background pt-2 md:pr-2">
        <div className="min-h-[calc(100vh-0.5rem)] overflow-hidden rounded-t-2xl border bg-card">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur md:px-6">
            <Button className="shrink-0 md:hidden" size="icon" variant="outline" aria-label="Abrir menu" onClick={() => setMobileOpen(true)}><Menu /></Button>
            {isDailyReport ? <><RelatorioDayHeader /><div ref={setHeaderActionTarget} className="hidden shrink-0 items-center border-l pl-3 md:flex" /></> : <><span className="flex text-muted-foreground"><PageIcon /></span><h1 className="min-w-0 truncate text-[17px] font-semibold tracking-tight">{page.title}</h1><div className="ml-auto flex items-center gap-3"><span className="hidden text-xs capitalize text-muted-foreground lg:block">{today} · Vitória/ES</span><div ref={setHeaderActionTarget} className="flex shrink-0 items-center" /></div></>}
          </header>
          <div className="mx-auto max-w-[1080px] p-5 pb-20 md:p-7 md:pb-20"><Outlet /></div>
        </div>
      </main>
    </div>
    </PageHeaderActionProvider>
  );
}
