import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Insert, Row } from "@/lib/database.types";
import { formatDate } from "@/lib/format";
import { listContatos } from "@/features/contatos/api";
import { PecaForm } from "@/features/pecas/PecaForm";
import { createPeca, deletePeca, listPecas, setPecaStatus, updatePeca } from "@/features/pecas/api";
import { getNextPecaStatus, pecaActionLabels, pecaStatusLabels, todayIso, type PecaStatus } from "@/features/pecas/domain";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";

const variants: Record<PecaStatus, "warning" | "default" | "info" | "success"> = { producao: "warning", pronta: "default", avisado: "info", entregue: "success" };
export function PecaBadge({ status }: { status: string }) { const key = status as PecaStatus; return <Badge variant={variants[key] ?? "secondary"}>{pecaStatusLabels[key] ?? status}</Badge>; }

export default function PecasPage() {
  const client = useQueryClient(); const [editing, setEditing] = useState<Row<"pecas"> | undefined>(); const [open, setOpen] = useState(false);
  const pecas = useQuery({ queryKey: ["pecas"], queryFn: listPecas }); const contatos = useQuery({ queryKey: ["contatos"], queryFn: listContatos });
  const refresh = () => client.invalidateQueries({ queryKey: ["pecas"] });
  const save = useMutation({ mutationFn: (value: Insert<"pecas">) => editing ? updatePeca(editing.id, value) : createPeca(value), onSuccess: () => { void refresh(); setOpen(false); toast.success("Salvo"); }, onError: (e: Error) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: deletePeca, onSuccess: () => void refresh(), onError: (e: Error) => toast.error(e.message) });
  const advance = useMutation({ mutationFn: ({ id, status }: { id: string; status: PecaStatus }) => setPecaStatus(id, status, todayIso()), onSuccess: () => { void refresh(); toast.success("Status atualizado"); }, onError: (e: Error) => toast.error(e.message) });
  if (pecas.isLoading || contatos.isLoading) return <LoadingState />; const error = pecas.error ?? contatos.error; if (error) return <ErrorState error={error} />; const pessoa = (id: string) => contatos.data?.find((item) => item.id === id)?.nome ?? "?";
  return <div className="flex flex-col gap-4"><p className="max-w-2xl text-sm text-muted-foreground">Controle das peças. A Catarina marca quando fica pronta; o atendimento vê o status e sabe a hora de avisar o cliente.</p><div className="flex justify-end"><Button onClick={() => { setEditing(undefined); setOpen(true); }}><Plus data-icon="inline-start" />Nova peça</Button></div><DataTable rows={pecas.data ?? []} getRowKey={(row) => row.id} columns={[
    { key: "aluno", header: "Aluno", cell: (row) => <strong>{pessoa(row.contato_id)}</strong> }, { key: "peca", header: "Peça", cell: (row) => row.descricao ?? "—" }, { key: "deixou", header: "Deixou", cell: (row) => formatDate(row.data_deixou) }, { key: "estimativa", header: "Estimativa", cell: (row) => row.estimativa ?? "—" }, { key: "status", header: "Status", cell: (row) => <PecaBadge status={row.status} /> }, { key: "acoes", header: "", cell: (row) => { const next = getNextPecaStatus(row.status); return <div className="flex justify-end gap-1">{next && <Button size="sm" onClick={() => advance.mutate({ id: row.id, status: next })}>{pecaActionLabels[row.status as PecaStatus]}</Button>}<Button size="icon" variant="ghost" onClick={() => { setEditing(row); setOpen(true); }}><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => { if (window.confirm("Excluir peça?")) remove.mutate(row.id); }}><Trash2 /></Button></div>; } },
  ]} /><PecaForm key={editing?.id ?? "nova"} open={open} onOpenChange={setOpen} peca={editing} contatos={contatos.data ?? []} pending={save.isPending} onSubmit={(value) => save.mutate(value)} /></div>;
}
