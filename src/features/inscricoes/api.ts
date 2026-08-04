import type { Insert, Update } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { ensureNoError } from "@/features/shared/api";
export async function listInscricoes() { const { data, error } = await supabase.from("inscricoes").select("*"); ensureNoError(error); return data ?? []; }
export async function createInscricao(input: Insert<"inscricoes">) { const { data, error } = await supabase.from("inscricoes").insert(input).select().single(); ensureNoError(error); return data; }
export async function updateInscricao(id: string, input: Update<"inscricoes">) { const { data, error } = await supabase.from("inscricoes").update(input).eq("id", id).select().single(); ensureNoError(error); return data; }
export async function deleteInscricao(id: string) { const { error } = await supabase.from("inscricoes").delete().eq("id", id); ensureNoError(error); }
