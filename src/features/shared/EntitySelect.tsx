import { Fragment, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EntitySelectProps {
  label: string;
  value?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; group?: string }>;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
}

export function EntitySelect({
  label,
  value,
  placeholder = "Selecione",
  options,
  onValueChange,
  disabled,
  name,
}: EntitySelectProps) {
  const id = useId();
  const listId = `${id}-options`;
  const [open, setOpen] = useState(false);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.group ? `${selected.group} · ${selected.label}` : selected?.label;

  const focusOption = (index: number) => {
    const normalized = (index + options.length) % options.length;
    optionRefs.current[normalized]?.focus();
  };

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(options.length - 1);
    }
  };

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-controls={listId}
            aria-expanded={open}
            disabled={disabled}
            className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground")}
          >
            <span className="truncate">{selectedLabel ?? placeholder}</span>
            <ChevronDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="max-h-72 w-[var(--radix-popover-trigger-width)] overflow-y-auto p-1"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
            optionRefs.current[selectedIndex]?.focus();
          }}
        >
          <div id={listId} role="listbox" aria-label={label} className="flex flex-col">
            {options.map((option, index) => (
              <Fragment key={option.value}>
                {option.group && option.group !== options[index - 1]?.group && (
                  <div className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground first:pt-1">
                    {option.group}
                  </div>
                )}
                <button
                  ref={(node) => { optionRefs.current[index] = node; }}
                  type="button"
                  role="option"
                  aria-label={option.group ? `${option.group} · ${option.label}` : option.label}
                  aria-selected={option.value === value}
                  className="flex min-h-8 w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus:bg-accent"
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-4", option.value !== value && "invisible")} />
                  <span>{option.label}</span>
                </button>
              </Fragment>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
