import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

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

function monthLabel(value: string) {
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
    .format(new Date(`${value}T12:00:00`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(new Date(`${value}T12:00:00`))
    .replace(".", "");
}

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
    : `${start.slice(0, 7)}-${new Date(Number(start.slice(0, 4)), Number(start.slice(5, 7)), 0).getDate()}`;
  const notices = studio.data.avisos
    .filter(({ data }) => data >= start && data <= end)
    .sort((left, right) => left.data.localeCompare(right.data));
  const periodLabel = period === "mes" ? monthLabel(start) : `${shortDate(start)} – ${shortDate(end)}`;

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
    event.currentTarget.reset();
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={submit}
        className="rounded-xl border border-[hsl(30_8%_90%)] bg-white p-4 shadow-[0_1px_2px_rgba(24,20,18,.04)]"
      >
        <div className="grid grid-cols-3 gap-3">
          <EntitySelect
            label="Aluno"
            placeholder="Escolher aluno"
            value={contactId}
            options={studio.data.contatos.map(({ id, nome }) => ({ value: id, label: nome }))}
            onValueChange={setContactId}
          />
          <EntitySelect
            label="Aula que vai faltar"
            placeholder="Escolher a aula"
            value={occurrenceKey}
            options={occurrences.map(({ data, turma, capacity }) => ({
              value: `${data}|${turma.id}`,
              group: new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
                .format(new Date(`${data}T12:00:00`)),
              label: `${turma.nome} ${turma.hora?.slice(0, 5) ?? ""} · ${capacity.ocupados}/${turma.capacidade} ocupados · ${capacity.avisaram} avisaram`,
            }))}
            onValueChange={setOccurrenceKey}
          />
          <Field className="gap-1.5">
            <FieldLabel htmlFor="aviso-obs" className="text-xs text-[hsl(25_5%_45%)]">Observação (opcional)</FieldLabel>
            <Input
              id="aviso-obs"
              name="obs"
              placeholder="Ex.: viagem de trabalho, quer repor na quinta"
              className="h-[38px] rounded-[9px] border-[hsl(30_8%_85%)] px-3 text-sm"
            />
          </Field>
        </div>
        <Button
          type="submit"
          disabled={create.isPending || !contactId || !occurrenceKey}
          className="mt-3 h-10 w-full rounded-[9px] bg-[hsl(340_72%_64%)] px-4 text-sm font-semibold text-white hover:bg-[hsl(340_72%_60%)]"
        >
          <Plus data-icon="inline-start" />
          Registrar aviso
        </Button>
      </form>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="m-0 text-xs font-semibold leading-[1.5] uppercase tracking-[.1em] text-[hsl(25_5%_45%)]">Avisos registrados</h2>
          <div className="ml-auto inline-flex gap-1 rounded-[10px] border border-[hsl(30_8%_90%)] bg-white p-1" role="group" aria-label="Período dos avisos">
            {(["mes", "semana"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={period === value}
                onClick={() => setPeriod(value)}
                className={cn(
                  "inline-flex h-8 items-center rounded-lg border-0 px-3 text-[13px] font-semibold",
                  period === value ? "bg-[hsl(340_72%_64%)] text-white" : "bg-transparent text-[hsl(25_5%_45%)]",
                )}
              >
                {value === "mes" ? "Mês" : "Semana"}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              aria-label="Período anterior"
              onClick={() => setAnchor(period === "semana" ? addIsoDays(anchor, -7) : shiftIsoMonth(anchor, -1))}
              className="inline-flex size-[38px] items-center justify-center rounded-[10px] border border-[hsl(30_8%_88%)] bg-white text-[hsl(25_5%_35%)] hover:bg-[hsl(30_8%_96%)]"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="inline-flex h-[38px] items-center gap-2.5 rounded-[10px] border border-[hsl(30_8%_88%)] bg-white px-4 text-[15px] font-semibold">
              <CalendarDays className="size-4 text-[hsl(25_5%_45%)]" />
              {periodLabel}
            </span>
            <button
              type="button"
              aria-label="Próximo período"
              onClick={() => setAnchor(period === "semana" ? addIsoDays(anchor, 7) : shiftIsoMonth(anchor, 1))}
              className="inline-flex size-[38px] items-center justify-center rounded-[10px] border border-[hsl(30_8%_88%)] bg-white text-[hsl(25_5%_35%)] hover:bg-[hsl(30_8%_96%)]"
            >
              <ChevronRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setAnchor(today)}
              className="inline-flex h-[38px] items-center rounded-[9px] border-0 bg-transparent px-2.5 text-sm font-semibold text-[hsl(340_55%_44%)] hover:bg-[hsl(340_60%_97%)]"
            >
              Hoje
            </button>
          </div>
        </div>

        <div className="overflow-auto rounded-xl border border-[hsl(30_8%_90%)] bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {[
                  ["Aluno", ""],
                  ["Aula", ""],
                  ["Turma", ""],
                  ["Avisou em", ""],
                  ["Situação", ""],
                  ["Observação", "min-w-[220px]"],
                ].map(([label, className]) => (
                  <th key={label} className={cn("h-10 border-b border-[hsl(30_8%_90%)] px-3 text-left text-[11px] font-semibold uppercase tracking-[.05em] text-[hsl(25_5%_45%)]", className)}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => {
                const contact = studio.data.contatos.find(({ id }) => id === notice.contato_id);
                const turma = studio.data.turmas.find(({ id }) => id === notice.turma_id);
                const aula = studio.data.aulas.find((item) => item.data === notice.data && item.turma_id === notice.turma_id);
                const attendance = studio.data.presencas.find((item) => item.aula_id === aula?.id && item.contato_id === notice.contato_id);
                const status = absenceStatus(notice.data, attendance?.status, today);
                return (
                  <tr key={notice.id} className="border-b border-[hsl(30_8%_94%)] last:border-0">
                    <td className="p-3 align-top"><strong>{contact?.nome ?? "Contato"}</strong></td>
                    <td className="p-3 align-top">{formatDate(notice.data)}</td>
                    <td className="p-3 align-top">{turma?.nome ?? "Turma"}</td>
                    <td className="p-3 align-top">{formatDate(notice.avisou_em)}</td>
                    <td className="p-3 align-top">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold whitespace-nowrap",
                        status === "falta_confirmada" && "bg-[hsla(24,70%,45%,.14)] text-[hsl(24_60%_34%)]",
                        status === "acabou_indo" && "bg-[hsla(152,35%,40%,.14)] text-[hsl(152_35%_26%)]",
                        status === "sem_chamada" && "border border-[hsl(30_8%_88%)] text-[hsl(25_5%_45%)]",
                        status === "falta_esperada" && "bg-[hsla(38,85%,50%,.16)] text-[hsl(30_62%_30%)]",
                      )}>
                        {absenceLabels[status]}
                      </span>
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-1.5">
                        <Input
                          aria-label={`Observação de ${contact?.nome ?? "contato"}`}
                          defaultValue={notice.obs ?? ""}
                          placeholder="Observação (opcional)"
                          className="h-8 min-w-[180px] rounded-lg border-[hsl(30_8%_88%)] px-2.5 text-[13px]"
                          onBlur={(event) => {
                            if (event.currentTarget.value !== (notice.obs ?? "")) {
                              update.mutate({ id: notice.id, obs: event.currentTarget.value });
                            }
                          }}
                        />
                        <button
                          type="button"
                          aria-label="Excluir aviso"
                          disabled={remove.isPending}
                          onClick={() => remove.mutate(notice.id)}
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded-[7px] border-0 bg-transparent text-[hsl(25_5%_50%)] hover:bg-[hsl(30_8%_96%)]"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {notices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-[hsl(25_5%_45%)]">
                    Nenhum aviso neste período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
