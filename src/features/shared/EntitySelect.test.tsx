import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EntitySelect } from "@/features/shared/EntitySelect";

describe("EntitySelect", () => {
  it("usa uma lista própria em vez de um select nativo", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <EntitySelect
          label="Turma"
          value="turma-1"
          options={[
            { value: "turma-1", label: "Quinta" },
            { value: "turma-2", label: "Sexta" },
          ]}
          onValueChange={onValueChange}
        />
      </form>,
    );

    expect(container.querySelector("select")).toBeNull();
    await user.click(screen.getByRole("combobox", { name: "Turma" }));
    await user.click(screen.getByRole("option", { name: "Sexta" }));
    expect(onValueChange).toHaveBeenCalledWith("turma-2");
  });
});
