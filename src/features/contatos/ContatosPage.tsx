import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studioDataQueryKey } from "@/features/app-enxuto/api";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { ContatoForm } from "@/features/contatos/ContatoForm";
import { createContato, deleteContato, updateContato } from "@/features/contatos/api";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import type { Insert, Row } from "@/lib/database.helpers";

export default function ContatosPage() {
  const navigate = useNavigate();
  const studio = useStudioData();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Row<"contatos"> | undefined>();
  const [open, setOpen] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: studioDataQueryKey });
  const save = useMutation({ mutationFn: (value: Insert<"contatos">) => editing ? updateContato(editing.id, value) : createContato(value), onSuccess: () => { void refresh(); setOpen(false); toast.success("Contato salvo"); }, onError: (error: Error) => toast.error(error.message) });
  const remove = useMutation({ mutationFn: deleteContato, onSuccess: () => void refresh(), onError: (error: Error) => toast.error(error.message) });
  if (studio.isLoading) return <LoadingState />;
  if (studio.error || !studio.data) return <ErrorState error={studio.error ?? new Error("Dados indisponíveis")} />;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{studio.data.contatos.length} contatos</span><Button type="button" onClick={() => { setEditing(undefined); setOpen(true); }}><Plus data-icon="inline-start" />Novo contato</Button></div>
      <DataTable
        rows={studio.data.contatos}
        getRowKey={({ id }) => id}
        onRowClick={(row) => void navigate(`/contatos/${row.id}`)}
        columns={[
          { key: "nome", header: "Nome", cell: (row) => <strong>{row.nome}</strong> },
          { key: "tel", header: "WhatsApp", cell: (row) => row.tel || "-" },
          { key: "origem", header: "Origem", cell: (row) => <Badge variant="secondary">{row.origem || "-"}</Badge> },
          { key: "vinculos", header: "Vínculos", cell: (row) => <div className="flex flex-wrap gap-1">{studio.data.matriculas.some(({ contato_id }) => contato_id === row.id) && <Badge>Turma</Badge>}{studio.data.avulsas.some(({ contato_id }) => contato_id === row.id) && <Badge variant="success">Avulsa</Badge>}{studio.data.inscricoes.some(({ contato_id }) => contato_id === row.id) && <Badge variant="info">Workshop</Badge>}</div> },
          { key: "obs", header: "Obs.", cell: (row) => <span className="text-muted-foreground">{row.obs || "-"}</span> },
          { key: "acoes", header: "", cell: (row) => <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}><Button type="button" size="icon" variant="ghost" aria-label={`Editar ${row.nome}`} onClick={() => { setEditing(row); setOpen(true); }}><Pencil /></Button><Button type="button" size="icon" variant="ghost" aria-label={`Excluir ${row.nome}`} onClick={() => remove.mutate(row.id)}><Trash2 /></Button></div> },
        ]}
      />
      <ContatoForm key={editing?.id ?? "novo"} open={open} onOpenChange={setOpen} contato={editing} pending={save.isPending} onSubmit={(value) => save.mutate(value)} />
    </div>
  );
}
