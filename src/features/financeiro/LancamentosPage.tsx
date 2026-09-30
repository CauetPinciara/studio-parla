import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    return [group?.nome, subgroup?.nome, category?.nome].filter(Boolean).join(" · ") || "Categoria removida";
  };
  const openLabel = type === "despesa" ? "Em aberto" : "A receber";
  const paidLabel = type === "despesa" ? "Já pago" : "Já recebido";
  const contactLabel = type === "despesa" ? "Fornecedor" : "Aluno / contato";

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: openLabel, value: sum(open), className: "text-foreground" },
          { label: "Em atraso", value: sum(overdue), className: "text-[hsl(0_55%_38%)]" },
          { label: paidLabel, value: sum(paid), className: "text-[hsl(152_32%_32%)]" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1 rounded-xl border border-[hsl(30_8%_90%)] bg-white p-4">
            <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-[hsl(25_5%_50%)]">{item.label}</span>
            <strong className={`text-2xl font-semibold leading-[1.5] tracking-[-.02em] ${item.className}`}>{formatCurrency(item.value)}</strong>
          </div>
        ))}
      </div>
      <DataTable
        rows={rows}
        getRowKey={({ id }) => id}
        emptyMessage="Nenhum lançamento."
        columns={[
          { key: "descricao", header: "Descrição", cell: (row) => <strong>{row.descricao}</strong> },
          { key: "categoria", header: "Categoria", cell: (row) => <span className="text-[hsl(25_5%_45%)]">{categoryPath(row.categoria_id)}</span> },
          { key: "contato", header: contactLabel, cell: (row) => row.contato ?? "-" },
          { key: "vencimento", header: "Vencimento", cell: (row) => formatDate(row.vencimento) },
          { key: "valor", header: "Valor", className: "text-right", cell: (row) => <div className="text-right font-semibold tabular-nums">{formatCurrency(row.valor)}</div> },
          { key: "status", header: "Status", className: "text-right", cell: (row) => {
            const status = financeEntryStatus(row, today);
            return (
              <div className="flex items-center justify-end gap-2">
                <Badge variant={status.key === "pago" ? "success" : status.key === "vencido" ? "destructive" : "warning"}>{status.label}</Badge>
                <Button
                  type="button"
                  size="sm"
                  variant={row.pago ? "outline" : "default"}
                  disabled={toggle.isPending}
                  className="h-[30px] rounded-lg px-3 text-xs"
                  onClick={() => toggle.mutate({ id: row.id, paid: !row.pago })}
                >
                  {row.pago ? "Desfazer" : type === "despesa" ? "Marcar pago" : "Marcar recebido"}
                </Button>
              </div>
            );
          } },
        ]}
      />
    </div>
  );
}
