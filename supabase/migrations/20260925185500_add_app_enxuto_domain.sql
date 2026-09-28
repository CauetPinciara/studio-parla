alter table public.turmas
  add column if not exists fim time,
  add column if not exists capacidade integer not null default 6;

update public.turmas set nome = 'Argila'
where nome = 'Quarta · 15h–18h'
  and not exists (select 1 from public.turmas where nome = 'Argila');
update public.turmas set nome = 'Torno'
where nome = 'Quarta · 18h–21h'
  and not exists (select 1 from public.turmas where nome = 'Torno');
update public.turmas set nome = 'Esmalte'
where nome = 'Quinta · 18h–21h'
  and not exists (select 1 from public.turmas where nome = 'Esmalte');
update public.turmas set dia = 3, hora = '15:00', fim = '18:00', capacidade = 6 where nome = 'Argila';
update public.turmas set dia = 3, hora = '18:00', fim = '21:00', capacidade = 6 where nome = 'Torno';
update public.turmas set dia = 4, hora = '18:00', fim = '21:00', capacidade = 8 where nome = 'Esmalte';

alter table public.turmas
  drop constraint if exists turmas_capacidade_check;
alter table public.turmas
  add constraint turmas_capacidade_check check (capacidade > 0);

alter table public.matriculas
  add column if not exists desde date;
update public.matriculas
set desde = created_at::date
where desde is null;
alter table public.matriculas
  alter column desde set default current_date,
  alter column desde set not null;

alter table public.pecas
  add column if not exists prazo date,
  add column if not exists etapa text;
alter table public.pecas
  drop constraint if exists pecas_etapa_check;
alter table public.pecas
  add constraint pecas_etapa_check
  check (etapa is null or etapa in ('1ª queima', '2ª queima'));
alter table public.pecas
  drop constraint if exists pecas_status_check;
alter table public.pecas
  add constraint pecas_status_check
  check (status in ('producao', 'pronta', 'avisado', 'entregue'));

update public.relatorios
set autor = 'Catarina'
where autor is null or btrim(autor) = '';

with groups as (
  select
    data,
    autor,
    min(id::text)::uuid as keep_id,
    string_agg(nullif(btrim(resumo), ''), E'\n' order by created_at, id) as resumo,
    max(concluido_em) as concluido_em
  from public.relatorios
  group by data, autor
), merged as (
  update public.relatorios as report
  set resumo = groups.resumo,
      concluido_em = groups.concluido_em
  from groups
  where report.id = groups.keep_id
  returning report.id
)
delete from public.relatorios as report
using groups
where report.data = groups.data
  and report.autor = groups.autor
  and report.id <> groups.keep_id;

alter table public.relatorios
  alter column autor set not null;
alter table public.relatorios
  drop constraint if exists relatorios_data_autor_key;
alter table public.relatorios
  add constraint relatorios_data_autor_key unique (data, autor);

create table if not exists public.avisos_falta (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references public.contatos(id) on delete cascade,
  turma_id uuid not null references public.turmas(id) on delete cascade,
  data date not null,
  avisou_em date not null default current_date,
  por text not null,
  obs text,
  origem text not null default 'aviso'
    check (origem in ('aviso', 'confirmacao')),
  created_at timestamptz not null default now(),
  unique (contato_id, turma_id, data)
);

create table if not exists public.confirmacoes (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  turma_id uuid not null references public.turmas(id) on delete cascade,
  contato_id uuid not null references public.contatos(id) on delete cascade,
  status text not null check (status in ('confirmou', 'nao_vem')),
  por text not null,
  em timestamptz not null default now(),
  unique (data, turma_id, contato_id)
);

create table if not exists public.reposicoes (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references public.contatos(id) on delete cascade,
  origem_data date not null,
  origem_turma_id uuid not null references public.turmas(id) on delete cascade,
  destino_data date not null,
  destino_turma_id uuid not null references public.turmas(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (contato_id, origem_data, origem_turma_id)
);

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  contato_id uuid not null references public.contatos(id) on delete cascade,
  tipo text not null check (tipo in (
    'Mensalidade', 'Workshop', 'Aula avulsa', 'Queima', 'Argila',
    'Kit / material', 'Outro'
  )),
  valor numeric(10,2) not null check (valor >= 0),
  forma text not null default 'Pix' check (forma in (
    'Pix', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito',
    'Transferência'
  )),
  obs text,
  por text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.promocoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  regra text not null,
  quem text,
  validade text,
  ativa boolean not null default true
);

create table if not exists public.plano_grupos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('despesa', 'receita')),
  nome text not null,
  classificacao text not null,
  constraint plano_grupos_classificacao_check check (
    (tipo = 'despesa' and classificacao in (
      'Custo Operacional', 'Custo Fixo', 'Investimento', 'Empréstimo',
      'Retiradas'
    ))
    or
    (tipo = 'receita' and classificacao in (
      'Produtos & Serviços', 'Empréstimos', 'Aportes'
    ))
  )
);

create table if not exists public.plano_subgrupos (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.plano_grupos(id) on delete cascade,
  nome text not null
);

create table if not exists public.plano_categorias (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.plano_grupos(id) on delete cascade,
  subgrupo_id uuid references public.plano_subgrupos(id) on delete cascade,
  nome text not null
);

create table if not exists public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('despesa', 'receita')),
  descricao text not null,
  categoria_id uuid not null references public.plano_categorias(id),
  contato text,
  vencimento date not null,
  valor numeric(10,2) not null check (valor >= 0),
  pago boolean not null default false,
  pago_em date,
  constraint lancamentos_pagamento_check check (
    (pago and pago_em is not null) or (not pago and pago_em is null)
  )
);

create or replace function public.current_member_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select papel
  from public.app_members
  where lower(email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;

create or replace function public.is_finance_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_member()
    and coalesce(public.current_member_role() <> 'atendimento', false);
$$;

alter table public.avisos_falta enable row level security;
alter table public.confirmacoes enable row level security;
alter table public.reposicoes enable row level security;
alter table public.pagamentos enable row level security;
alter table public.promocoes enable row level security;
alter table public.plano_grupos enable row level security;
alter table public.plano_subgrupos enable row level security;
alter table public.plano_categorias enable row level security;
alter table public.lancamentos enable row level security;

drop policy if exists "membros full" on public.avisos_falta;
create policy "membros full" on public.avisos_falta
  for all using (public.is_member()) with check (public.is_member());
drop policy if exists "membros full" on public.confirmacoes;
create policy "membros full" on public.confirmacoes
  for all using (public.is_member()) with check (public.is_member());
drop policy if exists "membros full" on public.reposicoes;
create policy "membros full" on public.reposicoes
  for all using (public.is_member()) with check (public.is_member());
drop policy if exists "membros full" on public.pagamentos;
create policy "membros full" on public.pagamentos
  for all using (public.is_member()) with check (public.is_member());
drop policy if exists "membros full" on public.promocoes;
create policy "membros full" on public.promocoes
  for all using (public.is_member()) with check (public.is_member());

drop policy if exists "financeiro full" on public.plano_grupos;
create policy "financeiro full" on public.plano_grupos
  for all using (public.is_finance_member()) with check (public.is_finance_member());
drop policy if exists "financeiro full" on public.plano_subgrupos;
create policy "financeiro full" on public.plano_subgrupos
  for all using (public.is_finance_member()) with check (public.is_finance_member());
drop policy if exists "financeiro full" on public.plano_categorias;
create policy "financeiro full" on public.plano_categorias
  for all using (public.is_finance_member()) with check (public.is_finance_member());
drop policy if exists "financeiro full" on public.lancamentos;
create policy "financeiro full" on public.lancamentos
  for all using (public.is_finance_member()) with check (public.is_finance_member());
