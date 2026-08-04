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
  ('00000000-0000-0000-0000-000000000019', 'Thiago', '—', 'Indicação', 'Namorado da Mariana.'),
  ('00000000-0000-0000-0000-000000000020', 'Glauciene', '—', 'Instagram', ''),
  ('00000000-0000-0000-0000-000000000021', 'Milena', '27 99799-3642', 'Workshop', ''),
  ('00000000-0000-0000-0000-000000000022', 'Wânia', '27 99778-4004', 'Workshop', ''),
  ('00000000-0000-0000-0000-000000000023', 'Aluna nova', '—', 'Instagram', 'Fechou 10/07.')
on conflict (id) do nothing;

do $$
declare
  t1 uuid; t2 uuid; t3 uuid;
begin
  select id into t1 from turmas where nome = 'Quarta · 15h–18h';
  select id into t2 from turmas where nome = 'Quarta · 18h–21h';
  select id into t3 from turmas where nome = 'Quinta · 18h–21h';
  insert into matriculas (id, contato_id, turma_id, mensalidade, pagamento, status) values
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', t3, 520, 'Cartão', 'Ativa'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000019', t3, 520, '—', 'Ativa'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', t3, 500, 'PIX', 'Ativa'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000013', t2, 520, '—', 'Ativa'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000014', t1, 520, '—', 'Ativa'),
    ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000015', t1, 520, '—', 'Ativa'),
    ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000023', t1, 520, 'A definir', 'Nova')
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
  ('40000000-0000-0000-0000-000000000003', 'Workshop 08/07 (realizado)', '08/07', '—')
on conflict (id) do nothing;

insert into inscricoes (id, contato_id, workshop_id, status) values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', '40000000-0000-0000-0000-000000000003', 'Realizada'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000022', '40000000-0000-0000-0000-000000000003', 'Realizada')
on conflict (id) do nothing;

insert into pecas (id, contato_id, descricao, data_deixou, estimativa, status) values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000018', 'Peças do mês de junho', '2026-06-20', '—', 'pronta'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', 'Canequinha', '2026-07-09', '~15 dias', 'producao')
on conflict (id) do nothing;
