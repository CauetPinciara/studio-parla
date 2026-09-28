import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { canAccessWorkspace } from "@/app/access";
import { DEFAULT_ROUTE } from "@/app/navigation";
import { LoadingState } from "@/features/shared/AsyncState";
import { useAuth } from "@/lib/auth";

export function FinanceAccessBoundary({ children }: { children: ReactNode }) {
  const { loading, membershipChecked, member } = useAuth();

  if (loading || !membershipChecked) return <LoadingState />;
  if (!canAccessWorkspace(member?.papel, "financeiro")) {
    return <Navigate to={DEFAULT_ROUTE} replace />;
  }

  return children;
}
