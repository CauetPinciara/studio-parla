import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Insert, Row } from "@/lib/database.types";
import { AvulsaForm } from "@/features/avulsas/AvulsaForm";
import { createAvulsa, deleteAvulsa, listAvulsas, updateAvulsa } from "@/features/avulsas/api";
import { listContatos } from "@/features/contatos/api";
import { MatriculaForm } from "@/features/matriculas/MatriculaForm";
import { createMatricula, deleteMatricula, listMatriculas, updateMatricula } from "@/features/matriculas/api";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { listTurmas } from "@/features/turmas/api";
import { formatCurrency, formatDate } from "@/lib/format";

export default function MatriculasPage() {
  const client = useQueryClient(); const [mat, setMat] = useState<Row<"matriculas"> | undefined>(); const [matOpen, setMatOpen] = useState(false); const [avulsa, setAvulsa] = useState<Row<"avulsas"> | undefined>(); const [avulsaOpen, setAvulsaOpen] = useState(false);
  const contatos = useQuery({ queryKey: ["contatos"], queryFn: listContatos }); const turmas = useQuery({ queryKey: ["turmas"], queryFn: listTurmas }); const matriculas = useQuery({ queryKey: ["matriculas"], queryFn: listMatriculas }); const avulsas = useQuery({ queryKey: ["avulsas"], queryFn: listAvulsas });
  const saveMat = useMutation({ mutationFn: (value: Insert<"matriculas">) => mat ? updateMatricula(mat.id, value) : createMatricula(value), onSuccess: () => { void client.invalidateQueries({ queryKey: ["matriculas"] }); setMatOpen(false); toast.success("Salvo"); }, onError: (e: Error) => toast.error(e.message) });
  const removeMat = useMutation({ mutationFn: deleteMatricula, onSuccess: () => void client.invalidateQueries({ queryKey: ["matriculas"] }), onError: (e: Error) => toast.error(e.message) });
  const saveAvulsa = useMutation({ mutationFn: (value: Insert<"avulsas">) => avulsa ? updateAvulsa(avulsa.id, value) : createAvulsa(value), onSuccess: () => { void client.invalidateQueries({ queryKey: ["avulsas"] }); setAvulsaOpen(false); toast.success("Salvo"); }, onError: (e: Error) => toast.error(e.message) });
  const removeAvulsa = useMutation({ mutationFn: deleteAvulsa, onSuccess: () => void client.invalidateQueries({ queryKey: ["avulsas"] }), onError: (e: Error) => toast.error(e.message) });
  if (contatos.isLoading || turmas.isLoading || matriculas.isLoading || avulsas.isLoading) return <LoadingState />; const error = contatos.error ?? turmas.error ?? matriculas.error ?? avulsas.error; if (error) return <ErrorState error={error} />;
  const pessoa = (id: string) => contatos.data?.find((item) => item.id === id)?.nome ?? "?"; const turma = (id: string | null) => turmas.data?.find((item) => item.id === id)?.nome ?? "—";
  const statusVariant = (status: string) => status === "Ativa" ? "success" : status === "Nova" ? "info" : status === "Pausada" ? "warning" : "secondary";
  return <div className="flex flex-col gap-7"><section className="flex flex-col gap-4"><p className="max-w-2xl text-sm text-muted-foreground">Cada linha liga uma pessoa a uma turma, com mensalidade e forma de pagamento próprios.</p><div className="flex items-center justify-between"><h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Matrículas</h2><Button onClick={() => { setMat(undefined); setMatOpen(true); }}><Plus data-icon="inline-start" />Nova matrícula</Button></div><DataTable rows={matriculas.data ?? []} getRowKey={(row) => row.id} columns={[
    { key: "aluno", header: "Aluno", cell: (row) => <strong>{pessoa(row.contato_id)}</strong> }, { key: "turma", header: "Turma", cell: (row) => turma(row.turma_id) }, { key: "mensalidade", header: "Mensalidade", cell: (row) => formatCurrency(row.mensalidade) }, { key: "pagamento", header: "Pagamento", cell: (row) => row.pagamento ?? "—" }, { key: "status", header: "Situação", cell: (row) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge> }, { key: "acoes", header: "", cell: (row) => <div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => { setMat(row); setMatOpen(true); }}><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => { if (window.confirm("Excluir matrícula?")) removeMat.mutate(row.id); }}><Trash2 /></Button></div> },
  ]} /></section><section className="flex flex-col gap-4"><div className="flex items-center justify-between"><h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Aulas avulsas</h2><Button variant="outline" onClick={() => { setAvulsa(undefined); setAvulsaOpen(true); }}><Plus data-icon="inline-start" />Nova avulsa</Button></div><DataTable rows={avulsas.data ?? []} getRowKey={(row) => row.id} emptyMessage="Nenhuma." columns={[
    { key: "aluno", header: "Aluno", cell: (row) => <strong>{pessoa(row.contato_id)}</strong> }, { key: "data", header: "Data", cell: (row) => formatDate(row.data) }, { key: "turma", header: "Encaixe", cell: (row) => turma(row.turma_id) }, { key: "status", header: "Situação", cell: (row) => <Badge variant="success">{row.status}</Badge> }, { key: "acoes", header: "", cell: (row) => <div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => { setAvulsa(row); setAvulsaOpen(true); }}><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => { if (window.confirm("Excluir aula avulsa?")) removeAvulsa.mutate(row.id); }}><Trash2 /></Button></div> },
  ]} /></section><MatriculaForm key={mat?.id ?? "nova"} open={matOpen} onOpenChange={setMatOpen} matricula={mat} contatos={contatos.data ?? []} turmas={turmas.data ?? []} pending={saveMat.isPending} onSubmit={(value) => saveMat.mutate(value)} /><AvulsaForm key={avulsa?.id ?? "nova"} open={avulsaOpen} onOpenChange={setAvulsaOpen} avulsa={avulsa} contatos={contatos.data ?? []} turmas={turmas.data ?? []} pending={saveAvulsa.isPending} onSubmit={(value) => saveAvulsa.mutate(value)} /></div>;
}
