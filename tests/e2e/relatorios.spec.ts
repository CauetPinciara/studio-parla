import { expect, test, type Locator, type Page } from "@playwright/test";
import type { Insert, Row, Update } from "../../src/lib/database.types";

interface RestWrite {
  table: "relatorios" | "pecas" | "aulas" | "presencas";
  method: "POST" | "PATCH";
  id: string | null;
  onConflict: string | null;
  body: Record<string, unknown>;
}

interface StudioSeed {
  relatorios?: Row<"relatorios">[];
  pecas?: Row<"pecas">[];
  contatos?: Row<"contatos">[];
  turmas?: Row<"turmas">[];
  matriculas?: Row<"matriculas">[];
  avulsas?: Row<"avulsas">[];
  aulas?: Row<"aulas">[];
  presencas?: Row<"presencas">[];
}

interface ContrastSample {
  label: string;
  foreground: string;
  background: string;
  ratio: number;
}

async function measureTextContrast(
  locator: Locator,
  label: string,
): Promise<ContrastSample> {
  return locator.evaluate((element, sampleLabel) => {
    interface Color {
      red: number;
      green: number;
      blue: number;
      alpha: number;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Could not create color conversion context");
    const colorContext = context;

    function parseColor(value: string): Color {
      colorContext.clearRect(0, 0, 1, 1);
      colorContext.fillStyle = value;
      colorContext.fillRect(0, 0, 1, 1);
      const [red, green, blue, alpha] = colorContext.getImageData(
        0,
        0,
        1,
        1,
      ).data;

      return {
        red,
        green,
        blue,
        alpha: alpha / 255,
      };
    }

    function composite(foreground: Color, background: Color): Color {
      const alpha =
        foreground.alpha + background.alpha * (1 - foreground.alpha);
      if (alpha === 0) {
        return { red: 0, green: 0, blue: 0, alpha: 0 };
      }

      return {
        red:
          (foreground.red * foreground.alpha +
            background.red * background.alpha * (1 - foreground.alpha)) /
          alpha,
        green:
          (foreground.green * foreground.alpha +
            background.green * background.alpha * (1 - foreground.alpha)) /
          alpha,
        blue:
          (foreground.blue * foreground.alpha +
            background.blue * background.alpha * (1 - foreground.alpha)) /
          alpha,
        alpha,
      };
    }

    function luminance(color: Color): number {
      const linearChannels = [color.red, color.green, color.blue].map(
        (channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        },
      );

      return (
        linearChannels[0] * 0.2126 +
        linearChannels[1] * 0.7152 +
        linearChannels[2] * 0.0722
      );
    }

    const foreground = parseColor(getComputedStyle(element).color);
    let background = { red: 0, green: 0, blue: 0, alpha: 0 };
    let current: Element | null = element;

    while (current && background.alpha < 1) {
      const layer = parseColor(getComputedStyle(current).backgroundColor);
      background = composite(background, layer);
      current = current.parentElement;
    }

    if (background.alpha < 1) {
      background = composite(background, {
        red: 255,
        green: 255,
        blue: 255,
        alpha: 1,
      });
    }

    const renderedForeground = composite(foreground, background);
    const foregroundLuminance = luminance(renderedForeground);
    const backgroundLuminance = luminance(background);
    const ratio =
      (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
      (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);

    return {
      label: sampleLabel,
      foreground: getComputedStyle(element).color,
      background: `rgb(${Math.round(background.red)}, ${Math.round(background.green)}, ${Math.round(background.blue)})`,
      ratio,
    };
  }, label);
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

const attendanceIds = {
  turmaModelagem: "turma-modelagem",
  turmaTorno: "turma-torno",
  contatoAna: "contato-ana",
  contatoBeatriz: "contato-beatriz",
  contatoClara: "contato-clara",
  contatoDiego: "contato-diego",
  contatoPausada: "contato-pausada",
  contatoAConfirmar: "contato-a-confirmar",
  matriculaAna: "matricula-ana",
  matriculaBeatriz: "matricula-beatriz",
  matriculaDiego: "matricula-diego",
  matriculaPausada: "matricula-pausada",
  avulsaAna: "avulsa-ana",
  avulsaClara: "avulsa-clara",
  avulsaAConfirmar: "avulsa-a-confirmar",
  aulaHistorica: "aula-historica",
  presencaHistorica: "presenca-historica",
} as const;

function attendanceContact(id: string, nome: string): Row<"contatos"> {
  return {
    id,
    nome,
    tel: null,
    origem: null,
    obs: null,
    created_at: "2026-08-01T12:00:00.000Z",
  };
}

function attendanceSeed(): StudioSeed {
  return {
    contatos: [
      attendanceContact(attendanceIds.contatoAna, "Ana"),
      attendanceContact(attendanceIds.contatoBeatriz, "Beatriz"),
      attendanceContact(attendanceIds.contatoClara, "Clara"),
      attendanceContact(attendanceIds.contatoDiego, "Diego"),
      attendanceContact(attendanceIds.contatoPausada, "Pessoa pausada"),
      attendanceContact(
        attendanceIds.contatoAConfirmar,
        "Pessoa a confirmar",
      ),
    ],
    turmas: [
      {
        id: attendanceIds.turmaModelagem,
        nome: "Modelagem livre",
        dia: 3,
        hora: "15:00",
      },
      {
        id: attendanceIds.turmaTorno,
        nome: "Torno iniciante",
        dia: 3,
        hora: "18:00",
      },
    ],
    matriculas: [
      {
        id: attendanceIds.matriculaAna,
        contato_id: attendanceIds.contatoAna,
        turma_id: attendanceIds.turmaModelagem,
        mensalidade: 520,
        pagamento: "Pix",
        status: "Ativa",
        created_at: "2026-01-01T00:00:00.000Z",
      },
      {
        id: attendanceIds.matriculaBeatriz,
        contato_id: attendanceIds.contatoBeatriz,
        turma_id: attendanceIds.turmaModelagem,
        mensalidade: 520,
        pagamento: "Pix",
        status: "Nova",
        created_at: "2026-01-01T00:00:00.000Z",
      },
      {
        id: attendanceIds.matriculaDiego,
        contato_id: attendanceIds.contatoDiego,
        turma_id: attendanceIds.turmaTorno,
        mensalidade: 520,
        pagamento: "Pix",
        status: "Ativa",
        created_at: "2026-01-01T00:00:00.000Z",
      },
      {
        id: attendanceIds.matriculaPausada,
        contato_id: attendanceIds.contatoPausada,
        turma_id: attendanceIds.turmaModelagem,
        mensalidade: 520,
        pagamento: "Pix",
        status: "Pausada",
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ],
    avulsas: [
      {
        id: attendanceIds.avulsaAna,
        contato_id: attendanceIds.contatoAna,
        turma_id: attendanceIds.turmaModelagem,
        data: "2026-08-05",
        status: "Confirmada",
      },
      {
        id: attendanceIds.avulsaClara,
        contato_id: attendanceIds.contatoClara,
        turma_id: attendanceIds.turmaModelagem,
        data: "2026-08-05",
        status: "Confirmada",
      },
      {
        id: attendanceIds.avulsaAConfirmar,
        contato_id: attendanceIds.contatoAConfirmar,
        turma_id: attendanceIds.turmaModelagem,
        data: "2026-08-05",
        status: "A confirmar",
      },
    ],
  };
}

function filterIn<T extends Record<string, unknown>>(
  rows: T[],
  url: URL,
  field: keyof T & string,
): T[] {
  const filter = url.searchParams.get(field);
  if (!filter?.startsWith("in.(") || !filter.endsWith(")")) return rows;

  const values = filter.slice(4, -1).split(",");
  return rows.filter((row) => values.includes(String(row[field])));
}

function filterEqual<T extends Record<string, unknown>>(
  rows: T[],
  url: URL,
  field: keyof T & string,
): T[] {
  const filter = url.searchParams.get(field);
  if (!filter?.startsWith("eq.")) return rows;

  return rows.filter((row) => String(row[field]) === filter.slice(3));
}

async function installStudioApi(
  page: Page,
  seed: StudioSeed = {},
) {
  const state = {
    relatorios: [...(seed.relatorios ?? [])],
    pecas: [...(seed.pecas ?? [])],
    contatos: [...(seed.contatos ?? [contato])],
    turmas: [...(seed.turmas ?? [turma])],
    matriculas: [...(seed.matriculas ?? [])],
    avulsas: [...(seed.avulsas ?? [])],
    aulas: [...(seed.aulas ?? [])],
    presencas: [...(seed.presencas ?? [])],
    writes: [] as RestWrite[],
    attendanceReads: 0,
    failNextAttendance: false,
  };

  await page.route(/https:\/\/[^/]+\.supabase\.co\/.*/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const table = url.pathname.split("/").at(-1);

    if (url.pathname.startsWith("/rest/v1/") && method === "GET") {
      let rows = table === "relatorios"
        ? state.relatorios
        : table === "pecas"
          ? state.pecas
          : table === "contatos"
            ? state.contatos
            : table === "turmas"
              ? state.turmas
              : table === "matriculas"
                ? state.matriculas
                : table === "avulsas"
                  ? state.avulsas
                  : table === "aulas"
                    ? state.aulas
                    : table === "presencas"
                      ? state.presencas
                      : [];

      if (table === "matriculas") {
        rows = filterIn(state.matriculas, url, "status");
      } else if (table === "avulsas") {
        rows = filterEqual(
          filterEqual(state.avulsas, url, "data"),
          url,
          "status",
        );
      } else if (table === "aulas") {
        state.attendanceReads += 1;
        rows = filterEqual(
          filterEqual(state.aulas, url, "data"),
          url,
          "turma_id",
        );
      } else if (table === "contatos") {
        rows = filterIn(state.contatos, url, "id");
      } else if (table === "presencas") {
        rows = filterIn(state.presencas, url, "aula_id");
      }

      const acceptsSingle = request
        .headers()["accept"]
        ?.includes("application/vnd.pgrst.object+json");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(acceptsSingle ? (rows[0] ?? null) : rows),
      });
      return;
    }

    if (
      url.pathname.startsWith("/rest/v1/") &&
      (method === "POST" || method === "PATCH") &&
      (table === "relatorios" ||
        table === "pecas" ||
        table === "aulas" ||
        table === "presencas")
    ) {
      const body = request.postDataJSON() as Record<string, unknown>;
      const id = url.searchParams.get("id")?.replace(/^eq\./, "") ?? null;
      const onConflict = url.searchParams.get("on_conflict");
      state.writes.push({ table, method, id, onConflict, body });

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

      if (table === "pecas" && method === "POST") {
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

      if (table === "pecas") {
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

      if (table === "aulas") {
        const input = body as Insert<"aulas">;
        let saved = state.aulas.find(
          (item) =>
            item.data === input.data && item.turma_id === input.turma_id,
        );

        if (!saved) {
          saved = {
            id: `aula-${state.aulas.length + 1}`,
            data: input.data,
            turma_id: input.turma_id ?? null,
            turma_nome: input.turma_nome,
            created_at: "2026-08-05T12:00:00.000Z",
            updated_at: "2026-08-05T12:00:00.000Z",
          };
          state.aulas.push(saved);
        }

        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: "[]",
        });
        return;
      }

      if (state.failNextAttendance) {
        state.failNextAttendance = false;
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Falha ao registrar presença" }),
        });
        return;
      }

      const input = body as Insert<"presencas">;
      const index = state.presencas.findIndex(
        (item) =>
          item.aula_id === input.aula_id &&
          item.contato_id === input.contato_id,
      );
      const previous = state.presencas[index];
      const saved: Row<"presencas"> = {
        id: previous?.id ?? `presenca-${state.presencas.length + 1}`,
        aula_id: input.aula_id,
        contato_id: input.contato_id ?? null,
        contato_nome: input.contato_nome,
        status: input.status,
        origem: input.origem,
        matricula_id: input.matricula_id ?? null,
        avulsa_id: input.avulsa_id ?? null,
        created_at: previous?.created_at ?? "2026-08-05T12:00:00.000Z",
        updated_at: "2026-08-05T12:00:00.000Z",
      };

      if (index === -1) state.presencas.push(saved);
      else state.presencas[index] = saved;

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(saved),
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

test("lista turmas automáticas, persiste presença e bloqueia a conclusão até tudo ser anotado", async ({
  page,
}) => {
  const state = await installStudioApi(page, attendanceSeed());
  await page.goto("/relatorios?data=2026-08-05");

  const attendance = page.locator(
    'section[aria-labelledby="attendance-heading"]',
  );
  await expect(
    attendance.getByRole("heading", { name: "Presenças" }),
  ).toBeVisible();
  const headings = await page.getByRole("heading").allTextContents();
  expect(headings.indexOf("Presenças")).toBeGreaterThanOrEqual(0);
  expect(headings.indexOf("Presenças")).toBeLessThan(
    headings.indexOf("Resumo do dia"),
  );

  const cards = attendance.getByRole("region");
  await expect(cards).toHaveCount(2);
  await expect(cards.getByRole("heading")).toHaveText([
    "Modelagem livre",
    "Torno iniciante",
  ]);

  const modelagem = attendance.getByRole("region", {
    name: "Modelagem livre",
  });
  const torno = attendance.getByRole("region", { name: "Torno iniciante" });
  await expect(modelagem).toContainText("15h00");
  await expect(modelagem).toContainText("3 pessoas esperadas");
  await expect(torno).toContainText("18h00");
  await expect(torno).toContainText("1 pessoa esperada");

  const people = [
    ["Ana", "Modelagem livre", "Matrícula"],
    ["Beatriz", "Modelagem livre", "Matrícula"],
    ["Clara", "Modelagem livre", "Avulsa"],
    ["Diego", "Torno iniciante", "Matrícula"],
  ] as const;

  await expect(attendance.getByRole("listitem")).toHaveCount(4);
  for (const [name, className, origin] of people) {
    const row = attendance.getByRole("listitem").filter({ hasText: name });
    await expect(row).toHaveCount(1);
    await expect(row.getByText(origin, { exact: true })).toBeVisible();

    const group = row.getByRole("group", {
      name: `Presença de ${name} em ${className}`,
    });
    await expect(group.getByRole("button")).toHaveCount(2);
    await expect(group.getByRole("button", { name: "Presente" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(group.getByRole("button", { name: "Faltou" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  }

  await expect(page.getByText("Pessoa pausada")).toHaveCount(0);
  await expect(page.getByText("Pessoa a confirmar")).toHaveCount(0);

  const completion = page.getByRole("button", { name: "Tudo anotado!" });
  await expect(completion).toBeDisabled();

  const claraGroup = attendance.getByRole("group", {
    name: "Presença de Clara em Modelagem livre",
  });
  state.failNextAttendance = true;
  await claraGroup.getByRole("button", { name: "Faltou" }).click();
  await expect(
    page.getByText("Falha ao registrar presença").last(),
  ).toBeVisible();
  await expect(claraGroup.getByRole("button", { name: "Faltou" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(completion).toBeDisabled();
  expect(state.presencas).toEqual([]);

  const marks = [
    ["Ana", "Modelagem livre", "Presente", "Presença registrada"],
    ["Beatriz", "Modelagem livre", "Presente", "Presença registrada"],
    ["Diego", "Torno iniciante", "Presente", "Presença registrada"],
    ["Clara", "Modelagem livre", "Faltou", "Falta registrada"],
  ] as const;

  for (const [name, className, status, feedback] of marks) {
    const group = attendance.getByRole("group", {
      name: `Presença de ${name} em ${className}`,
    });
    const readsBefore = state.attendanceReads;
    await group.getByRole("button", { name: status }).click();
    await expect(page.getByText(feedback).last()).toBeVisible();
    await expect(group.getByRole("button", { name: status })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect.poll(() => state.attendanceReads).toBeGreaterThan(readsBefore);
  }

  const successfulAttendanceWrites = state.writes
    .filter((write) => write.table === "aulas" || write.table === "presencas")
    .slice(-8);
  expect(successfulAttendanceWrites.map((write) => write.table)).toEqual([
    "aulas",
    "presencas",
    "aulas",
    "presencas",
    "aulas",
    "presencas",
    "aulas",
    "presencas",
  ]);
  for (const write of successfulAttendanceWrites.filter(
    (item) => item.table === "aulas",
  )) {
    expect(write.onConflict).toBe("data,turma_id");
  }
  for (const write of successfulAttendanceWrites.filter(
    (item) => item.table === "presencas",
  )) {
    expect(write.onConflict).toBe("aula_id,contato_id");
  }

  expect(state.presencas).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        contato_id: attendanceIds.contatoAna,
        contato_nome: "Ana",
        status: "presente",
        origem: "matricula",
        matricula_id: attendanceIds.matriculaAna,
        avulsa_id: null,
      }),
      expect.objectContaining({
        contato_id: attendanceIds.contatoBeatriz,
        contato_nome: "Beatriz",
        status: "presente",
        origem: "matricula",
        matricula_id: attendanceIds.matriculaBeatriz,
        avulsa_id: null,
      }),
      expect.objectContaining({
        contato_id: attendanceIds.contatoClara,
        contato_nome: "Clara",
        status: "faltou",
        origem: "avulsa",
        matricula_id: null,
        avulsa_id: attendanceIds.avulsaClara,
      }),
      expect.objectContaining({
        contato_id: attendanceIds.contatoDiego,
        contato_nome: "Diego",
        status: "presente",
        origem: "matricula",
        matricula_id: attendanceIds.matriculaDiego,
        avulsa_id: null,
      }),
    ]),
  );

  await expect(completion).toBeEnabled();
  await completion.click();
  await expect(completion).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  for (const [name, className, status] of marks) {
    const group = attendance.getByRole("group", {
      name: `Presença de ${name} em ${className}`,
    });
    await expect(group.getByRole("button", { name: status })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }
  await expect(completion).toHaveAttribute("aria-pressed", "true");
  await expect(completion).toBeEnabled();
  await completion.click();
  await expect(completion).toHaveAttribute("aria-pressed", "false");
});

test("mostra Empty oficial sem escrever ao navegar por uma data sem aulas", async ({
  page,
}) => {
  const state = await installStudioApi(page, attendanceSeed());
  await page.goto("/relatorios?data=2026-08-05");
  const attendanceWritesBefore = state.writes.filter(
    (write) => write.table === "aulas" || write.table === "presencas",
  ).length;

  await page.getByRole("button", { name: "Próximo dia" }).click();
  await expect(page).toHaveURL(/data=2026-08-06$/);

  const empty = page.locator('[data-slot="empty"]');
  await expect(empty).toBeVisible();
  await expect(empty.getByText("Nenhuma aula esperada", { exact: true })).toBeVisible();
  await expect(
    empty.getByText(
      "Não há turmas recorrentes nem aulas avulsas confirmadas para esta data.",
      { exact: true },
    ),
  ).toBeVisible();

  const completion = page.getByRole("button", { name: "Tudo anotado!" });
  await expect(completion).toBeEnabled();
  await completion.click();
  await expect(completion).toHaveAttribute("aria-pressed", "true");

  expect(
    state.writes.filter(
      (write) => write.table === "aulas" || write.table === "presencas",
    ),
  ).toHaveLength(attendanceWritesBefore);
});

test("mantém os blocos de presença legíveis em desktop e mobile", async ({
  page,
}) => {
  const state = await installStudioApi(page, attendanceSeed());
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/relatorios?data=2026-08-05");

  const attendance = page.locator(
    'section[aria-labelledby="attendance-heading"]',
  );
  const contrastSamples = [
    await measureTextContrast(
      attendance.getByRole("heading", { name: "Presenças" }),
      "heading Presenças",
    ),
    await measureTextContrast(
      attendance.getByText("15h00 · 3 pessoas esperadas", { exact: true }),
      "CardDescription",
    ),
  ];

  await page.getByRole("button", { name: "Próximo dia" }).click();
  const emptyDescription = page.locator('[data-slot="empty-description"]');
  await expect(emptyDescription).toBeVisible();
  contrastSamples.push(
    await measureTextContrast(emptyDescription, "EmptyDescription"),
  );

  expect(
    contrastSamples.filter((sample) => sample.ratio < 4.5),
    `WCAG AA contrast failures:\n${contrastSamples
      .map(
        (sample) =>
          `${sample.label}: ${sample.ratio.toFixed(2)}:1 (${sample.foreground} on ${sample.background})`,
      )
      .join("\n")}`,
  ).toEqual([]);

  await page.goto("/relatorios?data=2026-08-05");
  const anaGroup = attendance.getByRole("group", {
    name: "Presença de Ana em Modelagem livre",
  });
  const present = anaGroup.getByRole("button", { name: "Presente" });
  const readsBefore = state.attendanceReads;
  await present.focus();
  await expect(present).toBeFocused();
  await page.keyboard.press("Space");
  await expect(present).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => state.attendanceReads).toBeGreaterThan(readsBefore);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(page).toHaveScreenshot("relatorios-attendance-desktop.png", {
    animations: "disabled",
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/relatorios?data=2026-08-05");
  await expect(
    attendance
      .getByRole("group", {
        name: "Presença de Ana em Modelagem livre",
      })
      .getByRole("button", { name: "Presente" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(page).toHaveScreenshot("relatorios-attendance-mobile.png", {
    animations: "disabled",
  });
});

test("mantém histórico órfão e permite reabrir dia concluído com presença pendente", async ({
  page,
}) => {
  const seed = attendanceSeed();
  const state = await installStudioApi(page, {
    relatorios: [
      {
        id: "relatorio-concluido",
        data: "2026-08-05",
        turma_id: null,
        autor: "Catarina",
        resumo: null,
        concluido_em: "2026-08-05T21:00:00.000Z",
        created_at: "2026-08-05T12:00:00.000Z",
      },
    ],
    contatos: seed.contatos?.filter(
      (item) => item.id === attendanceIds.contatoAna,
    ),
    turmas: seed.turmas?.filter(
      (item) => item.id === attendanceIds.turmaModelagem,
    ),
    matriculas: seed.matriculas?.filter(
      (item) => item.id === attendanceIds.matriculaAna,
    ),
    aulas: [
      {
        id: attendanceIds.aulaHistorica,
        data: "2026-08-05",
        turma_id: null,
        turma_nome: "Turma arquivada",
        created_at: "2026-08-05T12:00:00.000Z",
        updated_at: "2026-08-05T12:00:00.000Z",
      },
    ],
    presencas: [
      {
        id: attendanceIds.presencaHistorica,
        aula_id: attendanceIds.aulaHistorica,
        contato_id: null,
        contato_nome: "Helena histórica",
        status: "faltou",
        origem: "avulsa",
        matricula_id: null,
        avulsa_id: "avulsa-historica",
        created_at: "2026-08-05T12:00:00.000Z",
        updated_at: "2026-08-05T12:00:00.000Z",
      },
    ],
  });
  await page.goto("/relatorios?data=2026-08-05");

  const historicalCard = page.getByRole("region", {
    name: "Turma arquivada",
  });
  const historicalRow = historicalCard.getByRole("listitem").filter({
    hasText: "Helena histórica",
  });
  await expect(historicalRow.getByText("Avulsa", { exact: true })).toBeVisible();
  await expect(historicalRow.getByText("Histórico", { exact: true })).toBeVisible();

  const historicalGroup = historicalRow.getByRole("group", {
    name: "Presença de Helena histórica em Turma arquivada",
  });
  await expect(
    historicalGroup.getByRole("button", { name: "Faltou" }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const option of await historicalGroup.getByRole("button").all()) {
    await expect(option).toBeDisabled();
  }

  const currentGroup = page.getByRole("group", {
    name: "Presença de Ana em Modelagem livre",
  });
  await expect(
    currentGroup.getByRole("button", { name: "Presente" }),
  ).toHaveAttribute("aria-pressed", "false");

  const completion = page.getByRole("button", { name: "Tudo anotado!" });
  await expect(completion).toHaveAttribute("aria-pressed", "true");
  await expect(completion).toBeEnabled();
  await completion.click();
  await expect(completion).toHaveAttribute("aria-pressed", "false");
  await expect(completion).toBeDisabled();
  expect(
    state.writes.filter(
      (write) => write.table === "aulas" || write.table === "presencas",
    ),
  ).toEqual([]);
});
