import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { DEFAULT_ROUTE, NAVIGATION_ITEMS } from "@/app/navigation";
import { Layout } from "@/components/Layout";
import { ComingSoonPage } from "@/features/shared/ComingSoonPage";
import { Protected } from "@/components/Protected";
import { LoadingState } from "@/features/shared/AsyncState";

const pages: Record<string, LazyExoticComponent<ComponentType>> = {
  "/relatorios": lazy(() => import("@/features/relatorios/RelatoriosPage")), "/pecas": lazy(() => import("@/features/pecas/PecasPage")), "/calendario": lazy(() => import("@/features/calendario/CalendarioPage")), "/atendimento": lazy(() => import("@/features/atendimento/AtendimentoPage")), "/fechamento": lazy(() => import("@/features/fechamento/FechamentoPage")), "/contatos": lazy(() => import("@/features/contatos/ContatosPage")), "/matriculas": lazy(() => import("@/features/matriculas/MatriculasPage")), "/turmas": lazy(() => import("@/features/turmas/TurmasPage")), "/workshops": lazy(() => import("@/features/workshops/WorkshopsPage")), "/precos": lazy(() => import("@/features/precos/PrecosPage")), "/visao-geral": lazy(() => import("@/features/visao-geral/VisaoGeralPage")),
};
export default function App() { const shellPreview = import.meta.env.DEV && localStorage.getItem("studio-parla-shell-preview") === "1"; const content = <Routes><Route element={<Layout />}>{NAVIGATION_ITEMS.map((item) => { const Page = pages[item.path]; return <Route key={item.path} path={item.path} element={<Suspense fallback={<LoadingState />}>{Page ? <Page /> : <ComingSoonPage />}</Suspense>} />; })}<Route index element={<Navigate to={DEFAULT_ROUTE} replace />} /><Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} /></Route></Routes>; return shellPreview ? content : <Protected>{content}</Protected>; }
