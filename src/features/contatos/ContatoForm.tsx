import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Insert, Row } from "@/lib/database.types";
import { FormActions, NativeSelect } from "@/features/shared/FormParts";
import { formValue } from "@/lib/forms";

const origens = ["Instagram", "Indicação", "Google", "Passou na frente", "Workshop", "Outro"];
export function ContatoForm({ open, onOpenChange, contato, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; contato?: Row<"contatos">; pending: boolean; onSubmit: (value: Insert<"contatos">) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ nome: formValue(data, "nome").trim(), tel: formValue(data, "tel") || null, origem: formValue(data, "origem") || "Instagram", obs: formValue(data, "obs") || null }); }
  return <Modal open={open} onOpenChange={onOpenChange} title={contato ? "Editar contato" : "Novo contato"}><form onSubmit={submit}><FieldGroup><Field><FieldLabel htmlFor="nome">Nome</FieldLabel><Input id="nome" name="nome" required defaultValue={contato?.nome} /></Field><Field><FieldLabel htmlFor="tel">WhatsApp</FieldLabel><Input id="tel" name="tel" defaultValue={contato?.tel ?? ""} /></Field><Field><FieldLabel htmlFor="origem">Origem</FieldLabel><NativeSelect id="origem" name="origem" defaultValue={contato?.origem ?? "Instagram"}>{origens.map((item) => <option key={item}>{item}</option>)}</NativeSelect></Field><Field><FieldLabel htmlFor="obs">Observações</FieldLabel><Textarea id="obs" name="obs" defaultValue={contato?.obs ?? ""} /></Field></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
