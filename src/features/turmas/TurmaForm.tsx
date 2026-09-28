import { useState, type FormEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { generateClassName } from "@/features/app-enxuto/domain";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { FormActions } from "@/features/shared/FormParts";
import type { Insert, Row } from "@/lib/database.helpers";
import { formValue } from "@/lib/forms";

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const HOURS = Array.from({ length: 16 }, (_, index) => `${String(index + 7).padStart(2, "0")}:00`);

export function TurmaForm({ open, onOpenChange, turma, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; turma?: Row<"turmas">; pending: boolean; onSubmit: (value: Insert<"turmas">) => void }) {
  const [day, setDay] = useState(String(turma?.dia ?? 3));
  const [start, setStart] = useState(turma?.hora?.slice(0, 5) ?? "15:00");
  const [end, setEnd] = useState(turma?.fim?.slice(0, 5) ?? "18:00");
  const [capacity, setCapacity] = useState(turma?.capacidade ?? 6);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rawName = formValue(data, "nome");
    onSubmit({
      nome: generateClassName(rawName, Number(day), start, end),
      dia: Number(day),
      hora: start,
      fim: end,
      capacidade: capacity,
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={turma ? "Editar turma" : "Nova turma"}>
      <form onSubmit={submit}>
        <FieldGroup>
          <Field><FieldLabel htmlFor="turma-nome">Nome</FieldLabel><Input id="turma-nome" name="nome" defaultValue={turma?.nome ?? ""} placeholder="Gerado automaticamente se ficar vazio" /></Field>
          <EntitySelect label="Dia da semana" value={day} options={DAYS.map((label, value) => ({ value: String(value), label }))} onValueChange={setDay} />
          <div className="grid grid-cols-2 gap-3">
            <EntitySelect label="Início" value={start} options={HOURS.map((value) => ({ value, label: value }))} onValueChange={setStart} />
            <EntitySelect label="Fim" value={end} options={HOURS.map((value) => ({ value, label: value }))} onValueChange={setEnd} />
          </div>
          <Field>
            <FieldLabel>Capacidade</FieldLabel>
            <div className="flex items-center gap-3">
              <Button type="button" size="icon" variant="outline" aria-label="Diminuir capacidade" onClick={() => setCapacity((value) => Math.max(1, value - 1))}><Minus /></Button>
              <output className="min-w-8 text-center font-semibold">{capacity}</output>
              <Button type="button" size="icon" variant="outline" aria-label="Aumentar capacidade" onClick={() => setCapacity((value) => Math.min(20, value + 1))}><Plus /></Button>
            </div>
          </Field>
        </FieldGroup>
        <FormActions pending={pending} onCancel={() => onOpenChange(false)} />
      </form>
    </Modal>
  );
}
