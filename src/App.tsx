import { Navigate, Route, Routes } from "react-router-dom";
import { DEFAULT_ROUTE, NAVIGATION_ITEMS } from "@/app/navigation";
import { Layout } from "@/components/Layout";
import { ComingSoonPage } from "@/features/shared/ComingSoonPage";

export default function App() { return <Routes><Route element={<Layout />}>{NAVIGATION_ITEMS.map((item) => <Route key={item.path} path={item.path} element={<ComingSoonPage />} />)}<Route index element={<Navigate to={DEFAULT_ROUTE} replace />} /><Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} /></Route></Routes>; }
