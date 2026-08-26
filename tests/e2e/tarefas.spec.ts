import { expect, test, type Page } from "@playwright/test";
import type { Insert, Row, Update } from "../../src/lib/database.types";

interface TarefaWrite {
  method: "POST" | "PATCH" | "DELETE";
  id: string | null;
  body: Record<string, unknown> | null;
}

interface TaskApiSeed {
  tarefas?: Row<"tarefas">[];
}

async function installTaskApi(page: Page, seed: TaskApiSeed = {}) {
  const state = {
    tarefas: [...(seed.tarefas ?? [])],
    writes: [] as TarefaWrite[],
  };

  await page.route(/https:\/\/[^/]+\.supabase\.co\/.*/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const table = url.pathname.split("/").at(-1);

    if (url.pathname.startsWith("/rest/v1/") && table === "tarefas") {
      if (method === "GET") {
        const ordered = [...state.tarefas].sort(
          (left, right) =>
            right.data_abertura.localeCompare(left.data_abertura) ||
            right.created_at.localeCompare(left.created_at),
        );
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(ordered),
        });
        return;
      }

      const id = url.searchParams.get("id")?.replace(/^eq\./, "") ?? null;
      const body = method === "DELETE"
        ? null
        : request.postDataJSON() as Record<string, unknown>;
      state.writes.push({ method: method as TarefaWrite["method"], id, body });

      if (method === "POST") {
        const input = body as Insert<"tarefas">;
        const created: Row<"tarefas"> = {
          id: `tarefa-${state.tarefas.length + 1}`,
          status: input.status ?? "a_fazer",
          data_abertura: input.data_abertura ?? "2026-08-24",
          data_conclusao: input.data_conclusao ?? null,
          responsavel: input.responsavel,
          titulo: input.titulo,
          descricao: input.descricao ?? null,
          created_at: "2026-08-24T15:00:00.000Z",
        };
        state.tarefas.unshift(created);
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(created),
        });
        return;
      }

      if (method === "PATCH") {
        const index = state.tarefas.findIndex((tarefa) => tarefa.id === id);
        const updated = {
          ...state.tarefas[index],
          ...(body as Update<"tarefas">),
        };
        state.tarefas[index] = updated;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(updated),
        });
        return;
      }

      state.tarefas = state.tarefas.filter((tarefa) => tarefa.id !== id);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
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
  await page.clock.setFixedTime(new Date("2026-08-24T12:00:00-03:00"));
  await page.addInitScript(() =>
    localStorage.setItem("studio-parla-shell-preview", "1"),
  );
});

test("persiste CRUD e alterna Lista e Kanban no navegador", async ({ page }) => {
  const state = await installTaskApi(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tarefas");

  await expect(page).toHaveURL(/\/tarefas$/);
  await expect(page.getByRole("heading", { name: "Tarefas", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tarefas", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: "Lista" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Nenhuma tarefa cadastrada.")).toBeVisible();

  await page.getByRole("button", { name: "Nova tarefa" }).click();
  const createDialog = page.getByRole("dialog", { name: "Nova tarefa" });
  await expect(createDialog.getByLabel("Status")).toHaveValue("a_fazer");
  await expect(createDialog.getByLabel("Data de abertura")).toHaveValue("2026-08-24");
  await expect(createDialog.getByLabel("Data de conclusão")).toBeDisabled();
  await createDialog.getByLabel("Responsável").fill("Catarina");
  await createDialog.getByLabel("Título").fill("Organizar materiais");
  await createDialog.getByLabel("Descrição").fill("Separar argila");
  await createDialog.getByRole("button", { name: "Salvar" }).click();
  await expect(createDialog).toBeHidden();

  expect(state.writes[0]).toEqual({
    method: "POST",
    id: null,
    body: {
      status: "a_fazer",
      data_abertura: "2026-08-24",
      data_conclusao: null,
      responsavel: "Catarina",
      titulo: "Organizar materiais",
      descricao: "Separar argila",
    },
  });

  const kanban = page.getByRole("button", { name: "Kanban" });
  await kanban.focus();
  await expect(kanban).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(kanban).toHaveAttribute("aria-pressed", "true");
  const todo = page.getByRole("region", { name: "A fazer" });
  const doing = page.getByRole("region", { name: "Em andamento" });
  const done = page.getByRole("region", { name: "Concluída" });
  await expect(todo).toBeVisible();
  await expect(doing).toBeVisible();
  await expect(done).toBeVisible();

  await todo.getByLabel("Alterar status de Organizar materiais").selectOption("concluida");
  await expect(done.getByRole("listitem", { name: "Organizar materiais" })).toBeVisible();
  expect(state.writes[1]).toMatchObject({
    method: "PATCH",
    id: "tarefa-1",
    body: { status: "concluida", data_conclusao: "2026-08-24" },
  });

  await page.reload();
  await expect(page.getByText("Organizar materiais", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Editar Organizar materiais" }).click();
  const editDialog = page.getByRole("dialog", { name: "Editar tarefa" });
  await editDialog.getByLabel("Título").fill("Organizar materiais do workshop");
  await editDialog.getByLabel("Descrição").fill("Separar argila e revisar as ferramentas");
  await editDialog.getByRole("button", { name: "Salvar" }).click();
  await expect(editDialog).toBeHidden();
  await expect(page.getByText("Organizar materiais do workshop", { exact: true }).first()).toBeVisible();
  expect(state.writes[2]).toMatchObject({
    method: "PATCH",
    id: "tarefa-1",
    body: {
      status: "concluida",
      data_abertura: "2026-08-24",
      data_conclusao: "2026-08-24",
      responsavel: "Catarina",
      titulo: "Organizar materiais do workshop",
      descricao: "Separar argila e revisar as ferramentas",
    },
  });

  const editedRow = page.getByRole("row").filter({
    hasText: "Organizar materiais do workshop",
  });
  await editedRow.getByLabel("Alterar status de Organizar materiais do workshop").selectOption("em_andamento");
  expect(state.writes[3]).toMatchObject({
    method: "PATCH",
    id: "tarefa-1",
    body: { status: "em_andamento", data_conclusao: null },
  });
  await expect(page.getByText("Sem conclusão").first()).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir Organizar materiais do workshop" }).click();
  await expect(page.getByText("Nenhuma tarefa cadastrada.")).toBeVisible();
  expect(state.writes[4]).toEqual({ method: "DELETE", id: "tarefa-1", body: null });
});

test("mantém Tarefas legível em desktop e mobile", async ({ page }) => {
  await installTaskApi(page, {
    tarefas: [{
      id: "tarefa-visual",
      status: "em_andamento",
      data_abertura: "2026-08-20",
      data_conclusao: null,
      responsavel: "Catarina",
      titulo: "Preparar materiais para o workshop de cerâmica",
      descricao: "Separar argila, ferramentas, aventais e referências para receber a turma com tudo organizado e fácil de localizar.",
      created_at: "2026-08-20T15:00:00.000Z",
    }],
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tarefas");
  await expect(page.getByText("Preparar materiais para o workshop de cerâmica", { exact: true }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page).toHaveScreenshot("tarefas-desktop.png", { animations: "disabled" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contatos");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  const drawer = page.getByRole("dialog", { name: "Navegação principal" });
  await expect(drawer).toBeVisible();
  const workspace = drawer.getByLabel("Workspace");
  await expect(workspace).toContainText("Cadastros");
  await workspace.click();
  await page.getByRole("option", { name: "Operação", exact: true }).click();
  await expect(page).toHaveURL(/\/relatorios$/);
  await expect(drawer).toBeHidden();

  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("link", { name: "Tarefas", exact: true }).click();
  await expect(page).toHaveURL(/\/tarefas$/);
  await expect(page.getByRole("dialog", { name: "Navegação principal" })).toBeHidden();
  const kanban = page.getByRole("button", { name: "Kanban" });
  await kanban.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Em andamento" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page).toHaveScreenshot("tarefas-mobile.png", { animations: "disabled" });
});
