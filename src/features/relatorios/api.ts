import type { Insert, Update } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { ensureNoError } from "@/features/shared/api";
export async function listRelatorios() { const { data, error } = await supabase.from("relatorios").select("*").order("data", { ascending: false }); ensureNoError(error); return data ?? []; }
export async function createRelatorio(input: Insert<"relatorios">) { const { data, error } = await supabase.from("relatorios").insert(input).select().single(); ensureNoError(error); return data; }
export async function updateRelatorio(id: string, input: Update<"relatorios">) { const { data, error } = await supabase.from("relatorios").update(input).eq("id", id).select().single(); ensureNoError(error); return data; }
export async function deleteRelatorio(id: string) { const { error } = await supabase.from("relatorios").delete().eq("id", id); ensureNoError(error); }
