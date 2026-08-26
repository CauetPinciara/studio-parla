import type { Row } from "@/lib/database.types";
import { ensureNoError } from "@/features/shared/api";
import { supabase } from "@/lib/supabase";
import {
  deriveAttendanceDay,
  type AttendanceDay,
  type AttendanceOrigin,
  type AttendanceStatus,
} from "@/features/relatorios/attendance-domain";

export interface UpsertAulaInput {
  data: string;
  turmaId: string;
  turmaNome: string;
}

export interface UpsertAttendanceInput extends UpsertAulaInput {
  contatoId: string;
  contatoNome: string;
  status: AttendanceStatus;
  origem: AttendanceOrigin;
  matriculaId: string | null;
  avulsaId: string | null;
}

export const attendanceDayQueryKey = (data: string) =>
  ["attendance-day", data] as const;

export async function loadAttendanceDay(data: string): Promise<AttendanceDay> {
  const [turmasResult, matriculasResult, avulsasResult, aulasResult] =
    await Promise.all([
      supabase.from("turmas").select("*"),
      supabase.from("matriculas").select("*").in("status", ["Ativa", "Nova"]),
      supabase
        .from("avulsas")
        .select("*")
        .eq("data", data)
        .eq("status", "Confirmada"),
      supabase.from("aulas").select("*").eq("data", data),
    ]);

  ensureNoError(turmasResult.error);
  ensureNoError(matriculasResult.error);
  ensureNoError(avulsasResult.error);
  ensureNoError(aulasResult.error);

  const turmas = turmasResult.data ?? [];
  const matriculas = matriculasResult.data ?? [];
  const avulsas = avulsasResult.data ?? [];
  const aulas = aulasResult.data ?? [];
  const contactIds = [
    ...new Set([
      ...matriculas.map((enrollment) => enrollment.contato_id),
      ...avulsas.map((booking) => booking.contato_id),
    ]),
  ].sort();
  const aulaIds = [
    ...new Set(aulas.map((attendanceClass) => attendanceClass.id)),
  ].sort();

  const [contatosResult, presencasResult] = await Promise.all([
    contactIds.length > 0
      ? supabase.from("contatos").select("*").in("id", contactIds)
      : Promise.resolve({ data: [] as Row<"contatos">[], error: null }),
    aulaIds.length > 0
      ? supabase.from("presencas").select("*").in("aula_id", aulaIds)
      : Promise.resolve({ data: [] as Row<"presencas">[], error: null }),
  ]);

  ensureNoError(contatosResult.error);
  ensureNoError(presencasResult.error);

  return deriveAttendanceDay({
    data,
    turmas,
    matriculas,
    avulsas,
    contatos: contatosResult.data ?? [],
    aulas,
    presencas: presencasResult.data ?? [],
  });
}

export async function upsertAula(
  input: UpsertAulaInput,
): Promise<Row<"aulas">> {
  const { error: upsertError } = await supabase.from("aulas").upsert(
    {
      data: input.data,
      turma_id: input.turmaId,
      turma_nome: input.turmaNome,
    },
    { onConflict: "data,turma_id", ignoreDuplicates: true },
  );
  ensureNoError(upsertError);

  const { data, error: lookupError } = await supabase
    .from("aulas")
    .select("*")
    .eq("data", input.data)
    .eq("turma_id", input.turmaId)
    .single();
  ensureNoError(lookupError);

  if (!data) {
    throw new Error("Attendance class was not found after upsert");
  }

  return data;
}

function validateAttendanceSource(input: UpsertAttendanceInput): void {
  if (input.origem !== "matricula" && input.origem !== "avulsa") {
    throw new RangeError(`Invalid attendance origin: ${String(input.origem)}`);
  }

  if (input.origem === "matricula" && input.avulsaId !== null) {
    throw new RangeError("Matricula attendance cannot reference an avulsa");
  }

  if (input.origem === "avulsa" && input.matriculaId !== null) {
    throw new RangeError("Avulsa attendance cannot reference a matricula");
  }
}

export async function upsertAttendance(
  input: UpsertAttendanceInput,
): Promise<Row<"presencas">> {
  validateAttendanceSource(input);

  const attendanceClass = await upsertAula({
    data: input.data,
    turmaId: input.turmaId,
    turmaNome: input.turmaNome,
  });
  const { data, error } = await supabase
    .from("presencas")
    .upsert(
      {
        aula_id: attendanceClass.id,
        contato_id: input.contatoId,
        contato_nome: input.contatoNome,
        status: input.status,
        origem: input.origem,
        matricula_id: input.matriculaId,
        avulsa_id: input.avulsaId,
      },
      { onConflict: "aula_id,contato_id" },
    )
    .select("*")
    .single();
  ensureNoError(error);

  if (!data) {
    throw new Error("Attendance was not found after upsert");
  }

  return data;
}
