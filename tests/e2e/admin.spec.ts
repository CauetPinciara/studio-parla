import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import type { Row } from "../../src/lib/database.types";

const desktop = { width: 1440, height: 900 };
const mobile = { width: 390, height: 844 };

interface IdentityOptions {
  sessionEmail?: string;
  member?: Row<"app_members"> | null;
  membershipPending?: boolean;
  viewport?: { width: number; height: number };
}

interface IdentityPage {
  context: BrowserContext;
  page: Page;
  releaseMembership: () => void;
}

function testMember(email: string): Row<"app_members"> {
  return {
    email,
    nome: "Catarina",
    created_at: "2026-08-26T12:00:00.000Z",
  };
}

function testSession(email: string) {
  return {
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    expires_in: 3_600,
    expires_at: 2_000_000_000,
    token_type: "bearer",
    user: {
      id: "00000000-0000-4000-8000-000000000001",
      aud: "authenticated",
      role: "authenticated",
      email,
      email_confirmed_at: "2026-08-26T12:00:00.000Z",
      confirmed_at: "2026-08-26T12:00:00.000Z",
      last_sign_in_at: "2026-08-26T12:00:00.000Z",
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      identities: [],
      created_at: "2026-08-26T12:00:00.000Z",
      updated_at: "2026-08-26T12:00:00.000Z",
      is_anonymous: false,
    },
  };
}

async function createIdentityPage(
  browser: Browser,
  {
    sessionEmail,
    member = null,
    membershipPending = false,
    viewport = desktop,
  }: IdentityOptions,
): Promise<IdentityPage> {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const session = sessionEmail ? testSession(sessionEmail) : null;
  let releaseMembership: () => void = () => {};
  const membershipGate = membershipPending
    ? new Promise<void>((resolve) => {
        releaseMembership = resolve;
      })
    : Promise.resolve();

  await page.clock.setFixedTime(new Date("2026-08-26T12:00:00-03:00"));
  await page.addInitScript((storedSession) => {
    const sessionKey = "sb-placeholder-auth-token";
    localStorage.setItem("studio-parla-shell-preview", "1");
    if (storedSession) {
      localStorage.setItem(sessionKey, JSON.stringify(storedSession));

      const readStoredValue = localStorage.getItem.bind(localStorage);
      Storage.prototype.getItem = (key) => {
        if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
          return readStoredValue(sessionKey);
        }

        return readStoredValue(key);
      };
    }
  }, session);

  await page.route(/https:\/\/[^/]+\.supabase\.co\/.*/, async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/rest/v1/app_members") {
      await membershipGate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "content-range": member ? "0-0/1" : "*/0" },
        body: JSON.stringify(member),
      });
      return;
    }

    if (url.pathname.startsWith("/rest/v1/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
      return;
    }

    await route.abort();
  });

  return { context, page, releaseMembership };
}

async function expectNoAdmin(page: Page) {
  for (const text of [
    "Admin",
    "Administração",
    "Configurações e acesso do sistema",
    "Área administrativa",
    "Acesso de superadmin",
  ]) {
    await expect(page.getByText(text, { exact: true })).toHaveCount(0);
  }
}

async function expectNoAdminWorkspaceOption(page: Page) {
  await page.getByLabel("Workspace").click();
  await expect(page.getByRole("option", { name: "Admin", exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
}

async function expectAdminPage(page: Page) {
  await expect(
    page.getByRole("heading", { name: "Administração", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Configurações e acesso do sistema", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Área administrativa", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Acesso de superadmin", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Este espaço está reservado para configurações administrativas do Studio Parla.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Nenhuma ferramenta administrativa disponível ainda.", {
      exact: true,
    }),
  ).toBeVisible();
}

test("não expõe Admin para identidade pendente, ausente ou comum", async ({
  browser,
}) => {
  await test.step("membership pendente", async () => {
    const app = await createIdentityPage(browser, {
      sessionEmail: "catarina@example.com",
      member: testMember("catarina@example.com"),
      membershipPending: true,
    });

    await app.page.goto("/admin");
    await expect(app.page.getByText("Carregando…", { exact: true })).toBeVisible();
    await expectNoAdmin(app.page);
    app.releaseMembership();
    await expect(app.page).toHaveURL(/\/relatorios/);
    await app.context.close();
  });

  await test.step("identidade ausente", async () => {
    const app = await createIdentityPage(browser, {});

    await app.page.goto("/admin");
    await expect(app.page).toHaveURL(/\/relatorios/);
    await expectNoAdminWorkspaceOption(app.page);
    await expectNoAdmin(app.page);
    await app.context.close();
  });

  await test.step("member comum", async () => {
    const app = await createIdentityPage(browser, {
      sessionEmail: "catarina@example.com",
      member: testMember("catarina@example.com"),
    });

    await app.page.goto("/admin");
    await expect(app.page).toHaveURL(/\/relatorios/);
    await expectNoAdminWorkspaceOption(app.page);
    await expectNoAdmin(app.page);
    await app.context.close();
  });
});

test("abre Admin somente para o superadmin pelo seletor, rota direta e reload", async ({
  browser,
}) => {
  const app = await createIdentityPage(browser, {
    sessionEmail: "cauetpinciara@gmail.com",
    member: testMember("cauetpinciara@gmail.com"),
  });

  await app.page.goto("/admin");
  await expectAdminPage(app.page);
  await expect(app.page.getByLabel("Workspace")).toContainText("Admin");
  await expect(
    app.page.getByRole("link", { name: "Administração", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await app.page.goto("/relatorios");
  const workspace = app.page.getByLabel("Workspace");
  await workspace.focus();
  await expect(workspace).toBeFocused();
  await app.page.keyboard.press("Enter");
  await app.page.keyboard.press("End");
  await expect(
    app.page.getByRole("option", { name: "Admin", exact: true }),
  ).toBeFocused();
  await app.page.keyboard.press("Enter");
  await expect(app.page).toHaveURL(/\/admin$/);
  await expect(app.page.getByLabel("Workspace")).toContainText("Admin");

  await app.page.reload();
  await expectAdminPage(app.page);
  await expect(app.page.getByLabel("Workspace")).toContainText("Admin");
  await expect(
    app.page.getByRole("link", { name: "Administração", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(app.page).toHaveScreenshot("admin-desktop.png", {
    animations: "disabled",
  });

  await app.context.close();
});

test("mantém Admin contido no celular e fecha o drawer", async ({ browser }) => {
  const app = await createIdentityPage(browser, {
    sessionEmail: "cauetpinciara@gmail.com",
    member: testMember("cauetpinciara@gmail.com"),
    viewport: mobile,
  });

  await app.page.goto("/relatorios");
  await app.page.getByRole("button", { name: "Abrir menu" }).click();
  const drawer = app.page.getByRole("dialog", { name: "Navegação principal" });
  await expect(drawer).toBeVisible();
  const workspace = drawer.getByLabel("Workspace");
  await workspace.focus();
  await expect(workspace).toBeFocused();
  await app.page.keyboard.press("Enter");
  await app.page.keyboard.press("End");
  await expect(
    app.page.getByRole("option", { name: "Admin", exact: true }),
  ).toBeFocused();
  await app.page.keyboard.press("Enter");

  await expect(app.page).toHaveURL(/\/admin$/);
  await expect(app.page.getByLabel("Workspace")).toContainText("Admin");
  await expect(drawer).toBeHidden();
  await expectAdminPage(app.page);
  expect(
    await app.page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(app.page).toHaveScreenshot("admin-mobile.png", {
    animations: "disabled",
  });

  await app.context.close();
});
