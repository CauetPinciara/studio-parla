import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export const Alert = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div role="alert" className={cn("relative rounded-xl border bg-card p-4", className)} {...props} />;
export const AlertTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => <h5 className={cn("mb-1 font-semibold", className)} {...props} />;
export const AlertDescription = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn("text-sm text-muted-foreground", className)} {...props} />;
