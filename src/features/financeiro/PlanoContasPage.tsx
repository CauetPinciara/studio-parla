import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

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
  const updateClassification = useMutation({
    mutationFn: ({ id, classificacao }: { id: string; classificacao: string }) => updatePlanGroup(id, { classificacao }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: studioDataQueryKey }),
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
  const directCategories = categories.filter(({ subgrupo_id }) => !subgrupo_id);
  const allTypeGroups = studio.data.planoGrupos.filter((group) => group.tipo === type);
  const categoryCount = allTypeGroups.reduce(
    (count, group) => count + studio.data.planoCategorias.filter(({ grupo_id }) => grupo_id === group.id).length,
    0,
  );
  const categoryBadgeClass = type === "despesa"
    ? "bg-[hsla(38,85%,55%,.18)] text-[hsl(30_62%_30%)]"
    : "bg-[hsla(152,40%,45%,.16)] text-[hsl(152_40%_26%)]";
  const dotClass = type === "despesa" ? "border-[hsl(24_70%_52%)]" : "border-[hsl(152_32%_40%)]";

  const categoryRow = (category: (typeof categories)[number], last: boolean) => (
    <div
      key={category.id}
      className={cn(
        "flex items-center gap-2.5 px-3.5 py-[11px] hover:bg-[hsl(30_8%_98%)]",
        !last && "border-b border-[hsl(30_8%_94%)]",
      )}
    >
      <span className={cn("inline-block size-2.5 shrink-0 rounded-full border-2", dotClass)} />
      <span className="min-w-0 truncate text-sm font-medium">{category.nome}</span>
      <span className="ml-auto flex shrink-0 items-center gap-1.5">
        <span className={cn("inline-flex items-center rounded-full px-[9px] py-[3px] text-[10px] font-bold uppercase tracking-[.05em]", categoryBadgeClass)}>
          {selected?.classificacao}
        </span>
        <button type="button" aria-label="Editar categoria" onClick={() => selected && setEditor({ kind: "category", groupId: selected.id, subgroupId: category.subgrupo_id ?? undefined, id: category.id })} className="inline-flex size-[30px] items-center justify-center rounded-[7px] border-0 bg-transparent hover:bg-[hsl(30_8%_93%)]"><Pencil className="size-4" /></button>
        <button type="button" aria-label="Remover categoria" onClick={() => setDeleteTarget({ kind: "category", id: category.id, name: category.nome })} className="inline-flex size-[30px] items-center justify-center rounded-[7px] border-0 bg-transparent hover:bg-[hsl(30_8%_93%)]"><Trash2 className="size-4" /></button>
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex gap-1 rounded-[11px] border border-[hsl(30_8%_90%)] bg-white p-1">
          {(["despesa", "receita"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => { setType(value); setSelectedId(null); }}
              className={cn(
                "inline-flex h-9 items-center rounded-[9px] border-0 px-[18px] text-sm font-semibold",
                type === value ? "bg-[hsl(340_72%_64%)] text-white" : "bg-transparent text-[hsl(25_5%_45%)]",
              )}
            >
              {value === "despesa" ? "Despesas" : "Receitas"}
            </button>
          ))}
        </div>
        <span className="text-[13px] text-[hsl(25_5%_45%)]">{categoryCount} {categoryCount === 1 ? "categoria" : "categorias"}</span>
        <button type="button" onClick={() => setEditor({ kind: "group" })} className="ml-auto inline-flex h-9 items-center gap-2 rounded-[9px] border-0 bg-[hsl(340_72%_64%)] px-3.5 text-sm font-semibold text-white hover:bg-[hsl(340_65%_58%)]"><Plus className="size-4" />Novo grupo</button>
      </div>
      <Input aria-label="Buscar no plano de contas" className="h-10 rounded-[10px] border-[hsl(30_8%_88%)] bg-white px-3.5 text-sm" placeholder="Buscar grupo, subgrupo ou categoria…" value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="grid grid-cols-[minmax(0,260px)_minmax(0,1fr)] items-start gap-4">
        <div className="flex flex-col gap-1 rounded-xl border border-[hsl(30_8%_90%)] bg-white p-2.5">
          <span className="px-2.5 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[.08em] text-[hsl(25_5%_50%)]">Grupos</span>
          {groups.map((group) => (
            <button key={group.id} type="button" className={cn("flex w-full items-center gap-2.5 rounded-[10px] border-0 px-2.5 py-[9px] text-left hover:bg-[hsl(30_8%_96%)]", selected?.id === group.id ? "bg-[hsl(340_60%_97%)]" : "bg-transparent")} onClick={() => setSelectedId(group.id)}>
              <span className={cn("inline-block size-[7px] shrink-0 rounded-full border-[3.5px]", dotClass)} />
              <span className="flex min-w-0 flex-col items-start leading-[1.35]">
                <strong className="text-sm">{group.nome}</strong>
                <span className="text-xs text-[hsl(25_5%_48%)]">{studio.data.planoCategorias.filter(({ grupo_id }) => grupo_id === group.id).length} categorias · {group.classificacao}</span>
              </span>
            </button>
          ))}
          {groups.length === 0 && <span className="px-2.5 py-5 text-center text-[13px] text-[hsl(25_5%_50%)]">Nenhum grupo encontrado.</span>}
        </div>
        {selected && (
          <div className="rounded-xl border border-[hsl(30_8%_90%)] bg-white">
            <div className="flex flex-wrap items-center gap-3 px-[18px] pb-3.5 pt-[18px]">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="m-0 text-xl font-semibold tracking-[-.01em]">{selected.nome}</h2>
                <span className="text-[13px] text-[hsl(25_5%_48%)]">{categories.length} {categories.length === 1 ? "categoria" : "categorias"}</span>
              </div>
              <div className="ml-auto flex gap-1">
                <button type="button" aria-label="Editar grupo" onClick={() => setEditor({ kind: "group", id: selected.id })} className="inline-flex size-[34px] items-center justify-center rounded-lg border-0 bg-transparent hover:bg-[hsl(30_8%_94%)]"><Pencil className="size-4" /></button>
                <button type="button" aria-label="Remover grupo" onClick={() => setDeleteTarget({ kind: "group", id: selected.id, name: selected.nome })} className="inline-flex size-[34px] items-center justify-center rounded-lg border-0 bg-transparent hover:bg-[hsl(30_8%_94%)]"><Trash2 className="size-4" /></button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 px-[18px] pb-4">
              <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-[hsl(25_5%_50%)]">Classificação do grupo</span>
              <EntitySelect
                label="Classificação do grupo"
                hideLabel
                value={selected.classificacao}
                disabled={updateClassification.isPending}
                onValueChange={(classificacao) => updateClassification.mutate({ id: selected.id, classificacao })}
                options={CLASSIFICATIONS[type].map((classification) => ({ value: classification, label: classification }))}
                triggerClassName="h-[34px] w-auto min-w-[116px] text-[13px] font-semibold"
              />
            </div>

            <div className="border-t border-[hsl(30_8%_92%)]">
              {directCategories.map((category, index) => categoryRow(category, index + 1 === directCategories.length))}
              <button type="button" onClick={() => setEditor({ kind: "category", groupId: selected.id })} className="flex w-full items-center gap-2 border-0 border-t border-[hsl(30_8%_94%)] bg-transparent px-3.5 py-3 text-left text-[13px] font-semibold text-[hsl(340_50%_42%)] hover:bg-[hsl(340_60%_98%)]"><Plus className="size-4" />Nova categoria</button>
            </div>

            {subgroups.map((subgroup) => {
              const subgroupCategories = categories.filter(({ subgrupo_id }) => subgrupo_id === subgroup.id);
              return (
                <div key={subgroup.id} className="mx-[18px] mb-4 rounded-[11px] border border-[hsl(30_8%_91%)] bg-[hsl(30_10%_98%)]">
                  <div className="flex items-center gap-2.5 px-3.5 py-3">
                    <span className="flex min-w-0 flex-col leading-[1.3]">
                      <span className="text-[13px] font-bold uppercase tracking-[.05em] text-[hsl(25_5%_35%)]">{subgroup.nome}</span>
                      <span className="text-xs text-[hsl(25_5%_50%)]">{subgroupCategories.length} {subgroupCategories.length === 1 ? "categoria" : "categorias"}</span>
                    </span>
                    <span className="ml-auto flex gap-1">
                      <button type="button" aria-label="Editar subgrupo" onClick={() => setEditor({ kind: "subgroup", groupId: selected.id, id: subgroup.id })} className="inline-flex size-[30px] items-center justify-center rounded-[7px] border-0 bg-transparent hover:bg-[hsl(30_8%_93%)]"><Pencil className="size-4" /></button>
                      <button type="button" aria-label="Remover subgrupo" onClick={() => setDeleteTarget({ kind: "subgroup", id: subgroup.id, name: subgroup.nome })} className="inline-flex size-[30px] items-center justify-center rounded-[7px] border-0 bg-transparent hover:bg-[hsl(30_8%_93%)]"><Trash2 className="size-4" /></button>
                    </span>
                  </div>
                  <div className="rounded-b-[10px] border-t border-[hsl(30_8%_92%)] bg-white">
                    {subgroupCategories.map((category, index) => categoryRow(category, index + 1 === subgroupCategories.length))}
                    <button type="button" onClick={() => setEditor({ kind: "category", groupId: selected.id, subgroupId: subgroup.id })} className="flex w-full items-center gap-2 rounded-b-[10px] border-0 border-t border-[hsl(30_8%_94%)] bg-transparent px-3.5 py-[11px] text-left text-[13px] font-semibold text-[hsl(340_50%_42%)] hover:bg-[hsl(340_60%_98%)]"><Plus className="size-4" />Nova categoria neste subgrupo</button>
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => setEditor({ kind: "subgroup", groupId: selected.id })} className="flex w-full items-center gap-2 rounded-b-xl border-0 border-t border-[hsl(30_8%_92%)] bg-transparent px-[18px] py-3.5 text-left text-[13px] font-semibold text-[hsl(25_5%_40%)] hover:bg-[hsl(30_8%_97%)]"><Plus className="size-4" />Novo subgrupo</button>
          </div>
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
