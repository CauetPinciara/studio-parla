import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  saveReposicao,
  studioDataQueryKey,
} from "@/features/app-enxuto/api";
import {
  addIsoDays,
  classCapacity,
  occurrencesForRange,
} from "@/features/app-enxuto/domain";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { formatDate } from "@/lib/format";

interface ReposicaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contatoId: string;
  origemData: string;
  origemTurmaId: string;
}

export function ReposicaoDialog({
  open,
  onOpenChange,
  contatoId,
  origemData,
  origemTurmaId,
}: ReposicaoDialogProps) {
  const queryClient = useQueryClient();
  const studio = useStudioData();
  const save = useMutation({
    mutationFn: saveReposicao,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studioDataQueryKey });
      onOpenChange(false);
      toast.success("Reposição marcada");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const choices = useMemo(() => {
    if (!studio.data) return [];
    return occurrencesForRange(
      studio.data.turmas,
      addIsoDays(origemData, 1),
      35,
    )
      .map((occurrence) => ({
        ...occurrence,
        capacity: classCapacity({
          turma: occurrence.turma,
          data: occurrence.data,
          matriculas: studio.data.matriculas,
          avisos: studio.data.avisos,
          reposicoes: studio.data.reposicoes,
        }),
      }))
      .filter(({ capacity }) => capacity.vagas > 0)
      .slice(0, 12);
  }, [origemData, studio.data]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Marcar reposição"
      description="Escolha uma próxima aula com vaga."
    >
      {studio.isLoading ? (
        <LoadingState />
      ) : studio.error ? (
        <ErrorState error={studio.error} />
      ) : (
        <div className="flex flex-col gap-2">
          {choices.map(({ data, turma, capacity }) => (
            <Button
              key={`${data}-${turma.id}`}
              type="button"
              variant="outline"
              className="h-auto justify-between py-3"
              disabled={save.isPending}
              onClick={() => save.mutate({
                contato_id: contatoId,
                origem_data: origemData,
                origem_turma_id: origemTurmaId,
                destino_data: data,
                destino_turma_id: turma.id,
              })}
            >
              <span className="flex flex-col items-start gap-1">
                <strong>{formatDate(data)}</strong>
                <span>{turma.nome} · {turma.hora?.slice(0, 5)}</span>
              </span>
              <Badge variant="secondary">{capacity.vagas} vagas</Badge>
            </Button>
          ))}
          {choices.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma aula com vaga nas próximas semanas.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
