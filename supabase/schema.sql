create extension if not exists pgcrypto;

-- Allowlist: quem pode usar o app
create table if not exists app_members (
  email      text primary key,
  nome       text,
  created_at timestamptz not null default now()
);
insert into app_members (email, nome) values
  ('cauetpinciara@gmail.com',     'Cauet'),
  ('catarinamosc@gmail.com', 'Catarina'),
  ('isabelachmatalik@gmail.com',  'Isabela')
on conflict (email) do nothing;

create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_members where email = (auth.jwt() ->> 'email'));
$$;

create table if not exists contatos (
  id uuid primary key default gen_random_uuid(),
  nome text not null, tel text, origem text, obs text,
  created_at timestamptz not null default now()
);
create table if not exists turmas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique, dia int, hora text
);
create table if not exists matriculas (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references contatos(id) on delete cascade,
  turma_id uuid references turmas(id) on delete set null,
  mensalidade numeric(10,2) default 520, pagamento text,
  status text not null default 'Ativa' check (status in ('Ativa','Pausada','Nova','Saiu')),
  created_at timestamptz not null default now()
);
create table if not exists workshops (
  id uuid primary key default gen_random_uuid(),
  nome text not null, datas text, preco text,
  created_at timestamptz not null default now()
);
create table if not exists inscricoes (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references contatos(id) on delete cascade,
  workshop_id uuid not null references workshops(id) on delete cascade,
  status text default 'Confirmada'
);
create table if not exists avulsas (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references contatos(id) on delete cascade,
  turma_id uuid references turmas(id) on delete set null,
  data date, status text default 'A confirmar'
);
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
create table if not exists pecas (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references contatos(id) on delete cascade,
  descricao text, data_deixou date, estimativa text, data_pronta date,
  status text not null default 'producao' check (status in ('producao','pronta','avisado','entregue')),
  created_at timestamptz not null default now()
);
create table if not exists relatorios (
  id uuid primary key default gen_random_uuid(),
  data date not null, turma_id uuid references turmas(id) on delete set null,
  autor text, resumo text, concluido_em timestamptz, created_at timestamptz not null default now()
);
create table if not exists tarefas (
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
insert into turmas (nome, dia, hora) values
  ('Quarta · 15h–18h', 3, '15:00'),
  ('Quarta · 18h–21h', 3, '18:00'),
  ('Quinta · 18h–21h', 4, '18:00')
on conflict (nome) do nothing;

alter table app_members enable row level security;
alter table contatos enable row level security;
alter table turmas enable row level security;
alter table matriculas enable row level security;
alter table workshops enable row level security;
alter table inscricoes enable row level security;
alter table avulsas enable row level security;
alter table aulas enable row level security;
alter table presencas enable row level security;
alter table pecas enable row level security;
alter table relatorios enable row level security;
alter table tarefas enable row level security;

create policy "membros leem allowlist" on app_members for select using (is_member());
create policy "membros full" on contatos   for all using (is_member()) with check (is_member());
create policy "membros full" on turmas      for all using (is_member()) with check (is_member());
create policy "membros full" on matriculas  for all using (is_member()) with check (is_member());
create policy "membros full" on workshops   for all using (is_member()) with check (is_member());
create policy "membros full" on inscricoes  for all using (is_member()) with check (is_member());
create policy "membros full" on avulsas     for all using (is_member()) with check (is_member());
create policy "membros full" on aulas       for all using (public.is_member()) with check (public.is_member());
create policy "membros full" on presencas   for all using (public.is_member()) with check (public.is_member());
create policy "membros full" on pecas       for all using (is_member()) with check (is_member());
create policy "membros full" on relatorios  for all using (is_member()) with check (is_member());
create policy "membros full" on tarefas     for all using (is_member()) with check (is_member());
