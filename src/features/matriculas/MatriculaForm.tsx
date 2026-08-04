import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Insert, Row } from "@/lib/database.types";
import { FormActions, NativeSelect } from "@/features/shared/FormParts";
import { formValue } from "@/lib/forms";
const pagamentos = ["PIX", "Cartão", "Débito", "A definir", "—"];
const statuses = ["Ativa", "Pausada", "Nova", "Saiu"];
export function MatriculaForm({ open, onOpenChange, matricula, contatos, turmas, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; matricula?: Row<"matriculas">; contatos: Row<"contatos">[]; turmas: Row<"turmas">[]; pending: boolean; onSubmit: (value: Insert<"matriculas">) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ contato_id: formValue(data, "contato_id"), turma_id: formValue(data, "turma_id") || null, mensalidade: Number(formValue(data, "mensalidade")) || 0, pagamento: formValue(data, "pagamento"), status: formValue(data, "status") }); }
  return <Modal open={open} onOpenChange={onOpenChange} title={matricula ? "Editar matrícula" : "Nova matrícula"}><form onSubmit={submit}><FieldGroup><Field><FieldLabel>Aluno</FieldLabel><NativeSelect name="contato_id" required defaultValue={matricula?.contato_id}><option value="">Selecione…</option>{contatos.map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</NativeSelect></Field><Field><FieldLabel>Turma</FieldLabel><NativeSelect name="turma_id" defaultValue={matricula?.turma_id ?? ""}><option value="">Selecione…</option>{turmas.map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</NativeSelect></Field><Field><FieldLabel>Mensalidade (R$)</FieldLabel><Input name="mensalidade" type="number" step="0.01" defaultValue={matricula?.mensalidade ?? 520} /></Field><Field><FieldLabel>Forma de pagamento</FieldLabel><NativeSelect name="pagamento" defaultValue={matricula?.pagamento ?? "—"}>{pagamentos.map((item) => <option key={item}>{item}</option>)}</NativeSelect></Field><Field><FieldLabel>Situação</FieldLabel><NativeSelect name="status" defaultValue={matricula?.status ?? "Ativa"}>{statuses.map((item) => <option key={item}>{item}</option>)}</NativeSelect></Field></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
