import { expect, test } from "@playwright/test";
import { coreSeed, installApp } from "./helpers";

test("confirmação, aviso, chamada e reposição compartilham o mesmo estado", async ({ page }) => {
  const state = await installApp(page, { role: "admin", seed: coreSeed });
  await page.goto("/confirmacoes");
  await expect(page.getByRole("heading", { name: /Quinta · 15h-18h/ })).toHaveCount(8);

  const firstAna = page.getByRole("listitem").filter({ hasText: "Ana" }).first();
  await firstAna.getByRole("radio", { name: "Não vem", exact: true }).click();
  await expect.poll(() => state.tables.confirmacoes?.length ?? 0).toBe(1);
  await expect.poll(() => state.tables.avisos_falta?.length ?? 0).toBe(1);
  expect(state.tables.avisos_falta[0]).toMatchObject({
    contato_id: "contato-ana",
    turma_id: "turma-quinta",
    data: "2026-07-09",
    origem: "confirmacao",
  });

  await expect(firstAna.getByRole("button", { name: "Remarcar" })).toBeVisible();
  await firstAna.getByRole("button", { name: "Remarcar" }).click();
  const replacement = page.getByRole("dialog", { name: "Marcar reposição" });
  await replacement.getByRole("button", { name: /16\/07\/2026/ }).click();
  await expect.poll(() => state.tables.reposicoes?.length ?? 0).toBe(1);
  expect(state.tables.reposicoes[0]).toMatchObject({
    contato_id: "contato-ana",
    origem_data: "2026-07-09",
    destino_data: "2026-07-16",
  });

  await page.goto("/relatorios?data=2026-07-09");
  await expect(page.getByText("Avisou falta · 09/07", { exact: true })).toBeVisible();
  const attendance = page.getByRole("group", { name: /Presença de Ana/ });
  await attendance.getByRole("button", { name: "Faltou", exact: true }).click();
  await expect.poll(() => state.tables.presencas?.length ?? 0).toBe(1);

  await page.goto("/avisos");
  await expect(page.getByText("Falta confirmada", { exact: true })).toBeVisible();
  await page.getByLabel("Aula").click();
  await expect(page.getByRole("option", { name: /16\/07\/2026.*3\/3 ocupados/ })).toBeVisible();
});

test("usa somente controles próprios nas telas e formulários principais", async ({ page }) => {
  await installApp(page, { role: "admin", seed: coreSeed });
  const routes = [
    "/relatorios",
    "/confirmacoes",
    "/avisos",
    "/contatos",
    "/matriculas",
    "/turmas",
    "/promocoes",
    "/precos",
    "/plano-contas",
    "/contas-pagar",
    "/contas-receber",
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('select:visible, input[type="date"]:visible, input[type="time"]:visible')).toHaveCount(0);
  }

  await page.goto("/turmas");
  const header = page.locator("header");
  await expect(header.getByRole("button", { name: "Nova turma" })).toBeVisible();
  await header.getByRole("button", { name: "Nova turma" }).click();
  const dialog = page.getByRole("dialog", { name: "Nova turma" });
  await expect(dialog.locator('select:visible, input[type="date"]:visible, input[type="time"]:visible')).toHaveCount(0);
  await expect(dialog.getByRole("combobox", { name: "Dia da semana" })).toBeVisible();
  await expect(dialog.getByRole("combobox", { name: "Início" })).toBeVisible();
  await expect(dialog.getByRole("combobox", { name: "Fim" })).toBeVisible();
});

test("preserva o fechamento ao salvar e permite reabrir o dia", async ({ page }) => {
  const state = await installApp(page, {
    role: "admin",
    seed: {
      ...coreSeed,
      relatorios: [{
        id: "relatorio-fechado",
        data: "2026-07-09",
        turma_id: null,
        autor: "Cauet",
        resumo: "Dia encerrado",
        concluido_em: "2026-07-09T20:00:00.000Z",
        created_at: "2026-07-09T20:00:00.000Z",
      }],
    },
  });
  await page.goto("/relatorios?data=2026-07-09");
  await page.getByRole("button", { name: "Observações" }).click();
  await page.getByPlaceholder("O que valeu registrar sobre o dia?").fill("Observação revisada");
  await page.getByRole("button", { name: "Salvar observação" }).click();

  await expect.poll(() => state.writes.find((write) => write.table === "relatorios")?.body).toMatchObject({
    resumo: "Observação revisada",
    concluido_em: "2026-07-09T20:00:00.000Z",
  });
  await expect(page.getByRole("button", { name: "Dia fechado" })).toBeVisible();
  await page.getByRole("button", { name: "Dia fechado" }).click();
  await expect.poll(() => state.tables.relatorios[0].concluido_em).toBeNull();
});

test("mantém peças avisadas no fluxo até a entrega", async ({ page }) => {
  const state = await installApp(page, {
    role: "admin",
    seed: {
      ...coreSeed,
      pecas: [{
        id: "peca-avisada",
        contato_id: "contato-ana",
        descricao: "Caneca pronta",
        data_deixou: "2026-07-01",
        estimativa: "15 dias",
        data_pronta: "2026-07-08",
        prazo: "2026-07-15",
        etapa: "2ª queima",
        status: "avisado",
        created_at: "2026-07-01T15:00:00.000Z",
      }],
    },
  });
  await page.goto("/relatorios?data=2026-07-09");
  await page.locator('nav[aria-label="Etapas do relatório"]:visible').getByLabel("Peças").click();
  await page.getByRole("button", { name: "Marcar entregue" }).click();
  await expect.poll(() => state.tables.pecas[0].status).toBe("entregue");
});
