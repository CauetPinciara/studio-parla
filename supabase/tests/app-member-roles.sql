begin;

select plan(7);

select has_column('public', 'app_members', 'papel', 'app_members has papel');
select col_not_null('public', 'app_members', 'papel', 'papel is required');
select col_default_is('public', 'app_members', 'papel', '''atendimento''::text', 'papel defaults to atendimento');
select results_eq(
  $$ select papel from public.app_members where email = 'catarinamosc@gmail.com' $$,
  array['professora'::text],
  'Catarina is professora'
);
select results_eq(
  $$ select papel from public.app_members where email = 'isabelachmatalik@gmail.com' $$,
  array['atendimento'::text],
  'Isabela is atendimento'
);
select results_eq(
  $$ select papel from public.app_members where email = 'cauetpinciara@gmail.com' $$,
  array['admin'::text],
  'Cauet is admin'
);
select throws_ok(
  $$ insert into public.app_members (email, papel) values ('invalid@example.com', 'owner') $$,
  '23514',
  null,
  'invalid roles are rejected'
);

select * from finish();
rollback;
