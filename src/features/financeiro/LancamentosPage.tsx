import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { setLancamentoPaid, studioDataQueryKey } from "@/features/app-enxuto/api";
import { financeEntryStatus } from "@/features/app-enxuto/domain";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { localDateIso } from "@/lib/date";
import { formatCurrency, formatDate } from "@/lib/format";

export function LancamentosPage({ type }: { type: "despesa" | "receita" }) {
  const studio = useStudioData();
  const queryClient = useQueryClient();
  const today = localDateIso();
  const toggle = useMutation({
    mutationFn: ({ id, paid }: { id: string; paid: boolean }) => setLancamentoPaid(id, paid, today),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: studioDataQueryKey }),
  });
  if (studio.isLoading) return <LoadingState />;
  if (studio.error || !studio.data) return <ErrorState error={studio.error ?? new Error("Dados indisponíveis")} />;

  const rows = studio.data.lancamentos
    .filter(({ tipo }) => tipo === type)
    .sort((left, right) => left.vencimento.localeCompare(right.vencimento));
  const open = rows.filter(({ pago }) => !pago);
  const overdue = open.filter(({ vencimento }) => vencimento < today);
  const paid = rows.filter(({ pago }) => pago);
  const sum = (items: typeof rows) => items.reduce((total, item) => total + item.valor, 0);
  const categoryPath = (categoryId: string | null) => {
    if (!categoryId) return "Categoria removida";
    const category = studio.data.planoCategorias.find(({ id }) => id === categoryId);
    const group = studio.data.planoGrupos.find(({ id }) => id === category?.grupo_id);
    const subgroup = studio.data.planoSubgrupos.find(({ id }) => id === category?.subgrupo_id);
    return [group?.nome, subgroup?.nome, category?.nome].filter(Boolean).join(" › ") || "Categoria removida";
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader><CardTitle>Em aberto</CardTitle></CardHeader><CardContent>{formatCurrency(sum(open))}</CardContent></Card>
        <Card><CardHeader><CardTitle>Em atraso</CardTitle></CardHeader><CardContent>{formatCurrency(sum(overdue))}</CardContent></Card>
        <Card><CardHeader><CardTitle>Quitado</CardTitle></CardHeader><CardContent>{formatCurrency(sum(paid))}</CardContent></Card>
      </div>
      <DataTable
        rows={rows}
        getRowKey={({ id }) => id}
        emptyMessage="Nenhum lançamento."
        columns={[
          { key: "descricao", header: "Descrição", cell: (row) => <strong>{row.descricao}</strong> },
          { key: "categoria", header: "Categoria", cell: (row) => categoryPath(row.categoria_id) },
          { key: "contato", header: "Contato", cell: (row) => row.contato ?? "-" },
          { key: "vencimento", header: "Vencimento", cell: (row) => formatDate(row.vencimento) },
          { key: "valor", header: "Valor", cell: (row) => formatCurrency(row.valor) },
          { key: "status", header: "Status", cell: (row) => {
            const status = financeEntryStatus(row, today);
            return <Badge variant={status.key === "pago" ? "success" : status.key === "vencido" ? "destructive" : status.key === "hoje" ? "warning" : "secondary"}>{status.label}</Badge>;
          } },
          { key: "acao", header: "", cell: (row) => <Button type="button" size="sm" variant="outline" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: row.id, paid: !row.pago })}>{row.pago ? "Desfazer" : "Marcar pago"}</Button> },
        ]}
      />
    </div>
  );
}
