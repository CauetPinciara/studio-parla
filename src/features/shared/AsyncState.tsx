import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingState() { return <Card><CardHeader>Carregando…</CardHeader><CardContent className="text-sm text-muted-foreground">Buscando os dados do ateliê.</CardContent></Card>; }
export function ErrorState({ error }: { error: Error }) { return <Alert><AlertTitle>Não foi possível carregar</AlertTitle><AlertDescription>{error.message}. Tente novamente.</AlertDescription></Alert>; }
