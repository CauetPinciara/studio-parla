import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { FieldGroup } from "@/components/ui/field";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { FormActions } from "@/features/shared/FormParts";
import type { Insert, Row } from "@/lib/database.helpers";

export function InscricaoForm({ open, onOpenChange, inscricao, contatos, workshops, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; inscricao?: Row<"inscricoes">; contatos: Row<"contatos">[]; workshops: Row<"workshops">[]; pending: boolean; onSubmit: (value: Insert<"inscricoes">) => void }) {
  const [contactId, setContactId] = useState(inscricao?.contato_id ?? "");
  const [workshopId, setWorkshopId] = useState(inscricao?.workshop_id ?? "");
  const [status, setStatus] = useState(inscricao?.status ?? "Confirmada");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactId || !workshopId) return;
    onSubmit({ contato_id: contactId, workshop_id: workshopId, status });
  }
  return <Modal open={open} onOpenChange={onOpenChange} title={inscricao ? "Editar inscrição" : "Inscrever em workshop"}><form onSubmit={submit}><FieldGroup><EntitySelect label="Pessoa" value={contactId} options={contatos.map(({ id, nome }) => ({ value: id, label: nome }))} onValueChange={setContactId} /><EntitySelect label="Workshop" value={workshopId} options={workshops.map(({ id, nome }) => ({ value: id, label: nome }))} onValueChange={setWorkshopId} /><EntitySelect label="Situação" value={status} options={["Confirmada", "A confirmar", "Realizada"].map((value) => ({ value, label: value }))} onValueChange={setStatus} /></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
