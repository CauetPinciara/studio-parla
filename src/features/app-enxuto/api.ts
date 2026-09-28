import type { Insert, Row, TableName, Update } from "@/lib/database.helpers";
import { ensureNoError } from "@/features/shared/api";
import { supabase } from "@/lib/supabase";

export const studioDataQueryKey = ["studio-data"] as const;

async function all<Table extends TableName>(table: Table): Promise<Row<Table>[]> {
  const { data, error } = await supabase.from(table).select("*");
  ensureNoError(error);
  return (data ?? []) as Row<Table>[];
}

export async function loadStudioData() {
  const [
    contatos,
    turmas,
    matriculas,
    avulsas,
    workshops,
    inscricoes,
    pecas,
    aulas,
    presencas,
    relatorios,
    avisos,
    confirmacoes,
    reposicoes,
    pagamentos,
    promocoes,
    planoGrupos,
    planoSubgrupos,
    planoCategorias,
    lancamentos,
  ] = await Promise.all([
    all("contatos"),
    all("turmas"),
    all("matriculas"),
    all("avulsas"),
    all("workshops"),
    all("inscricoes"),
    all("pecas"),
    all("aulas"),
    all("presencas"),
    all("relatorios"),
    all("avisos_falta"),
    all("confirmacoes"),
    all("reposicoes"),
    all("pagamentos"),
    all("promocoes"),
    all("plano_grupos"),
    all("plano_subgrupos"),
    all("plano_categorias"),
    all("lancamentos"),
  ]);

  return {
    contatos,
    turmas,
    matriculas,
    avulsas,
    workshops,
    inscricoes,
    pecas,
    aulas,
    presencas,
    relatorios,
    avisos,
    confirmacoes,
    reposicoes,
    pagamentos,
    promocoes,
    planoGrupos,
    planoSubgrupos,
    planoCategorias,
    lancamentos,
  };
}

async function insert<Table extends TableName>(
  table: Table,
  value: Insert<Table>,
): Promise<Row<Table>> {
  const { data, error } = await supabase.from(table).insert(value as never).select().single();
  ensureNoError(error);
  return data as Row<Table>;
}

export async function saveAviso(value: Insert<"avisos_falta">) {
  return insert("avisos_falta", value);
}

export async function updateAviso(id: string, value: Update<"avisos_falta">) {
  const { data, error } = await supabase.from("avisos_falta").update(value).eq("id", id).select().single();
  ensureNoError(error);
  return data;
}

export async function deleteAviso(id: string) {
  const { error } = await supabase.from("avisos_falta").delete().eq("id", id);
  ensureNoError(error);
}

export async function saveReposicao(value: Insert<"reposicoes">) {
  const { data, error } = await supabase.from("reposicoes").upsert(value, {
    onConflict: "contato_id,origem_data,origem_turma_id",
  }).select().single();
  ensureNoError(error);
  return data;
}

export async function savePagamento(value: Insert<"pagamentos">) {
  return insert("pagamentos", value);
}

export async function deletePagamento(id: string) {
  const { error } = await supabase.from("pagamentos").delete().eq("id", id);
  ensureNoError(error);
}

export async function saveDailyReport(value: Insert<"relatorios">) {
  const { data, error } = await supabase.from("relatorios").upsert(value, {
    onConflict: "data,autor",
  }).select().single();
  ensureNoError(error);
  return data;
}

export async function toggleDailyReport(
  report: { id: string; concluido_em: string | null },
) {
  const { data, error } = await supabase
    .from("relatorios")
    .update({ concluido_em: report.concluido_em ? null : new Date().toISOString() })
    .eq("id", report.id)
    .select()
    .single();
  ensureNoError(error);
  return data;
}

export async function setLancamentoPaid(id: string, paid: boolean, today: string) {
  const { data, error } = await supabase
    .from("lancamentos")
    .update({ pago: paid, pago_em: paid ? today : null })
    .eq("id", id)
    .select()
    .single();
  ensureNoError(error);
  return data;
}

export async function createPlanGroup(value: Insert<"plano_grupos">) {
  return insert("plano_grupos", value);
}

export async function updatePlanGroup(id: string, value: Update<"plano_grupos">) {
  const { data, error } = await supabase.from("plano_grupos").update(value).eq("id", id).select().single();
  ensureNoError(error);
  return data;
}

export async function deletePlanGroup(id: string) {
  const { error } = await supabase.from("plano_grupos").delete().eq("id", id);
  ensureNoError(error);
}

export async function createPlanSubgroup(value: Insert<"plano_subgrupos">) {
  return insert("plano_subgrupos", value);
}

export async function updatePlanSubgroup(id: string, value: Update<"plano_subgrupos">) {
  const { data, error } = await supabase.from("plano_subgrupos").update(value).eq("id", id).select().single();
  ensureNoError(error);
  return data;
}

export async function deletePlanSubgroup(id: string) {
  const { error } = await supabase.from("plano_subgrupos").delete().eq("id", id);
  ensureNoError(error);
}

export async function createPlanCategory(value: Insert<"plano_categorias">) {
  return insert("plano_categorias", value);
}

export async function updatePlanCategory(id: string, value: Update<"plano_categorias">) {
  const { data, error } = await supabase.from("plano_categorias").update(value).eq("id", id).select().single();
  ensureNoError(error);
  return data;
}

export async function deletePlanCategory(id: string) {
  const { error } = await supabase.from("plano_categorias").delete().eq("id", id);
  ensureNoError(error);
}
