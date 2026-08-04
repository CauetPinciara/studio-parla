import type { Insert, Update } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { ensureNoError } from "@/features/shared/api";
export async function listMatriculas() { const { data, error } = await supabase.from("matriculas").select("*").order("created_at"); ensureNoError(error); return data ?? []; }
export async function createMatricula(input: Insert<"matriculas">) { const { data, error } = await supabase.from("matriculas").insert(input).select().single(); ensureNoError(error); return data; }
export async function updateMatricula(id: string, input: Update<"matriculas">) { const { data, error } = await supabase.from("matriculas").update(input).eq("id", id).select().single(); ensureNoError(error); return data; }
export async function deleteMatricula(id: string) { const { error } = await supabase.from("matriculas").delete().eq("id", id); ensureNoError(error); }
