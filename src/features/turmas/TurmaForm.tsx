import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Insert, Row } from "@/lib/database.types";
import { FormActions } from "@/features/shared/FormParts";
import { formValue } from "@/lib/forms";
export function TurmaForm({ open, onOpenChange, turma, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; turma?: Row<"turmas">; pending: boolean; onSubmit: (value: Insert<"turmas">) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ nome: formValue(data, "nome").trim(), dia: Number(formValue(data, "dia")) || null, hora: formValue(data, "hora") || null }); }
  return <Modal open={open} onOpenChange={onOpenChange} title={turma ? "Editar turma" : "Nova turma"}><form onSubmit={submit}><FieldGroup><Field><FieldLabel htmlFor="nome">Nome</FieldLabel><Input id="nome" name="nome" required defaultValue={turma?.nome} /></Field><Field><FieldLabel htmlFor="dia">Dia da semana (0 a 6)</FieldLabel><Input id="dia" name="dia" type="number" min="0" max="6" defaultValue={turma?.dia ?? ""} /></Field><Field><FieldLabel htmlFor="hora">Horário</FieldLabel><Input id="hora" name="hora" type="time" defaultValue={turma?.hora ?? ""} /></Field></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
