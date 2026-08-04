import type { Update } from "@/lib/database.types";
export type PecaStatus = "producao" | "pronta" | "avisado" | "entregue";
const next: Record<PecaStatus, PecaStatus | null> = { producao: "pronta", pronta: "avisado", avisado: "entregue", entregue: null };
export const pecaStatusLabels: Record<PecaStatus, string> = { producao: "Em produção", pronta: "Pronta · avisar", avisado: "Aguardando retirada", entregue: "Entregue" };
export const pecaActionLabels: Partial<Record<PecaStatus, string>> = { producao: "Marcar pronta", pronta: "Marcar avisada", avisado: "Marcar entregue" };
export function getNextPecaStatus(status: string): PecaStatus | null { return status in next ? next[status as PecaStatus] : null; }
export function pecaStatusPatch(status: PecaStatus, date: string): Update<"pecas"> { return status === "pronta" ? { status, data_pronta: date } : { status }; }
export function todayIso() { return new Date().toISOString().slice(0, 10); }
