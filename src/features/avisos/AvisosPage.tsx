import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  deleteAviso,
  saveAviso,
  studioDataQueryKey,
  updateAviso,
} from "@/features/app-enxuto/api";
import {
  absenceStatus,
  addIsoDays,
  classCapacity,
  occurrencesForRange,
  shiftIsoMonth,
} from "@/features/app-enxuto/domain";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { useAuth } from "@/lib/auth";
import { localDateIso } from "@/lib/date";
import { formatDate } from "@/lib/format";
import { formValue } from "@/lib/forms";

type Period = "mes" | "semana";

function weekStart(value: string) {
  const date = new Date(`${value}T12:00:00`);
  const offset = (date.getDay() + 6) % 7;
  return addIsoDays(value, -offset);
}

function monthStart(value: string) {
  return `${value.slice(0, 7)}-01`;
}

const absenceLabels = {
  falta_confirmada: "Falta confirmada",
  acabou_indo: "Acabou indo",
  sem_chamada: "Sem chamada",
  falta_esperada: "Falta esperada",
};

export default function AvisosPage() {
  const { member } = useAuth();
  const queryClient = useQueryClient();
  const studio = useStudioData();
  const today = localDateIso();
  const [period, setPeriod] = useState<Period>("mes");
  const [anchor, setAnchor] = useState(today);
  const [contactId, setContactId] = useState("");
  const [occurrenceKey, setOccurrenceKey] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: studioDataQueryKey });
  const create = useMutation({
    mutationFn: saveAviso,
    onSuccess: () => {
      void refresh();
      setContactId("");
      setOccurrenceKey("");
      toast.success("Aviso registrado");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const update = useMutation({
    mutationFn: ({ id, obs }: { id: string; obs: string }) => updateAviso(id, { obs }),
    onSuccess: () => void refresh(),
    onError: (error: Error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: deleteAviso,
    onSuccess: () => void refresh(),
    onError: (error: Error) => toast.error(error.message),
  });

  const occurrences = useMemo(() => {
    if (!studio.data) return [];
    return occurrencesForRange(studio.data.turmas, today, 85).slice(0, 12).map((item) => ({
      ...item,
      capacity: classCapacity({
        turma: item.turma,
        data: item.data,
        matriculas: studio.data.matriculas,
        avisos: studio.data.avisos,
        reposicoes: studio.data.reposicoes,
      }),
    }));
  }, [studio.data, today]);

  if (studio.isLoading) return <LoadingState />;
  if (studio.error || !studio.data) return <ErrorState error={studio.error ?? new Error("Dados indisponíveis")} />;

  const start = period === "semana" ? weekStart(anchor) : monthStart(anchor);
  const end = period === "semana"
    ? addIsoDays(start, 6)
    : addIsoDays(`${start.slice(0, 7)}-${new Date(Number(start.slice(0, 4)), Number(start.slice(5, 7)), 0).getDate()}`, 0);
  const notices = studio.data.avisos
    .filter(({ data }) => data >= start && data <= end)
    .sort((left, right) => left.data.localeCompare(right.data));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const [data, turmaId] = occurrenceKey.split("|");
    const form = new FormData(event.currentTarget);
    if (!contactId || !data || !turmaId) return;
    create.mutate({
      contato_id: contactId,
      turma_id: turmaId,
      data,
      avisou_em: today,
      por: member?.nome ?? "Usuário",
      obs: formValue(form, "obs"),
      origem: "aviso",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader><CardTitle>Novo aviso de falta</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <FieldGroup>
              <EntitySelect
                label="Aluno"
                value={contactId}
                options={studio.data.contatos.map(({ id, nome }) => ({ value: id, label: nome }))}
                onValueChange={setContactId}
              />
              <EntitySelect
                label="Aula"
                value={occurrenceKey}
                options={occurrences.map(({ data, turma, capacity }) => ({
                  value: `${data}|${turma.id}`,
                  group: formatDate(data),
                  label: `${turma.nome} · ${capacity.ocupados}/${turma.capacidade} ocupados · ${capacity.avisaram} avisaram`,
                }))}
                onValueChange={setOccurrenceKey}
              />
              <Field>
                <FieldLabel htmlFor="aviso-obs">Observação</FieldLabel>
                <Input id="aviso-obs" name="obs" placeholder="Motivo ou contexto" />
              </Field>
              <Button type="submit" disabled={create.isPending || !contactId || !occurrenceKey}>
                Registrar aviso
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup type="single" variant="outline" value={period} onValueChange={(value) => value && setPeriod(value as Period)}>
          <ToggleGroupItem value="mes">Mês</ToggleGroupItem>
          <ToggleGroupItem value="semana">Semana</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Button type="button" size="icon" variant="outline" aria-label="Período anterior" onClick={() => setAnchor(period === "semana" ? addIsoDays(anchor, -7) : shiftIsoMonth(anchor, -1))}><ChevronLeft /></Button>
          <Button type="button" variant="outline" onClick={() => setAnchor(today)}>Hoje</Button>
          <Button type="button" size="icon" variant="outline" aria-label="Próximo período" onClick={() => setAnchor(period === "semana" ? addIsoDays(anchor, 7) : shiftIsoMonth(anchor, 1))}><ChevronRight /></Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {notices.map((notice) => {
          const contact = studio.data.contatos.find(({ id }) => id === notice.contato_id);
          const turma = studio.data.turmas.find(({ id }) => id === notice.turma_id);
          const aula = studio.data.aulas.find((item) => item.data === notice.data && item.turma_id === notice.turma_id);
          const attendance = studio.data.presencas.find((item) => item.aula_id === aula?.id && item.contato_id === notice.contato_id);
          const status = absenceStatus(notice.data, attendance?.status, today);
          return (
            <Card key={notice.id}>
              <CardContent className="flex flex-col gap-3 pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <strong>{contact?.nome ?? "Contato"}</strong>
                    <p className="text-sm text-muted-foreground">{formatDate(notice.data)} · {turma?.nome ?? "Turma"}</p>
                  </div>
                  <Badge variant={status === "acabou_indo" ? "success" : status === "falta_confirmada" ? "destructive" : "secondary"}>
                    {absenceLabels[status]}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    aria-label={`Observação de ${contact?.nome ?? "contato"}`}
                    defaultValue={notice.obs ?? ""}
                    onBlur={(event) => {
                      if (event.currentTarget.value !== (notice.obs ?? "")) update.mutate({ id: notice.id, obs: event.currentTarget.value });
                    }}
                  />
                  <Button type="button" size="icon" variant="ghost" aria-label="Remover aviso" onClick={() => remove.mutate(notice.id)}><Trash2 /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {notices.length === 0 && <p className="text-sm text-muted-foreground">Nenhum aviso neste período.</p>}
      </div>
    </div>
  );
}
