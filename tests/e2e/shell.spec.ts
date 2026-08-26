import { expect, test, type Locator, type Page } from "@playwright/test";

const routes = [
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

async function chooseWorkspace(page: Page, trigger: Locator, label: string) {
  await trigger.click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-04T14:00:00-03:00"));
  await page.addInitScript(() => localStorage.setItem("studio-parla-shell-preview", "1"));
  await page.route(/https:\/\/[^/]+\.supabase\.co\/.*/, async (route) => route.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
});

test("mantém os três workspaces e a rota ativa após recarregar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/relatorios");

  await expect(page.getByRole("heading", { name: "Studio Parla" })).toBeVisible();
  const workspace = page.getByLabel("Workspace");
  await expect(workspace).toContainText("Operação");
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.getByText("Dia selecionado")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Selecionar data" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ir para hoje" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Relatório do dia", exact: true })).toHaveCount(0);

  await chooseWorkspace(page, workspace, "Cadastros");
  await expect(page).toHaveURL(/\/contatos$/);
  await expect(page.getByRole("link", { name: "Contatos" })).toHaveAttribute("aria-current", "page");

  await chooseWorkspace(page, workspace, "Tática");
  await expect(page).toHaveURL(/\/visao-geral$/);
  await page.reload();
  await expect(workspace).toContainText("Tática");
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
  const drawer = page.getByRole("dialog", { name: "Navegação principal" });
  await expect(drawer).toBeVisible();
  await chooseWorkspace(page, drawer.getByLabel("Workspace"), "Cadastros");
  await expect(page).toHaveURL(/\/contatos$/);
  await expect(drawer).toBeHidden();

  await menuButton.click();
  await page.getByRole("link", { name: "Preços & serviços" }).click();
  await expect(page).toHaveURL(/\/precos$/);
  await expect(page.getByRole("dialog", { name: "Navegação principal" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Preços & serviços", exact: true })).toBeVisible();
});

test("preserva o shell visual em desktop e mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/relatorios?data=2026-08-26");
  await expect(page).toHaveURL(/\/relatorios\?data=2026-08-26$/);
  await expect(
    page.getByText("Quarta Feira, 26/08/2026", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Ir para hoje" })).toBeVisible();
  await expect(page.getByText("Sem resumo.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tudo anotado!" })).toHaveAttribute("aria-pressed", "false");
  await expect(page).toHaveScreenshot("shell-desktop.png", { animations: "disabled" });

  await page.getByRole("button", { name: "Selecionar data" }).click();
  const calendarPopover = page.locator('[data-slot="popover-content"]');
  await expect(calendarPopover).toBeVisible();
  expect(
    await calendarPopover.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).not.toBe("rgba(0, 0, 0, 0)");
  await expect(page).toHaveScreenshot("shell-report-calendar-open.png", { animations: "disabled" });
  await page.keyboard.press("Escape");
  await expect(calendarPopover).toBeHidden();

  await page.getByLabel("Workspace").click();
  const workspaceListbox = page.getByRole("listbox");
  await expect(workspaceListbox).toBeVisible();
  expect(
    await workspaceListbox.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).not.toBe("rgba(0, 0, 0, 0)");
  await expect(page.getByRole("option", { name: "Operação" })).toBeVisible();
  await expect(page).toHaveScreenshot("shell-workspace-select-open.png", { animations: "disabled" });
  await page.keyboard.press("Escape");
  await expect(workspaceListbox).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/relatorios?data=2026-08-26");
  await expect(page).toHaveURL(/\/relatorios\?data=2026-08-26$/);
  await expect(page.getByText("Sem resumo.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ir para hoje" })).toBeVisible();
  const completion = page.getByRole("button", { name: "Tudo anotado!" });
  await expect(completion).toBeVisible();
  await expect(completion).toHaveAttribute("aria-pressed", "false");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(page).toHaveScreenshot("shell-mobile.png", { animations: "disabled" });
});
