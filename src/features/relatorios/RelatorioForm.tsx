import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Insert, Row } from "@/lib/database.types";
import { formValue } from "@/lib/forms";
import { FormActions, NativeSelect } from "@/features/shared/FormParts";
export function RelatorioForm({ open, onOpenChange, relatorio, turmas, author, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; relatorio?: Row<"relatorios">; turmas: Row<"turmas">[]; author: string; pending: boolean; onSubmit: (value: Insert<"relatorios">) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ data: formValue(data, "data"), turma_id: formValue(data, "turma_id") || null, autor: relatorio?.autor ?? author, resumo: formValue(data, "resumo") || null }); }
  return <Modal open={open} onOpenChange={onOpenChange} title={relatorio ? "Editar dia" : "Novo dia"}><form onSubmit={submit}><FieldGroup><Field><FieldLabel>Data</FieldLabel><Input name="data" type="date" required defaultValue={relatorio?.data ?? new Date().toISOString().slice(0, 10)} /></Field><Field><FieldLabel>Turma</FieldLabel><NativeSelect name="turma_id" defaultValue={relatorio?.turma_id ?? ""}><option value="">Geral</option>{turmas.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</NativeSelect></Field><Field><FieldLabel>Resumo do dia</FieldLabel><Textarea name="resumo" defaultValue={relatorio?.resumo ?? ""} /></Field></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
