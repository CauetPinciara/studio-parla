import { LogIn, ShieldX } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabaseConfig } from "@/lib/supabase";

function GateScreen({ children }: { children: ReactNode }) { return <main className="flex min-h-screen items-center justify-center bg-background p-5"><div className="w-full max-w-md">{children}</div></main>; }

export function Protected({ children }: { children: ReactNode }) {
  const { session, member, loading, membershipChecked, signInWithGoogle, signOut } = useAuth();
  if (!supabaseConfig.configured) return <GateScreen><Alert><AlertTitle>Configure o Supabase</AlertTitle><AlertDescription>Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local para conectar o app.</AlertDescription></Alert></GateScreen>;
  if (loading || (session && !membershipChecked)) return <GateScreen><Card><CardHeader><CardTitle>Studio Parla</CardTitle><CardDescription>Verificando seu acesso…</CardDescription></CardHeader></Card></GateScreen>;
  if (!session) return <GateScreen><Card><CardHeader><CardTitle>Studio Parla</CardTitle><CardDescription>Painel interno do ateliê.</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">Use uma conta Google autorizada para continuar.</p></CardContent><CardFooter><Button className="w-full" onClick={() => void signInWithGoogle()}><LogIn data-icon="inline-start" />Entrar com Google</Button></CardFooter></Card></GateScreen>;
  if (!member) return <GateScreen><Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldX />Acesso não autorizado</CardTitle><CardDescription>O e-mail {session.user.email} não está na allowlist do Studio Parla.</CardDescription></CardHeader><CardFooter><Button variant="outline" onClick={() => void signOut()}>Sair</Button></CardFooter></Card></GateScreen>;
  return children;
}
