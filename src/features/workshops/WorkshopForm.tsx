import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Insert, Row } from "@/lib/database.types";
import { FormActions } from "@/features/shared/FormParts";
import { formValue } from "@/lib/forms";
export function WorkshopForm({ open, onOpenChange, workshop, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; workshop?: Row<"workshops">; pending: boolean; onSubmit: (value: Insert<"workshops">) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ nome: formValue(data, "nome").trim(), datas: formValue(data, "datas") || null, preco: formValue(data, "preco") || null }); }
  return <Modal open={open} onOpenChange={onOpenChange} title={workshop ? "Editar workshop" : "Novo workshop / evento"}><form onSubmit={submit}><FieldGroup><Field><FieldLabel>Nome</FieldLabel><Input name="nome" required defaultValue={workshop?.nome} /></Field><Field><FieldLabel>Datas / horário</FieldLabel><Input name="datas" defaultValue={workshop?.datas ?? ""} /></Field><Field><FieldLabel>Preço</FieldLabel><Input name="preco" defaultValue={workshop?.preco ?? ""} /></Field></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
