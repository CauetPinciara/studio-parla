import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { studioDataQueryKey } from "@/features/app-enxuto/api";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { TurmaForm } from "@/features/turmas/TurmaForm";
import { createTurma, deleteTurma, updateTurma } from "@/features/turmas/api";
import type { Insert, Row } from "@/lib/database.helpers";

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function hours(start: string | null, end: string | null) {
  return `${start?.slice(0, 2)}h–${end?.slice(0, 2)}h`;
}

export default function TurmasPage() {
  const studio = useStudioData();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Row<"turmas"> | undefined>();
  const [open, setOpen] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: studioDataQueryKey });
  const save = useMutation({
    mutationFn: (value: Insert<"turmas">) => editing ? updateTurma(editing.id, value) : createTurma(value),
    onSuccess: () => { void refresh(); setOpen(false); toast.success("Turma salva"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: deleteTurma,
    onSuccess: () => void refresh(),
    onError: (error: Error) => toast.error(error.message),
  });

  if (studio.isLoading) return <LoadingState />;
  if (studio.error || !studio.data) return <ErrorState error={studio.error ?? new Error("Dados indisponíveis")} />;
  const sorted = [...studio.data.turmas].sort((left, right) => (left.dia ?? 7) - (right.dia ?? 7) || (left.hora ?? "").localeCompare(right.hora ?? ""));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end"><Button type="button" onClick={() => { setEditing(undefined); setOpen(true); }}><Plus data-icon="inline-start" />Nova turma</Button></div>
      {DAYS.map((day, weekday) => {
        const classes = sorted.filter(({ dia }) => dia === weekday);
        if (classes.length === 0) return null;
        return (
          <section key={day} className="flex flex-col gap-3">
            <h2 className="font-semibold">{day}</h2>
            {classes.map((turma) => {
              const enrollments = studio.data.matriculas.filter(({ turma_id, status }) => turma_id === turma.id && ["Ativa", "Nova"].includes(status));
              const students = enrollments.map(({ contato_id }) => studio.data.contatos.find(({ id }) => id === contato_id)?.nome).filter(Boolean);
              const free = Math.max(0, turma.capacidade - enrollments.length);
              return (
                <Card key={turma.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-col gap-1"><CardTitle>{turma.nome}</CardTitle><span className="text-sm text-muted-foreground">{hours(turma.hora, turma.fim)} · {enrollments.length} de {turma.capacidade} ocupados</span></div>
                      <div className="flex items-center gap-1"><Badge variant={free ? "success" : "warning"}>{free ? `${free} vagas livres` : "Cheia"}</Badge><Button type="button" size="icon" variant="ghost" aria-label="Editar turma" onClick={() => { setEditing(turma); setOpen(true); }}><Pencil /></Button><Button type="button" size="icon" variant="ghost" aria-label="Excluir turma" onClick={() => remove.mutate(turma.id)}><Trash2 /></Button></div>
                    </div>
                  </CardHeader>
                  <CardContent><p className="text-sm">{students.length ? students.join(", ") : "Sem alunos"}</p></CardContent>
                </Card>
              );
            })}
          </section>
        );
      })}
      <TurmaForm key={editing?.id ?? "nova"} open={open} onOpenChange={setOpen} turma={editing} pending={save.isPending} onSubmit={(value) => save.mutate(value)} />
    </div>
  );
}
