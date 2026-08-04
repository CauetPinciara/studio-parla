import type { SelectHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NativeSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cn("h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />; }
export function FormActions({ pending, onCancel }: { pending: boolean; onCancel: () => void }) { return <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button></div>; }
