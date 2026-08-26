import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isSuperadminEmail } from "@/app/access";
import { DEFAULT_ROUTE } from "@/app/navigation";
import { LoadingState } from "@/features/shared/AsyncState";
import { useAuth } from "@/lib/auth";

export function AdminAccessBoundary({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const { loading, membershipChecked, member } = useAuth();

  if (loading || !membershipChecked) return <LoadingState />;
  if (!isSuperadminEmail(member?.email)) {
    return <Navigate to={DEFAULT_ROUTE} replace />;
  }

  return children;
}
