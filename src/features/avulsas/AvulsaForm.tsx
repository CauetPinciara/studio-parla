import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Insert, Row } from "@/lib/database.types";
import { FormActions, NativeSelect } from "@/features/shared/FormParts";
import { formValue } from "@/lib/forms";
export function AvulsaForm({ open, onOpenChange, avulsa, contatos, turmas, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; avulsa?: Row<"avulsas">; contatos: Row<"contatos">[]; turmas: Row<"turmas">[]; pending: boolean; onSubmit: (value: Insert<"avulsas">) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ contato_id: formValue(data, "contato_id"), turma_id: formValue(data, "turma_id") || null, data: formValue(data, "data") || null, status: formValue(data, "status") }); }
  return <Modal open={open} onOpenChange={onOpenChange} title={avulsa ? "Editar avulsa" : "Nova aula avulsa"}><form onSubmit={submit}><FieldGroup><Field><FieldLabel>Aluno</FieldLabel><NativeSelect name="contato_id" required defaultValue={avulsa?.contato_id}><option value="">Selecione…</option>{contatos.map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</NativeSelect></Field><Field><FieldLabel>Data</FieldLabel><Input name="data" type="date" defaultValue={avulsa?.data ?? ""} /></Field><Field><FieldLabel>Encaixe na turma</FieldLabel><NativeSelect name="turma_id" defaultValue={avulsa?.turma_id ?? ""}><option value="">Selecione…</option>{turmas.map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</NativeSelect></Field><Field><FieldLabel>Situação</FieldLabel><NativeSelect name="status" defaultValue={avulsa?.status ?? "A confirmar"}>{["Confirmada", "A confirmar", "Realizada"].map((item) => <option key={item}>{item}</option>)}</NativeSelect></Field></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
