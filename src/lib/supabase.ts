import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

interface EnvLike { VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string }

export function getSupabaseConfig(env: EnvLike) {
  const configured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
  return {
    url: configured ? env.VITE_SUPABASE_URL! : "https://placeholder.supabase.co",
    anonKey: configured ? env.VITE_SUPABASE_ANON_KEY! : "placeholder-anon-key",
    configured,
  };
}

export const supabaseConfig = getSupabaseConfig({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
export const supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey);
