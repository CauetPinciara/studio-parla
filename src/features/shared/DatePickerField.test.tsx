import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePickerField } from "@/features/shared/DatePickerField";

describe("DatePickerField", () => {
  it("usa um calendário próprio e mantém o valor no formulário sem input de data nativo", async () => {
    const user = userEvent.setup();
    const { container } = render(<DatePickerField label="Data" name="data" defaultValue="2026-07-09" />);

    expect(container.querySelector('input[type="date"]')).toBeNull();
    expect(container.querySelector('input[name="data"]')).toHaveValue("2026-07-09");
    expect(screen.getByRole("button", { name: "Data: 09/07/2026" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Data: 09/07/2026" }));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("mantém validação nativa quando a data é obrigatória", () => {
    const { container } = render(<DatePickerField label="Data" name="data" required />);

    expect(container.querySelector('input[type="date"]')).toBeNull();
    expect(screen.getByRole("textbox", { name: "Data selecionada" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: "Data selecionada" })).toBeInvalid();
  });
});
