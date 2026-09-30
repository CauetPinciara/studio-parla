import { useState } from "react";
import { CalendarClock, CalendarX2, Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import type { UpsertAttendanceInput } from "@/features/relatorios/attendance-api";
import type { AttendanceDay } from "@/features/relatorios/attendance-domain";
import { formatDate } from "@/lib/format";
import type { Row } from "@/lib/database.helpers";

export interface AttendanceBlocksProps {
  day: AttendanceDay;
  pending: boolean;
  onMark: (input: UpsertAttendanceInput) => void;
  avisos?: Row<"avisos_falta">[];
  reposicoes?: Row<"reposicoes">[];
  onReplacement?: (source: { contatoId: string; turmaId: string; data: string }) => void;
}

function classTitleId(key: string): string {
  return `attendance-class-${key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function AttendanceBlocks({
  day,
  pending,
  onMark,
  avisos = [],
  reposicoes = [],
  onReplacement,
}: AttendanceBlocksProps): React.ReactElement {
  return (
    <section className="flex flex-col gap-3" aria-label="Presenças">
      {day.turmas.length === 0 ? (
        <Empty className="gap-2 rounded-xl border border-dashed border-[hsl(30_8%_88%)] p-12 text-center">
          <EmptyHeader>
            <EmptyMedia className="size-10 rounded-[10px] bg-muted" variant="icon">
              <CalendarX2 size={24} aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-base font-semibold">Nenhuma aula esperada</EmptyTitle>
            <EmptyDescription className="text-sm text-muted-foreground">
              Nenhuma turma recorrente nem avulsa confirmada nesta data.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {day.turmas.map((attendanceClass) => (
            <AttendanceClassBlock
              key={attendanceClass.key}
              attendanceClass={attendanceClass}
              date={day.data}
              pending={pending}
              avisos={avisos}
              reposicoes={reposicoes}
              onMark={onMark}
              onReplacement={onReplacement}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type AttendanceClassItem = AttendanceDay["turmas"][number];

function AttendanceClassBlock({
  attendanceClass,
  date,
  pending,
  avisos,
  reposicoes,
  onMark,
  onReplacement,
}: {
  attendanceClass: AttendanceClassItem;
  date: string;
  pending: boolean;
  avisos: Row<"avisos_falta">[];
  reposicoes: Row<"reposicoes">[];
  onMark: AttendanceBlocksProps["onMark"];
  onReplacement?: AttendanceBlocksProps["onReplacement"];
}) {
  const pendingCount = attendanceClass.pessoas.filter(({ status }) => !status).length;
  const [open, setOpen] = useState(pendingCount > 0);
  const present = attendanceClass.pessoas.filter(({ status }) => status === "presente").length;
  const absent = attendanceClass.pessoas.filter(({ status }) => status === "faltou").length;
  const titleId = classTitleId(attendanceClass.key);
  const peopleId = `${titleId}-people`;

  return (
    <Card role="region" aria-labelledby={titleId} className="overflow-hidden shadow-[0_1px_2px_rgba(24,20,18,.04)]">
      <button type="button" aria-expanded={open} aria-controls={peopleId} className={`flex w-full items-center gap-3 border-none bg-card px-4 py-3 text-left hover:bg-[hsl(30_10%_98%)] ${open ? "border-b border-b-[hsl(30_8%_92%)]" : ""}`} onClick={() => setOpen((value) => !value)}>
        <span className={`flex size-[38px] shrink-0 items-center justify-center rounded-[10px] text-xs font-bold ${pendingCount === 0 ? "bg-[hsla(152,35%,40%,.14)] text-[hsl(152_35%_28%)]" : "bg-[hsla(340,72%,64%,.14)] text-[hsl(340_45%_38%)]"}`}>
          {attendanceClass.hora?.slice(0, 2) ?? "--"}h
        </span>
        <span className="flex min-w-0 flex-col items-start leading-[1.3]">
          <CardTitle id={titleId} className="text-sm font-semibold leading-[1.3] tracking-normal">{attendanceClass.turmaNome}</CardTitle>
          <CardDescription className="text-xs leading-[1.3] text-[hsl(25_5%_48%)]">{attendanceClass.pessoas.length === 1 ? "1 aluno" : `${attendanceClass.pessoas.length} alunos`}{attendanceClass.hora ? ` · ${attendanceClass.hora.slice(0, 5)}` : ""}</CardDescription>
        </span>
        <span className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {present > 0 && <Badge className="py-[3px]" variant="success">{present} {present === 1 ? "presente" : "presentes"}</Badge>}
          {absent > 0 && <Badge className="py-[3px]" variant="destructive">{absent} {absent === 1 ? "falta" : "faltas"}</Badge>}
          {pendingCount > 0 && <Badge className="py-[3px] text-muted-foreground" variant="outline">{pendingCount} sem marcar</Badge>}
          <ChevronDown size={16} className={`text-quiet-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <CardContent className="p-0">
          <ul id={peopleId} className="flex flex-col">
            {attendanceClass.pessoas.map((person) => {
              const historical = attendanceClass.turmaId === null || person.contatoId === null;
              const notice = avisos.find((item) => item.data === date && item.turma_id === attendanceClass.turmaId && item.contato_id === person.contatoId);
              const replacement = reposicoes.find((item) => item.origem_data === date && item.origem_turma_id === attendanceClass.turmaId && item.contato_id === person.contatoId);
              const columns = `28px minmax(64px,1fr) ${person.origem === "matricula" ? "0px" : "minmax(0,64px)"} ${notice ? "minmax(0,150px)" : "0px"} ${person.status === "faltou" ? "minmax(0,116px)" : "0px"} minmax(0,148px)`;
              return (
                <li key={person.key} style={{ "--attendance-columns": columns } as React.CSSProperties} className="flex min-w-0 flex-col gap-2.5 border-b border-b-[hsl(30_8%_94%)] px-4 py-2.5 last:border-0 lg:grid lg:grid-cols-[var(--attendance-columns)] lg:items-center">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[hsl(30_8%_93%)] text-[11px] font-bold text-nav-foreground">{person.nome.slice(0, 2).toUpperCase()}</span>
                  <span className="min-w-0 truncate font-medium">{person.nome}</span>
                  <span className="flex min-w-0 overflow-hidden">{person.origem === "avulsa" && <Badge variant="outline">Avulsa</Badge>}{historical && <Badge variant="outline">Histórico</Badge>}</span>
                  <span className="flex min-w-0 overflow-hidden">{notice && <Badge variant="warning">Avisou falta · {formatDate(notice.avisou_em).slice(0, 5)}</Badge>}</span>
                  <span className="flex justify-end">{person.status === "faltou" && !historical && onReplacement && (
                    <Button className={`h-[30px] w-full rounded-full px-2 text-xs font-semibold ${replacement ? "border-none bg-info-soft text-info" : "border-dashed text-muted-foreground"}`} type="button" size="sm" variant="outline" onClick={() => onReplacement({ contatoId: person.contatoId!, turmaId: attendanceClass.turmaId!, data: date })}>
                      <CalendarClock size={14} data-icon="inline-start" />
                      {replacement ? `Reposição · ${formatDate(replacement.destino_data).slice(0, 5)}` : "Marcar reposição"}
                    </Button>
                  )}</span>
                  <span className="flex justify-end">
                    <span className="inline-flex w-full overflow-hidden rounded-[9px] border border-[hsl(30_8%_88%)]" role="group" aria-label={`Presença de ${person.nome} em ${attendanceClass.turmaNome}`}>
                      {(["presente", "faltou"] as const).map((status) => {
                        const active = person.status === status;
                        return <button
                          key={status}
                          type="button"
                          className={`inline-flex h-8 min-w-0 flex-1 items-center justify-center border-none px-0 text-[13px] font-semibold ${status === "faltou" ? "border-l border-l-[hsl(30_8%_88%)]" : ""} ${active ? status === "presente" ? "bg-success text-white" : "bg-destructive text-white" : "bg-white text-muted-foreground"}`}
                          aria-pressed={active}
                          disabled={pending || historical}
                          onClick={() => {
                            if (historical) return;
                            onMark({ data: date, turmaId: attendanceClass.turmaId!, turmaNome: attendanceClass.turmaNome, contatoId: person.contatoId!, contatoNome: person.nome, status, origem: person.origem, matriculaId: person.matriculaId, avulsaId: person.avulsaId });
                          }}
                        >
                          <span className={`flex shrink-0 overflow-hidden transition-all ${active ? "mr-1.5 w-3.5 opacity-100" : "mr-0 w-0 -translate-x-1.5 opacity-0"}`}><Check size={14} /></span>
                          {status === "presente" ? "Veio" : "Faltou"}
                        </button>;
                      })}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
