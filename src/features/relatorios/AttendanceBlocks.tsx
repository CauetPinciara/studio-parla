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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
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

function formatAttendanceTime(value: string | null): string {
  if (value === null) return "Horário não informado";

  const [hours, minutes] = value.split(":");
  return `${hours}h${minutes}`;
}

function expectedPeopleLabel(count: number): string {
  return count === 1 ? "1 pessoa esperada" : `${count} pessoas esperadas`;
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
    <section
      className="flex flex-col gap-3"
      aria-labelledby="attendance-heading"
    >
      <h2
        id="attendance-heading"
        className="text-foreground/70 text-xs font-semibold uppercase tracking-widest"
      >
        Presenças
      </h2>

      {day.turmas.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarX2 aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Nenhuma aula esperada</EmptyTitle>
            <EmptyDescription className="text-foreground/70">
              Não há turmas recorrentes nem aulas avulsas confirmadas para esta
              data.
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

  return (
    <Card role="region" aria-labelledby={titleId} className="overflow-hidden">
      <button type="button" className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/40" onClick={() => setOpen((value) => !value)}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary-foreground">
          {attendanceClass.hora?.slice(0, 2) ?? "--"}h
        </span>
        <span className="min-w-0">
          <CardTitle id={titleId} className="text-sm">{attendanceClass.turmaNome}</CardTitle>
          <CardDescription>{formatAttendanceTime(attendanceClass.hora)} · {expectedPeopleLabel(attendanceClass.pessoas.length)}</CardDescription>
        </span>
        <span className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          {present > 0 && <Badge variant="success">{present} presentes</Badge>}
          {absent > 0 && <Badge variant="destructive">{absent} faltas</Badge>}
          {pendingCount > 0 && <Badge variant="outline">{pendingCount} sem marcar</Badge>}
          <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <CardContent className="border-t pt-4">
          <ul className="flex flex-col gap-4">
            {attendanceClass.pessoas.map((person) => {
              const historical = attendanceClass.turmaId === null || person.contatoId === null;
              const notice = avisos.find((item) => item.data === date && item.turma_id === attendanceClass.turmaId && item.contato_id === person.contatoId);
              const replacement = reposicoes.find((item) => item.origem_data === date && item.origem_turma_id === attendanceClass.turmaId && item.contato_id === person.contatoId);
              return (
                <li key={person.key} className="flex min-w-0 flex-col gap-3 border-b pb-4 last:border-0 last:pb-0 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold">{person.nome.slice(0, 2).toUpperCase()}</span>
                    <span className="min-w-0 break-words font-medium">{person.nome}</span>
                    {person.origem === "avulsa" && <Badge variant="outline">Avulsa</Badge>}
                    {historical && <Badge variant="outline">Histórico</Badge>}
                    {notice && <Badge variant="warning">Avisou falta · {formatDate(notice.avisou_em).slice(0, 5)}</Badge>}
                  </div>
                  {person.status === "faltou" && !historical && onReplacement && (
                    <Button type="button" size="sm" variant="outline" onClick={() => onReplacement({ contatoId: person.contatoId!, turmaId: attendanceClass.turmaId!, data: date })}>
                      <CalendarClock data-icon="inline-start" />
                      {replacement ? `Reposição · ${formatDate(replacement.destino_data).slice(0, 5)}` : "Marcar reposição"}
                    </Button>
                  )}
                  <ToggleGroup
                    className="w-full lg:w-fit"
                    type="single"
                    variant="outline"
                    role="group"
                    value={person.status ?? ""}
                    aria-label={`Presença de ${person.nome} em ${attendanceClass.turmaNome}`}
                    disabled={pending || historical}
                    onValueChange={(nextStatus) => {
                      if ((nextStatus !== "presente" && nextStatus !== "faltou") || historical) return;
                      onMark({ data: date, turmaId: attendanceClass.turmaId!, turmaNome: attendanceClass.turmaNome, contatoId: person.contatoId!, contatoNome: person.nome, status: nextStatus, origem: person.origem, matriculaId: person.matriculaId, avulsaId: person.avulsaId });
                    }}
                  >
                    <ToggleGroupItem className="flex-1 lg:flex-none" value="presente" role="button" aria-pressed={person.status === "presente"}>{person.status === "presente" && <Check />}Presente</ToggleGroupItem>
                    <ToggleGroupItem className="flex-1 lg:flex-none" value="faltou" role="button" aria-pressed={person.status === "faltou"}>{person.status === "faltou" && <Check />}Faltou</ToggleGroupItem>
                  </ToggleGroup>
                </li>
              );
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
