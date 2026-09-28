import type { MemberRole } from "@/app/access";

const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

function dateAtNoon(value: string) {
  return new Date(`${value}T12:00:00`);
}

function isoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addIsoDays(value: string, amount: number) {
  const date = dateAtNoon(value);
  date.setDate(date.getDate() + amount);
  return isoDate(date);
}

export function replacementStartDate(originDate: string, today: string) {
  const dayAfterAbsence = addIsoDays(originDate, 1);
  return dayAfterAbsence > today ? dayAfterAbsence : today;
}

export function shiftIsoMonth(value: string, amount: number) {
  const date = dateAtNoon(`${value.slice(0, 7)}-01`);
  date.setMonth(date.getMonth() + amount);
  return isoDate(date);
}

export interface RecurringClass {
  id: string;
  nome: string;
  dia: number | null;
  hora: string | null;
  fim: string | null;
  capacidade: number;
}

export function occurrencesForRange<T extends RecurringClass>(
  turmas: T[],
  start: string,
  days: number,
) {
  const occurrences: Array<{ data: string; turma: T }> = [];
  for (let offset = 0; offset < days; offset += 1) {
    const data = addIsoDays(start, offset);
    const weekday = dateAtNoon(data).getDay();
    turmas
      .filter(({ dia }) => dia === weekday)
      .sort((left, right) => (left.hora ?? "").localeCompare(right.hora ?? ""))
      .forEach((turma) => occurrences.push({ data, turma }));
  }
  return occurrences;
}

interface CapacityInput {
  turma: { id: string; capacidade: number };
  data: string;
  matriculas: Array<{ contato_id: string; turma_id: string | null; status: string }>;
  avisos: Array<{ contato_id: string; turma_id: string; data: string }>;
  reposicoes: Array<{ contato_id: string; destino_turma_id: string; destino_data: string }>;
}

export function classCapacity({ turma, data, matriculas, avisos, reposicoes }: CapacityInput) {
  const activeContacts = new Set(
    matriculas
      .filter(({ turma_id, status }) => turma_id === turma.id && ["Ativa", "Nova"].includes(status))
      .map(({ contato_id }) => contato_id),
  );
  const avisaram = new Set(
    avisos
      .filter((aviso) => aviso.turma_id === turma.id && aviso.data === data && activeContacts.has(aviso.contato_id))
      .map(({ contato_id }) => contato_id),
  ).size;
  const replacements = reposicoes.filter(
    ({ destino_turma_id, destino_data }) =>
      destino_turma_id === turma.id && destino_data === data,
  ).length;
  const ocupados = Math.max(0, activeContacts.size - avisaram + replacements);

  return {
    matriculados: activeContacts.size,
    avisaram,
    reposicoes: replacements,
    ocupados,
    vagas: Math.max(0, turma.capacidade - ocupados),
  };
}

export type ConfirmationStatus = "confirmou" | "nao_vem" | "sem_resposta";

export function confirmationStatus(
  confirmation: { status: string } | null | undefined,
  notice: { origem: string } | null | undefined,
): ConfirmationStatus {
  if (confirmation?.status === "confirmou") return "confirmou";
  if (confirmation?.status === "nao_vem" || notice) return "nao_vem";
  return "sem_resposta";
}

export type AbsenceStatus =
  | "falta_confirmada"
  | "acabou_indo"
  | "sem_chamada"
  | "falta_esperada";

export function absenceStatus(
  classDate: string,
  attendance: string | null | undefined,
  today: string,
): AbsenceStatus {
  if (attendance === "faltou") return "falta_confirmada";
  if (attendance === "presente") return "acabou_indo";
  return classDate < today ? "sem_chamada" : "falta_esperada";
}

export function reportStepsForRole(role: MemberRole) {
  return role === "atendimento"
    ? ["Resumo de ontem", "Confirmações", "Pagamentos", "Observações"]
    : ["Chamada", "Peças", "Observações"];
}

function dayDifference(from: string, to: string) {
  return Math.round(
    (dateAtNoon(to).getTime() - dateAtNoon(from).getTime()) / 86_400_000,
  );
}

export function financeEntryStatus(
  entry: { pago: boolean; vencimento: string },
  today: string,
) {
  if (entry.pago) return { key: "pago" as const, label: "Pago" };
  const difference = dayDifference(today, entry.vencimento);
  if (difference < 0) {
    const days = Math.abs(difference);
    return { key: "vencido" as const, label: `Vencido há ${days} ${days === 1 ? "dia" : "dias"}` };
  }
  if (difference === 0) return { key: "hoje" as const, label: "Vence hoje" };
  return { key: "aberto" as const, label: `A vencer em ${difference} ${difference === 1 ? "dia" : "dias"}` };
}

function hourLabel(value: string) {
  const [hours, minutes] = value.split(":");
  return minutes === "00" ? `${Number(hours)}h` : `${Number(hours)}h${minutes}`;
}

export function generateClassName(name: string, weekday: number, start: string, end: string) {
  const trimmed = name.trim();
  if (trimmed) return trimmed;
  return `${DAY_NAMES[weekday] ?? "Turma"} · ${hourLabel(start)}–${hourLabel(end)}`;
}

export function monthsStudying(start: string, today: string) {
  const startDate = dateAtNoon(start);
  const todayDate = dateAtNoon(today);
  const months = (todayDate.getFullYear() - startDate.getFullYear()) * 12
    + todayDate.getMonth() - startDate.getMonth();
  return Math.max(0, months - (todayDate.getDate() < startDate.getDate() ? 1 : 0));
}
