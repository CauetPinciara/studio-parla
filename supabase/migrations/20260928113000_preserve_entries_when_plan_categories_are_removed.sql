alter table public.lancamentos
  drop constraint if exists lancamentos_categoria_id_fkey;

alter table public.lancamentos
  alter column categoria_id drop not null;

alter table public.lancamentos
  add constraint lancamentos_categoria_id_fkey
  foreign key (categoria_id)
  references public.plano_categorias(id)
  on delete set null;
