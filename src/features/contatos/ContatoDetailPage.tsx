import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { monthsStudying } from "@/features/app-enxuto/domain";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { PecaBadge } from "@/features/pecas/PecasPage";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { localDateIso } from "@/lib/date";
import { formatCurrency, formatDate } from "@/lib/format";

export default function ContatoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const studio = useStudioData();
  if (studio.isLoading) return <LoadingState />;
  if (studio.error || !studio.data) return <ErrorState error={studio.error ?? new Error("Dados indisponíveis")} />;
  const contact = studio.data.contatos.find((item) => item.id === id);
  if (!contact) return <ErrorState error={new Error("Contato não encontrado")} />;
  const enrollment = studio.data.matriculas.find(({ contato_id, status }) => contato_id === contact.id && status !== "Saiu");
  const turma = studio.data.turmas.find(({ id: turmaId }) => turmaId === enrollment?.turma_id);
  const pieces = studio.data.pecas.filter(({ contato_id }) => contato_id === contact.id);
  const notices = studio.data.avisos.filter(({ contato_id }) => contato_id === contact.id).sort((left, right) => right.data.localeCompare(left.data));
  return (
    <div className="flex flex-col gap-5">
      <Button type="button" variant="ghost" className="self-start" onClick={() => void navigate("/contatos")}><ArrowLeft data-icon="inline-start" />Voltar</Button>
      <Card><CardHeader><CardTitle>{contact.nome}</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><p><span className="text-sm text-muted-foreground">WhatsApp</span><br />{contact.tel || "-"}</p><p><span className="text-sm text-muted-foreground">Origem</span><br />{contact.origem || "-"}</p><p className="sm:col-span-2"><span className="text-sm text-muted-foreground">Observações</span><br />{contact.obs || "Sem observações"}</p></CardContent></Card>
      {enrollment && <Card><CardHeader><CardTitle>Matrícula</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><p><span className="text-sm text-muted-foreground">Turma</span><br />{turma?.nome ?? "-"}</p><p><span className="text-sm text-muted-foreground">Mensalidade</span><br />{formatCurrency(enrollment.mensalidade)} · {enrollment.pagamento}</p><p><span className="text-sm text-muted-foreground">Aluno desde</span><br />{formatDate(enrollment.desde)} · {monthsStudying(enrollment.desde, localDateIso())} meses</p><p><Badge variant={enrollment.status === "Ativa" ? "success" : enrollment.status === "Nova" ? "info" : "warning"}>{enrollment.status}</Badge></p></CardContent></Card>}
      <Card><CardHeader><CardTitle>Peças · {pieces.length}</CardTitle></CardHeader><CardContent><ul className="flex flex-col gap-3">{pieces.map((piece) => <li key={piece.id} className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-0"><div><strong>{piece.descricao || "Peça"}</strong><p className="text-sm text-muted-foreground">{piece.etapa || "Etapa não informada"} · prazo {formatDate(piece.prazo)}</p></div><PecaBadge status={piece.status} /></li>)}{pieces.length === 0 && <li className="text-muted-foreground">Nenhuma peça.</li>}</ul></CardContent></Card>
      <Card><CardHeader><CardTitle>Histórico de avisos</CardTitle></CardHeader><CardContent><ul className="flex flex-col gap-3">{notices.map((notice) => <li key={notice.id} className="border-b pb-3 last:border-0"><strong>{formatDate(notice.data)}</strong><p className="text-sm text-muted-foreground">{studio.data.turmas.find(({ id: turmaId }) => turmaId === notice.turma_id)?.nome} · avisou em {formatDate(notice.avisou_em)} · {notice.por}</p>{notice.obs && <p>{notice.obs}</p>}</li>)}{notices.length === 0 && <li className="text-muted-foreground">Nenhum aviso.</li>}</ul></CardContent></Card>
    </div>
  );
}
