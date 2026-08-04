import type { Insert, Update } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { ensureNoError } from "@/features/shared/api";
export async function listWorkshops() { const { data, error } = await supabase.from("workshops").select("*").order("created_at", { ascending: false }); ensureNoError(error); return data ?? []; }
export async function createWorkshop(input: Insert<"workshops">) { const { data, error } = await supabase.from("workshops").insert(input).select().single(); ensureNoError(error); return data; }
export async function updateWorkshop(id: string, input: Update<"workshops">) { const { data, error } = await supabase.from("workshops").update(input).eq("id", id).select().single(); ensureNoError(error); return data; }
export async function deleteWorkshop(id: string) { const { error } = await supabase.from("workshops").delete().eq("id", id); ensureNoError(error); }
