import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  studioDataQueryKey,
  updateAviso,
} from "@/features/app-enxuto/api";
import {
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
import { formatDate } from "@/lib/format";

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

export function ConfirmacoesPage({ startDate, embedded = false }: ConfirmacoesPageProps = {}) {
  const { member } = useAuth();
  const queryClient = useQueryClient();
  const studio = useStudioData();
  const [filter, setFilter] = useState<Filter>("todos");
  const [replacement, setReplacement] = useState<ReplacementSource | null>(null);
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
    return occurrencesForRange(studio.data.turmas, today, 8).map((occurrence) => {
      const students = studio.data.matriculas
        .filter(({ turma_id, status }) =>
          turma_id === occurrence.turma.id && ["Ativa", "Nova"].includes(status))
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
  }, [studio.data, today]);

  if (studio.isLoading) return <LoadingState />;
  if (studio.error) return <ErrorState error={studio.error} />;

  const rows = classes.flatMap(({ students }) => students);
  const totals = rows.reduce<Record<ConfirmationStatus, number>>(
    (result, row) => ({ ...result, [row.status]: result[row.status] + 1 }),
    { confirmou: 0, nao_vem: 0, sem_resposta: 0 },
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3" aria-label={embedded ? "Resumo das confirmações" : undefined}>
        <Card><CardHeader><CardTitle>{totals.confirmou} confirmados</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardTitle>{totals.nao_vem} não vêm</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardTitle>{totals.sem_resposta} sem resposta</CardTitle></CardHeader></Card>
      </div>
      <ToggleGroup
        type="single"
        variant="outline"
        value={filter}
        onValueChange={(value) => value && setFilter(value as Filter)}
      >
        <ToggleGroupItem value="todos">Todos</ToggleGroupItem>
        <ToggleGroupItem value="sem_resposta">Sem resposta</ToggleGroupItem>
      </ToggleGroup>

      {classes.map(({ data, turma, students }) => {
        const visible = students.filter((student) =>
          filter === "todos" || student.status === "sem_resposta");
        if (visible.length === 0) return null;
        return (
          <Card key={`${data}-${turma.id}`}>
            <CardHeader>
              <CardTitle>{formatDate(data)} · {turma.nome}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-4">
                {visible.map(({ contact, status, notice }) => contact && (
                  <li key={contact.id} className="flex flex-col gap-3 border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <strong>{contact.nome}</strong>
                        {status === "sem_resposta" && <Badge variant="outline">Sem resposta</Badge>}
                      </div>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        value={status === "sem_resposta" ? "" : status}
                        disabled={saveStatus.isPending}
                        onValueChange={(value) => saveStatus.mutate({
                          data,
                          turmaId: turma.id,
                          contatoId: contact.id,
                          por: member?.nome ?? "Usuário",
                          status: value ? value as "confirmou" | "nao_vem" : null,
                          today,
                        })}
                      >
                        <ToggleGroupItem value="confirmou">Confirmou</ToggleGroupItem>
                        <ToggleGroupItem value="nao_vem">Não vem</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    {status === "nao_vem" && (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        {notice && (
                          <Input
                            aria-label={`Observação de ${contact.nome}`}
                            defaultValue={notice.obs ?? ""}
                            placeholder="Observação do aviso"
                            onBlur={(event) => {
                              if (event.currentTarget.value !== (notice.obs ?? "")) {
                                saveObservation.mutate({ id: notice.id, obs: event.currentTarget.value });
                              }
                            }}
                          />
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setReplacement({ contatoId: contact.id, turmaId: turma.id, data })}
                        >
                          <CalendarClock data-icon="inline-start" />
                          Remarcar
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}

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
