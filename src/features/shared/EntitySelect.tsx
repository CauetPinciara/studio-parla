import { useId } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EntitySelectProps {
  label: string;
  value?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
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
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
