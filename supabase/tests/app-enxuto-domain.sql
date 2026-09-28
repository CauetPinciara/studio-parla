begin;

select plan(34);

select has_column('public', 'turmas', 'fim', 'turmas has fim');
select has_column('public', 'turmas', 'capacidade', 'turmas has capacidade');
select col_not_null('public', 'turmas', 'capacidade', 'capacidade is required');
select has_column('public', 'matriculas', 'desde', 'matriculas has desde');
select has_column('public', 'pecas', 'prazo', 'pecas has prazo');
select has_column('public', 'pecas', 'etapa', 'pecas has etapa');
select col_not_null('public', 'relatorios', 'autor', 'relatorio author is required');

select has_table('public', 'avisos_falta', 'avisos_falta exists');
select has_table('public', 'confirmacoes', 'confirmacoes exists');
select has_table('public', 'reposicoes', 'reposicoes exists');
select has_table('public', 'pagamentos', 'pagamentos exists');
select has_table('public', 'promocoes', 'promocoes exists');
select has_table('public', 'plano_grupos', 'plano_grupos exists');
select has_table('public', 'plano_subgrupos', 'plano_subgrupos exists');
select has_table('public', 'plano_categorias', 'plano_categorias exists');
select has_table('public', 'lancamentos', 'lancamentos exists');

select col_is_unique('public', 'relatorios', array['data', 'autor'], 'one report per date and author');
select col_is_unique('public', 'avisos_falta', array['contato_id', 'turma_id', 'data'], 'one absence notice per class');
select col_is_unique('public', 'confirmacoes', array['data', 'turma_id', 'contato_id'], 'one confirmation per class');
select col_is_unique('public', 'reposicoes', array['contato_id', 'origem_data', 'origem_turma_id'], 'one replacement per absence');

select fk_ok('public', 'avisos_falta', 'contato_id', 'public', 'contatos', 'id', 'absence notice references contact');
select fk_ok('public', 'confirmacoes', 'turma_id', 'public', 'turmas', 'id', 'confirmation references class');
select fk_ok('public', 'reposicoes', 'destino_turma_id', 'public', 'turmas', 'id', 'replacement references destination class');
select fk_ok('public', 'pagamentos', 'contato_id', 'public', 'contatos', 'id', 'payment references contact');
select fk_ok('public', 'plano_subgrupos', 'grupo_id', 'public', 'plano_grupos', 'id', 'subgroup references group');
select fk_ok('public', 'plano_categorias', 'subgrupo_id', 'public', 'plano_subgrupos', 'id', 'category references subgroup');
select fk_ok('public', 'lancamentos', 'categoria_id', 'public', 'plano_categorias', 'id', 'entry references category');

select policies_are('public', 'avisos_falta', array['membros full'], 'absence notices use member policy');
select policies_are('public', 'plano_grupos', array['financeiro full'], 'chart groups use finance policy');
select policies_are('public', 'lancamentos', array['financeiro full'], 'entries use finance policy');

set local request.jwt.claims = '{"email":"isabelachmatalik@gmail.com"}';
select is(public.current_member_role(), 'atendimento', 'Isabela resolves to atendimento');
select is(public.is_finance_member(), false, 'atendimento cannot access finance');
set local request.jwt.claims = '{"email":"cauetpinciara@gmail.com"}';
select is(public.is_finance_member(), true, 'admin can access finance');
set local request.jwt.claims = '{"email":"catarinamosc@gmail.com"}';
select is(public.is_finance_member(), true, 'professora can access finance');

select * from finish();
rollback;
