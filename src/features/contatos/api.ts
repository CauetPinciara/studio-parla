import type { Insert, Update } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { ensureNoError } from "@/features/shared/api";
export async function listContatos() { const { data, error } = await supabase.from("contatos").select("*").order("nome"); ensureNoError(error); return data ?? []; }
export async function createContato(input: Insert<"contatos">) { const { data, error } = await supabase.from("contatos").insert(input).select().single(); ensureNoError(error); return data; }
export async function updateContato(id: string, input: Update<"contatos">) { const { data, error } = await supabase.from("contatos").update(input).eq("id", id).select().single(); ensureNoError(error); return data; }
export async function deleteContato(id: string) { const { error } = await supabase.from("contatos").delete().eq("id", id); ensureNoError(error); }
