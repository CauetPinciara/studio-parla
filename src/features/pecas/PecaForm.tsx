import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/features/shared/DatePickerField";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { FormActions } from "@/features/shared/FormParts";
import type { Insert, Row } from "@/lib/database.helpers";
import { localDateIso } from "@/lib/date";
import { formValue } from "@/lib/forms";

interface PecaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peca?: Row<"pecas">;
  contatos: Row<"contatos">[];
  date?: string;
  pending: boolean;
  onSubmit: (value: Insert<"pecas">) => void;
}

const STATUS_OPTIONS = [
  { value: "producao", label: "Em produção" },
  { value: "pronta", label: "Pronta · avisar" },
  { value: "avisado", label: "Aguardando retirada" },
  { value: "entregue", label: "Entregue" },
];

export function PecaForm({ open, onOpenChange, peca, contatos, date, pending, onSubmit }: PecaFormProps) {
  const [contactId, setContactId] = useState(peca?.contato_id ?? "");
  const [status, setStatus] = useState(peca?.status ?? "producao");
  const [stage, setStage] = useState(peca?.etapa ?? "1ª queima");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!contactId) return;
    onSubmit({
      contato_id: contactId,
      descricao: formValue(data, "descricao") || null,
      data_deixou: formValue(data, "data_deixou") || null,
      estimativa: formValue(data, "estimativa") || "-",
      etapa: stage,
      prazo: formValue(data, "prazo") || null,
      status,
      data_pronta: status === "pronta" ? peca?.data_pronta ?? localDateIso() : peca?.data_pronta,
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={peca ? "Editar peça" : "Nova peça"}>
      <form onSubmit={submit}>
        <FieldGroup>
          <EntitySelect label="Aluno" value={contactId} options={contatos.map(({ id, nome }) => ({ value: id, label: nome }))} onValueChange={setContactId} />
          <Field><FieldLabel htmlFor="peca-descricao">Descrição da peça</FieldLabel><Input id="peca-descricao" name="descricao" defaultValue={peca?.descricao ?? ""} /></Field>
          <DatePickerField label="Data que deixou" name="data_deixou" defaultValue={date ?? peca?.data_deixou ?? ""} disabled={Boolean(date)} />
          <EntitySelect label="Etapa" value={stage} options={["1ª queima", "2ª queima"].map((value) => ({ value, label: value }))} onValueChange={setStage} />
          <DatePickerField label="Prazo da queima" name="prazo" defaultValue={peca?.prazo ?? ""} />
          <Field><FieldLabel htmlFor="peca-estimativa">Estimativa</FieldLabel><Input id="peca-estimativa" name="estimativa" defaultValue={peca?.estimativa ?? ""} placeholder="Ex.: ~15 dias" /></Field>
          <EntitySelect label="Status" value={status} options={STATUS_OPTIONS} onValueChange={setStatus} />
        </FieldGroup>
        <FormActions pending={pending} onCancel={() => onOpenChange(false)} />
      </form>
    </Modal>
  );
}
