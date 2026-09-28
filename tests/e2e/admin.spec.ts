import { expect, test } from "@playwright/test";
import { installApp } from "./helpers";

test("Isabela não vê nem acessa o workspace Financeiro", async ({ page }) => {
  await installApp(page, { role: "atendimento" });
  await page.goto("/relatorios");

  await expect(page.getByText("Isabela", { exact: true })).toBeVisible();
  await expect(page.getByText("Atendimento", { exact: true })).toBeVisible();
  await page.getByLabel("Workspace").click();
  await expect(page.getByRole("option", { name: "Financeiro", exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");

  for (const route of ["/plano-contas", "/contas-pagar", "/contas-receber"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/relatorios$/);
  }
});

for (const role of ["professora", "admin"] as const) {
  test(`${role} vê e acessa o workspace Financeiro`, async ({ page }) => {
    await installApp(page, { role });
    await page.goto("/relatorios");
    await page.getByLabel("Workspace").click();
    await page.getByRole("option", { name: "Financeiro", exact: true }).click();
    await expect(page).toHaveURL(/\/plano-contas$/);
    await expect(page.getByRole("heading", { name: "Plano de Contas", exact: true })).toBeVisible();
  });
}
