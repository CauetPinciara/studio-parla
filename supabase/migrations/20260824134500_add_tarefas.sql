create table if not exists public.tarefas (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'a_fazer' check (status in ('a_fazer','em_andamento','concluida')),
  data_abertura date not null default current_date,
  data_conclusao date,
  responsavel text not null check (btrim(responsavel) <> ''),
  titulo text not null check (btrim(titulo) <> ''),
  descricao text,
  created_at timestamptz not null default now(),
  check (
    (status = 'concluida' and data_conclusao is not null)
    or (status <> 'concluida' and data_conclusao is null)
  ),
  check (data_conclusao is null or data_conclusao >= data_abertura)
);

alter table public.tarefas enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tarefas'
      and policyname = 'membros full'
  ) then
    create policy "membros full" on public.tarefas
      for all using (public.is_member()) with check (public.is_member());
  end if;
end;
$$;
