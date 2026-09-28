import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerField } from "@/features/shared/DatePickerField";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { FormActions } from "@/features/shared/FormParts";
import type { Insert, Row } from "@/lib/database.helpers";
import { formValue } from "@/lib/forms";

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
  const [classId, setClassId] = useState(relatorio?.turma_id ?? "geral");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({ data: formValue(data, "data"), turma_id: classId === "geral" ? null : classId, autor: relatorio?.autor ?? author, resumo: formValue(data, "resumo") || null });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={relatorio ? "Editar dia" : "Anotar este dia"}>
      <form onSubmit={submit}>
        <FieldGroup>
          <DatePickerField label="Data" name="data" defaultValue={relatorio?.data ?? selectedDate} required />
          <EntitySelect label="Turma" value={classId} options={[{ value: "geral", label: "Geral" }, ...turmas.map(({ id, nome }) => ({ value: id, label: nome }))]} onValueChange={setClassId} />
          <Field><FieldLabel htmlFor="relatorio-resumo">Resumo do dia</FieldLabel><Textarea id="relatorio-resumo" name="resumo" defaultValue={relatorio?.resumo ?? ""} /></Field>
        </FieldGroup>
        <FormActions pending={pending} onCancel={() => onOpenChange(false)} />
      </form>
    </Modal>
  );
}
