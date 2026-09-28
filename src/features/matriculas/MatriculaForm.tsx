import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/features/shared/DatePickerField";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { FormActions } from "@/features/shared/FormParts";
import type { Insert, Row } from "@/lib/database.helpers";
import { formValue } from "@/lib/forms";

const PAYMENT_METHODS = ["PIX", "Cartão", "Débito", "A definir", "-"];
const STATUSES = ["Ativa", "Pausada", "Nova", "Saiu"];

interface MatriculaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matricula?: Row<"matriculas">;
  contatos: Row<"contatos">[];
  turmas: Row<"turmas">[];
  pending: boolean;
  onSubmit: (value: Insert<"matriculas">) => void;
}

export function MatriculaForm({ open, onOpenChange, matricula, contatos, turmas, pending, onSubmit }: MatriculaFormProps) {
  const [contactId, setContactId] = useState(matricula?.contato_id ?? "");
  const [classId, setClassId] = useState(matricula?.turma_id ?? "");
  const [payment, setPayment] = useState(matricula?.pagamento ?? "-");
  const [status, setStatus] = useState(matricula?.status ?? "Ativa");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!contactId) return;
    onSubmit({
      contato_id: contactId,
      turma_id: classId || null,
      mensalidade: Number(formValue(data, "mensalidade")) || 0,
      pagamento: payment,
      status,
      desde: formValue(data, "desde") || undefined,
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={matricula ? "Editar matrícula" : "Nova matrícula"}>
      <form onSubmit={submit}>
        <FieldGroup>
          <EntitySelect label="Aluno" value={contactId} options={contatos.map(({ id, nome }) => ({ value: id, label: nome }))} onValueChange={setContactId} />
          <EntitySelect label="Turma" value={classId} options={turmas.map(({ id, nome }) => ({ value: id, label: nome }))} onValueChange={setClassId} />
          <Field><FieldLabel htmlFor="matricula-mensalidade">Mensalidade (R$)</FieldLabel><Input id="matricula-mensalidade" name="mensalidade" type="number" step="0.01" defaultValue={matricula?.mensalidade ?? 520} /></Field>
          <DatePickerField label="Aluno desde" name="desde" defaultValue={matricula?.desde ?? ""} />
          <EntitySelect label="Forma de pagamento" value={payment} options={PAYMENT_METHODS.map((value) => ({ value, label: value }))} onValueChange={setPayment} />
          <EntitySelect label="Situação" value={status} options={STATUSES.map((value) => ({ value, label: value }))} onValueChange={setStatus} />
        </FieldGroup>
        <FormActions pending={pending} onCancel={() => onOpenChange(false)} />
      </form>
    </Modal>
  );
}
