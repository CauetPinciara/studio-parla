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

      <main className="min-w-0 flex-1 bg-background md:mt-3.5 md:mr-3.5 md:ml-1.5">
        <div className="flex min-h-[calc(100vh-14px)] flex-col overflow-hidden rounded-t-2xl border border-b-0 bg-card shadow-[0_1px_2px_rgba(24,20,18,.04)]">
          <header className="z-30 flex h-16 shrink-0 items-center gap-3 rounded-t-2xl border-b bg-card px-4 md:px-6">
            <Button className="shrink-0 md:hidden" size="icon" variant="outline" aria-label="Abrir menu" onClick={() => setMobileOpen(true)}><Menu /></Button>
            {isDailyReport ? <><RelatorioDayHeader /><div ref={setHeaderActionTarget} className="ml-1.5 hidden shrink-0 items-center gap-1.5 border-l pl-3 md:flex" /></> : <><div className="flex min-w-0 flex-1 items-center gap-2.5"><span className="flex text-muted-foreground"><PageIcon size={18} /></span><h1 className="min-w-0 truncate text-[17px] font-semibold tracking-[-.015em]">{page.title}</h1></div><div ref={setHeaderActionTarget} className="ml-auto flex shrink-0 items-center gap-2" /></>}
          </header>
          <div className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col p-5 pb-8 md:p-7 md:pb-8"><Outlet /></div>
        </div>
      </main>
    </div>
    </PageHeaderActionProvider>
  );
}
