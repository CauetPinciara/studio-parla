alter table public.app_members
  add column if not exists papel text;

update public.app_members
set papel = case lower(email)
  when 'catarinamosc@gmail.com' then 'professora'
  when 'cauetpinciara@gmail.com' then 'admin'
  else 'atendimento'
end
where papel is null;

alter table public.app_members
  alter column papel set default 'atendimento',
  alter column papel set not null;

alter table public.app_members
  drop constraint if exists app_members_papel_check;

alter table public.app_members
  add constraint app_members_papel_check
  check (papel in ('professora', 'atendimento', 'admin'));
