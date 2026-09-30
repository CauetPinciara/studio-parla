import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { studioDataQueryKey, updateAviso } from "@/features/app-enxuto/api";
import {
  addIsoDays,
  confirmationStatus,
  occurrencesForRange,
  type ConfirmationStatus,
} from "@/features/app-enxuto/domain";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { setConfirmation } from "@/features/confirmacoes/api";
import { ReposicaoDialog } from "@/features/reposicoes/ReposicaoDialog";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { useAuth } from "@/lib/auth";
import { localDateIso } from "@/lib/date";
import { cn } from "@/lib/utils";

type Filter = "todos" | "sem_resposta";

interface ReplacementSource {
  contatoId: string;
  turmaId: string;
  data: string;
}

interface ConfirmacoesPageProps {
  startDate?: string;
  embedded?: boolean;
}

function dateParts(value: string) {
  const date = new Date(`${value}T12:00:00`);
  const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return {
    day: value.slice(8),
    month: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", ""),
    weekday: weekdays[date.getDay()],
    longDate: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" }).format(date),
  };
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export function ConfirmacoesPage({ startDate, embedded = false }: ConfirmacoesPageProps = {}) {
  const { member } = useAuth();
  const queryClient = useQueryClient();
  const studio = useStudioData();
  const [filter, setFilter] = useState<Filter>("todos");
  const [replacement, setReplacement] = useState<ReplacementSource | null>(null);
  const [openClasses, setOpenClasses] = useState<Record<string, boolean>>({});
  const [observationDrafts, setObservationDrafts] = useState<Record<string, string>>({});
  const today = startDate ?? localDateIso();

  const refresh = () => queryClient.invalidateQueries({ queryKey: studioDataQueryKey });
  const saveStatus = useMutation({
    mutationFn: setConfirmation,
    onSuccess: () => void refresh(),
    onError: (error: Error) => toast.error(error.message),
  });
  const saveObservation = useMutation({
    mutationFn: ({ id, obs }: { id: string; obs: string }) => updateAviso(id, { obs }),
    onSuccess: () => void refresh(),
    onError: (error: Error) => toast.error(error.message),
  });

  const classes = useMemo(() => {
    if (!studio.data) return [];
    const occurrences = embedded
      ? occurrencesForRange(studio.data.turmas, today, 56).slice(0, 8)
      : occurrencesForRange(studio.data.turmas, today, 8);
    return occurrences.map((occurrence) => {
      const students = studio.data.matriculas
        .filter(({ turma_id, status }) => turma_id === occurrence.turma.id && ["Ativa", "Nova"].includes(status))
        .map((enrollment) => {
          const contact = studio.data.contatos.find(({ id }) => id === enrollment.contato_id);
          const confirmation = studio.data.confirmacoes.find((item) =>
            item.data === occurrence.data
            && item.turma_id === occurrence.turma.id
            && item.contato_id === enrollment.contato_id);
          const notice = studio.data.avisos.find((item) =>
            item.data === occurrence.data
            && item.turma_id === occurrence.turma.id
            && item.contato_id === enrollment.contato_id);
          return {
            enrollment,
            contact,
            confirmation,
            notice,
            status: confirmationStatus(confirmation, notice),
          };
        })
        .filter(({ contact }) => contact);
      return { ...occurrence, students };
    }).filter(({ students }) => students.length > 0);
  }, [embedded, studio.data, today]);

  if (studio.isLoading) return <LoadingState />;
  if (studio.error) return <ErrorState error={studio.error} />;

  const rows = classes.flatMap(({ students }) => students);
  const totals = rows.reduce<Record<ConfirmationStatus, number>>(
    (result, row) => ({ ...result, [row.status]: result[row.status] + 1 }),
    { confirmou: 0, nao_vem: 0, sem_resposta: 0 },
  );
  const days = Array.from(new Set(classes.map(({ data }) => data))).map((data) => ({
    data,
    classes: classes.filter((item) => item.data === data),
  }));

  const changeStatus = (
    data: string,
    turmaId: string,
    contatoId: string,
    status: "confirmou" | "nao_vem" | null,
  ) => {
    const obs = observationDrafts[`${data}-${contatoId}`]?.trim();
    saveStatus.mutate({
      data,
      turmaId,
      contatoId,
      por: member?.nome ?? "Usuário",
      status,
      today,
      ...(status === "nao_vem" && obs ? { obs } : {}),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border border-[hsl(30_8%_90%)] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(24,20,18,.04)]"
        aria-label={embedded ? "Resumo das confirmações" : undefined}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex flex-col leading-[1.2]">
            <strong className="text-xl leading-[1.2] tabular-nums text-[hsl(152_35%_28%)]">{totals.confirmou}</strong>
            <span className="text-xs leading-[1.2] text-[hsl(25_5%_45%)]">confirmados</span>
          </span>
          <span className="flex flex-col leading-[1.2]">
            <strong className="text-xl leading-[1.2] tabular-nums text-[hsl(30_62%_32%)]">{totals.nao_vem}</strong>
            <span className="text-xs leading-[1.2] text-[hsl(25_5%_45%)]">não vêm</span>
          </span>
          <span className="flex flex-col leading-[1.2]">
            <strong className="text-xl leading-[1.2] tabular-nums">{totals.sem_resposta}</strong>
            <span className="text-xs leading-[1.2] text-[hsl(25_5%_45%)]">sem resposta</span>
          </span>
        </div>
        <div className="ml-auto inline-flex gap-0.5 rounded-[9px] border border-[hsl(30_8%_90%)] bg-[hsl(30_10%_97%)] p-[3px]" role="group" aria-label="Filtrar confirmações">
          <button
            type="button"
            aria-pressed={filter === "todos"}
            onClick={() => setFilter("todos")}
            className={cn(
              "inline-flex h-8 items-center rounded-[7px] border-0 px-3 text-[13px] font-semibold",
              filter === "todos" ? "bg-[hsl(340_72%_64%)] text-white" : "bg-transparent text-[hsl(25_5%_45%)]",
            )}
          >
            Todos
          </button>
          <button
            type="button"
            aria-pressed={filter === "sem_resposta"}
            onClick={() => setFilter("sem_resposta")}
            className={cn(
              "inline-flex h-8 items-center rounded-[7px] border-0 px-3 text-[13px] font-semibold",
              filter === "sem_resposta" ? "bg-[hsl(340_72%_64%)] text-white" : "bg-transparent text-[hsl(25_5%_45%)]",
            )}
          >
            Só sem resposta
          </button>
        </div>
      </div>

      {days.map(({ data, classes: dayClasses }) => {
        const parts = dateParts(data);
        const relative = data === today ? "Hoje" : data === addIsoDays(today, 1) ? "Amanhã" : "";
        return (
          <section key={data} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-[42px] shrink-0 flex-col items-center justify-center rounded-[10px] bg-[hsl(30_8%_95%)] font-bold leading-[1.15] text-[hsl(25_5%_32%)]">
                <span className="text-sm">{parts.day}</span>
                <span className="text-[9px] uppercase tracking-[.06em]">{parts.month}</span>
              </span>
              <span className="flex min-w-0 flex-col leading-[1.3]">
                <span className="text-[15px] font-semibold">{parts.weekday}</span>
                <span className="text-xs text-[hsl(25_5%_48%)]">{parts.longDate}</span>
              </span>
              {relative && (
                <span className="inline-flex items-center rounded-full bg-[hsla(340,72%,64%,.14)] px-2.5 py-[3px] text-xs font-semibold text-[hsl(340_45%_38%)]">
                  {relative}
                </span>
              )}
            </div>

            {dayClasses.map(({ turma, students }) => {
              const visible = students.filter((student) => filter === "todos" || student.status === "sem_resposta");
              const key = `${data}-${turma.id}`;
              const open = openClasses[key] ?? true;
              const confirmed = students.filter(({ status }) => status === "confirmou").length;
              const absent = students.filter(({ status }) => status === "nao_vem").length;
              const pending = students.length - confirmed - absent;
              const complete = pending === 0;
              return (
                <div key={key} className="overflow-hidden rounded-xl border border-[hsl(30_8%_90%)] bg-white shadow-[0_1px_2px_rgba(24,20,18,.04)]">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`${key}-students`}
                    onClick={() => setOpenClasses((current) => ({ ...current, [key]: !open }))}
                    className={cn(
                      "flex w-full items-center gap-3 border-0 bg-white px-4 py-3 text-left hover:bg-[hsl(30_10%_98%)]",
                      open && "border-b border-[hsl(30_8%_92%)]",
                    )}
                  >
                    <span className={cn(
                      "inline-flex size-[38px] shrink-0 items-center justify-center rounded-[10px] text-xs font-bold",
                      complete
                        ? "bg-[hsla(152,35%,40%,.14)] text-[hsl(152_35%_28%)]"
                        : "bg-[hsla(340,72%,64%,.14)] text-[hsl(340_45%_38%)]",
                    )}>
                      {turma.hora ? `${turma.hora.slice(0, 2)}h` : "-"}
                    </span>
                    <span className="flex min-w-0 flex-col items-start leading-[1.3]">
                      <h3 className="m-0 text-sm font-semibold leading-[1.3]">{turma.nome}</h3>
                      <span className="text-xs text-[hsl(25_5%_48%)]">
                        {turma.hora?.slice(0, 5) ?? "-"}–{turma.fim?.slice(0, 5) ?? "-"} · {students.length} {students.length === 1 ? "matriculado" : "matriculados"}
                      </span>
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-1.5">
                      {confirmed > 0 && (
                        <span className="inline-flex items-center rounded-full bg-[hsla(152,30%,36%,.12)] px-2.5 py-[3px] text-xs font-semibold text-[hsl(152_35%_28%)]">
                          {confirmed} {confirmed === 1 ? "confirmado" : "confirmados"}
                        </span>
                      )}
                      {absent > 0 && (
                        <span className="inline-flex items-center rounded-full bg-[hsla(38,80%,46%,.16)] px-2.5 py-[3px] text-xs font-semibold text-[hsl(30_62%_30%)]">
                          {absent} {absent === 1 ? "não vem" : "não vêm"}
                        </span>
                      )}
                      {pending > 0 && (
                        <span className="inline-flex items-center rounded-full border border-[hsl(30_8%_88%)] px-2.5 py-[3px] text-xs font-semibold text-[hsl(25_5%_45%)]">
                          {pending} sem resposta
                        </span>
                      )}
                      <ChevronDown className={cn("size-4 text-[hsl(25_5%_55%)] transition-transform", open && "rotate-180")} />
                    </span>
                  </button>

                  {open && (
                    <ul id={`${key}-students`} className="m-0 flex list-none flex-col p-0">
                      {visible.map(({ contact, confirmation, status, notice }, index) => contact && (
                        <li
                          key={contact.id}
                          className={cn(
                            "grid grid-cols-[28px_minmax(0,1fr)] items-center gap-2.5 px-4 py-2.5 lg:grid-cols-[28px_minmax(110px,1fr)_minmax(0,170px)_0px_206px]",
                            status === "nao_vem" && "lg:grid-cols-[28px_minmax(110px,1fr)_minmax(0,170px)_minmax(0,132px)_206px]",
                            index + 1 < visible.length && "border-b border-[hsl(30_8%_94%)]",
                          )}
                        >
                          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[hsl(30_8%_93%)] text-[11px] font-bold text-[hsl(25_5%_40%)]">
                            {initials(contact.nome)}
                          </span>
                          <span className="flex min-w-0 flex-col gap-px">
                            <span className="truncate font-medium">{contact.nome}</span>
                            <span className={cn(
                              "truncate whitespace-nowrap text-[11px]",
                              status === "confirmou" && "text-[hsl(152_35%_30%)]",
                              status === "nao_vem" && "text-[hsl(30_62%_32%)]",
                              status === "sem_resposta" && "text-[hsl(25_5%_55%)]",
                            )}>
                              {confirmation
                                ? `${confirmation.status === "confirmou" ? "Confirmou" : "Não vem"} · ${confirmation.por}`
                                : notice
                                  ? `Avisou em ${notice.avisou_em.slice(8, 10)}/${notice.avisou_em.slice(5, 7)}`
                                  : "Sem resposta"}
                            </span>
                          </span>
                          <input
                            type="text"
                            value={observationDrafts[`${data}-${contact.id}`] ?? notice?.obs ?? ""}
                            onChange={(event) => setObservationDrafts((current) => ({
                              ...current,
                              [`${data}-${contact.id}`]: event.currentTarget.value,
                            }))}
                            onBlur={(event) => {
                              if (notice && event.currentTarget.value !== (notice.obs ?? "")) {
                                saveObservation.mutate({ id: notice.id, obs: event.currentTarget.value });
                              }
                            }}
                            aria-label={`Observação de ${contact.nome}`}
                            placeholder="Observação (opcional)"
                            className={cn(
                              "col-span-2 h-8 w-full rounded-lg border bg-white px-2.5 text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring lg:col-span-1",
                              status === "nao_vem" ? "border-[hsl(38_45%_80%)]" : "border-[hsl(30_8%_88%)]",
                            )}
                          />
                          <span className="col-span-2 flex min-w-0 justify-end overflow-hidden lg:col-span-1">
                            {status === "nao_vem" && (
                              <button
                                type="button"
                                onClick={() => setReplacement({ contatoId: contact.id, turmaId: turma.id, data })}
                                className="inline-flex h-[30px] w-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-dashed border-[hsl(30_8%_85%)] bg-transparent px-2 text-xs font-semibold text-[hsl(25_5%_45%)]"
                              >
                                Remarcar
                              </button>
                            )}
                          </span>
                          <span role="radiogroup" aria-label={`Confirmação de ${contact.nome}`} className="col-span-2 inline-flex w-full overflow-hidden rounded-[9px] border border-[hsl(30_8%_88%)] lg:col-span-1">
                            <button
                              type="button"
                              role="radio"
                              aria-checked={status === "confirmou"}
                              disabled={saveStatus.isPending}
                              onClick={() => changeStatus(data, turma.id, contact.id, "confirmou")}
                              className={cn(
                                "inline-flex h-8 min-w-0 flex-1 items-center justify-center border-0 px-0 text-[13px] font-semibold whitespace-nowrap",
                                status === "confirmou" ? "bg-[hsl(152_32%_34%)] text-white" : "bg-white text-[hsl(25_5%_45%)]",
                              )}
                            >
                              <span className={cn("flex overflow-hidden transition-all", status === "confirmou" ? "mr-1.5 w-3.5 opacity-100" : "mr-0 w-0 opacity-0")}><Check className="size-3.5" /></span>
                              Confirmou
                            </button>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={status === "nao_vem"}
                              disabled={saveStatus.isPending}
                              onClick={() => changeStatus(data, turma.id, contact.id, "nao_vem")}
                              className={cn(
                                "inline-flex h-8 min-w-0 flex-1 items-center justify-center border-0 border-l border-[hsl(30_8%_88%)] px-0 text-[13px] font-semibold whitespace-nowrap",
                                status === "nao_vem" ? "bg-[hsl(38_70%_42%)] text-white" : "bg-white text-[hsl(25_5%_45%)]",
                              )}
                            >
                              <span className={cn("flex overflow-hidden transition-all", status === "nao_vem" ? "mr-1.5 w-3.5 opacity-100" : "mr-0 w-0 opacity-0")}><Check className="size-3.5" /></span>
                              Não vem
                            </button>
                            <button
                              type="button"
                              disabled={saveStatus.isPending}
                              title="Sem resposta"
                              aria-label="Sem resposta"
                              onClick={() => changeStatus(data, turma.id, contact.id, null)}
                              className={cn(
                                "inline-flex h-8 w-[38px] shrink-0 items-center justify-center border-0 border-l border-[hsl(30_8%_88%)] p-0",
                                status === "sem_resposta" ? "bg-[hsl(30_8%_92%)] text-[hsl(25_5%_35%)]" : "bg-white text-[hsl(25_5%_55%)]",
                              )}
                            >
                              <RotateCcw className="size-3.5" />
                            </button>
                          </span>
                        </li>
                      ))}
                      {visible.length === 0 && (
                        <li className="px-4 py-5 text-[13px] text-[hsl(25_5%_48%)]">
                          Todos os alunos desta turma já responderam.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}

      {days.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[hsl(30_8%_88%)] p-12 text-center">
          <strong className="text-base">Nenhuma aula nos próximos 7 dias</strong>
          <span className="text-sm text-[hsl(25_5%_45%)]">Cadastre turmas em Cadastros → Turmas.</span>
        </div>
      )}

      {replacement && (
        <ReposicaoDialog
          open
          onOpenChange={(open) => !open && setReplacement(null)}
          contatoId={replacement.contatoId}
          origemData={replacement.data}
          origemTurmaId={replacement.turmaId}
        />
      )}
    </div>
  );
}

export default ConfirmacoesPage;
