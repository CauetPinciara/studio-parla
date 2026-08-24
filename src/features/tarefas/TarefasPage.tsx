import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import {
  createTarefa,
  deleteTarefa,
  listTarefas,
  tarefasQueryKey,
  updateTarefa,
} from "@/features/tarefas/api";
import {
  TAREFA_STATUS,
  tarefaStatusLabels,
  tarefaStatusPatch,
  type TarefaStatus,
} from "@/features/tarefas/domain";
import { TarefaForm } from "@/features/tarefas/TarefaForm";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { NativeSelect } from "@/features/shared/FormParts";
import { useAuth } from "@/lib/auth";
import { localDateIso } from "@/lib/date";
import type { Insert, Row } from "@/lib/database.types";
import { formatDate } from "@/lib/format";

type View = "lista" | "kanban";

function StatusBadge({ status }: { status: TarefaStatus }) {
  const variant =
    status === "concluida"
      ? "success"
      : status === "em_andamento"
        ? "warning"
        : "secondary";
  return <Badge variant={variant}>{tarefaStatusLabels[status]}</Badge>;
}

function TaskDetails({ tarefa }: { tarefa: Row<"tarefas"> }) {
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt className="text-xs text-muted-foreground">Responsável</dt>
        <dd>{tarefa.responsavel}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Abertura</dt>
        <dd>{formatDate(tarefa.data_abertura)}</dd>
      </div>
      <div className="col-span-2">
        <dt className="text-xs text-muted-foreground">Conclusão</dt>
        <dd>
          {tarefa.data_conclusao
            ? formatDate(tarefa.data_conclusao)
            : "Sem conclusão"}
        </dd>
      </div>
    </dl>
  );
}

interface TaskActionsProps {
  tarefa: Row<"tarefas">;
  controlId: string;
  pending: boolean;
  onStatus: (tarefa: Row<"tarefas">, status: TarefaStatus) => void;
  onEdit: (tarefa: Row<"tarefas">) => void;
  onDelete: (tarefa: Row<"tarefas">) => void;
}

function TaskActions({
  tarefa,
  controlId,
  pending,
  onStatus,
  onEdit,
  onDelete,
}: TaskActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FieldLabel className="sr-only" htmlFor={controlId}>
        Alterar status de {tarefa.titulo}
      </FieldLabel>
      <NativeSelect
        className="w-auto"
        id={controlId}
        name={`status-${tarefa.id}`}
        value={tarefa.status}
        disabled={pending}
        onChange={(event) =>
          onStatus(tarefa, event.target.value as TarefaStatus)
        }
      >
        {TAREFA_STATUS.map((status) => (
          <option key={status} value={status}>
            {tarefaStatusLabels[status]}
          </option>
        ))}
      </NativeSelect>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={`Editar ${tarefa.titulo}`}
        disabled={pending}
        onClick={() => onEdit(tarefa)}
      >
        <Pencil />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={`Excluir ${tarefa.titulo}`}
        disabled={pending}
        onClick={() => onDelete(tarefa)}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

interface TaskCardProps extends Omit<TaskActionsProps, "controlId"> {
  prefix: string;
}

function TaskCard({ tarefa, prefix, ...actions }: TaskCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle>{tarefa.titulo}</CardTitle>
          <StatusBadge status={tarefa.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className={tarefa.descricao ? undefined : "text-muted-foreground"}>
          {tarefa.descricao || "Sem descrição"}
        </p>
        <TaskDetails tarefa={tarefa} />
      </CardContent>
      <CardFooter>
        <TaskActions
          tarefa={tarefa}
          controlId={`${prefix}-${tarefa.id}`}
          {...actions}
        />
      </CardFooter>
    </Card>
  );
}

export default function TarefasPage() {
  const client = useQueryClient();
  const { member } = useAuth();
  const [view, setView] = useState<View>("lista");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Row<"tarefas"> | undefined>();
  const tarefas = useQuery({ queryKey: tarefasQueryKey, queryFn: listTarefas });

  const save = useMutation({
    mutationFn: ({ id, value }: { id?: string; value: Insert<"tarefas"> }) =>
      id ? updateTarefa(id, value) : createTarefa(value),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: tarefasQueryKey });
      setFormOpen(false);
      setEditing(undefined);
      toast.success("Tarefa salva");
    },
  });
  const changeStatus = useMutation({
    mutationFn: ({ tarefa, status }: { tarefa: Row<"tarefas">; status: TarefaStatus }) =>
      updateTarefa(tarefa.id, tarefaStatusPatch(tarefa, status, localDateIso())),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: tarefasQueryKey });
      toast.success("Status atualizado");
    },
  });
  const remove = useMutation({
    mutationFn: deleteTarefa,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: tarefasQueryKey });
      toast.success("Tarefa excluída");
    },
  });

  if (tarefas.isLoading) return <LoadingState />;
  if (tarefas.error) return <ErrorState error={tarefas.error} />;

  const rows = tarefas.data ?? [];
  const mutationError = changeStatus.error ?? remove.error;
  const pending = changeStatus.isPending || remove.isPending;
  const editTask = (tarefa: Row<"tarefas">) => {
    save.reset();
    setEditing(tarefa);
    setFormOpen(true);
  };
  const deleteTask = (tarefa: Row<"tarefas">) => {
    if (window.confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) {
      remove.mutate(tarefa.id);
    }
  };
  const statusTask = (tarefa: Row<"tarefas">, status: TarefaStatus) => {
    changeStatus.mutate({ tarefa, status });
  };
  const actions = {
    pending,
    onStatus: statusTask,
    onEdit: editTask,
    onDelete: deleteTask,
  };

  let content: ReactNode;
  if (rows.length === 0) {
    content = (
      <p className="rounded-xl border p-8 text-center text-muted-foreground">
        Nenhuma tarefa cadastrada.
      </p>
    );
  } else if (view === "lista") {
    content = (
      <>
        <div className="hidden md:block">
          <DataTable
            rows={rows}
            getRowKey={(tarefa) => tarefa.id}
            columns={[
              {
                key: "tarefa",
                header: "Tarefa",
                cell: (tarefa) => (
                  <div className="flex max-w-sm flex-col gap-1">
                    <strong>{tarefa.titulo}</strong>
                    <span className="text-sm text-muted-foreground">
                      {tarefa.descricao || "Sem descrição"}
                    </span>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (tarefa) => (
                  <div className="flex flex-col gap-2">
                    <StatusBadge status={tarefa.status} />
                    <TaskActions
                      tarefa={tarefa}
                      controlId={`desktop-${tarefa.id}`}
                      {...actions}
                    />
                  </div>
                ),
              },
              { key: "responsavel", header: "Responsável", cell: (tarefa) => tarefa.responsavel },
              { key: "abertura", header: "Abertura", cell: (tarefa) => formatDate(tarefa.data_abertura) },
              {
                key: "conclusao",
                header: "Conclusão",
                cell: (tarefa) => tarefa.data_conclusao ? formatDate(tarefa.data_conclusao) : "Sem conclusão",
              },
            ]}
          />
        </div>
        <ul
          className="flex flex-col gap-3 md:hidden"
          aria-label="Lista móvel de tarefas"
        >
          {rows.map((tarefa) => (
            <li key={tarefa.id} aria-label={tarefa.titulo}>
              <TaskCard tarefa={tarefa} prefix="mobile" {...actions} />
            </li>
          ))}
        </ul>
      </>
    );
  } else {
    content = (
      <div className="grid gap-4 lg:grid-cols-3">
        {TAREFA_STATUS.map((status) => {
          const label = tarefaStatusLabels[status];
          const statusRows = rows.filter((tarefa) => tarefa.status === status);
          return (
            <section key={status} role="region" aria-labelledby={`tarefas-${status}`}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle id={`tarefas-${status}`}>{label}</CardTitle>
                    <Badge variant="outline">{statusRows.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-3">
                    {statusRows.map((tarefa) => (
                      <li key={tarefa.id} aria-label={tarefa.titulo}>
                        <TaskCard tarefa={tarefa} prefix="kanban" {...actions} />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            Organize as pendências do Studio Parla em lista ou por andamento.
          </p>
          <div
            className="flex gap-2"
            role="group"
            aria-label="Visualização das tarefas"
          >
            <Button
              type="button"
              variant={view === "lista" ? "default" : "outline"}
              aria-pressed={view === "lista"}
              onClick={() => setView("lista")}
            >
              Lista
            </Button>
            <Button
              type="button"
              variant={view === "kanban" ? "default" : "outline"}
              aria-pressed={view === "kanban"}
              onClick={() => setView("kanban")}
            >
              Kanban
            </Button>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => {
            save.reset();
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus data-icon="inline-start" />
          Nova tarefa
        </Button>
      </div>

      {mutationError && (
        <Alert>
          <AlertTitle>Não foi possível atualizar a tarefa</AlertTitle>
          <AlertDescription>{mutationError.message}</AlertDescription>
        </Alert>
      )}

      {content}

      <TarefaForm
        key={editing?.id ?? "nova"}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(undefined);
        }}
        tarefa={editing}
        defaultResponsavel={member?.nome ?? member?.email ?? ""}
        pending={save.isPending}
        mutationError={save.error}
        onSubmit={(value) => save.mutate({ id: editing?.id, value })}
      />
    </div>
  );
}
