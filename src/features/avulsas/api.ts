import type { Insert, Update } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { ensureNoError } from "@/features/shared/api";
export async function listAvulsas() { const { data, error } = await supabase.from("avulsas").select("*").order("data", { ascending: false }); ensureNoError(error); return data ?? []; }
export async function createAvulsa(input: Insert<"avulsas">) { const { data, error } = await supabase.from("avulsas").insert(input).select().single(); ensureNoError(error); return data; }
export async function updateAvulsa(id: string, input: Update<"avulsas">) { const { data, error } = await supabase.from("avulsas").update(input).eq("id", id).select().single(); ensureNoError(error); return data; }
export async function deleteAvulsa(id: string) { const { error } = await supabase.from("avulsas").delete().eq("id", id); ensureNoError(error); }
