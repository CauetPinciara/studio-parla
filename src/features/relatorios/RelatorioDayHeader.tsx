import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ptBR } from "react-day-picker/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/lib/auth";
import { createRelatorio, listRelatorios, relatoriosQueryKey, setRelatorioCompletion } from "@/features/relatorios/api";
import { attendanceDayQueryKey, loadAttendanceDay } from "@/features/relatorios/attendance-api";
import { isAttendanceDayReady } from "@/features/relatorios/attendance-domain";
import { formatReportHeaderDate, normalizeReportDate, reportTodayIso, shiftReportDate } from "@/features/relatorios/date-navigation";

const shortMonths = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function dateFromIso(value: string) {
  return new Date(`${value}T12:00:00`);
}

function dateToIso(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day} ${shortMonths[Number(month) - 1]} ${year}`;
}

export function RelatorioDayHeader() {
  const client = useQueryClient();
  const { member } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = reportTodayIso();
  const selectedDate = normalizeReportDate(searchParams.get("data"), today);
  const selected = dateFromIso(selectedDate);
  const relatorios = useQuery({ queryKey: relatoriosQueryKey, queryFn: listRelatorios });
  const attendanceDay = useQuery({
    queryKey: attendanceDayQueryKey(selectedDate),
    queryFn: () => loadAttendanceDay(selectedDate),
  });
  const report = relatorios.data?.find((item) => item.data === selectedDate);
  const isCompleted = Boolean(report?.concluido_em);
  const attendanceReady = attendanceDay.data
    ? isAttendanceDayReady(attendanceDay.data)
    : false;
  const isToday = selectedDate === today;
  const goToDate = (date: string) => setSearchParams({ data: date });

  const completion = useMutation({
    mutationFn: () => {
      const completedAt = report?.concluido_em ? null : new Date().toISOString();
      return report
        ? setRelatorioCompletion(report.id, completedAt)
        : createRelatorio({
            data: selectedDate,
            turma_id: null,
            autor: member?.nome ?? "Catarina",
            resumo: null,
            concluido_em: completedAt,
          });
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: relatoriosQueryKey });
      toast.success(isCompleted ? "Dia reaberto" : "Tudo anotado");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const completionDisabled =
    relatorios.isLoading ||
    completion.isPending ||
    (!isCompleted && !attendanceReady);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-0">
      <div
        className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2 lg:col-start-2 lg:flex-none"
        role="group"
        aria-label="Navegação da data"
      >
        <Button
          className="shrink-0"
          size="icon"
          variant="outline"
          aria-label="Dia anterior"
          onClick={() => goToDate(shiftReportDate(selectedDate, -1))}
        >
          <ChevronLeft />
        </Button>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              className="min-w-0 flex-1 justify-start sm:w-[180px] sm:flex-none lg:w-[250px] xl:w-[300px]"
              variant="outline"
              aria-label="Selecionar data"
            >
              <CalendarDays className="hidden sm:block" data-icon="inline-start" />
              <span className="truncate sm:hidden" aria-hidden="true">
                {formatShortDate(selectedDate)}
              </span>
              <span className="hidden truncate sm:inline" aria-hidden="true">
                {formatReportHeaderDate(selectedDate)}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selected}
              defaultMonth={selected}
              locale={ptBR}
              timeZone="America/Sao_Paulo"
              autoFocus
              onSelect={(date) => {
                if (!date) return;
                goToDate(dateToIso(date));
                setCalendarOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        <Button
          className="shrink-0"
          size="icon"
          variant="outline"
          aria-label="Próximo dia"
          onClick={() => goToDate(shiftReportDate(selectedDate, 1))}
        >
          <ChevronRight />
        </Button>
        {!isToday && (
          <Button
            className="shrink-0"
            size="sm"
            variant="ghost"
            onClick={() => goToDate(today)}
          >
            Ir para hoje
          </Button>
        )}
      </div>
      <Button
        className="shrink-0 lg:col-start-3 lg:row-start-1 lg:w-auto lg:justify-self-end lg:px-3"
        size="icon"
        variant={isCompleted ? "default" : "outline"}
        aria-label="Tudo anotado!"
        aria-pressed={isCompleted}
        disabled={completionDisabled}
        onClick={() => completion.mutate()}
      >
        <CheckCircle2 data-icon="inline-start" />
        <span className="hidden lg:inline">Tudo anotado!</span>
      </Button>
    </div>
  );
}
