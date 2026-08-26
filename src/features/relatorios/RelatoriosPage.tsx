import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Insert } from "@/lib/database.types";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { listContatos } from "@/features/contatos/api";
import { PecaForm } from "@/features/pecas/PecaForm";
import { createPeca, listPecas, setPecaStatus } from "@/features/pecas/api";
import { PecaBadge } from "@/features/pecas/PecasPage";
import { AttendanceBlocks } from "@/features/relatorios/AttendanceBlocks";
import { RelatorioForm } from "@/features/relatorios/RelatorioForm";
import { createRelatorio, listRelatorios, relatoriosQueryKey, updateRelatorio } from "@/features/relatorios/api";
import { attendanceDayQueryKey, loadAttendanceDay, upsertAttendance } from "@/features/relatorios/attendance-api";
import { normalizeReportDate, reportTodayIso } from "@/features/relatorios/date-navigation";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { listTurmas } from "@/features/turmas/api";

export default function RelatoriosPage() {
  const client = useQueryClient();
  const { member } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reportOpen, setReportOpen] = useState(false);
  const [pieceOpen, setPieceOpen] = useState(false);
  const today = reportTodayIso();
  const candidate = searchParams.get("data");
  const selectedDate = normalizeReportDate(candidate, today);

  useEffect(() => {
    if (candidate !== selectedDate) {
      setSearchParams({ data: selectedDate }, { replace: true });
    }
  }, [candidate, selectedDate, setSearchParams]);

  const relatorios = useQuery({ queryKey: relatoriosQueryKey, queryFn: listRelatorios });
  const pecas = useQuery({ queryKey: ["pecas"], queryFn: listPecas });
  const contatos = useQuery({ queryKey: ["contatos"], queryFn: listContatos });
  const turmas = useQuery({ queryKey: ["turmas"], queryFn: listTurmas });
  const attendanceDay = useQuery({
    queryKey: attendanceDayQueryKey(selectedDate),
    queryFn: () => loadAttendanceDay(selectedDate),
  });
  const report = relatorios.data?.find((item) => item.data === selectedDate);
  const goToDate = (date: string) => setSearchParams({ data: date });
  const refreshReports = () => client.invalidateQueries({ queryKey: relatoriosQueryKey });
  const refreshPieces = () => client.invalidateQueries({ queryKey: ["pecas"] });

  const saveReport = useMutation({
    mutationFn: (value: Insert<"relatorios">) => report
      ? updateRelatorio(report.id, value)
      : createRelatorio(value),
    onSuccess: (saved) => {
      void refreshReports();
      setReportOpen(false);
      if (saved) goToDate(saved.data);
      toast.success("Dia salvo");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const savePiece = useMutation({
    mutationFn: createPeca,
    onSuccess: () => {
      void refreshPieces();
      setPieceOpen(false);
      toast.success("Peça registrada");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const ready = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => setPecaStatus(id, "pronta", date),
    onSuccess: () => {
      void refreshPieces();
      toast.success("Marcada como pronta");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const attendance = useMutation({
    mutationFn: upsertAttendance,
    onSuccess: (_saved, variables) => {
      void client.invalidateQueries({
        queryKey: attendanceDayQueryKey(variables.data),
      });
      toast.success(
        variables.status === "presente"
          ? "Presença registrada"
          : "Falta registrada",
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (relatorios.isLoading || pecas.isLoading || contatos.isLoading || turmas.isLoading || attendanceDay.isLoading) {
    return <LoadingState />;
  }
  const error = relatorios.error ?? attendanceDay.error ?? pecas.error ?? contatos.error ?? turmas.error;
  if (error) return <ErrorState error={error} />;

  const pessoa = (id: string) => contatos.data?.find((item) => item.id === id)?.nome ?? "?";
  const turma = (id: string | null) => turmas.data?.find((item) => item.id === id)?.nome ?? "Geral";
  const left = pecas.data?.filter((item) => item.data_deixou === selectedDate) ?? [];
  const done = pecas.data?.filter((item) => item.data_pronta === selectedDate) ?? [];
  const production = pecas.data?.filter((item) => item.status === "producao") ?? [];

  return <div className="flex flex-col gap-6">
    <AttendanceBlocks
      day={attendanceDay.data!}
      pending={attendance.isPending}
      onMark={attendance.mutate}
    />

    <Card>
      <CardHeader>
        <CardTitle>Resumo do dia</CardTitle>
        <CardDescription>{report ? `${turma(report.turma_id)} · por ${report.autor ?? "Catarina"}` : "Nenhum registro salvo para esta data."}</CardDescription>
      </CardHeader>
      <CardContent><p className={report?.resumo ? undefined : "text-muted-foreground"}>{report?.resumo || "Sem resumo."}</p></CardContent>
      <CardFooter><Button variant="outline" onClick={() => setReportOpen(true)}>{report ? <Pencil data-icon="inline-start" /> : <Plus data-icon="inline-start" />}{report ? "Editar dia" : "Anotar este dia"}</Button></CardFooter>
    </Card>

    <section className="flex flex-col gap-3">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Peças deixadas neste dia</h2>
        <Button className="w-full sm:w-auto" size="sm" onClick={() => setPieceOpen(true)}><Plus data-icon="inline-start" />Registrar peça</Button>
      </div>
      <DataTable rows={left} getRowKey={(row) => row.id} emptyMessage="Nenhuma peça registrada neste dia." columns={[
        { key: "aluno", header: "Aluno", cell: (row) => <strong>{pessoa(row.contato_id)}</strong> },
        { key: "peca", header: "Peça", cell: (row) => row.descricao },
        { key: "estimativa", header: "Estimativa", cell: (row) => row.estimativa },
        { key: "status", header: "Status", cell: (row) => <PecaBadge status={row.status} /> },
      ]} />
    </section>

    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Marcar peças como prontas hoje</h2>
      <DataTable rows={production} getRowKey={(row) => row.id} emptyMessage="Nenhuma peça em produção." columns={[
        { key: "aluno", header: "Aluno", cell: (row) => <strong>{pessoa(row.contato_id)}</strong> },
        { key: "peca", header: "Peça", cell: (row) => row.descricao },
        { key: "deixou", header: "Deixou", cell: (row) => formatDate(row.data_deixou) },
        { key: "acao", header: "", cell: (row) => <div className="text-right"><Button size="sm" disabled={ready.isPending} onClick={() => ready.mutate({ id: row.id, date: selectedDate })}>Ficou pronta hoje</Button></div> },
      ]} />
    </section>

    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Peças que ficaram prontas neste dia</h2>
      <DataTable rows={done} getRowKey={(row) => row.id} emptyMessage="Nenhuma peça marcada como pronta neste dia." columns={[
        { key: "aluno", header: "Aluno", cell: (row) => <strong>{pessoa(row.contato_id)}</strong> },
        { key: "peca", header: "Peça", cell: (row) => row.descricao },
        { key: "status", header: "Status", cell: (row) => <PecaBadge status={row.status} /> },
      ]} />
    </section>

    <RelatorioForm key={report?.id ?? selectedDate} open={reportOpen} onOpenChange={setReportOpen} relatorio={report} selectedDate={selectedDate} turmas={turmas.data ?? []} author={member?.nome ?? "Catarina"} pending={saveReport.isPending} onSubmit={(value) => saveReport.mutate(value)} />
    <PecaForm key={`piece-${selectedDate}`} open={pieceOpen} onOpenChange={setPieceOpen} contatos={contatos.data ?? []} date={selectedDate} pending={savePiece.isPending} onSubmit={(value) => savePiece.mutate(value)} />
  </div>;
}
