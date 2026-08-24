import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormActions, NativeSelect } from "@/features/shared/FormParts";
import {
  buildTarefaInput,
  TAREFA_STATUS,
  tarefaStatusLabels,
  type TarefaStatus,
} from "@/features/tarefas/domain";
import type { Insert, Row } from "@/lib/database.types";
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
    tarefa?.status ?? "a_fazer",
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
          <Field>
            <FieldLabel htmlFor="tarefa-status">Status</FieldLabel>
            <NativeSelect
              id="tarefa-status"
              name="status"
              required
              value={status}
              onChange={(event) => setStatus(event.target.value as TarefaStatus)}
            >
              {TAREFA_STATUS.map((value) => (
                <option key={value} value={value}>
                  {tarefaStatusLabels[value]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="tarefa-data-abertura">
              Data de abertura
            </FieldLabel>
            <Input
              id="tarefa-data-abertura"
              name="data_abertura"
              type="date"
              required
              value={dataAbertura}
              onChange={(event) => setDataAbertura(event.target.value)}
            />
          </Field>
          <Field data-disabled={status !== "concluida" || undefined}>
            <FieldLabel htmlFor="tarefa-data-conclusao">
              Data de conclusão
            </FieldLabel>
            <Input
              id="tarefa-data-conclusao"
              name="data_conclusao"
              type="date"
              min={dataAbertura}
              disabled={status !== "concluida"}
              defaultValue={tarefa?.data_conclusao ?? ""}
            />
          </Field>
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
