import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  createPlanCategory,
  createPlanGroup,
  createPlanSubgroup,
  deletePlanCategory,
  deletePlanGroup,
  deletePlanSubgroup,
  studioDataQueryKey,
  updatePlanCategory,
  updatePlanGroup,
  updatePlanSubgroup,
} from "@/features/app-enxuto/api";
import type { AwaitedStudioData } from "@/features/app-enxuto/types";
import { useStudioData } from "@/features/app-enxuto/useStudioData";
import { EntitySelect } from "@/features/shared/EntitySelect";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { formValue } from "@/lib/forms";

type PlanType = "despesa" | "receita";
type Editor =
  | { kind: "group"; id?: string }
  | { kind: "subgroup"; groupId: string; id?: string }
  | { kind: "category"; groupId: string; subgroupId?: string; id?: string };
type DeleteTarget = { kind: Editor["kind"]; id: string; name: string };

const CLASSIFICATIONS: Record<PlanType, string[]> = {
  despesa: ["Custo Operacional", "Custo Fixo", "Investimento", "Empréstimo", "Retiradas"],
  receita: ["Produtos & Serviços", "Empréstimos", "Aportes"],
};

function PlanEditor({ editor, data, type, onClose }: { editor: Editor; data: AwaitedStudioData; type: PlanType; onClose: () => void }) {
  const queryClient = useQueryClient();
  const group = editor.kind === "group" && editor.id ? data.planoGrupos.find(({ id }) => id === editor.id) : null;
  const subgroup = editor.kind === "subgroup" && editor.id ? data.planoSubgrupos.find(({ id }) => id === editor.id) : null;
  const category = editor.kind === "category" && editor.id ? data.planoCategorias.find(({ id }) => id === editor.id) : null;
  const [classification, setClassification] = useState(group?.classificacao ?? CLASSIFICATIONS[type][0]);
  const mutation = useMutation({
    mutationFn: async (form: FormData) => {
      const nome = formValue(form, "nome").trim();
      if (!nome) throw new Error("Nome é obrigatório");
      if (editor.kind === "group") {
        return editor.id
          ? updatePlanGroup(editor.id, { nome, classificacao: classification })
          : createPlanGroup({ nome, classificacao: classification, tipo: type });
      }
      if (editor.kind === "subgroup") {
        return editor.id
          ? updatePlanSubgroup(editor.id, { nome })
          : createPlanSubgroup({ nome, grupo_id: editor.groupId });
      }
      return editor.id
        ? updatePlanCategory(editor.id, { nome })
        : createPlanCategory({ nome, grupo_id: editor.groupId, subgrupo_id: editor.subgroupId ?? null });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studioDataQueryKey });
      onClose();
      toast.success("Plano de contas atualizado");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const title = `${editor.id ? "Editar" : "Novo"} ${editor.kind === "group" ? "grupo" : editor.kind === "subgroup" ? "subgrupo" : "categoria"}`;
  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title={title}>
      <form onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutation.mutate(new FormData(event.currentTarget));
      }}>
        <FieldGroup>
          <Field><FieldLabel htmlFor="plan-name">Nome</FieldLabel><Input id="plan-name" name="nome" defaultValue={group?.nome ?? subgroup?.nome ?? category?.nome ?? ""} /></Field>
          {editor.kind === "group" && (
            <EntitySelect label="Classificação" value={classification} options={CLASSIFICATIONS[type].map((value) => ({ value, label: value }))} onValueChange={setClassification} />
          )}
          <Button type="submit" disabled={mutation.isPending}>Salvar</Button>
        </FieldGroup>
      </form>
    </Modal>
  );
}

export default function PlanoContasPage() {
  const studio = useStudioData();
  const queryClient = useQueryClient();
  const [type, setType] = useState<PlanType>("despesa");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const remove = useMutation({
    mutationFn: ({ kind, id }: { kind: Editor["kind"]; id: string }) =>
      kind === "group" ? deletePlanGroup(id) : kind === "subgroup" ? deletePlanSubgroup(id) : deletePlanCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studioDataQueryKey });
      setDeleteTarget(null);
      toast.success("Item removido do plano de contas");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const groups = useMemo(() => {
    if (!studio.data) return [];
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return studio.data.planoGrupos.filter((group) => {
      if (group.tipo !== type) return false;
      if (!term) return true;
      const subgroups = studio.data.planoSubgrupos.filter(({ grupo_id }) => grupo_id === group.id);
      const categories = studio.data.planoCategorias.filter(({ grupo_id }) => grupo_id === group.id);
      return [group.nome, group.classificacao, ...subgroups.map(({ nome }) => nome), ...categories.map(({ nome }) => nome)]
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(term));
    });
  }, [search, studio.data, type]);

  if (studio.isLoading) return <LoadingState />;
  if (studio.error || !studio.data) return <ErrorState error={studio.error ?? new Error("Dados indisponíveis")} />;
  const selected = groups.find(({ id }) => id === selectedId) ?? groups[0];
  const categories = selected ? studio.data.planoCategorias.filter(({ grupo_id }) => grupo_id === selected.id) : [];
  const subgroups = selected ? studio.data.planoSubgrupos.filter(({ grupo_id }) => grupo_id === selected.id) : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup type="single" variant="outline" value={type} onValueChange={(value) => value && setType(value as PlanType)}>
          <ToggleGroupItem value="despesa">Despesa</ToggleGroupItem>
          <ToggleGroupItem value="receita">Receita</ToggleGroupItem>
        </ToggleGroup>
        <Button type="button" onClick={() => setEditor({ kind: "group" })}><Plus data-icon="inline-start" />Novo grupo</Button>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground" />
        <Input aria-label="Buscar no plano de contas" className="pl-10" placeholder="Buscar grupo, subgrupo ou categoria" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.6fr)]">
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <Button key={group.id} type="button" variant={selected?.id === group.id ? "secondary" : "ghost"} className="h-auto justify-start py-3 text-left" onClick={() => setSelectedId(group.id)}>
              <span className="flex flex-col items-start gap-1">
                <strong>{group.nome}</strong>
                <span className="text-xs text-muted-foreground">{group.classificacao} · {studio.data.planoCategorias.filter(({ grupo_id }) => grupo_id === group.id).length} categorias</span>
              </span>
            </Button>
          ))}
        </div>
        {selected && (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><CardTitle>{selected.nome}</CardTitle><Badge variant="secondary">{selected.classificacao}</Badge></div>
                <div className="flex gap-2">
                  <Button type="button" size="icon" variant="ghost" aria-label="Editar grupo" onClick={() => setEditor({ kind: "group", id: selected.id })}><Pencil /></Button>
                  <Button type="button" size="icon" variant="ghost" aria-label="Remover grupo" onClick={() => setDeleteTarget({ kind: "group", id: selected.id, name: selected.nome })}><Trash2 /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Categorias diretas</h3><Button type="button" size="sm" variant="outline" onClick={() => setEditor({ kind: "category", groupId: selected.id })}><Plus data-icon="inline-start" />Categoria</Button></div>
                {categories.filter(({ subgrupo_id }) => !subgrupo_id).map((category) => (
                  <div key={category.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><span>{category.nome}</span><div className="flex gap-1"><Button type="button" size="icon" variant="ghost" aria-label="Editar categoria" onClick={() => setEditor({ kind: "category", groupId: selected.id, id: category.id })}><Pencil /></Button><Button type="button" size="icon" variant="ghost" aria-label="Remover categoria" onClick={() => setDeleteTarget({ kind: "category", id: category.id, name: category.nome })}><Trash2 /></Button></div></div>
                ))}
              </section>
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Subgrupos</h3><Button type="button" size="sm" variant="outline" onClick={() => setEditor({ kind: "subgroup", groupId: selected.id })}><Plus data-icon="inline-start" />Subgrupo</Button></div>
                {subgroups.map((subgroup) => (
                  <Card key={subgroup.id}>
                    <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{subgroup.nome}</CardTitle><div className="flex gap-1"><Button type="button" size="icon" variant="ghost" aria-label="Editar subgrupo" onClick={() => setEditor({ kind: "subgroup", groupId: selected.id, id: subgroup.id })}><Pencil /></Button><Button type="button" size="icon" variant="ghost" aria-label="Remover subgrupo" onClick={() => setDeleteTarget({ kind: "subgroup", id: subgroup.id, name: subgroup.nome })}><Trash2 /></Button></div></div></CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      {categories.filter(({ subgrupo_id }) => subgrupo_id === subgroup.id).map((category) => <div key={category.id} className="flex items-center justify-between gap-2"><span>{category.nome}</span><div className="flex gap-1"><Button type="button" size="icon" variant="ghost" aria-label="Editar categoria" onClick={() => setEditor({ kind: "category", groupId: selected.id, subgroupId: subgroup.id, id: category.id })}><Pencil /></Button><Button type="button" size="icon" variant="ghost" aria-label="Remover categoria" onClick={() => setDeleteTarget({ kind: "category", id: category.id, name: category.nome })}><Trash2 /></Button></div></div>)}
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditor({ kind: "category", groupId: selected.id, subgroupId: subgroup.id })}><Plus data-icon="inline-start" />Categoria</Button>
                    </CardContent>
                  </Card>
                ))}
              </section>
            </CardContent>
          </Card>
        )}
      </div>
      {editor && <PlanEditor editor={editor} data={studio.data} type={type} onClose={() => setEditor(null)} />}
      {deleteTarget && (
        <Modal open onOpenChange={(open) => !open && setDeleteTarget(null)} title={`Remover ${deleteTarget.name}?`} description={deleteTarget.kind === "group" ? "As categorias e os subgrupos dentro deste grupo também serão removidos." : "Esta ação não pode ser desfeita."}>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button><Button type="button" variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate(deleteTarget)}>Remover</Button></div>
        </Modal>
      )}
    </div>
  );
}
