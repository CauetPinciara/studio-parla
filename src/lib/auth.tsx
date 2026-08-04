/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Row } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  session: Session | null;
  member: Row<"app_members"> | null;
  loading: boolean;
  membershipChecked: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<{ email: string; member: Row<"app_members"> | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setLoading(false); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const email = session?.user.email;
    if (!email) return;
    let active = true;
    void supabase.from("app_members").select("email,nome,created_at").eq("email", email).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("Falha ao verificar allowlist", error.message);
      setMembership({ email, member: data });
    });
    return () => { active = false; };
  }, [session]);

  const member = session?.user.email && membership?.email === session.user.email ? membership.member : null;
  const membershipChecked = !session?.user.email || membership?.email === session.user.email;
  const value = useMemo<AuthContextValue>(() => ({
    session, member, loading, membershipChecked,
    signInWithGoogle: async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }); if (error) throw error; },
    signOut: async () => { const { error } = await supabase.auth.signOut(); if (error) throw error; },
  }), [loading, member, membershipChecked, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return value;
}
