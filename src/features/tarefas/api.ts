import { ensureNoError } from "@/features/shared/api";
import type { Insert, Row, Update } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export const tarefasQueryKey = ["tarefas"] as const;

function ensureOriginalError(error: { message: string } | null) {
  try {
    ensureNoError(error);
  } catch {
    throw error as Error;
  }
}

export async function listTarefas(): Promise<Row<"tarefas">[]> {
  const { data, error } = await supabase
    .from("tarefas")
    .select("*")
    .order("data_abertura", { ascending: false })
    .order("created_at", { ascending: false });

  ensureOriginalError(error);
  return data ?? [];
}

export async function createTarefa(
  input: Insert<"tarefas">,
): Promise<Row<"tarefas">> {
  const { data, error } = await supabase
    .from("tarefas")
    .insert(input)
    .select()
    .single();

  ensureOriginalError(error);
  return data!;
}

export async function updateTarefa(
  id: string,
  patch: Update<"tarefas">,
): Promise<Row<"tarefas">> {
  const { data, error } = await supabase
    .from("tarefas")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  ensureOriginalError(error);
  return data!;
}

export async function deleteTarefa(id: string): Promise<void> {
  const { error } = await supabase.from("tarefas").delete().eq("id", id);
  ensureOriginalError(error);
}
