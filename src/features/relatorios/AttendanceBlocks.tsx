import { CalendarX2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import type { UpsertAttendanceInput } from "@/features/relatorios/attendance-api";
import type { AttendanceDay } from "@/features/relatorios/attendance-domain";

export interface AttendanceBlocksProps {
  day: AttendanceDay;
  pending: boolean;
  onMark: (input: UpsertAttendanceInput) => void;
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
          {day.turmas.map((attendanceClass) => {
            const titleId = classTitleId(attendanceClass.key);

            return (
              <Card
                key={attendanceClass.key}
                role="region"
                aria-labelledby={titleId}
              >
                <CardHeader>
                  <CardTitle id={titleId}>
                    {attendanceClass.turmaNome}
                  </CardTitle>
                  <CardDescription className="text-foreground/70">
                    {formatAttendanceTime(attendanceClass.hora)} ·{" "}
                    {expectedPeopleLabel(attendanceClass.pessoas.length)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-3">
                    {attendanceClass.pessoas.map((person) => {
                      const historical =
                        attendanceClass.turmaId === null ||
                        person.contatoId === null;

                      return (
                        <li
                          key={person.key}
                          className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="min-w-0 break-words font-medium">
                              {person.nome}
                            </span>
                            <Badge
                              variant={
                                person.origem === "matricula"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {person.origem === "matricula"
                                ? "Matrícula"
                                : "Avulsa"}
                            </Badge>
                            {historical && (
                              <Badge variant="outline">Histórico</Badge>
                            )}
                          </div>
                          <ToggleGroup
                            className="w-full sm:w-fit"
                            type="single"
                            variant="outline"
                            role="group"
                            value={person.status ?? ""}
                            aria-label={`Presença de ${person.nome} em ${attendanceClass.turmaNome}`}
                            disabled={pending || historical}
                            onValueChange={(nextStatus) => {
                              if (
                                nextStatus !== "presente" &&
                                nextStatus !== "faltou"
                              ) {
                                return;
                              }
                              if (
                                attendanceClass.turmaId === null ||
                                person.contatoId === null
                              ) {
                                return;
                              }

                              onMark({
                                data: day.data,
                                turmaId: attendanceClass.turmaId,
                                turmaNome: attendanceClass.turmaNome,
                                contatoId: person.contatoId,
                                contatoNome: person.nome,
                                status: nextStatus,
                                origem: person.origem,
                                matriculaId: person.matriculaId,
                                avulsaId: person.avulsaId,
                              });
                            }}
                          >
                            <ToggleGroupItem
                              className="flex-1 sm:flex-none"
                              value="presente"
                              role="button"
                              aria-pressed={person.status === "presente"}
                            >
                              {person.status === "presente" && (
                                <Check aria-hidden="true" />
                              )}
                              Presente
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              className="flex-1 sm:flex-none"
                              value="faltou"
                              role="button"
                              aria-pressed={person.status === "faltou"}
                            >
                              {person.status === "faltou" && (
                                <Check aria-hidden="true" />
                              )}
                              Faltou
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
