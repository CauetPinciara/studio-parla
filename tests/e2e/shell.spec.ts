import { expect, test, type Page } from "@playwright/test";
import { coreSeed, installApp } from "./helpers";

async function workspaceOptions(page: Page) {
  await page.getByLabel("Workspace").click();
  return page.getByRole("option");
}

test("exibe os 12 itens nos três workspaces e preserva a sidebar recolhida", async ({ page }) => {
  await installApp(page, { role: "admin", seed: coreSeed });
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/relatorios");

  await expect(page.getByLabel("Workspace")).toContainText("Operação");
  await expect(page.getByRole("link")).toHaveCount(4);
  expect(await page.getByRole("link").allTextContents()).toEqual([
    "Relatório do dia",
    "Aulas & confirmações",
    "Avisos de falta",
    "Fechamento",
  ]);

  const options = await workspaceOptions(page);
  await expect(options).toHaveCount(3);
  expect(await options.allTextContents()).toEqual(["Operação", "Cadastros", "Financeiro"]);
  await page.getByRole("option", { name: "Cadastros", exact: true }).click();
  await expect(page).toHaveURL(/\/contatos$/);
  expect(await page.getByRole("link").allTextContents()).toEqual([
    "Alunos & contatos",
    "Matrículas",
    "Turmas",
    "Promoções & mensalidades",
    "Preços & serviços",
  ]);

  await workspaceOptions(page);
  await page.getByRole("option", { name: "Financeiro", exact: true }).click();
  await expect(page).toHaveURL(/\/plano-contas$/);
  expect(await page.getByRole("link").allTextContents()).toEqual([
    "Plano de Contas",
    "Contas a Pagar",
    "Contas a Receber",
  ]);

  await page.getByRole("button", { name: "Recolher sidebar" }).click();
  await expect(page.getByRole("button", { name: "Expandir sidebar" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("studio-parla-sidebar-collapsed"))).toBe("1");
  await page.reload();
  await expect(page.getByRole("button", { name: "Expandir sidebar" })).toBeVisible();
  await expect(page.getByText("Cauet", { exact: true })).toHaveCount(0);
  await page.goto("/relatorios?data=2026-07-09");
  await expect(page.getByText("Ana", { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot("app-enxuto-desktop.png", { animations: "disabled" });
});

test("mantém a navegação utilizável no celular", async ({ page }) => {
  await installApp(page, { role: "admin", seed: coreSeed });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/relatorios");

  await page.getByRole("button", { name: "Abrir menu" }).click();
  const drawer = page.getByRole("dialog", { name: "Navegação principal" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Cauet", { exact: true })).toBeVisible();
  await expect(drawer.getByText("Admin", { exact: true })).toBeVisible();
  await drawer.getByRole("link", { name: "Avisos de falta", exact: true }).click();
  await expect(page).toHaveURL(/\/avisos$/);
  await expect(drawer).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page).toHaveScreenshot("app-enxuto-mobile-menu.png", { animations: "disabled" });
});
