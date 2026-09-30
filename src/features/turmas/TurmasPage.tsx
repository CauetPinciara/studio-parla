import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeaderAction } from "@/components/PageHeaderAction";
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
  const featuredWorkshop = studio.data.workshops.find(({ nome }) => nome.toLocaleLowerCase("pt-BR").includes("colônia"));

  return (
    <div className="flex flex-col gap-4">
      <PageHeaderAction><Button type="button" onClick={() => { setEditing(undefined); setOpen(true); }}><Plus data-icon="inline-start" />Nova turma</Button></PageHeaderAction>
      <div className="flex flex-col gap-3">
        {DAYS.map((day, weekday) => {
          const classes = sorted.filter(({ dia }) => dia === weekday);
          if (classes.length === 0) return null;
          return (
            <section key={day} className="overflow-hidden rounded-xl border bg-card shadow-[0_1px_2px_rgba(24,20,18,.04)]">
              <div className="flex items-center gap-2 border-b bg-background px-4 py-2 text-[11px] font-bold tracking-[.06em] text-nav-foreground uppercase">
                <span>{day}</span>
                <span className="opacity-60">{classes.length} {classes.length === 1 ? "turma" : "turmas"}</span>
              </div>
              {classes.map((turma) => {
              const enrollments = studio.data.matriculas.filter(({ turma_id, status }) => turma_id === turma.id && ["Ativa", "Nova"].includes(status));
              const students = enrollments.map(({ contato_id }) => studio.data.contatos.find(({ id }) => id === contato_id)?.nome).filter(Boolean);
              const free = Math.max(0, turma.capacidade - enrollments.length);
              const schedule = hours(turma.hora, turma.fim);
              const repeatsSchedule = turma.hora ? turma.nome.includes(`${turma.hora.slice(0, 2)}h`) : false;
              return (
                <div key={turma.id} className="flex items-center gap-3 border-b border-b-[hsl(30_8%_95%)] bg-card px-4 py-3 last:border-0 hover:bg-[hsl(30_8%_98%)]">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[15px] font-semibold">{turma.nome}{!repeatsSchedule && <span className="font-medium text-muted-foreground"> {schedule}</span>}</span>
                      <span className="text-xs leading-[1.5] text-[hsl(25_5%_48%)]">{enrollments.length} de {turma.capacidade} ocupados</span>
                      <span className="truncate text-xs leading-[1.5] text-quiet-foreground">{students.length ? students.join(" · ") : "Nenhum aluno matriculado"}</span>
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-1.5"><Badge variant={free ? "success" : "outline"}>{free === 0 ? "Cheia" : free === 1 ? "1 vaga livre" : `${free} vagas livres`}</Badge><Button className="size-8 p-0" type="button" size="icon" variant="ghost" aria-label="Editar turma" onClick={() => { setEditing(turma); setOpen(true); }}><Pencil size={16} /></Button><Button className="size-8 p-0" type="button" size="icon" variant="ghost" aria-label="Excluir turma" onClick={() => remove.mutate(turma.id)}><Trash2 size={16} /></Button></div>
                </div>
              );
              })}
            </section>
          );
        })}
      </div>
      {featuredWorkshop && <div className="rounded-xl border bg-card shadow-[0_1px_2px_rgba(0,0,0,.05)]">
        <div className="flex flex-col gap-1.5 p-5"><h3 className="m-0 text-sm font-semibold">{featuredWorkshop.nome}</h3><p className="m-0 text-sm text-muted-foreground">{featuredWorkshop.datas}</p></div>
        <div className="px-5 pb-5 text-sm text-muted-foreground">Evento pontual: ver aba Workshops.</div>
      </div>}
      <TurmaForm key={editing?.id ?? "nova"} open={open} onOpenChange={setOpen} turma={editing} pending={save.isPending} onSubmit={(value) => save.mutate(value)} />
    </div>
  );
}
