import { describe, expect, it } from "vitest";
import { SUPERADMIN_EMAIL, isSuperadminEmail } from "@/app/access";

describe("regra única de superadmin", () => {
  it("exporta o único e-mail permitido", () => {
    expect(SUPERADMIN_EMAIL).toBe("cauetpinciara@gmail.com");
  });

  it("aceita o e-mail exato", () => {
    expect(isSuperadminEmail("cauetpinciara@gmail.com")).toBe(true);
  });

  it("normaliza espaços e caixa", () => {
    expect(isSuperadminEmail("  CauetPinciara@GMAIL.COM  ")).toBe(true);
  });

  it.each([
    null,
    undefined,
    "",
    "member@studio-parla.com",
    "cauetpinciara@mail.gmail.com",
    "cauetpinciara@gmail.com.br",
    "admin+cauetpinciara@gmail.com",
  ])("rejeita identidade não autorizada: %s", (email) => {
    expect(isSuperadminEmail(email)).toBe(false);
  });
});
