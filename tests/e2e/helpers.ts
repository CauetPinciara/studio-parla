import type { Page } from "@playwright/test";
import type { MemberRole } from "../../src/app/access";

type ApiRow = Record<string, unknown>;

export interface ApiWrite {
  table: string;
  method: string;
  body: ApiRow | null;
}

export interface AppApiState {
  tables: Record<string, ApiRow[]>;
  writes: ApiWrite[];
}

interface InstallAppOptions {
  role?: MemberRole;
  seed?: Record<string, ApiRow[]>;
  now?: string;
}

const memberNames: Record<MemberRole, string> = {
  professora: "Catarina",
  atendimento: "Isabela",
  admin: "Cauet",
};

function sessionFor(email: string) {
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
      email_confirmed_at: "2026-07-09T12:00:00.000Z",
      confirmed_at: "2026-07-09T12:00:00.000Z",
      last_sign_in_at: "2026-07-09T12:00:00.000Z",
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      identities: [],
      created_at: "2026-07-09T12:00:00.000Z",
      updated_at: "2026-07-09T12:00:00.000Z",
      is_anonymous: false,
    },
  };
}

function filterRows(rows: ApiRow[], url: URL) {
  return rows.filter((row) => {
    for (const [field, filter] of url.searchParams) {
      if (["select", "order", "on_conflict", "limit", "offset"].includes(field)) continue;
      if (filter.startsWith("eq.") && String(row[field]) !== filter.slice(3)) return false;
      if (filter.startsWith("in.(") && filter.endsWith(")")) {
        const values = filter.slice(4, -1).split(",");
        if (!values.includes(String(row[field]))) return false;
      }
    }
    return true;
  });
}

function responseBody(request: { headers: () => Record<string, string> }, rows: ApiRow[]) {
  const single = request.headers().accept?.includes("application/vnd.pgrst.object+json");
  return JSON.stringify(single ? (rows[0] ?? null) : rows);
}

export async function installApp(
  page: Page,
  { role = "admin", seed = {}, now = "2026-07-09T12:00:00-03:00" }: InstallAppOptions = {},
): Promise<AppApiState> {
  const email = `${role}@studio-parla.test`;
  const session = sessionFor(email);
  const member = {
    email,
    nome: memberNames[role],
    papel: role,
    created_at: "2026-07-09T12:00:00.000Z",
  };
  const state: AppApiState = {
    tables: Object.fromEntries(
      Object.entries(seed).map(([table, rows]) => [table, rows.map((row) => ({ ...row }))]),
    ),
    writes: [],
  };

  await page.clock.setFixedTime(new Date(now));
  await page.addInitScript((storedSession) => {
    const sessionKey = "sb-placeholder-auth-token";
    localStorage.setItem("studio-parla-shell-preview", "1");
    localStorage.setItem(sessionKey, JSON.stringify(storedSession));
    const readStoredValue = localStorage.getItem.bind(localStorage);
    Storage.prototype.getItem = (key) => {
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) return readStoredValue(sessionKey);
      return readStoredValue(key);
    };
  }, session);

  await page.route(/https:\/\/[^/]+\.supabase\.co\/.*/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const table = url.pathname.split("/").at(-1) ?? "";

    if (!url.pathname.startsWith("/rest/v1/")) {
      await route.abort();
      return;
    }

    if (table === "app_members") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: responseBody(request, [member]),
      });
      return;
    }

    const rows = state.tables[table] ?? (state.tables[table] = []);
    if (method === "GET") {
      const filtered = filterRows(rows, url);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: responseBody(request, filtered),
      });
      return;
    }

    if (method === "DELETE") {
      state.writes.push({ table, method, body: null });
      const selected = new Set(filterRows(rows, url));
      state.tables[table] = rows.filter((row) => !selected.has(row));
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      return;
    }

    const body = request.postDataJSON() as ApiRow;
    state.writes.push({ table, method, body });

    if (method === "PATCH") {
      const selected = filterRows(rows, url);
      selected.forEach((row) => Object.assign(row, body));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: responseBody(request, selected),
      });
      return;
    }

    const conflictFields = url.searchParams.get("on_conflict")?.split(",") ?? [];
    const existing = conflictFields.length > 0
      ? rows.find((row) => conflictFields.every((field) => row[field] === body[field]))
      : undefined;
    const ignoreDuplicate = request.headers().prefer?.includes("resolution=ignore-duplicates");
    let saved = existing;
    if (!saved) {
      saved = {
        id: body.id ?? `${table}-${rows.length + 1}`,
        created_at: body.created_at ?? "2026-07-09T15:00:00.000Z",
        ...body,
      };
      rows.push(saved);
    } else if (!ignoreDuplicate) {
      Object.assign(saved, body);
    }

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: responseBody(request, [saved]),
    });
  });

  return state;
}

export const coreSeed: Record<string, ApiRow[]> = {
  contatos: [
    { id: "contato-ana", nome: "Ana", tel: "27999990001", origem: "Instagram", obs: null, created_at: "2026-01-01T12:00:00.000Z" },
    { id: "contato-bia", nome: "Bia", tel: "27999990002", origem: "Indicação", obs: null, created_at: "2026-01-01T12:00:00.000Z" },
  ],
  turmas: [
    { id: "turma-quinta", nome: "Quinta · 15h-18h", dia: 4, hora: "15:00:00", fim: "18:00:00", capacidade: 3 },
  ],
  matriculas: [
    { id: "matricula-ana", contato_id: "contato-ana", turma_id: "turma-quinta", mensalidade: 520, pagamento: "Pix", status: "Ativa", desde: "2026-01-10", created_at: "2026-01-10T12:00:00.000Z" },
    { id: "matricula-bia", contato_id: "contato-bia", turma_id: "turma-quinta", mensalidade: 520, pagamento: "Pix", status: "Ativa", desde: "2026-02-10", created_at: "2026-02-10T12:00:00.000Z" },
  ],
};
