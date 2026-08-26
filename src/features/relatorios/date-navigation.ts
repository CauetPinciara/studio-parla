export const REPORT_TIME_ZONE = "America/Sao_Paulo" as const;

interface ReportDateParts {
  year: number;
  month: number;
  day: number;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const REPORT_WEEKDAY_LABELS = [
  "Domingo",
  "Segunda Feira",
  "Terça Feira",
  "Quarta Feira",
  "Quinta Feira",
  "Sexta Feira",
  "Sábado",
] as const;

function parseReportDate(candidate: string): ReportDateParts | null {
  const match = ISO_DATE_PATTERN.exec(candidate);

  if (!match) return null;

  const [, yearPart, monthPart, dayPart] = match;
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const reconstructed = new Date(Date.UTC(year, month - 1, day));

  if (
    reconstructed.getUTCFullYear() !== year ||
    reconstructed.getUTCMonth() !== month - 1 ||
    reconstructed.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function formatUtcDate(date: Date): string {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function reportTodayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

export function normalizeReportDate(
  candidate: string | null,
  today: string = reportTodayIso(),
): string {
  return candidate !== null && parseReportDate(candidate) ? candidate : today;
}

export function shiftReportDate(date: string, days: number): string {
  const parsed = parseReportDate(date);

  if (!parsed) throw new RangeError(`Invalid report date: ${date}`);

  return formatUtcDate(
    new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + days)),
  );
}

export function formatReportHeaderDate(date: string): string {
  const parsed = parseReportDate(date);

  if (!parsed) throw new RangeError(`Invalid report date: ${date}`);

  const weekday = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day),
  ).getUTCDay();
  const day = String(parsed.day).padStart(2, "0");
  const month = String(parsed.month).padStart(2, "0");
  const year = String(parsed.year).padStart(4, "0");

  return `${REPORT_WEEKDAY_LABELS[weekday]}, ${day}/${month}/${year}`;
}
