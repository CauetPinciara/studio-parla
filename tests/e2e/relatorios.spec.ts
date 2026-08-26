import { expect, test, type Page } from "@playwright/test";
import type { Insert, Row, Update } from "../../src/lib/database.types";

interface RestWrite {
  table: "relatorios" | "pecas";
  method: "POST" | "PATCH";
  id: string | null;
  body: Record<string, unknown>;
}

const contato: Row<"contatos"> = {
  id: "contato-1",
  nome: "Ana",
  tel: null,
  origem: null,
  obs: null,
  created_at: "2026-08-01T12:00:00.000Z",
};

const turma: Row<"turmas"> = {
  id: "turma-1",
  nome: "Quarta · 15h–18h",
  dia: 3,
  hora: "15:00",
};

const productionPiece: Row<"pecas"> = {
  id: "peca-producao",
  contato_id: contato.id,
  descricao: "Caneca em produção",
  data_deixou: "2026-08-01",
  estimativa: "15 dias",
  data_pronta: null,
  status: "producao",
  created_at: "2026-08-01T12:00:00.000Z",
};

async function installStudioApi(
  page: Page,
  seed: {
    relatorios?: Row<"relatorios">[];
    pecas?: Row<"pecas">[];
  } = {},
) {
  const state = {
    relatorios: [...(seed.relatorios ?? [])],
    pecas: [...(seed.pecas ?? [])],
    writes: [] as RestWrite[],
  };

  await page.route(/https:\/\/[^/]+\.supabase\.co\/.*/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const table = url.pathname.split("/").at(-1);

    if (url.pathname.startsWith("/rest/v1/") && method === "GET") {
      const rows = table === "relatorios"
        ? state.relatorios
        : table === "pecas"
          ? state.pecas
          : table === "contatos"
            ? [contato]
            : table === "turmas"
              ? [turma]
              : [];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(rows),
      });
      return;
    }

    if (
      url.pathname.startsWith("/rest/v1/") &&
      (method === "POST" || method === "PATCH") &&
      (table === "relatorios" || table === "pecas")
    ) {
      const body = request.postDataJSON() as Record<string, unknown>;
      const id = url.searchParams.get("id")?.replace(/^eq\./, "") ?? null;
      state.writes.push({ table, method, id, body });

      if (table === "relatorios") {
        if (method === "POST") {
          const input = body as Insert<"relatorios">;
          const created: Row<"relatorios"> = {
            id: `relatorio-${state.relatorios.length + 1}`,
            data: input.data,
            turma_id: input.turma_id ?? null,
            autor: input.autor ?? null,
            resumo: input.resumo ?? null,
            concluido_em: input.concluido_em ?? null,
            created_at: "2026-08-04T17:00:00.000Z",
          };
          state.relatorios.unshift(created);
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify(created),
          });
          return;
        }

        const index = state.relatorios.findIndex((item) => item.id === id);
        const updated = {
          ...state.relatorios[index],
          ...(body as Update<"relatorios">),
        };
        state.relatorios[index] = updated;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(updated),
        });
        return;
      }

      if (method === "POST") {
        const input = body as Insert<"pecas">;
        const created: Row<"pecas"> = {
          id: `peca-${state.pecas.length + 1}`,
          contato_id: input.contato_id,
          descricao: input.descricao ?? null,
          data_deixou: input.data_deixou ?? null,
          estimativa: input.estimativa ?? null,
          data_pronta: input.data_pronta ?? null,
          status: input.status ?? "producao",
          created_at: "2026-08-04T17:00:00.000Z",
        };
        state.pecas.unshift(created);
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(created),
        });
        return;
      }

      const index = state.pecas.findIndex((item) => item.id === id);
      const updated = {
        ...state.pecas[index],
        ...(body as Update<"pecas">),
      };
      state.pecas[index] = updated;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(updated),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });

  return state;
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-04T14:00:00-03:00"));
  await page.addInitScript(() =>
    localStorage.setItem("studio-parla-shell-preview", "1"),
  );
});

test("refina o header diário com navegação central e retorno condicional a hoje", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const state = await installStudioApi(page);
  await page.goto("/relatorios?data=2026-08-26");

  const sidebarHeader = page.locator("aside > header");
  const contentHeader = page.locator("main > header");
  const navigation = contentHeader.getByRole("group", {
    name: "Navegação da data",
  });
  const previous = navigation.getByRole("button", { name: "Dia anterior" });
  const datePicker = contentHeader.getByRole("button", {
    name: "Selecionar data",
  });
  const next = navigation.getByRole("button", { name: "Próximo dia" });
  const today = navigation.getByRole("button", { name: "Ir para hoje" });
  const completion = contentHeader.getByRole("button", {
    name: "Tudo anotado!",
  });

  await expect(sidebarHeader).toBeVisible();
  await expect(contentHeader.getByText("Dia selecionado")).toHaveCount(0);
  await expect(
    contentHeader.getByText("Quarta Feira, 26/08/2026", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("O que a Catarina registra no fim de cada aula"),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Relatório do dia", exact: true }),
  ).toHaveCount(0);
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("button", { name: "Tudo anotado!" })).toHaveCount(0);
  await expect(today).toHaveText("Ir para hoje");

  for (const control of [previous, datePicker, next, today, completion]) {
    await expect(control).toBeVisible();
  }

  const [sidebarBox, headerBox, navigationBox, completionBox] =
    await Promise.all([
      sidebarHeader.boundingBox(),
      contentHeader.boundingBox(),
      navigation.boundingBox(),
      completion.boundingBox(),
    ]);

  expect(sidebarBox?.height).toBe(80);
  expect(headerBox?.height).toBe(80);
  expect(headerBox).not.toBeNull();
  expect(navigationBox).not.toBeNull();
  expect(completionBox).not.toBeNull();

  const headerStyle = await contentHeader.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      paddingLeft: Number.parseFloat(style.paddingLeft),
      paddingRight: Number.parseFloat(style.paddingRight),
    };
  });
  const innerLeft = headerBox!.x + headerStyle.paddingLeft;
  const innerRight = headerBox!.x + headerBox!.width - headerStyle.paddingRight;
  const innerCenter = (innerLeft + innerRight) / 2;
  const navigationCenter = navigationBox!.x + navigationBox!.width / 2;

  expect(Math.abs(navigationCenter - innerCenter)).toBeLessThanOrEqual(1);
  expect(
    Math.abs(completionBox!.x + completionBox!.width - innerRight),
  ).toBeLessThanOrEqual(1);
  expect(
    await contentHeader.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).toBe("rgb(255, 255, 255)");

  await today.click();
  await expect(page).toHaveURL(/data=2026-08-04$/);
  await expect(
    contentHeader.getByText("Terça Feira, 04/08/2026", { exact: true }),
  ).toBeVisible();
  await expect(today).toHaveCount(0);

  await page.goto("/relatorios?data=2026-08-26");
  await datePicker.click();
  const calendar = page.getByRole("grid", { name: /agosto 2026/i });
  await expect(calendar).toBeVisible();
  await page
    .getByRole("button", { name: /quarta-feira, 5 de agosto de 2026/i })
    .click();
  await expect(page).toHaveURL(/data=2026-08-05$/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/relatorios?data=2026-08-26");

  const mobileControls = [previous, datePicker, next, today, completion];
  for (const control of mobileControls) {
    await expect(control).toBeVisible();
  }

  const mobileHeaderBox = await contentHeader.boundingBox();
  const mobileBoxes = await Promise.all(
    mobileControls.map((control) => control.boundingBox()),
  );
  expect(mobileHeaderBox).not.toBeNull();
  for (const box of mobileBoxes) expect(box).not.toBeNull();

  const mobileCenters = mobileBoxes.map(
    (box) => box!.y + box!.height / 2,
  );
  expect(Math.max(...mobileCenters) - Math.min(...mobileCenters)).toBeLessThanOrEqual(1);
  for (const box of mobileBoxes) {
    expect(box!.y).toBeGreaterThanOrEqual(mobileHeaderBox!.y);
    expect(box!.y + box!.height).toBeLessThanOrEqual(
      mobileHeaderBox!.y + mobileHeaderBox!.height,
    );
  }
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);

  await today.click();
  await expect(page).toHaveURL(/data=2026-08-04$/);
  await expect(today).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  expect(state.writes).toEqual([]);
});

test("abre hoje e navega sem criar dias vazios", async ({ page }) => {
  const state = await installStudioApi(page);

  await page.goto("/relatorios");

  await expect(page).toHaveURL(/\/relatorios\?data=2026-08-04$/);
  await expect(
    page.getByText("Terça Feira, 04/08/2026", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Sem resumo.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Novo dia" })).toHaveCount(0);
  const today = page.getByRole("button", { name: "Ir para hoje" });
  await expect(today).toHaveCount(0);

  await page.getByRole("button", { name: "Dia anterior" }).click();
  await expect(page).toHaveURL(/data=2026-08-03$/);
  await expect(today).toBeVisible();
  await today.click();
  await expect(page).toHaveURL(/data=2026-08-04$/);
  await expect(today).toHaveCount(0);
  await page.getByRole("button", { name: "Próximo dia" }).click();
  await expect(page).toHaveURL(/data=2026-08-05$/);
  await expect(today).toBeVisible();
  await today.click();
  await expect(page).toHaveURL(/data=2026-08-04$/);
  await expect(today).toHaveCount(0);

  await page.goto("/relatorios?data=2026-08-01");
  await expect(
    page.getByText("Sábado, 01/08/2026", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/data=2026-08-01$/);
  await expect(
    page.getByText("Sábado, 01/08/2026", { exact: true }),
  ).toBeVisible();

  await page.goto("/relatorios?data=2026-02-30");
  await expect(page).toHaveURL(/data=2026-08-04$/);
  expect(state.writes).toEqual([]);
});

test("persiste o dia, Tudo anotado e as peças na data selecionada", async ({
  page,
}) => {
  const state = await installStudioApi(page, { pecas: [productionPiece] });

  await page.goto("/relatorios?data=2026-08-04");
  await expect(page.getByText("Peças deixadas neste dia")).toBeVisible();
  await expect(page.getByText("Marcar peças como prontas hoje")).toBeVisible();
  await expect(page.getByText("Peças que ficaram prontas neste dia")).toBeVisible();

  await page.getByRole("button", { name: "Anotar este dia" }).click();
  const createDialog = page.getByRole("dialog", { name: "Anotar este dia" });
  await expect(createDialog.getByLabel("Data")).toHaveValue("2026-08-04");
  await createDialog.getByRole("button", { name: "Salvar" }).click();
  await expect(createDialog).toBeHidden();

  expect(state.writes[0]).toMatchObject({
    table: "relatorios",
    method: "POST",
    body: {
      data: "2026-08-04",
      turma_id: null,
      autor: "Catarina",
      resumo: null,
    },
  });

  await page.getByRole("button", { name: "Editar dia" }).click();
  const editDialog = page.getByRole("dialog", { name: "Editar dia" });
  await editDialog.getByLabel("Data").fill("2026-08-05");
  await editDialog.getByLabel("Turma").selectOption(turma.id);
  await editDialog.getByLabel("Resumo do dia").fill("Forno conferido e bancada organizada");
  await editDialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL(/data=2026-08-05$/);
  expect(state.writes[1]).toMatchObject({
    table: "relatorios",
    method: "PATCH",
    id: "relatorio-1",
    body: {
      data: "2026-08-05",
      turma_id: turma.id,
      autor: "Catarina",
      resumo: "Forno conferido e bancada organizada",
    },
  });

  const completion = page.getByRole("button", { name: "Tudo anotado!" });
  await expect(completion).toHaveAttribute("aria-pressed", "false");
  await completion.click();
  await expect(completion).toHaveAttribute("aria-pressed", "true");
  expect(state.writes[2]).toMatchObject({
    table: "relatorios",
    method: "PATCH",
    id: "relatorio-1",
    body: { concluido_em: "2026-08-04T17:00:00.000Z" },
  });

  await page.reload();
  await expect(completion).toHaveAttribute("aria-pressed", "true");
  await completion.click();
  await expect(completion).toHaveAttribute("aria-pressed", "false");
  expect(state.writes[3]).toMatchObject({
    table: "relatorios",
    method: "PATCH",
    body: { concluido_em: null },
  });

  await page.getByRole("button", { name: "Registrar peça" }).click();
  const pieceDialog = page.getByRole("dialog", { name: "Nova peça" });
  await pieceDialog.locator('select[name="contato_id"]').selectOption(contato.id);
  await pieceDialog.locator('input[name="descricao"]').fill("Prato texturizado");
  await expect(pieceDialog.locator('input[name="data_deixou"]')).toHaveValue("2026-08-05");
  await pieceDialog.locator('input[name="estimativa"]').fill("20 dias");
  await pieceDialog.getByRole("button", { name: "Salvar" }).click();
  await expect(pieceDialog).toBeHidden();

  expect(state.writes[4]).toMatchObject({
    table: "pecas",
    method: "POST",
    body: {
      contato_id: contato.id,
      descricao: "Prato texturizado",
      data_deixou: "2026-08-05",
      estimativa: "20 dias",
      status: "producao",
    },
  });

  const productionRow = page.getByRole("row").filter({
    hasText: "Caneca em produção",
  });
  await productionRow.getByRole("button", { name: "Ficou pronta hoje" }).click();
  expect(state.writes[5]).toMatchObject({
    table: "pecas",
    method: "PATCH",
    id: productionPiece.id,
    body: { status: "pronta", data_pronta: "2026-08-05" },
  });
  await expect(
    page.getByText("Peças que ficaram prontas neste dia").locator(".."),
  ).toBeVisible();
});

test("mantém o relatório diário acessível no celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installStudioApi(page);
  await page.goto("/relatorios");

  const previous = page.getByRole("button", { name: "Dia anterior" });
  const datePicker = page.getByRole("button", { name: "Selecionar data" });
  const next = page.getByRole("button", { name: "Próximo dia" });
  const today = page.getByRole("button", { name: "Ir para hoje" });
  const completion = page.getByRole("button", { name: "Tudo anotado!" });
  const annotate = page.getByRole("button", { name: "Anotar este dia" });

  for (const control of [previous, datePicker, next, completion, annotate]) {
    await expect(control).toBeVisible();
  }
  await expect(today).toHaveCount(0);
  await expect(completion).toHaveAttribute("aria-pressed", "false");

  await previous.focus();
  await expect(previous).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/data=2026-08-03$/);
  await expect(today).toBeVisible();
  await today.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/data=2026-08-04$/);
  await expect(today).toHaveCount(0);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
