import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Insert, Row } from "@/lib/database.types";
import { listAvulsas } from "@/features/avulsas/api";
import { listContatos } from "@/features/contatos/api";
import { listMatriculas } from "@/features/matriculas/api";
import { ErrorState, LoadingState } from "@/features/shared/AsyncState";
import { TurmaForm } from "@/features/turmas/TurmaForm";
import { createTurma, deleteTurma, listTurmas, updateTurma } from "@/features/turmas/api";

export default function TurmasPage() {
  const client = useQueryClient(); const [editing, setEditing] = useState<Row<"turmas"> | undefined>(); const [open, setOpen] = useState(false);
  const turmas = useQuery({ queryKey: ["turmas"], queryFn: listTurmas }); const contatos = useQuery({ queryKey: ["contatos"], queryFn: listContatos }); const matriculas = useQuery({ queryKey: ["matriculas"], queryFn: listMatriculas }); const avulsas = useQuery({ queryKey: ["avulsas"], queryFn: listAvulsas });
  const save = useMutation({ mutationFn: (value: Insert<"turmas">) => editing ? updateTurma(editing.id, value) : createTurma(value), onSuccess: () => { void client.invalidateQueries({ queryKey: ["turmas"] }); setOpen(false); toast.success("Salvo"); }, onError: (e: Error) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: deleteTurma, onSuccess: () => void client.invalidateQueries({ queryKey: ["turmas"] }), onError: (e: Error) => toast.error(e.message) });
  if (turmas.isLoading || contatos.isLoading || matriculas.isLoading || avulsas.isLoading) return <LoadingState />; const error = turmas.error ?? contatos.error ?? matriculas.error ?? avulsas.error; if (error) return <ErrorState error={error} />;
  const name = (id: string) => contatos.data?.find((item) => item.id === id)?.nome ?? "?";
  return <div className="flex flex-col gap-4"><p className="max-w-2xl text-sm text-muted-foreground">Turmas semanais. A lista de alunos vem das matrículas: muda a matrícula, muda aqui.</p><div className="flex justify-end"><Button onClick={() => { setEditing(undefined); setOpen(true); }}><Plus data-icon="inline-start" />Nova turma</Button></div><div className="grid gap-4 md:grid-cols-2">{turmas.data?.map((turma) => { const alunos = matriculas.data?.filter((item) => item.turma_id === turma.id).map((item) => name(item.contato_id)) ?? []; const extras = avulsas.data?.filter((item) => item.turma_id === turma.id).map((item) => `${name(item.contato_id)} (avulsa)`) ?? []; return <Card key={turma.id}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{turma.nome}</CardTitle><CardDescription>Turma semanal</CardDescription></div><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => { setEditing(turma); setOpen(true); }}><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => { if (window.confirm("Excluir esta turma?")) remove.mutate(turma.id); }}><Trash2 /></Button></div></div></CardHeader><CardContent><ul className="flex flex-col gap-2 text-sm">{[...alunos, ...extras].length ? [...alunos, ...extras].map((aluno) => <li key={aluno} className="border-b pb-2 last:border-0">{aluno}</li>) : <li className="text-muted-foreground">Sem alunos</li>}</ul></CardContent></Card>; })}</div><Card><CardHeader><CardTitle>Colônia de férias (infantil)</CardTitle><CardDescription>16, 23 e 30/07 · 14h–17h30</CardDescription></CardHeader><CardContent className="text-sm text-muted-foreground">Evento pontual: ver aba Workshops.</CardContent></Card><TurmaForm key={editing?.id ?? "novo"} open={open} onOpenChange={setOpen} turma={editing} pending={save.isPending} onSubmit={(value) => save.mutate(value)} /></div>;
}
