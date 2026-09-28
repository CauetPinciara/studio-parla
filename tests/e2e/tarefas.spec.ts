import { expect, test } from "@playwright/test";
import { installApp } from "./helpers";

const removedRoutes = [
  "/tarefas",
  "/pecas",
  "/calendario",
  "/atendimento",
  "/workshops",
  "/visao-geral",
  "/admin",
];

test("redireciona todas as rotas removidas ao relatório do dia", async ({ page }) => {
  await installApp(page, { role: "admin" });

  for (const route of removedRoutes) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/relatorios$/);
    await expect(page.getByLabel("Workspace")).toContainText("Operação");
  }
});
