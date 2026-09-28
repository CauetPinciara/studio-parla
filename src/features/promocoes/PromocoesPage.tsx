import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { formatCurrency, formatDate } from "@/lib/format";

export default function PromocoesPage() {
  const studio = useStudioData();
  if (studio.isLoading) return <LoadingState />;
  if (studio.error || !studio.data) return <ErrorState error={studio.error ?? new Error("Dados indisponíveis")} />;

  const active = studio.data.matriculas.filter(({ status }) => status === "Ativa");
  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {studio.data.promocoes.filter(({ ativa }) => ativa).map((promotion) => (
          <Card key={promotion.id}>
            <CardHeader><CardTitle>{promotion.nome}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p>{promotion.regra}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={promotion.quem?.includes("Isabela") ? "success" : "warning"}>{promotion.quem}</Badge>
                <Badge variant="outline">{promotion.validade}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Mensalidades ativas</h2>
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
