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
import { normalizeReportDate, reportTodayIso, shiftReportDate } from "@/features/relatorios/date-navigation";

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

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

function sentenceCase(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
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
  const report = relatorios.data?.find((item) => item.data === selectedDate);
  const isCompleted = Boolean(report?.concluido_em);
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

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
      <span className="hidden shrink-0 text-xs font-medium text-muted-foreground xl:inline">
        Dia selecionado
      </span>
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
            <CalendarDays data-icon="inline-start" />
            <span className="truncate sm:hidden" aria-hidden="true">
              {formatShortDate(selectedDate)}
            </span>
            <span className="hidden truncate sm:inline" aria-hidden="true">
              {sentenceCase(longDateFormatter.format(new Date(`${selectedDate}T00:00:00.000Z`)))}
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
      <Button
        className="shrink-0 lg:w-auto lg:px-3"
        size="icon"
        variant="ghost"
        aria-label="Hoje"
        onClick={() => goToDate(today)}
      >
        <CalendarDays data-icon="inline-start" />
        <span className="hidden lg:inline">Hoje</span>
      </Button>
      <Button
        className="ml-auto shrink-0 lg:w-auto lg:px-3"
        size="icon"
        variant={isCompleted ? "default" : "outline"}
        aria-label="Tudo anotado!"
        aria-pressed={isCompleted}
        disabled={relatorios.isLoading || completion.isPending}
        onClick={() => completion.mutate()}
      >
        <CheckCircle2 data-icon="inline-start" />
        <span className="hidden lg:inline">Tudo anotado!</span>
      </Button>
    </div>
  );
}
