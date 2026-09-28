import { Button } from "@/components/ui/button";

export function FormActions({ pending, onCancel }: { pending: boolean; onCancel: () => void }) { return <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button></div>; }
