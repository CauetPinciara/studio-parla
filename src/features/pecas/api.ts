import type { Insert, Update } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { ensureNoError } from "@/features/shared/api";
import { pecaStatusPatch, type PecaStatus } from "@/features/pecas/domain";
export async function listPecas() { const { data, error } = await supabase.from("pecas").select("*").order("created_at", { ascending: false }); ensureNoError(error); return data ?? []; }
export async function createPeca(input: Insert<"pecas">) { const { data, error } = await supabase.from("pecas").insert(input).select().single(); ensureNoError(error); return data; }
export async function updatePeca(id: string, input: Update<"pecas">) { const { data, error } = await supabase.from("pecas").update(input).eq("id", id).select().single(); ensureNoError(error); return data; }
export async function deletePeca(id: string) { const { error } = await supabase.from("pecas").delete().eq("id", id); ensureNoError(error); }
export async function setPecaStatus(id: string, status: PecaStatus, date: string) { return updatePeca(id, pecaStatusPatch(status, date)); }
