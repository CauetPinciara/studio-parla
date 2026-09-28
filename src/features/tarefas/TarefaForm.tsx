import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerField } from "@/features/shared/DatePickerField";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { FormActions } from "@/features/shared/FormParts";
import {
  buildTarefaInput,
  TAREFA_STATUS,
  tarefaStatusLabels,
  type TarefaStatus,
} from "@/features/tarefas/domain";
import type { Insert, Row } from "@/lib/database.helpers";
import { localDateIso } from "@/lib/date";
import { formValue } from "@/lib/forms";

interface TarefaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarefa?: Row<"tarefas">;
  defaultResponsavel: string;
  pending: boolean;
  mutationError: Error | null;
  onSubmit: (value: Insert<"tarefas">) => void;
}

export function TarefaForm({
  open,
  onOpenChange,
  tarefa,
  defaultResponsavel,
  pending,
  mutationError,
  onSubmit,
}: TarefaFormProps) {
  const [status, setStatus] = useState<TarefaStatus>(
    (tarefa?.status as TarefaStatus | undefined) ?? "a_fazer",
  );
  const [dataAbertura, setDataAbertura] = useState(
    tarefa?.data_abertura ?? localDateIso(),
  );
  const [localError, setLocalError] = useState<Error | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    try {
      const value = buildTarefaInput(
        {
          status,
          data_abertura: formValue(data, "data_abertura"),
          data_conclusao: formValue(data, "data_conclusao") || null,
          responsavel: formValue(data, "responsavel"),
          titulo: formValue(data, "titulo"),
          descricao: formValue(data, "descricao") || null,
        },
        localDateIso(),
        tarefa?.data_conclusao,
      );
      setLocalError(null);
      onSubmit(value);
    } catch (error) {
      setLocalError(error instanceof Error ? error : new Error("Dados inválidos"));
    }
  }

  const error = localError ?? mutationError;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={tarefa ? "Editar tarefa" : "Nova tarefa"}
    >
      <form onSubmit={submit}>
        <FieldGroup>
          {error && (
            <Alert>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <EntitySelect label="Status" value={status} options={TAREFA_STATUS.map((value) => ({ value, label: tarefaStatusLabels[value] }))} onValueChange={(value) => setStatus(value as TarefaStatus)} />
          <DatePickerField label="Data de abertura" name="data_abertura" value={dataAbertura} onValueChange={setDataAbertura} required />
          <DatePickerField label="Data de conclusão" name="data_conclusao" defaultValue={tarefa?.data_conclusao ?? ""} min={dataAbertura} disabled={status !== "concluida"} />
          <Field>
            <FieldLabel htmlFor="tarefa-responsavel">Responsável</FieldLabel>
            <Input
              id="tarefa-responsavel"
              name="responsavel"
              required
              defaultValue={tarefa?.responsavel ?? defaultResponsavel}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="tarefa-titulo">Título</FieldLabel>
            <Input
              id="tarefa-titulo"
              name="titulo"
              required
              defaultValue={tarefa?.titulo ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="tarefa-descricao">Descrição</FieldLabel>
            <Textarea
              id="tarefa-descricao"
              name="descricao"
              defaultValue={tarefa?.descricao ?? ""}
            />
          </Field>
        </FieldGroup>
        <FormActions pending={pending} onCancel={() => onOpenChange(false)} />
      </form>
    </Modal>
  );
}
