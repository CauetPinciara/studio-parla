import { expect, test } from "@playwright/test";

const routes = [
  ["/relatorios", "Relatório do dia"],
  ["/tarefas", "Tarefas"],
  ["/pecas", "Peças & forno"],
  ["/calendario", "Calendário"],
  ["/atendimento", "Atendimento"],
  ["/fechamento", "Fechamento"],
  ["/contatos", "Contatos"],
  ["/matriculas", "Matrículas"],
  ["/turmas", "Turmas"],
  ["/workshops", "Workshops & eventos"],
  ["/precos", "Preços & serviços"],
  ["/visao-geral", "Visão geral"],
] as const;

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-04T14:00:00-03:00"));
  await page.addInitScript(() => localStorage.setItem("studio-parla-shell-preview", "1"));
  await page.route(/https:\/\/[^/]+\.supabase\.co\/.*/, async (route) => route.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
});

test("mantém os três workspaces e a rota ativa após recarregar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/relatorios");

  await expect(page.getByRole("heading", { name: "Studio Parla" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Operação" })).toHaveAttribute("aria-selected", "true");

  await page.getByRole("tab", { name: "Cadastros" }).click();
  await expect(page).toHaveURL(/\/contatos$/);
  await expect(page.getByRole("link", { name: "Contatos" })).toHaveAttribute("aria-current", "page");

  await page.getByRole("tab", { name: "Tática" }).click();
  await expect(page).toHaveURL(/\/visao-geral$/);
  await page.reload();
  await expect(page.getByRole("tab", { name: "Tática" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Visão geral", exact: true })).toBeVisible();

  for (const [path, title] of routes) {
    await page.goto(path);
    await page.reload();
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: title, exact: true })).toHaveAttribute("aria-current", "page");
  }

  await page.goto("/pecas/");
  await expect(page.getByRole("heading", { name: "Peças & forno", exact: true })).toBeVisible();
});

test("oferece navegação móvel sem perder contexto", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/relatorios");

  const menuButton = page.getByRole("button", { name: "Abrir menu" });
  await menuButton.focus();
  await expect(menuButton).toBeFocused();
  await menuButton.click();
  await expect(page.getByRole("dialog", { name: "Navegação principal" })).toBeVisible();
  await page.getByRole("tab", { name: "Cadastros" }).click();
  await expect(page).toHaveURL(/\/contatos$/);
  await expect(page.getByRole("dialog", { name: "Navegação principal" })).toBeHidden();

  await menuButton.click();
  await page.getByRole("link", { name: "Preços & serviços" }).click();
  await expect(page).toHaveURL(/\/precos$/);
  await expect(page.getByRole("dialog", { name: "Navegação principal" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Preços & serviços", exact: true })).toBeVisible();
});

test("preserva o shell visual em desktop e mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/relatorios");
  await expect(page).toHaveURL(/\/relatorios\?data=2026-08-04$/);
  await expect(page.getByText("Sem resumo.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tudo anotado!" })).toHaveAttribute("aria-pressed", "false");
  await expect(page).toHaveScreenshot("shell-desktop.png", { animations: "disabled" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/relatorios");
  await expect(page).toHaveURL(/\/relatorios\?data=2026-08-04$/);
  await expect(page.getByText("Sem resumo.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tudo anotado!" })).toHaveAttribute("aria-pressed", "false");
  await expect(page).toHaveScreenshot("shell-mobile.png", { animations: "disabled" });
});
