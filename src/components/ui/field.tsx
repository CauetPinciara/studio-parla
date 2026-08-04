import type { FieldsetHTMLAttributes, HTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export const FieldGroup = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col gap-4", className)} {...props} />;
export const Field = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
export const FieldLabel = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => <label className={cn("text-xs font-semibold text-muted-foreground", className)} {...props} />;
export const FieldSet = ({ className, ...props }: FieldsetHTMLAttributes<HTMLFieldSetElement>) => <fieldset className={cn("flex flex-col gap-3", className)} {...props} />;
export const FieldLegend = ({ className, ...props }: HTMLAttributes<HTMLLegendElement>) => <legend className={cn("text-sm font-semibold", className)} {...props} />;
