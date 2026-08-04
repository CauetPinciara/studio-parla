import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { Insert, Row } from "@/lib/database.types";
import { FormActions, NativeSelect } from "@/features/shared/FormParts";
import { formValue } from "@/lib/forms";
export function InscricaoForm({ open, onOpenChange, inscricao, contatos, workshops, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; inscricao?: Row<"inscricoes">; contatos: Row<"contatos">[]; workshops: Row<"workshops">[]; pending: boolean; onSubmit: (value: Insert<"inscricoes">) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ contato_id: formValue(data, "contato_id"), workshop_id: formValue(data, "workshop_id"), status: formValue(data, "status") }); }
  return <Modal open={open} onOpenChange={onOpenChange} title={inscricao ? "Editar inscrição" : "Inscrever em workshop"}><form onSubmit={submit}><FieldGroup><Field><FieldLabel>Pessoa</FieldLabel><NativeSelect name="contato_id" required defaultValue={inscricao?.contato_id}><option value="">Selecione…</option>{contatos.map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</NativeSelect></Field><Field><FieldLabel>Workshop</FieldLabel><NativeSelect name="workshop_id" required defaultValue={inscricao?.workshop_id}><option value="">Selecione…</option>{workshops.map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</NativeSelect></Field><Field><FieldLabel>Situação</FieldLabel><NativeSelect name="status" defaultValue={inscricao?.status ?? "Confirmada"}>{["Confirmada", "A confirmar", "Realizada"].map((item) => <option key={item}>{item}</option>)}</NativeSelect></Field></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
