create table if not exists public.aulas (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  turma_id uuid references public.turmas(id) on delete set null,
  turma_nome text not null check (btrim(turma_nome) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aulas_data_turma_id_key unique (data, turma_id)
);

create table if not exists public.presencas (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references public.aulas(id) on delete cascade,
  contato_id uuid references public.contatos(id) on delete set null,
  contato_nome text not null check (btrim(contato_nome) <> ''),
  status text not null constraint presencas_status_check
    check (status in ('presente', 'faltou')),
  origem text not null constraint presencas_origem_check
    check (origem in ('matricula', 'avulsa')),
  matricula_id uuid references public.matriculas(id) on delete set null,
  avulsa_id uuid references public.avulsas(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint presencas_aula_id_contato_id_key unique (aula_id, contato_id),
  constraint presencas_origem_fonte_check check (
    (origem = 'matricula' and avulsa_id is null)
    or (origem = 'avulsa' and matricula_id is null)
  )
);

create or replace function public.set_attendance_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

drop trigger if exists aulas_set_updated_at on public.aulas;
create trigger aulas_set_updated_at
before update on public.aulas
for each row execute function public.set_attendance_updated_at();

drop trigger if exists presencas_set_updated_at on public.presencas;
create trigger presencas_set_updated_at
before update on public.presencas
for each row execute function public.set_attendance_updated_at();

alter table public.aulas enable row level security;
alter table public.presencas enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'aulas'
      and policyname = 'membros full'
  ) then
    create policy "membros full" on public.aulas
      for all using (public.is_member()) with check (public.is_member());
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'presencas'
      and policyname = 'membros full'
  ) then
    create policy "membros full" on public.presencas
      for all using (public.is_member()) with check (public.is_member());
  end if;
end;
$$;
