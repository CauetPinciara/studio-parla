import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Insert, Row } from "@/lib/database.types";
import { listAvulsas } from "@/features/avulsas/api";
import { ContatoForm } from "@/features/contatos/ContatoForm";
import { createContato, deleteContato, listContatos, updateContato } from "@/features/contatos/api";
import { listInscricoes } from "@/features/inscricoes/api";
import { listMatriculas } from "@/features/matriculas/api";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";

export default function ContatosPage() {
  const client = useQueryClient();
  const [editing, setEditing] = useState<Row<"contatos"> | undefined>();
  const [open, setOpen] = useState(false);
  const contatos = useQuery({ queryKey: ["contatos"], queryFn: listContatos });
  const matriculas = useQuery({ queryKey: ["matriculas"], queryFn: listMatriculas });
  const avulsas = useQuery({ queryKey: ["avulsas"], queryFn: listAvulsas });
  const inscricoes = useQuery({ queryKey: ["inscricoes"], queryFn: listInscricoes });
  const save = useMutation({ mutationFn: (value: Insert<"contatos">) => editing ? updateContato(editing.id, value) : createContato(value), onSuccess: () => { void client.invalidateQueries({ queryKey: ["contatos"] }); setOpen(false); toast.success("Salvo"); }, onError: (error: Error) => toast.error(error.message) });
  const remove = useMutation({ mutationFn: deleteContato, onSuccess: () => { void client.invalidateQueries({ queryKey: ["contatos"] }); toast.success("Contato excluído"); }, onError: (error: Error) => toast.error(error.message) });
  if (contatos.isLoading || matriculas.isLoading || avulsas.isLoading || inscricoes.isLoading) return <LoadingState />;
  const error = contatos.error ?? matriculas.error ?? avulsas.error ?? inscricoes.error;
  if (error) return <ErrorState error={error} />;
  const rows = contatos.data ?? [];
  return <div className="flex flex-col gap-4"><p className="max-w-2xl text-sm text-muted-foreground">A entidade-mãe. Toda pessoa (aluno, avulsa, workshop) existe aqui uma vez só. Os vínculos aparecem à direita.</p><div className="flex items-center justify-between gap-3"><h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{rows.length} contatos</h2><Button onClick={() => { setEditing(undefined); setOpen(true); }}><Plus data-icon="inline-start" />Novo contato</Button></div><DataTable rows={rows} getRowKey={(row) => row.id} columns={[
    { key: "nome", header: "Nome", cell: (row) => <strong>{row.nome}</strong> },
    { key: "tel", header: "WhatsApp", cell: (row) => row.tel || "—" },
    { key: "origem", header: "Origem", cell: (row) => <Badge variant="secondary">{row.origem || "—"}</Badge> },
    { key: "vinculos", header: "Vínculos", cell: (row) => <div className="flex flex-wrap gap-1">{matriculas.data?.some((item) => item.contato_id === row.id) && <Badge>Turma</Badge>}{avulsas.data?.some((item) => item.contato_id === row.id) && <Badge variant="success">Avulsa</Badge>}{inscricoes.data?.some((item) => item.contato_id === row.id) && <Badge variant="info">Workshop</Badge>}</div> },
    { key: "obs", header: "Obs.", cell: (row) => <span className="text-muted-foreground">{row.obs || "—"}</span> },
    { key: "acoes", header: "", className: "text-right", cell: (row) => <div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label={`Editar ${row.nome}`} onClick={() => { setEditing(row); setOpen(true); }}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Excluir ${row.nome}`} onClick={() => { if (window.confirm(`Excluir ${row.nome}?`)) remove.mutate(row.id); }}><Trash2 /></Button></div> },
  ]} /><ContatoForm key={editing?.id ?? "novo"} open={open} onOpenChange={setOpen} contato={editing} pending={save.isPending} onSubmit={(value) => save.mutate(value)} /></div>;
}
