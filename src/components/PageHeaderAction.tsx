import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

const PageHeaderActionTarget = createContext<HTMLElement | null>(null);

export function PageHeaderActionProvider({
  target,
  children,
}: {
  target: HTMLElement | null;
  children: ReactNode;
}) {
  return (
    <PageHeaderActionTarget.Provider value={target}>
      {children}
    </PageHeaderActionTarget.Provider>
  );
}

export function PageHeaderAction({ children }: { children: ReactNode }) {
  const target = useContext(PageHeaderActionTarget);
  return target ? createPortal(children, target) : null;
}
