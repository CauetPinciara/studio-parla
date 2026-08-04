import { getSupabaseConfig } from "@/lib/supabase";

describe("configuração do Supabase", () => {
  it("usa placeholders públicos seguros quando o ambiente ainda não foi configurado", () => {
    expect(getSupabaseConfig({})).toEqual({
      url: "https://placeholder.supabase.co",
      anonKey: "placeholder-anon-key",
      configured: false,
    });
  });

  it("reconhece somente o par completo de credenciais públicas", () => {
    expect(getSupabaseConfig({ VITE_SUPABASE_URL: "https://abc.supabase.co" }).configured).toBe(false);
    expect(getSupabaseConfig({ VITE_SUPABASE_URL: "https://abc.supabase.co", VITE_SUPABASE_ANON_KEY: "public-key" })).toEqual({
      url: "https://abc.supabase.co",
      anonKey: "public-key",
      configured: true,
    });
  });
});
