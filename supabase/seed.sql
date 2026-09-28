-- Dados de referência migrados de reference/parla.html.
-- Execute depois de supabase/schema.sql e ajuste apenas se não quiser os dados do protótipo.

insert into contatos (id, nome, tel, origem, obs) values
  ('00000000-0000-0000-0000-000000000011', 'Mariana', '27 99243-8823', 'Instagram', 'Namorado Thiago faz junto.'),
  ('00000000-0000-0000-0000-000000000012', 'Isadora', '27 99622-0201', 'Instagram', 'Definir horário (qua ou qui noite).'),
  ('00000000-0000-0000-0000-000000000013', 'Fabiana', '27 99799-3964', 'Instagram', 'Migrando p/ qua+qui noite.'),
  ('00000000-0000-0000-0000-000000000014', 'Lívia Araújo', '27 99911-7997', 'Instagram', 'Fez modelagem + pintura.'),
  ('00000000-0000-0000-0000-000000000015', 'Sandra', '27 98825-3590', 'Instagram', ''),
  ('00000000-0000-0000-0000-000000000016', 'Igor Junior', '27 99283-6002', 'Indicação', ''),
  ('00000000-0000-0000-0000-000000000017', 'Catarina Botelho', '27 99960-1910', 'Indicação', 'Terapia do Barro.'),
  ('00000000-0000-0000-0000-000000000018', 'Ana Carolina', '27 99725-2712', 'Instagram', 'Aluna de junho, não retoma agora.'),
  ('00000000-0000-0000-0000-000000000019', 'Thiago', '-', 'Indicação', 'Namorado da Mariana.'),
  ('00000000-0000-0000-0000-000000000020', 'Glauciene', '-', 'Instagram', ''),
  ('00000000-0000-0000-0000-000000000021', 'Milena', '27 99799-3642', 'Workshop', ''),
  ('00000000-0000-0000-0000-000000000022', 'Wânia', '27 99778-4004', 'Workshop', ''),
  ('00000000-0000-0000-0000-000000000023', 'Aluna nova', '-', 'Instagram', 'Fechou 10/07.')
on conflict (id) do nothing;

do $$
declare
  t1 uuid; t2 uuid; t3 uuid;
begin
  select id into t1 from turmas where nome = 'Argila';
  select id into t2 from turmas where nome = 'Torno';
  select id into t3 from turmas where nome = 'Esmalte';
  insert into matriculas (id, contato_id, turma_id, mensalidade, pagamento, status, desde) values
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', t3, 520, 'Cartão', 'Ativa', '2026-03-05'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000019', t3, 520, '-', 'Ativa', '2026-03-05'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', t3, 500, 'PIX', 'Ativa', '2026-05-14'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000013', t2, 520, '-', 'Ativa', '2026-04-08'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000014', t1, 520, '-', 'Ativa', '2026-02-11'),
    ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000015', t1, 520, '-', 'Ativa', '2026-06-03'),
    ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000023', t1, 520, 'A definir', 'Nova', '2026-07-10')
  on conflict (id) do nothing;
  insert into avulsas (id, contato_id, turma_id, data, status) values
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', t1, '2026-07-15', 'Confirmada')
  on conflict (id) do nothing;
  insert into relatorios (id, data, turma_id, autor, resumo) values
    ('30000000-0000-0000-0000-000000000001', '2026-07-09', t3, 'Catarina', 'Aula à noite. Lívia fez modelagem e pintura em aulas separadas. Isadora deixou uma canequinha para queima.')
  on conflict (id) do nothing;
end $$;

insert into workshops (id, nome, datas, preco) values
  ('40000000-0000-0000-0000-000000000001', 'Colônia de férias (infantil)', '16, 23 e 30/07 · 14h–17h30', '220 / 210 / 200 por dia'),
  ('40000000-0000-0000-0000-000000000002', 'Workshop de sábado', '12/07', 'a definir'),
  ('40000000-0000-0000-0000-000000000003', 'Workshop 08/07 (realizado)', '08/07', '-')
on conflict (id) do nothing;

insert into inscricoes (id, contato_id, workshop_id, status) values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', '40000000-0000-0000-0000-000000000003', 'Realizada'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000022', '40000000-0000-0000-0000-000000000003', 'Realizada')
on conflict (id) do nothing;

insert into pecas (id, contato_id, descricao, data_deixou, data_pronta, estimativa, prazo, etapa, status) values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000018', 'Peças do mês de junho', '2026-06-20', '2026-06-30', '-', '2026-06-30', '2ª queima', 'pronta'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', 'Canequinha', '2026-07-09', null, '~15 dias', '2026-07-24', '1ª queima', 'producao')
on conflict (id) do nothing;

insert into avisos_falta (id, contato_id, turma_id, data, avisou_em, por, obs, origem)
select '75000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', id, '2026-07-15', '2026-07-10', 'Isabela', 'Viagem de trabalho.', 'aviso'
from turmas where nome = 'Torno'
on conflict (id) do nothing;
insert into avisos_falta (id, contato_id, turma_id, data, avisou_em, por, obs, origem)
select '75000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', id, '2026-07-16', '2026-07-11', 'Isabela', '', 'aviso'
from turmas where nome = 'Esmalte'
on conflict (id) do nothing;

insert into promocoes (id, nome, regra, quem, validade, ativa) values
  ('74000000-0000-0000-0000-000000000001', 'Primeiro mês grátis', 'No pagamento trimestral adiantado', 'Isabela pode oferecer', 'Sem prazo', true),
  ('74000000-0000-0000-0000-000000000002', 'Mensalidade no PIX', 'R$ 520 para R$ 500 quando o aluno pede desconto', 'Isabela pode oferecer', 'Sem prazo', true),
  ('74000000-0000-0000-0000-000000000003', 'Pacote de avulsas', 'Desconto a combinar quando fecha mais de uma aula', 'Só Catarina ou Cauet', 'Caso a caso', true)
on conflict (id) do nothing;

insert into plano_grupos (id, tipo, nome, classificacao) values
  ('70000000-0000-0000-0000-000000000001', 'despesa', 'Custos do ateliê', 'Custo Fixo'),
  ('70000000-0000-0000-0000-000000000002', 'despesa', 'Matéria-prima', 'Custo Operacional'),
  ('70000000-0000-0000-0000-000000000003', 'despesa', 'Equipe', 'Custo Fixo'),
  ('70000000-0000-0000-0000-000000000004', 'despesa', 'Forno', 'Custo Operacional'),
  ('70000000-0000-0000-0000-000000000005', 'despesa', 'Aquisições', 'Investimento'),
  ('70000000-0000-0000-0000-000000000006', 'despesa', 'Retiradas dos sócios', 'Retiradas'),
  ('70000000-0000-0000-0000-000000000007', 'receita', 'Aulas', 'Produtos & Serviços'),
  ('70000000-0000-0000-0000-000000000008', 'receita', 'Serviços do ateliê', 'Produtos & Serviços'),
  ('70000000-0000-0000-0000-000000000009', 'receita', 'Workshops', 'Produtos & Serviços'),
  ('70000000-0000-0000-0000-000000000010', 'receita', 'Aportes', 'Aportes')
on conflict (id) do nothing;

insert into plano_subgrupos (id, grupo_id, nome) values
  ('71000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 'Argila'),
  ('71000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000008', 'Queimas')
on conflict (id) do nothing;

insert into plano_categorias (id, grupo_id, subgrupo_id, nome) values
  ('72000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', null, 'Aluguel'),
  ('72000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', null, 'Energia'),
  ('72000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', null, 'Água'),
  ('72000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001', null, 'Internet'),
  ('72000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000002', null, 'Esmaltes'),
  ('72000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000002', null, 'Óxidos e pigmentos'),
  ('72000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000001', 'Argila branca'),
  ('72000000-0000-0000-0000-000000000008', '70000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000001', 'Argila vermelha'),
  ('72000000-0000-0000-0000-000000000009', '70000000-0000-0000-0000-000000000003', null, 'Pró-labore Catarina'),
  ('72000000-0000-0000-0000-000000000010', '70000000-0000-0000-0000-000000000003', null, 'Atendimento Isabela'),
  ('72000000-0000-0000-0000-000000000011', '70000000-0000-0000-0000-000000000004', null, 'Manutenção do forno'),
  ('72000000-0000-0000-0000-000000000012', '70000000-0000-0000-0000-000000000004', null, 'Energia da queima'),
  ('72000000-0000-0000-0000-000000000013', '70000000-0000-0000-0000-000000000005', null, 'Ferramentas'),
  ('72000000-0000-0000-0000-000000000014', '70000000-0000-0000-0000-000000000005', null, 'Equipamentos'),
  ('72000000-0000-0000-0000-000000000015', '70000000-0000-0000-0000-000000000006', null, 'Retirada Catarina'),
  ('72000000-0000-0000-0000-000000000016', '70000000-0000-0000-0000-000000000006', null, 'Retirada Cauet'),
  ('72000000-0000-0000-0000-000000000017', '70000000-0000-0000-0000-000000000007', null, 'Mensalidades'),
  ('72000000-0000-0000-0000-000000000018', '70000000-0000-0000-0000-000000000007', null, 'Aula avulsa'),
  ('72000000-0000-0000-0000-000000000019', '70000000-0000-0000-0000-000000000007', null, 'Reposição paga'),
  ('72000000-0000-0000-0000-000000000020', '70000000-0000-0000-0000-000000000008', '71000000-0000-0000-0000-000000000002', '1ª queima (biscoito)'),
  ('72000000-0000-0000-0000-000000000021', '70000000-0000-0000-0000-000000000008', '71000000-0000-0000-0000-000000000002', '2ª queima (esmalte)'),
  ('72000000-0000-0000-0000-000000000022', '70000000-0000-0000-0000-000000000008', null, 'Argila vendida'),
  ('72000000-0000-0000-0000-000000000023', '70000000-0000-0000-0000-000000000009', null, 'Workshop aberto'),
  ('72000000-0000-0000-0000-000000000024', '70000000-0000-0000-0000-000000000009', null, 'Workshop fechado'),
  ('72000000-0000-0000-0000-000000000025', '70000000-0000-0000-0000-000000000010', null, 'Aporte dos sócios')
on conflict (id) do nothing;

insert into lancamentos (id, tipo, descricao, categoria_id, contato, vencimento, valor, pago, pago_em) values
  ('73000000-0000-0000-0000-000000000001', 'despesa', 'Aluguel do ateliê', '72000000-0000-0000-0000-000000000001', 'Imobiliária Mata da Praia', '2026-07-05', 2400, true, '2026-07-04'),
  ('73000000-0000-0000-0000-000000000002', 'despesa', 'Energia - junho', '72000000-0000-0000-0000-000000000002', 'EDP', '2026-07-03', 520.40, false, null),
  ('73000000-0000-0000-0000-000000000003', 'despesa', 'Argila branca - 200kg', '72000000-0000-0000-0000-000000000007', 'Cerâmica Serra', '2026-07-09', 780, false, null),
  ('73000000-0000-0000-0000-000000000004', 'despesa', 'Pró-labore Catarina', '72000000-0000-0000-0000-000000000009', 'Catarina', '2026-07-05', 3000, true, '2026-07-05'),
  ('73000000-0000-0000-0000-000000000005', 'despesa', 'Troca de resistência do forno', '72000000-0000-0000-0000-000000000011', 'Técnico Ribeiro', '2026-07-15', 640, false, null),
  ('73000000-0000-0000-0000-000000000006', 'receita', 'Mensalidade - Mariana', '72000000-0000-0000-0000-000000000017', 'Mariana', '2026-07-05', 380, true, '2026-07-03'),
  ('73000000-0000-0000-0000-000000000007', 'receita', 'Mensalidade - Isadora', '72000000-0000-0000-0000-000000000017', 'Isadora', '2026-07-05', 380, false, null),
  ('73000000-0000-0000-0000-000000000008', 'receita', 'Mensalidade - Fabiana', '72000000-0000-0000-0000-000000000017', 'Fabiana', '2026-07-09', 380, false, null),
  ('73000000-0000-0000-0000-000000000009', 'receita', '2ª queima - Lívia Araújo', '72000000-0000-0000-0000-000000000021', 'Lívia Araújo', '2026-07-14', 60, false, null),
  ('73000000-0000-0000-0000-000000000010', 'receita', 'Workshop de torno - 8 vagas', '72000000-0000-0000-0000-000000000023', 'Turma do workshop', '2026-07-18', 1520, false, null),
  ('73000000-0000-0000-0000-000000000011', 'receita', 'Argila vendida - Igor Junior', '72000000-0000-0000-0000-000000000022', 'Igor Junior', '2026-07-02', 45, true, '2026-07-02')
on conflict (id) do nothing;
