import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = cva("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold leading-[1.5]", { variants: { variant: { default: "bg-primary text-primary-foreground", secondary: "bg-[hsl(30_8%_95%)] text-[hsl(340_55%_42%)]", outline: "border border-[hsl(30_8%_90%)]", destructive: "bg-[hsla(24,70%,45%,.14)] text-[hsl(24_60%_34%)]", success: "bg-[hsl(150_30%_94%)] text-[hsl(152_30%_36%)]", warning: "bg-[hsl(36_60%_94%)] text-[hsl(32_60%_42%)]", info: "bg-[hsl(218_40%_95%)] text-[hsl(220_35%_45%)]" } }, defaultVariants: { variant: "default" } });
export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof variants>) { return <span className={cn(variants({ variant }), className)} {...props} />; }
