import type { Insert, Update } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { ensureNoError } from "@/features/shared/api";
export async function listTurmas() { const { data, error } = await supabase.from("turmas").select("*").order("dia").order("hora"); ensureNoError(error); return data ?? []; }
export async function createTurma(input: Insert<"turmas">) { const { data, error } = await supabase.from("turmas").insert(input).select().single(); ensureNoError(error); return data; }
export async function updateTurma(id: string, input: Update<"turmas">) { const { data, error } = await supabase.from("turmas").update(input).eq("id", id).select().single(); ensureNoError(error); return data; }
export async function deleteTurma(id: string) { const { error } = await supabase.from("turmas").delete().eq("id", id); ensureNoError(error); }
