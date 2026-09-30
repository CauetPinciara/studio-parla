import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { formatCurrency, formatDate } from "@/lib/format";

export default function PromocoesPage() {
  const studio = useStudioData();
  if (studio.isLoading) return <LoadingState />;
  if (studio.error || !studio.data) return <ErrorState error={studio.error ?? new Error("Dados indisponíveis")} />;

  const active = studio.data.matriculas.filter(({ status }) => status === "Ativa");
  const promotions = studio.data.promocoes.filter(({ ativa }) => ativa);
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold leading-[1.5] tracking-[.1em] text-muted-foreground uppercase">Promoções</h2>
        <DataTable
          rows={promotions}
          getRowKey={({ id }) => id}
          emptyMessage="Nenhuma promoção ativa."
          columns={[
            { key: "nome", header: "Promoção", cell: (row) => <strong>{row.nome}</strong> },
            { key: "regra", header: "Regra", cell: (row) => row.regra },
            { key: "quem", header: "Quem pode oferecer", cell: (row) => <Badge variant={row.quem?.includes("Isabela") ? "success" : "warning"}>{row.quem}</Badge> },
            { key: "validade", header: "Validade", cell: (row) => row.validade },
          ]}
        />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold leading-[1.5] tracking-[.1em] text-muted-foreground uppercase">Mensalidades ativas</h2>
        <DataTable
          rows={active}
          getRowKey={({ id }) => id}
          emptyMessage="Nenhuma mensalidade ativa."
          columns={[
            { key: "aluno", header: "Aluno", cell: (row) => studio.data.contatos.find(({ id }) => id === row.contato_id)?.nome ?? "?" },
            { key: "turma", header: "Turma", cell: (row) => studio.data.turmas.find(({ id }) => id === row.turma_id)?.nome ?? "?" },
            { key: "valor", header: "Valor", cell: (row) => formatCurrency(row.mensalidade) },
            { key: "forma", header: "Pagamento", cell: (row) => row.pagamento ?? "-" },
            { key: "desde", header: "Desde", cell: (row) => formatDate(row.desde) },
          ]}
        />
      </section>
    </div>
  );
}
