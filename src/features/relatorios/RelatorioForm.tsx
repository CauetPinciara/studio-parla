import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Insert, Row } from "@/lib/database.types";
import { formValue } from "@/lib/forms";
import { FormActions, NativeSelect } from "@/features/shared/FormParts";

interface RelatorioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatorio?: Row<"relatorios">;
  selectedDate: string;
  turmas: Row<"turmas">[];
  author: string;
  pending: boolean;
  onSubmit: (value: Insert<"relatorios">) => void;
}

export function RelatorioForm({ open, onOpenChange, relatorio, selectedDate, turmas, author, pending, onSubmit }: RelatorioFormProps) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ data: formValue(data, "data"), turma_id: formValue(data, "turma_id") || null, autor: relatorio?.autor ?? author, resumo: formValue(data, "resumo") || null }); }
  return <Modal open={open} onOpenChange={onOpenChange} title={relatorio ? "Editar dia" : "Anotar este dia"}><form onSubmit={submit}><FieldGroup><Field><FieldLabel htmlFor="relatorio-data">Data</FieldLabel><Input id="relatorio-data" name="data" type="date" required defaultValue={relatorio?.data ?? selectedDate} /></Field><Field><FieldLabel htmlFor="relatorio-turma">Turma</FieldLabel><NativeSelect id="relatorio-turma" name="turma_id" defaultValue={relatorio?.turma_id ?? ""}><option value="">Geral</option>{turmas.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</NativeSelect></Field><Field><FieldLabel htmlFor="relatorio-resumo">Resumo do dia</FieldLabel><Textarea id="relatorio-resumo" name="resumo" defaultValue={relatorio?.resumo ?? ""} /></Field></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
