alter table public.relatorios
  add column if not exists concluido_em timestamptz;
