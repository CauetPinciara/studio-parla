import { listAvulsas } from "@/features/avulsas/api";
import { listContatos } from "@/features/contatos/api";
import { listMatriculas } from "@/features/matriculas/api";
import { listPecas } from "@/features/pecas/api";
import { listTurmas } from "@/features/turmas/api";
import { listWorkshops } from "@/features/workshops/api";
export async function loadDashboard() { const [contatos, turmas, matriculas, avulsas, pecas, workshops] = await Promise.all([listContatos(), listTurmas(), listMatriculas(), listAvulsas(), listPecas(), listWorkshops()]); return { contatos, turmas, matriculas, avulsas, pecas, workshops }; }
