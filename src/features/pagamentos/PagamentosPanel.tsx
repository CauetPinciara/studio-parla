import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  deletePagamento,
  savePagamento,
  studioDataQueryKey,
} from "@/features/app-enxuto/api";
import type { AwaitedStudioData } from "@/features/app-enxuto/types";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { formatCurrency } from "@/lib/format";
import { formValue } from "@/lib/forms";

const PAYMENT_TYPES = ["Mensalidade", "Workshop", "Aula avulsa", "Queima", "Argila", "Kit / material", "Outro"];
const PAYMENT_METHODS = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Transferência"];

interface PagamentosPanelProps {
  data: AwaitedStudioData;
  selectedDate: string;
  author: string;
}

export function PagamentosPanel({ data, selectedDate, author }: PagamentosPanelProps) {
  const queryClient = useQueryClient();
  const [contactId, setContactId] = useState("");
  const [type, setType] = useState("Mensalidade");
  const [method, setMethod] = useState("Pix");
  const refresh = () => queryClient.invalidateQueries({ queryKey: studioDataQueryKey });
  const save = useMutation({
    mutationFn: savePagamento,
    onSuccess: () => {
      void refresh();
      toast.success("Pagamento registrado");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: deletePagamento,
    onSuccess: () => void refresh(),
    onError: (error: Error) => toast.error(error.message),
  });
  const payments = data.pagamentos.filter((payment) => payment.data === selectedDate);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("valor"));
    if (!contactId || !Number.isFinite(amount)) return;
    save.mutate({
      data: selectedDate,
      contato_id: contactId,
      tipo: type,
      valor: amount,
      forma: method,
      obs: formValue(form, "obs"),
      por: author,
    });
    event.currentTarget.reset();
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader><CardTitle>Registrar pagamento</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <FieldGroup>
              <EntitySelect label="Contato" value={contactId} options={data.contatos.map(({ id, nome }) => ({ value: id, label: nome }))} onValueChange={setContactId} />
              <EntitySelect label="O que foi pago" value={type} options={PAYMENT_TYPES.map((value) => ({ value, label: value }))} onValueChange={setType} />
              <Field><FieldLabel htmlFor="pagamento-valor">Valor</FieldLabel><Input id="pagamento-valor" name="valor" type="number" min="0" step="0.01" required /></Field>
              <EntitySelect label="Forma" value={method} options={PAYMENT_METHODS.map((value) => ({ value, label: value }))} onValueChange={setMethod} />
              <Field><FieldLabel htmlFor="pagamento-obs">Observação</FieldLabel><Input id="pagamento-obs" name="obs" /></Field>
              <Button type="submit" disabled={save.isPending || !contactId}>Registrar pagamento</Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Pagamentos do dia</h3>
        <strong>{formatCurrency(payments.reduce((sum, payment) => sum + payment.valor, 0))}</strong>
      </div>
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="flex items-center justify-between gap-3 pt-5">
            <div>
              <strong>{data.contatos.find(({ id }) => id === payment.contato_id)?.nome ?? "Contato"}</strong>
              <p className="text-sm text-muted-foreground">{payment.tipo} · {payment.forma} · {formatCurrency(payment.valor)}</p>
            </div>
            <Button type="button" size="icon" variant="ghost" aria-label="Remover pagamento" onClick={() => remove.mutate(payment.id)}><Trash2 /></Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
