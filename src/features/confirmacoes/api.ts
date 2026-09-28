import { ensureNoError } from "@/features/shared/api";
import { localDateIso } from "@/lib/date";
import { supabase } from "@/lib/supabase";

export type ConfirmationValue = "confirmou" | "nao_vem" | null;

interface SetConfirmationInput {
  data: string;
  turmaId: string;
  contatoId: string;
  por: string;
  status: ConfirmationValue;
  today?: string;
}

async function removeDerivedNotice(input: SetConfirmationInput) {
  const { error } = await supabase
    .from("avisos_falta")
    .delete()
    .eq("contato_id", input.contatoId)
    .eq("turma_id", input.turmaId)
    .eq("data", input.data)
    .eq("origem", "confirmacao");
  ensureNoError(error);
}

export async function setConfirmation(input: SetConfirmationInput) {
  if (input.status) {
    const { error } = await supabase.from("confirmacoes").upsert(
      {
        data: input.data,
        turma_id: input.turmaId,
        contato_id: input.contatoId,
        status: input.status,
        por: input.por,
        em: new Date().toISOString(),
      },
      { onConflict: "data,turma_id,contato_id" },
    );
    ensureNoError(error);
  } else {
    const { error } = await supabase
      .from("confirmacoes")
      .delete()
      .eq("data", input.data)
      .eq("turma_id", input.turmaId)
      .eq("contato_id", input.contatoId);
    ensureNoError(error);
  }

  if (input.status === "nao_vem") {
    const { error } = await supabase.from("avisos_falta").upsert(
      {
        contato_id: input.contatoId,
        turma_id: input.turmaId,
        data: input.data,
        avisou_em: input.today ?? localDateIso(),
        por: input.por,
        origem: "confirmacao",
      },
      {
        onConflict: "contato_id,turma_id,data",
        ignoreDuplicates: true,
      },
    );
    ensureNoError(error);
  } else {
    await removeDerivedNotice(input);
  }
}
