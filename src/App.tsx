import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DEFAULT_ROUTE, NAVIGATION_ITEMS } from "@/app/navigation";
import { Layout } from "@/components/Layout";
import { Protected } from "@/components/Protected";
import { LoadingState } from "@/features/shared/AsyncState";
import { ComingSoonPage } from "@/features/shared/ComingSoonPage";

const pages: Partial<Record<string, LazyExoticComponent<ComponentType>>> = {
  "/relatorios": lazy(() => import("@/features/relatorios/RelatoriosPage")),
  "/fechamento": lazy(() => import("@/features/fechamento/FechamentoPage")),
  "/contatos": lazy(() => import("@/features/contatos/ContatosPage")),
  "/matriculas": lazy(() => import("@/features/matriculas/MatriculasPage")),
  "/turmas": lazy(() => import("@/features/turmas/TurmasPage")),
  "/precos": lazy(() => import("@/features/precos/PrecosPage")),
};

const ContatoDetailPage = lazy(
  () => import("@/features/contatos/ContatoDetailPage"),
);

function OrdinaryShell() {
  const shellPreview = import.meta.env.DEV &&
    localStorage.getItem("studio-parla-shell-preview") === "1";
  const shell = <Layout />;

  return shellPreview ? shell : <Protected>{shell}</Protected>;
}

function suspended(element: React.ReactNode) {
  return <Suspense fallback={<LoadingState />}>{element}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<OrdinaryShell />}>
        {NAVIGATION_ITEMS.map((item) => {
          const Page = pages[item.path];
          return (
            <Route
              key={item.path}
              path={item.path}
              element={suspended(Page ? <Page /> : <ComingSoonPage />)}
            />
          );
        })}
        <Route path="/contatos/:id" element={suspended(<ContatoDetailPage />)} />
        <Route index element={<Navigate to={DEFAULT_ROUTE} replace />} />
        <Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} />
      </Route>
    </Routes>
  );
}
