import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { FormActions } from "@/features/shared/FormParts";
import type { Insert, Row } from "@/lib/database.helpers";
import { formValue } from "@/lib/forms";

const ORIGINS = ["Instagram", "Indicação", "Google", "Passou na frente", "Workshop", "Outro"];

export function ContatoForm({ open, onOpenChange, contato, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; contato?: Row<"contatos">; pending: boolean; onSubmit: (value: Insert<"contatos">) => void }) {
  const [origin, setOrigin] = useState(contato?.origem ?? "Instagram");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({ nome: formValue(data, "nome").trim(), tel: formValue(data, "tel") || null, origem: origin, obs: formValue(data, "obs") || null });
  }
  return <Modal open={open} onOpenChange={onOpenChange} title={contato ? "Editar contato" : "Novo contato"}><form onSubmit={submit}><FieldGroup><Field><FieldLabel htmlFor="contato-nome">Nome</FieldLabel><Input id="contato-nome" name="nome" required defaultValue={contato?.nome} /></Field><Field><FieldLabel htmlFor="contato-tel">WhatsApp</FieldLabel><Input id="contato-tel" name="tel" defaultValue={contato?.tel ?? ""} /></Field><EntitySelect label="Origem" value={origin} options={ORIGINS.map((value) => ({ value, label: value }))} onValueChange={setOrigin} /><Field><FieldLabel htmlFor="contato-obs">Observações</FieldLabel><Textarea id="contato-obs" name="obs" defaultValue={contato?.obs ?? ""} /></Field></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
