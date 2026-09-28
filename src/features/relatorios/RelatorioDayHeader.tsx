import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ptBR } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatReportHeaderDate, normalizeReportDate, reportTodayIso, shiftReportDate } from "@/features/relatorios/date-navigation";

const SHORT_MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function dateFromIso(value: string) { return new Date(`${value}T12:00:00`); }
function dateToIso(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatShortDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day} ${SHORT_MONTHS[Number(month) - 1]} ${year}`;
}

export function RelatorioDayHeader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = reportTodayIso();
  const selectedDate = normalizeReportDate(searchParams.get("data"), today);
  const selected = dateFromIso(selectedDate);
  const goToDate = (date: string) => setSearchParams({ data: date });

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2" role="group" aria-label="Navegação da data">
      <Button className="shrink-0" size="icon" variant="outline" aria-label="Dia anterior" onClick={() => goToDate(shiftReportDate(selectedDate, -1))}><ChevronLeft /></Button>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button className="min-w-0 flex-1 justify-start sm:w-[250px] sm:flex-none" variant="outline" aria-label="Selecionar data">
            <CalendarDays className="hidden sm:block" data-icon="inline-start" />
            <span className="truncate sm:hidden" aria-hidden="true">{formatShortDate(selectedDate)}</span>
            <span className="hidden truncate sm:inline" aria-hidden="true">{formatReportHeaderDate(selectedDate)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selected} defaultMonth={selected} locale={ptBR} timeZone="America/Sao_Paulo" autoFocus onSelect={(date) => { if (!date) return; goToDate(dateToIso(date)); setCalendarOpen(false); }} />
        </PopoverContent>
      </Popover>
      <Button className="shrink-0" size="icon" variant="outline" aria-label="Próximo dia" onClick={() => goToDate(shiftReportDate(selectedDate, 1))}><ChevronRight /></Button>
      {selectedDate !== today && <Button className="shrink-0" size="sm" variant="ghost" onClick={() => goToDate(today)}>Hoje</Button>}
    </div>
  );
}
