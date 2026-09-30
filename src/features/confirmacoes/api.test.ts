import { beforeEach, describe, expect, it, vi } from "vitest";
import { setConfirmation } from "@/features/confirmacoes/api";

const database = vi.hoisted(() => {
  const confirmationResult = { error: null };
  const noticeResult = { error: null };
  const confirmacoes = {
    upsert: vi.fn(() => Promise.resolve(confirmationResult)),
    delete: vi.fn(),
    eq: vi.fn(),
  };
  const avisos = {
    upsert: vi.fn(() => Promise.resolve(noticeResult)),
    delete: vi.fn(),
    eq: vi.fn(),
  };

  confirmacoes.delete.mockReturnValue(confirmacoes);
  confirmacoes.eq.mockImplementation(() => confirmacoes);
  avisos.delete.mockReturnValue(avisos);
  avisos.eq.mockImplementation(() => avisos);

  return {
    confirmacoes,
    avisos,
    from: vi.fn((table: string) => table === "confirmacoes" ? confirmacoes : avisos),
  };
});

vi.mock("@/lib/supabase", () => ({ supabase: { from: database.from } }));

const input = {
  data: "2026-07-15",
  turmaId: "turma-1",
  contatoId: "contato-1",
  por: "Isabela",
  today: "2026-07-09",
};

describe("sincronização de confirmações", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.confirmacoes.delete.mockReturnValue(database.confirmacoes);
    database.confirmacoes.eq.mockImplementation(() => database.confirmacoes);
    database.avisos.delete.mockReturnValue(database.avisos);
    database.avisos.eq.mockImplementation(() => database.avisos);
  });

  it("cria confirmação e aviso com a observação preparada sem sobrescrever um aviso manual", async () => {
    await setConfirmation({ ...input, status: "nao_vem", obs: "Vai viajar" });

    expect(database.confirmacoes.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "nao_vem", por: "Isabela" }),
      { onConflict: "data,turma_id,contato_id" },
    );
    expect(database.avisos.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ origem: "confirmacao", avisou_em: "2026-07-09", obs: "Vai viajar" }),
      { onConflict: "contato_id,turma_id,data", ignoreDuplicates: true },
    );
  });

  it("remove somente aviso originado pela confirmação ao mudar para confirmou", async () => {
    await setConfirmation({ ...input, status: "confirmou" });

    expect(database.avisos.delete).toHaveBeenCalledTimes(1);
    expect(database.avisos.eq).toHaveBeenCalledWith("origem", "confirmacao");
    expect(database.avisos.upsert).not.toHaveBeenCalled();
  });

  it("limpa a confirmação e seu aviso derivado", async () => {
    await setConfirmation({ ...input, status: null });

    expect(database.confirmacoes.delete).toHaveBeenCalledTimes(1);
    expect(database.confirmacoes.upsert).not.toHaveBeenCalled();
    expect(database.avisos.eq).toHaveBeenCalledWith("origem", "confirmacao");
  });
});
