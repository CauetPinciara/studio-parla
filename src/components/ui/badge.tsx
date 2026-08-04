import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", { variants: { variant: { default: "bg-primary text-primary-foreground", secondary: "bg-secondary text-secondary-foreground", outline: "border border-border", success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning", info: "bg-info-soft text-info" } }, defaultVariants: { variant: "default" } });
export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof variants>) { return <span className={cn(variants({ variant }), className)} {...props} />; }
