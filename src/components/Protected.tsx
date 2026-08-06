import { ShieldX } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { supabaseConfig } from "@/lib/supabase";

function GateScreen({ children }: { children: ReactNode }) { return <main className="flex min-h-screen items-center justify-center bg-background p-5"><div className="w-full max-w-md">{children}</div></main>; }

export function Protected({ children }: { children: ReactNode }) {
  const { session, member, loading, membershipChecked, accessError, signInWithPassword, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setLoginError(null);
    try {
      await signInWithPassword(email.trim(), password);
    } catch {
      setLoginError("E-mail ou senha inválidos.");
    } finally {
      setSubmitting(false);
    }
  };
  if (!supabaseConfig.configured) return <GateScreen><Alert><AlertTitle>Configure o Supabase</AlertTitle><AlertDescription>Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local para conectar o app.</AlertDescription></Alert></GateScreen>;
  if (loading || (session && !membershipChecked)) return <GateScreen><Card><CardHeader><CardTitle>Studio Parla</CardTitle><CardDescription>Verificando seu acesso…</CardDescription></CardHeader></Card></GateScreen>;
  if (accessError) return <GateScreen><Alert className="border-destructive text-destructive"><AlertTitle>Não foi possível verificar o acesso</AlertTitle><AlertDescription>{accessError}</AlertDescription></Alert></GateScreen>;
  if (!session) return <GateScreen><form onSubmit={(event) => void submit(event)}><Card><CardHeader><CardTitle>Studio Parla</CardTitle><CardDescription>Entre com a conta cadastrada no ateliê.</CardDescription></CardHeader><CardContent><FieldGroup>{loginError && <Alert className="border-destructive text-destructive"><AlertTitle>Não foi possível entrar</AlertTitle><AlertDescription>{loginError}</AlertDescription></Alert>}<Field><FieldLabel htmlFor="login-email">E-mail</FieldLabel><Input id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></Field><Field><FieldLabel htmlFor="login-password">Senha</FieldLabel><Input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></Field></FieldGroup></CardContent><CardFooter><Button className="w-full" type="submit" disabled={submitting}>{submitting ? "Entrando…" : "Entrar"}</Button></CardFooter></Card></form></GateScreen>;
  if (!member) return <GateScreen><Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldX />Acesso não autorizado</CardTitle><CardDescription>O e-mail {session.user.email} não está na allowlist do Studio Parla.</CardDescription></CardHeader><CardFooter><Button variant="outline" onClick={() => void signOut()}>Sair</Button></CardFooter></Card></GateScreen>;
  return children;
}
