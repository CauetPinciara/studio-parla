create extension if not exists pgcrypto;

-- Allowlist: quem pode usar o app
create table if not exists app_members (
  email      text primary key,
  nome       text,
  papel      text not null default 'atendimento'
    check (papel in ('professora', 'atendimento', 'admin')),
  created_at timestamptz not null default now()
);
insert into app_members (email, nome, papel) values
  ('cauetpinciara@gmail.com', 'Cauet', 'admin'),
  ('catarinamosc@gmail.com', 'Catarina', 'professora'),
  ('isabelachmatalik@gmail.com', 'Isabela', 'atendimento')
on conflict (email) do update set nome = excluded.nome, papel = excluded.papel;

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
  nome text not null unique,
  dia int,
  hora text,
  fim time,
  capacidade int not null default 6 check (capacidade > 0)
);
create table if not exists matriculas (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references contatos(id) on delete cascade,
  turma_id uuid references turmas(id) on delete set null,
  mensalidade numeric(10,2) default 520, pagamento text,
  status text not null default 'Ativa' check (status in ('Ativa','Pausada','Nova','Saiu')),
  created_at timestamptz not null default now(),
  desde date not null default current_date
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
  prazo date,
  etapa text check (etapa is null or etapa in ('1ª queima','2ª queima')),
  status text not null default 'producao' check (status in ('producao','pronta','avisado','entregue')),
  created_at timestamptz not null default now()
);
create table if not exists relatorios (
  id uuid primary key default gen_random_uuid(),
  data date not null, turma_id uuid references turmas(id) on delete set null,
  autor text not null, resumo text, concluido_em timestamptz, created_at timestamptz not null default now(),
  unique (data, autor)
);
create table if not exists avisos_falta (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references contatos(id) on delete cascade,
  turma_id uuid not null references turmas(id) on delete cascade,
  data date not null,
  avisou_em date not null default current_date,
  por text not null,
  obs text,
  origem text not null default 'aviso' check (origem in ('aviso','confirmacao')),
  created_at timestamptz not null default now(),
  unique (contato_id, turma_id, data)
);
create table if not exists confirmacoes (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  turma_id uuid not null references turmas(id) on delete cascade,
  contato_id uuid not null references contatos(id) on delete cascade,
  status text not null check (status in ('confirmou','nao_vem')),
  por text not null,
  em timestamptz not null default now(),
  unique (data, turma_id, contato_id)
);
create table if not exists reposicoes (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references contatos(id) on delete cascade,
  origem_data date not null,
  origem_turma_id uuid not null references turmas(id) on delete cascade,
  destino_data date not null,
  destino_turma_id uuid not null references turmas(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (contato_id, origem_data, origem_turma_id)
);
create table if not exists pagamentos (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  contato_id uuid not null references contatos(id) on delete cascade,
  tipo text not null check (tipo in ('Mensalidade','Workshop','Aula avulsa','Queima','Argila','Kit / material','Outro')),
  valor numeric(10,2) not null check (valor >= 0),
  forma text not null default 'Pix' check (forma in ('Pix','Dinheiro','Cartão de crédito','Cartão de débito','Transferência')),
  obs text,
  por text not null,
  created_at timestamptz not null default now()
);
create table if not exists promocoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  regra text not null,
  quem text,
  validade text,
  ativa bool not null default true
);
create table if not exists plano_grupos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('despesa','receita')),
  nome text not null,
  classificacao text not null,
  check (
    (tipo = 'despesa' and classificacao in ('Custo Operacional','Custo Fixo','Investimento','Empréstimo','Retiradas'))
    or (tipo = 'receita' and classificacao in ('Produtos & Serviços','Empréstimos','Aportes'))
  )
);
create table if not exists plano_subgrupos (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references plano_grupos(id) on delete cascade,
  nome text not null
);
create table if not exists plano_categorias (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references plano_grupos(id) on delete cascade,
  subgrupo_id uuid references plano_subgrupos(id) on delete cascade,
  nome text not null
);
create table if not exists lancamentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('despesa','receita')),
  descricao text not null,
  categoria_id uuid not null references plano_categorias(id),
  contato text,
  vencimento date not null,
  valor numeric(10,2) not null check (valor >= 0),
  pago bool not null default false,
  pago_em date,
  check ((pago and pago_em is not null) or (not pago and pago_em is null))
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
insert into turmas (nome, dia, hora, fim, capacidade) values
  ('Argila', 3, '15:00', '18:00', 6),
  ('Torno', 3, '18:00', '21:00', 6),
  ('Esmalte', 4, '18:00', '21:00', 8)
on conflict (nome) do nothing;

create or replace function public.current_member_role()
returns text language sql stable security definer set search_path = public as $$
  select papel from app_members
  where lower(email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;

create or replace function public.is_finance_member()
returns boolean language sql stable security definer set search_path = public as $$
  select is_member() and coalesce(current_member_role() <> 'atendimento', false);
$$;

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
alter table avisos_falta enable row level security;
alter table confirmacoes enable row level security;
alter table reposicoes enable row level security;
alter table pagamentos enable row level security;
alter table promocoes enable row level security;
alter table plano_grupos enable row level security;
alter table plano_subgrupos enable row level security;
alter table plano_categorias enable row level security;
alter table lancamentos enable row level security;

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
create policy "membros full" on avisos_falta for all using (is_member()) with check (is_member());
create policy "membros full" on confirmacoes for all using (is_member()) with check (is_member());
create policy "membros full" on reposicoes for all using (is_member()) with check (is_member());
create policy "membros full" on pagamentos for all using (is_member()) with check (is_member());
create policy "membros full" on promocoes for all using (is_member()) with check (is_member());
create policy "financeiro full" on plano_grupos for all using (is_finance_member()) with check (is_finance_member());
create policy "financeiro full" on plano_subgrupos for all using (is_finance_member()) with check (is_finance_member());
create policy "financeiro full" on plano_categorias for all using (is_finance_member()) with check (is_finance_member());
create policy "financeiro full" on lancamentos for all using (is_finance_member()) with check (is_finance_member());
