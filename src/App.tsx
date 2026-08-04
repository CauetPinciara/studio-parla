import { Navigate, Route, Routes } from "react-router-dom";
import { DEFAULT_ROUTE, NAVIGATION_ITEMS } from "@/app/navigation";
import { Layout } from "@/components/Layout";
import { ComingSoonPage } from "@/features/shared/ComingSoonPage";
import { Protected } from "@/components/Protected";
import ContatosPage from "@/features/contatos/ContatosPage";
import MatriculasPage from "@/features/matriculas/MatriculasPage";
import TurmasPage from "@/features/turmas/TurmasPage";
import WorkshopsPage from "@/features/workshops/WorkshopsPage";

const pages: Record<string, React.ReactNode> = { "/contatos": <ContatosPage />, "/matriculas": <MatriculasPage />, "/turmas": <TurmasPage />, "/workshops": <WorkshopsPage /> };
export default function App() { return <Protected><Routes><Route element={<Layout />}>{NAVIGATION_ITEMS.map((item) => <Route key={item.path} path={item.path} element={pages[item.path] ?? <ComingSoonPage />} />)}<Route index element={<Navigate to={DEFAULT_ROUTE} replace />} /><Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} /></Route></Routes></Protected>; }
