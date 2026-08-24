import type { Insert, Row, Update } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { ensureNoError } from "@/features/shared/api";

export const relatoriosQueryKey = ["relatorios"] as const;

export async function listRelatorios() { const { data, error } = await supabase.from("relatorios").select("*").order("data", { ascending: false }).order("created_at", { ascending: false }); ensureNoError(error); return data ?? []; }
export async function createRelatorio(input: Insert<"relatorios">) { const { data, error } = await supabase.from("relatorios").insert(input).select().single(); ensureNoError(error); return data; }
export async function updateRelatorio(id: string, input: Update<"relatorios">) { const { data, error } = await supabase.from("relatorios").update(input).eq("id", id).select().single(); ensureNoError(error); return data; }
export async function setRelatorioCompletion(id: string, completedAt: string | null): Promise<Row<"relatorios">> { return (await updateRelatorio(id, { concluido_em: completedAt }))!; }
export async function deleteRelatorio(id: string) { const { error } = await supabase.from("relatorios").delete().eq("id", id); ensureNoError(error); }
