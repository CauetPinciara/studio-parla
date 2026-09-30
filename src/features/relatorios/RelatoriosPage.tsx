import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { PageHeaderAction } from "@/components/PageHeaderAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { saveDailyReport, studioDataQueryKey, toggleDailyReport } from "@/features/app-enxuto/api";
import { addIsoDays, reportStepsForRole } from "@/features/app-enxuto/domain";
import type { AwaitedStudioData } from "@/features/app-enxuto/types";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { ConfirmacoesPage } from "@/features/confirmacoes/ConfirmacoesPage";
import { PagamentosPanel } from "@/features/pagamentos/PagamentosPanel";
import { PecaForm } from "@/features/pecas/PecaForm";
import { createPeca, setPecaStatus } from "@/features/pecas/api";
import { getNextPecaStatus, pecaActionLabels, pecaStatusLabels, type PecaStatus } from "@/features/pecas/domain";
import { ReposicaoDialog } from "@/features/reposicoes/ReposicaoDialog";
import { AttendanceBlocks } from "@/features/relatorios/AttendanceBlocks";
import { attendanceDayQueryKey, loadAttendanceDay, upsertAttendance } from "@/features/relatorios/attendance-api";
import type { AttendanceDay } from "@/features/relatorios/attendance-domain";
import { normalizeReportDate, reportTodayIso } from "@/features/relatorios/date-navigation";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";

interface ReplacementSource {
  contatoId: string;
  turmaId: string;
  data: string;
}

export default function RelatoriosPage() {
  const queryClient = useQueryClient();
  const { member } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stepState, setStepState] = useState({ key: "", index: 0 });
  const [pieceOpen, setPieceOpen] = useState(false);
  const [replacement, setReplacement] = useState<ReplacementSource | null>(null);
  const today = reportTodayIso();
  const candidate = searchParams.get("data");
  const selectedDate = normalizeReportDate(candidate, today);
  const yesterday = addIsoDays(selectedDate, -1);
  const role = member?.papel ?? "admin";
  const author = member?.nome ?? (role === "atendimento" ? "Isabela" : "Catarina");
  const steps = reportStepsForRole(role);
  const flowKey = `${role}:${selectedDate}`;
  const stepIndex = stepState.key === flowKey ? stepState.index : 0;
  const setStepIndex = (next: number | ((current: number) => number)) => {
    const index = typeof next === "function" ? next(stepIndex) : next;
    setStepState({ key: flowKey, index });
  };
  const activeStep = steps[stepIndex] ?? steps[0];
  const studio = useStudioData();
  const attendanceDay = useQuery({ queryKey: attendanceDayQueryKey(selectedDate), queryFn: () => loadAttendanceDay(selectedDate) });
  const previousDay = useQuery({ queryKey: attendanceDayQueryKey(yesterday), queryFn: () => loadAttendanceDay(yesterday), enabled: role === "atendimento" });

  useEffect(() => {
    if (candidate !== selectedDate) setSearchParams({ data: selectedDate }, { replace: true });
  }, [candidate, selectedDate, setSearchParams]);

  const currentReport = studio.data?.relatorios.find((item) => item.data === selectedDate && item.autor === author);
  const reportKey = currentReport?.id ?? `${selectedDate}:${author}`;
  const [observationState, setObservationState] = useState({ key: "", value: "" });
  const observation = observationState.key === reportKey ? observationState.value : currentReport?.resumo ?? "";
  const setObservation = (value: string) => setObservationState({ key: reportKey, value });

  const refreshStudio = () => queryClient.invalidateQueries({ queryKey: studioDataQueryKey });
  const attendance = useMutation({
    mutationFn: upsertAttendance,
    onSuccess: (_saved, variables) => {
      void queryClient.invalidateQueries({ queryKey: attendanceDayQueryKey(variables.data) });
      void refreshStudio();
      toast.success(variables.status === "presente" ? "Presença registrada" : "Falta registrada");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const savePiece = useMutation({
    mutationFn: createPeca,
    onSuccess: () => { void refreshStudio(); setPieceOpen(false); toast.success("Peça registrada"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const advancePiece = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PecaStatus }) => setPecaStatus(id, status, selectedDate),
    onSuccess: () => { void refreshStudio(); toast.success("Status da peça atualizado"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const saveObservation = useMutation({
    mutationFn: () => saveDailyReport({ data: selectedDate, autor: author, resumo: observation, turma_id: null, concluido_em: currentReport?.concluido_em ?? null }),
    onSuccess: () => { void refreshStudio(); toast.success("Observação salva"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const closeDay = useMutation({
    mutationFn: async () => {
      const saved = await saveDailyReport({ data: selectedDate, autor: author, resumo: observation, turma_id: null, concluido_em: currentReport?.concluido_em ?? null });
      if (!saved) throw new Error("Não foi possível salvar o relatório do dia.");
      const toggled = await toggleDailyReport({ id: saved.id, concluido_em: saved.concluido_em });
      if (!toggled) throw new Error("Não foi possível atualizar o fechamento do dia.");
      return toggled;
    },
    onSuccess: (saved) => { void refreshStudio(); toast.success(saved.concluido_em ? "Dia fechado" : "Dia reaberto"); },
    onError: (error: Error) => toast.error(error.message),
  });

  const allPieces = studio.data?.pecas ?? [];
  const pieces = {
    left: allPieces.filter((item) => item.data_deixou === selectedDate),
    kiln: allPieces.filter((item) => item.status !== "entregue"),
  };

  if (studio.isLoading || attendanceDay.isLoading || (role === "atendimento" && previousDay.isLoading)) return <LoadingState />;
  const error = studio.error ?? attendanceDay.error ?? previousDay.error;
  if (error || !studio.data || !attendanceDay.data) return <ErrorState error={error ?? new Error("Não foi possível carregar o relatório.")} />;

  const contactName = (id: string) => studio.data.contatos.find((item) => item.id === id)?.nome ?? "Contato";
  const isLast = stepIndex === steps.length - 1;
  const stepNavigation = (className?: string) => (
    <nav className={`flex gap-1.5 ${className ?? ""}`} aria-label="Etapas do relatório">
      {steps.map((step, index) => (
        <Button
          key={step}
          type="button"
          size="sm"
          variant="outline"
          className={index === stepIndex
            ? "h-[34px] gap-[7px] rounded-full border-foreground bg-foreground py-0 pr-3.5 pl-[7px] text-[13px] font-semibold text-white hover:bg-foreground hover:text-white"
            : "h-[34px] gap-[7px] rounded-full px-1.5 py-0 text-[13px] font-semibold text-nav-foreground"}
          aria-label={step}
          aria-current={index === stepIndex ? "step" : undefined}
          onClick={() => setStepIndex(index)}
        >
          <span className={index === stepIndex
            ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold text-white"
            : "flex size-5 shrink-0 items-center justify-center rounded-full bg-[hsl(30_8%_93%)] text-[11px] font-bold text-nav-foreground"}
          >{role === "atendimento" ? index : index + 1}</span>
          <span className={index === stepIndex ? "inline" : "hidden"}>{step}</span>
        </Button>
      ))}
    </nav>
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeaderAction>{stepNavigation()}</PageHeaderAction>
      {stepNavigation("flex-wrap md:hidden")}

      {activeStep === "Chamada" && (
        <AttendanceBlocks day={attendanceDay.data} pending={attendance.isPending} onMark={attendance.mutate} avisos={studio.data.avisos} reposicoes={studio.data.reposicoes} onReplacement={setReplacement} />
      )}

      {activeStep === "Peças" && (
        <PiecesStep
          left={pieces.left}
          kiln={pieces.kiln}
          contactName={contactName}
          pending={advancePiece.isPending}
          onNew={() => setPieceOpen(true)}
          onAdvance={(id, status) => advancePiece.mutate({ id, status })}
        />
      )}

      {activeStep === "Resumo de ontem" && previousDay.data && (
        <PreviousDaySummary day={previousDay.data} date={yesterday} data={studio.data} contactName={contactName} />
      )}

      {activeStep === "Confirmações" && <ConfirmacoesPage startDate={selectedDate} embedded />}
      {activeStep === "Pagamentos" && <PagamentosPanel data={studio.data} selectedDate={selectedDate} author={author} />}

      {activeStep === "Observações" && (
        <div className="flex flex-col gap-4">
          <Textarea rows={7} value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="O que valeu registrar sobre o dia?" />
          <div className="flex justify-end"><Button type="button" variant="outline" disabled={saveObservation.isPending} onClick={() => saveObservation.mutate()}>Salvar observação</Button></div>
        </div>
      )}

      <footer className="sticky bottom-0 z-30 -mx-5 -mb-8 mt-auto flex h-16 shrink-0 flex-wrap items-center gap-3 border-t bg-[hsl(30_10%_98%)] px-5 md:-mx-7 md:px-6">
        <span className="text-[13px] text-muted-foreground">Etapa {stepIndex + 1} de {steps.length} · {activeStep}</span>
        <div className="ml-auto flex gap-2">
          {stepIndex > 0 && <Button className="h-[38px] rounded-[9px] px-3.5 text-[13px] text-toggle-foreground" type="button" variant="outline" onClick={() => setStepIndex((value) => value - 1)}><ChevronLeft size={16} data-icon="inline-start" />{steps[stepIndex - 1]}</Button>}
          {!isLast && <Button className="h-[38px] rounded-[9px] px-4 text-[13px]" type="button" onClick={() => setStepIndex((value) => value + 1)}>{steps[stepIndex + 1]}<ChevronRight size={16} data-icon="inline-end" /></Button>}
          {isLast && <Button className="h-[38px] rounded-[9px] px-4 text-[13px]" type="button" variant={currentReport?.concluido_em ? "secondary" : "default"} disabled={closeDay.isPending} onClick={() => closeDay.mutate()}><CheckCircle2 size={16} data-icon="inline-start" />{currentReport?.concluido_em ? "Dia fechado" : "Fechar o dia"}</Button>}
        </div>
      </footer>

      <PecaForm key={`piece-${selectedDate}`} open={pieceOpen} onOpenChange={setPieceOpen} contatos={studio.data.contatos} date={selectedDate} pending={savePiece.isPending} onSubmit={(value) => savePiece.mutate(value)} />
      {replacement && <ReposicaoDialog open onOpenChange={(open) => !open && setReplacement(null)} contatoId={replacement.contatoId} origemData={replacement.data} origemTurmaId={replacement.turmaId} />}
    </div>
  );
}

function PiecesStep({ left, kiln, contactName, pending, onNew, onAdvance }: {
  left: AwaitedStudioData["pecas"];
  kiln: AwaitedStudioData["pecas"];
  contactName: (id: string) => string;
  pending: boolean;
  onNew: () => void;
  onAdvance: (id: string, status: PecaStatus) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3"><h2 className="section-title">Peças deixadas neste dia</h2><Button type="button" size="sm" onClick={onNew}><Plus data-icon="inline-start" />Registrar peça</Button></div>
        <DataTable rows={left} getRowKey={({ id }) => id} emptyMessage="Nenhuma peça registrada neste dia." columns={[
          { key: "aluno", header: "Aluno", cell: (row) => <strong>{contactName(row.contato_id)}</strong> },
          { key: "peca", header: "Peça", cell: (row) => row.descricao ?? "Peça sem descrição" },
          { key: "estimativa", header: "Estimativa", cell: (row) => row.estimativa ?? "-" },
          { key: "status", header: "Status", cell: (row) => <Badge variant="secondary">{pecaStatusLabels[row.status as PecaStatus]}</Badge> },
        ]} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="section-title">Fila do forno</h2>
        <DataTable rows={kiln} getRowKey={({ id }) => id} emptyMessage="Nenhuma peça na fila do forno." columns={[
          { key: "aluno", header: "Aluno", cell: (row) => <strong>{contactName(row.contato_id)}</strong> },
          { key: "peca", header: "Peça", cell: (row) => row.descricao ?? "Peça sem descrição" },
          { key: "deixou", header: "Deixou", cell: (row) => formatDate(row.data_deixou) },
          { key: "status", header: "Status", cell: (row) => {
            const next = getNextPecaStatus(row.status);
            return next ? <Button type="button" size="sm" disabled={pending} onClick={() => onAdvance(row.id, next)}>{pecaActionLabels[row.status as PecaStatus]}</Button> : <Badge variant="success">{pecaStatusLabels[row.status as PecaStatus]}</Badge>;
          } },
        ]} />
      </section>
    </div>
  );
}

function PreviousDaySummary({ day, date, data, contactName }: {
  day: AttendanceDay;
  date: string;
  data: AwaitedStudioData;
  contactName: (id: string) => string;
}) {
  const ready = data.pecas.filter(({ status }) => status === "pronta");
  const teacherReport = data.relatorios.find((item) => item.data === date && (item.autor ?? "").toLocaleLowerCase("pt-BR").includes("catarina"));
  return (
    <div className="flex flex-col gap-6">
      <div><h2 className="text-base font-semibold">O que a Catarina registrou em {formatDate(date)}</h2><p className="text-sm text-muted-foreground">Só leitura, para você começar o dia sabendo o que aconteceu.</p></div>
      <section className="flex flex-col gap-3"><h3 className="section-title">Presenças e faltas</h3>{day.turmas.map((turma) => <Card key={turma.key}><CardHeader><CardTitle className="text-sm">{turma.turmaNome}</CardTitle><CardDescription>{turma.hora?.slice(0, 5)}</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{turma.pessoas.map((person) => {
        const replacement = data.reposicoes.find((item) => item.contato_id === person.contatoId && item.origem_data === date && item.origem_turma_id === turma.turmaId);
        return <div key={person.key} className="flex flex-wrap items-center gap-2 border-b pb-3 last:border-0 last:pb-0"><strong>{person.nome}</strong><Badge variant={person.status === "presente" ? "success" : person.status === "faltou" ? "destructive" : "outline"}>{person.status === "presente" ? "Presente" : person.status === "faltou" ? "Faltou" : "Sem chamada"}</Badge>{person.status === "faltou" && <Badge variant={replacement ? "info" : "warning"}>{replacement ? `Reposição · ${formatDate(replacement.destino_data)}` : "Sem reposição marcada"}</Badge>}</div>;
      })}</CardContent></Card>)}</section>
      <section className="flex flex-col gap-3"><h3 className="section-title">Peças prontas para avisar</h3><Card><CardContent className="pt-5">{ready.length ? ready.map((piece) => <div key={piece.id} className="flex items-center justify-between gap-3 border-b py-3 first:pt-0 last:border-0 last:pb-0"><strong>{contactName(piece.contato_id)}</strong><span className="text-sm text-muted-foreground">{piece.descricao} · {piece.etapa ?? "Etapa não informada"}</span></div>) : <p className="text-sm text-muted-foreground">Nenhuma peça esperando aviso.</p>}</CardContent></Card></section>
      <section className="flex flex-col gap-3"><h3 className="section-title">Observações da Catarina</h3><Card className="bg-muted/40"><CardContent className="pt-5"><p className="text-sm leading-6">{teacherReport?.resumo || "A Catarina não escreveu observações neste dia."}</p></CardContent></Card></section>
    </div>
  );
}
