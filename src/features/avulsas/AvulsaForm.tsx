import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { FieldGroup } from "@/components/ui/field";
import { DatePickerField } from "@/features/shared/DatePickerField";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { FormActions } from "@/features/shared/FormParts";
import type { Insert, Row } from "@/lib/database.helpers";
import { formValue } from "@/lib/forms";

interface AvulsaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avulsa?: Row<"avulsas">;
  contatos: Row<"contatos">[];
  turmas: Row<"turmas">[];
  pending: boolean;
  onSubmit: (value: Insert<"avulsas">) => void;
}

export function AvulsaForm({ open, onOpenChange, avulsa, contatos, turmas, pending, onSubmit }: AvulsaFormProps) {
  const [contactId, setContactId] = useState(avulsa?.contato_id ?? "");
  const [classId, setClassId] = useState(avulsa?.turma_id ?? "");
  const [status, setStatus] = useState(avulsa?.status ?? "A confirmar");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!contactId) return;
    onSubmit({ contato_id: contactId, turma_id: classId || null, data: formValue(data, "data") || null, status });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={avulsa ? "Editar avulsa" : "Nova aula avulsa"}>
      <form onSubmit={submit}>
        <FieldGroup>
          <EntitySelect label="Aluno" value={contactId} options={contatos.map(({ id, nome }) => ({ value: id, label: nome }))} onValueChange={setContactId} />
          <DatePickerField label="Data" name="data" defaultValue={avulsa?.data ?? ""} required />
          <EntitySelect label="Encaixe na turma" value={classId} options={turmas.map(({ id, nome }) => ({ value: id, label: nome }))} onValueChange={setClassId} />
          <EntitySelect label="Situação" value={status} options={["Confirmada", "A confirmar", "Realizada"].map((value) => ({ value, label: value }))} onValueChange={setStatus} />
        </FieldGroup>
        <FormActions pending={pending} onCancel={() => onOpenChange(false)} />
      </form>
    </Modal>
  );
}
