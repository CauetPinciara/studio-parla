import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Insert, Row } from "@/lib/database.types";
import { listContatos } from "@/features/contatos/api";
import { InscricaoForm } from "@/features/inscricoes/InscricaoForm";
import { createInscricao, deleteInscricao, listInscricoes, updateInscricao } from "@/features/inscricoes/api";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { WorkshopForm } from "@/features/workshops/WorkshopForm";
import { createWorkshop, deleteWorkshop, listWorkshops, updateWorkshop } from "@/features/workshops/api";

export default function WorkshopsPage() {
  const client = useQueryClient(); const [workshop, setWorkshop] = useState<Row<"workshops"> | undefined>(); const [workshopOpen, setWorkshopOpen] = useState(false); const [inscricao, setInscricao] = useState<Row<"inscricoes"> | undefined>(); const [inscricaoOpen, setInscricaoOpen] = useState(false);
  const workshops = useQuery({ queryKey: ["workshops"], queryFn: listWorkshops }); const inscricoes = useQuery({ queryKey: ["inscricoes"], queryFn: listInscricoes }); const contatos = useQuery({ queryKey: ["contatos"], queryFn: listContatos });
  const saveWorkshop = useMutation({ mutationFn: (value: Insert<"workshops">) => workshop ? updateWorkshop(workshop.id, value) : createWorkshop(value), onSuccess: () => { void client.invalidateQueries({ queryKey: ["workshops"] }); setWorkshopOpen(false); toast.success("Salvo"); }, onError: (e: Error) => toast.error(e.message) });
  const removeWorkshop = useMutation({ mutationFn: deleteWorkshop, onSuccess: () => void client.invalidateQueries({ queryKey: ["workshops"] }), onError: (e: Error) => toast.error(e.message) });
  const saveInscricao = useMutation({ mutationFn: (value: Insert<"inscricoes">) => inscricao ? updateInscricao(inscricao.id, value) : createInscricao(value), onSuccess: () => { void client.invalidateQueries({ queryKey: ["inscricoes"] }); setInscricaoOpen(false); toast.success("Salvo"); }, onError: (e: Error) => toast.error(e.message) });
  const removeInscricao = useMutation({ mutationFn: deleteInscricao, onSuccess: () => void client.invalidateQueries({ queryKey: ["inscricoes"] }), onError: (e: Error) => toast.error(e.message) });
  if (workshops.isLoading || inscricoes.isLoading || contatos.isLoading) return <LoadingState />; const error = workshops.error ?? inscricoes.error ?? contatos.error; if (error) return <ErrorState error={error} />;
  const pessoa = (id: string) => contatos.data?.find((item) => item.id === id)?.nome ?? "?"; const evento = (id: string) => workshops.data?.find((item) => item.id === id)?.nome ?? "?";
  return <div className="flex flex-col gap-7"><section className="flex flex-col gap-4"><div className="flex justify-end"><Button onClick={() => { setWorkshop(undefined); setWorkshopOpen(true); }}><Plus data-icon="inline-start" />Novo workshop</Button></div><DataTable rows={workshops.data ?? []} getRowKey={(row) => row.id} columns={[
    { key: "nome", header: "Nome", cell: (row) => <strong>{row.nome}</strong> }, { key: "datas", header: "Datas", cell: (row) => row.datas ?? "—" }, { key: "preco", header: "Preço", cell: (row) => row.preco ?? "—" }, { key: "inscritos", header: "Inscritos", cell: (row) => inscricoes.data?.filter((item) => item.workshop_id === row.id).length ?? 0 }, { key: "acoes", header: "", cell: (row) => <div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => { setWorkshop(row); setWorkshopOpen(true); }}><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => { if (window.confirm("Excluir workshop?")) removeWorkshop.mutate(row.id); }}><Trash2 /></Button></div> },
  ]} /></section><section className="flex flex-col gap-4"><div className="flex items-center justify-between"><h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Inscrições</h2><Button variant="outline" onClick={() => { setInscricao(undefined); setInscricaoOpen(true); }}><Plus data-icon="inline-start" />Inscrever pessoa</Button></div><DataTable rows={inscricoes.data ?? []} getRowKey={(row) => row.id} emptyMessage="Nenhuma." columns={[
    { key: "pessoa", header: "Pessoa", cell: (row) => <strong>{pessoa(row.contato_id)}</strong> }, { key: "workshop", header: "Workshop", cell: (row) => evento(row.workshop_id) }, { key: "status", header: "Situação", cell: (row) => <Badge variant="info">{row.status}</Badge> }, { key: "acoes", header: "", cell: (row) => <div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => { setInscricao(row); setInscricaoOpen(true); }}><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => { if (window.confirm("Excluir inscrição?")) removeInscricao.mutate(row.id); }}><Trash2 /></Button></div> },
  ]} /></section><WorkshopForm key={workshop?.id ?? "novo"} open={workshopOpen} onOpenChange={setWorkshopOpen} workshop={workshop} pending={saveWorkshop.isPending} onSubmit={(value) => saveWorkshop.mutate(value)} /><InscricaoForm key={inscricao?.id ?? "nova"} open={inscricaoOpen} onOpenChange={setInscricaoOpen} inscricao={inscricao} contatos={contatos.data ?? []} workshops={workshops.data ?? []} pending={saveInscricao.isPending} onSubmit={(value) => saveInscricao.mutate(value)} /></div>;
}
