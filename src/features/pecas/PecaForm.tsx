import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Insert, Row } from "@/lib/database.types";
import { formValue } from "@/lib/forms";
import { FormActions, NativeSelect } from "@/features/shared/FormParts";

export function PecaForm({ open, onOpenChange, peca, contatos, date, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; peca?: Row<"pecas">; contatos: Row<"contatos">[]; date?: string; pending: boolean; onSubmit: (value: Insert<"pecas">) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const status = formValue(data, "status") || "producao"; onSubmit({ contato_id: formValue(data, "contato_id"), descricao: formValue(data, "descricao") || null, data_deixou: formValue(data, "data_deixou") || null, estimativa: formValue(data, "estimativa") || "—", status, data_pronta: status === "pronta" ? (peca?.data_pronta ?? new Date().toISOString().slice(0, 10)) : peca?.data_pronta }); }
  return <Modal open={open} onOpenChange={onOpenChange} title={peca ? "Editar peça" : "Nova peça"}><form onSubmit={submit}><FieldGroup><Field><FieldLabel>Aluno</FieldLabel><NativeSelect name="contato_id" required defaultValue={peca?.contato_id}><option value="">Selecione…</option>{contatos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</NativeSelect></Field><Field><FieldLabel>Descrição da peça</FieldLabel><Input name="descricao" defaultValue={peca?.descricao ?? ""} /></Field><Field><FieldLabel>Data que deixou</FieldLabel><Input name="data_deixou" type="date" defaultValue={date ?? peca?.data_deixou ?? ""} readOnly={Boolean(date)} /></Field><Field><FieldLabel>Estimativa (ex.: ~15 dias)</FieldLabel><Input name="estimativa" defaultValue={peca?.estimativa ?? ""} /></Field><Field><FieldLabel>Status</FieldLabel><NativeSelect name="status" defaultValue={peca?.status ?? "producao"}><option value="producao">Em produção</option><option value="pronta">Pronta · avisar</option><option value="avisado">Aguardando retirada</option><option value="entregue">Entregue</option></NativeSelect></Field></FieldGroup><FormActions pending={pending} onCancel={() => onOpenChange(false)} /></form></Modal>;
}
