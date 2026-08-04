create extension if not exists pgcrypto;

-- Allowlist: quem pode usar o app
create table if not exists app_members (
  email      text primary key,
  nome       text,
  created_at timestamptz not null default now()
);
insert into app_members (email, nome) values
  ('voce@gmail.com',     'Cauet'),
  ('catarina@gmail.com', 'Catarina'),
  ('isabela@gmail.com',  'Isabela')
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
  autor text, resumo text, created_at timestamptz not null default now()
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
alter table pecas enable row level security;
alter table relatorios enable row level security;

create policy "membros leem allowlist" on app_members for select using (is_member());
create policy "membros full" on contatos   for all using (is_member()) with check (is_member());
create policy "membros full" on turmas      for all using (is_member()) with check (is_member());
create policy "membros full" on matriculas  for all using (is_member()) with check (is_member());
create policy "membros full" on workshops   for all using (is_member()) with check (is_member());
create policy "membros full" on inscricoes  for all using (is_member()) with check (is_member());
create policy "membros full" on avulsas     for all using (is_member()) with check (is_member());
create policy "membros full" on pecas       for all using (is_member()) with check (is_member());
create policy "membros full" on relatorios  for all using (is_member()) with check (is_member());
