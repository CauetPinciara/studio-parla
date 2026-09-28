import { useId, useState } from "react";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  label: string;
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  min?: string;
  required?: boolean;
  className?: string;
}

function dateFromIso(value: string | undefined) {
  return value ? new Date(`${value}T12:00:00`) : undefined;
}

function isoFromDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePickerField({
  label,
  name,
  value,
  defaultValue = "",
  onValueChange,
  disabled,
  min,
  required,
  className,
}: DatePickerFieldProps) {
  const id = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const current = value ?? internalValue;
  const selected = dateFromIso(current);
  const minimum = dateFromIso(min);
  const update = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input type="hidden" name={name} value={current} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={`${label}: ${current ? formatDate(current) : "não selecionada"}`}
            aria-required={required}
            className={cn("w-full justify-start font-normal", !current && "text-muted-foreground")}
          >
            <CalendarDays data-icon="inline-start" />
            {current ? formatDate(current) : "Escolher data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selected}
            defaultMonth={selected}
            disabled={minimum ? { before: minimum } : undefined}
            onSelect={(next) => {
              if (!next) return;
              update(isoFromDate(next));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
