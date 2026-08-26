\set ON_ERROR_STOP on

begin;

do $$
begin
  if to_regclass('public.aulas') is null then
    raise exception 'public.aulas does not exist';
  end if;

  if to_regclass('public.presencas') is null then
    raise exception 'public.presencas does not exist';
  end if;
end;
$$;

do $$
declare
  constraint_count integer;
begin
  select count(*)
    into constraint_count
    from pg_constraint constraint_definition
    join pg_class table_definition
      on table_definition.oid = constraint_definition.conrelid
    join pg_namespace table_schema
      on table_schema.oid = table_definition.relnamespace
   where table_schema.nspname = 'public'
     and table_definition.relname = 'aulas'
     and constraint_definition.conname = 'aulas_data_turma_id_key'
     and constraint_definition.contype = 'u';

  if constraint_count <> 1 then
    raise exception 'aulas_data_turma_id_key is missing or is not unique';
  end if;

  select count(*)
    into constraint_count
    from pg_constraint constraint_definition
    join pg_class table_definition
      on table_definition.oid = constraint_definition.conrelid
    join pg_namespace table_schema
      on table_schema.oid = table_definition.relnamespace
   where table_schema.nspname = 'public'
     and table_definition.relname = 'presencas'
     and constraint_definition.conname = 'presencas_aula_id_contato_id_key'
     and constraint_definition.contype = 'u';

  if constraint_count <> 1 then
    raise exception 'presencas_aula_id_contato_id_key is missing or is not unique';
  end if;

  if exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'aulas'
       and column_name = 'status'
  ) then
    raise exception 'aulas.status must not be introduced';
  end if;

  if exists (
    select 1
      from pg_constraint constraint_definition
      join pg_class table_definition
        on table_definition.oid = constraint_definition.conrelid
      join pg_namespace table_schema
        on table_schema.oid = table_definition.relnamespace
     where table_schema.nspname = 'public'
       and table_definition.relname = 'aulas'
       and constraint_definition.conname = 'aulas_status'
  ) then
    raise exception 'aulas_status must not be introduced';
  end if;

  foreach constraint_count in array array[1, 2, 3]
  loop
    if not exists (
      select 1
        from pg_constraint constraint_definition
        join pg_class table_definition
          on table_definition.oid = constraint_definition.conrelid
        join pg_namespace table_schema
          on table_schema.oid = table_definition.relnamespace
       where table_schema.nspname = 'public'
         and table_definition.relname = 'presencas'
         and constraint_definition.contype = 'c'
         and constraint_definition.conname = (
           array[
             'presencas_status_check',
             'presencas_origem_check',
             'presencas_origem_fonte_check'
           ]
         )[constraint_count]
    ) then
      raise exception 'required presencas check constraint % is missing', (
        array[
          'presencas_status_check',
          'presencas_origem_check',
          'presencas_origem_fonte_check'
        ]
      )[constraint_count];
    end if;
  end loop;
end;
$$;

do $$
declare
  foreign_key record;
begin
  for foreign_key in
    select table_definition.relname as table_name,
           column_definition.attname as column_name,
           constraint_definition.confdeltype as delete_action
      from pg_constraint constraint_definition
      join pg_class table_definition
        on table_definition.oid = constraint_definition.conrelid
      join pg_namespace table_schema
        on table_schema.oid = table_definition.relnamespace
      join unnest(constraint_definition.conkey) as key_column(attnum)
        on true
      join pg_attribute column_definition
        on column_definition.attrelid = table_definition.oid
       and column_definition.attnum = key_column.attnum
     where table_schema.nspname = 'public'
       and constraint_definition.contype = 'f'
       and (
         (table_definition.relname = 'aulas' and column_definition.attname = 'turma_id')
         or (
           table_definition.relname = 'presencas'
           and column_definition.attname in (
             'aula_id',
             'contato_id',
             'matricula_id',
             'avulsa_id'
           )
         )
       )
  loop
    if foreign_key.column_name = 'aula_id' and foreign_key.delete_action <> 'c' then
      raise exception 'presencas.aula_id must use ON DELETE CASCADE';
    end if;

    if foreign_key.column_name <> 'aula_id' and foreign_key.delete_action <> 'n' then
      raise exception '%.% must use ON DELETE SET NULL', foreign_key.table_name, foreign_key.column_name;
    end if;
  end loop;

  if (
    select count(*)
      from pg_constraint constraint_definition
      join pg_class table_definition
        on table_definition.oid = constraint_definition.conrelid
      join pg_namespace table_schema
        on table_schema.oid = table_definition.relnamespace
      join unnest(constraint_definition.conkey) as key_column(attnum)
        on true
      join pg_attribute column_definition
        on column_definition.attrelid = table_definition.oid
       and column_definition.attnum = key_column.attnum
     where table_schema.nspname = 'public'
       and constraint_definition.contype = 'f'
       and (
         (table_definition.relname = 'aulas' and column_definition.attname = 'turma_id')
         or (
           table_definition.relname = 'presencas'
           and column_definition.attname in (
             'aula_id',
             'contato_id',
             'matricula_id',
             'avulsa_id'
           )
         )
       )
  ) <> 5 then
    raise exception 'expected all five attendance foreign keys';
  end if;
end;
$$;

insert into public.turmas (id, nome, dia, hora)
values ('00000000-0000-0000-0000-000000000101', 'Attendance schema turma', 3, '15:00');

insert into public.contatos (id, nome)
values ('00000000-0000-0000-0000-000000000201', 'Attendance schema contato');

insert into public.matriculas (id, contato_id, turma_id, status)
values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Ativa'
);

insert into public.avulsas (id, contato_id, turma_id, data, status)
values (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  '2026-08-26',
  'Confirmada'
);

insert into public.aulas (id, data, turma_id, turma_nome)
values (
  '00000000-0000-0000-0000-000000000501',
  '2026-08-26',
  '00000000-0000-0000-0000-000000000101',
  'Attendance schema turma snapshot'
);

insert into public.presencas (
  id,
  aula_id,
  contato_id,
  contato_nome,
  status,
  origem,
  matricula_id,
  avulsa_id
)
values (
  '00000000-0000-0000-0000-000000000601',
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000201',
  'Attendance schema contato snapshot',
  'presente',
  'matricula',
  '00000000-0000-0000-0000-000000000301',
  null
);

do $$
begin
  begin
    insert into public.aulas (data, turma_id, turma_nome)
    values (
      '2026-08-26',
      '00000000-0000-0000-0000-000000000101',
      'Duplicate aula'
    );
    raise exception 'aulas_data_turma_id_key accepted a duplicate';
  exception
    when unique_violation then null;
  end;

  begin
    insert into public.presencas (
      aula_id,
      contato_id,
      contato_nome,
      status,
      origem,
      matricula_id
    )
    values (
      '00000000-0000-0000-0000-000000000501',
      '00000000-0000-0000-0000-000000000201',
      'Duplicate presenca',
      'faltou',
      'matricula',
      '00000000-0000-0000-0000-000000000301'
    );
    raise exception 'presencas_aula_id_contato_id_key accepted a duplicate';
  exception
    when unique_violation then null;
  end;

  begin
    insert into public.presencas (aula_id, contato_nome, status, origem)
    values (
      '00000000-0000-0000-0000-000000000501',
      'Invalid status',
      'desconhecido',
      'matricula'
    );
    raise exception 'presencas_status_check accepted an invalid status';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.presencas (aula_id, contato_nome, status, origem)
    values (
      '00000000-0000-0000-0000-000000000501',
      'Invalid origin',
      'presente',
      'desconhecida'
    );
    raise exception 'presencas_origem_check accepted an invalid origin';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.presencas (
      aula_id,
      contato_nome,
      status,
      origem,
      avulsa_id
    )
    values (
      '00000000-0000-0000-0000-000000000501',
      'Cross-origin matricula',
      'presente',
      'matricula',
      '00000000-0000-0000-0000-000000000401'
    );
    raise exception 'presencas_origem_fonte_check accepted avulsa_id for matricula';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.presencas (
      aula_id,
      contato_nome,
      status,
      origem,
      matricula_id
    )
    values (
      '00000000-0000-0000-0000-000000000501',
      'Cross-origin avulsa',
      'presente',
      'avulsa',
      '00000000-0000-0000-0000-000000000301'
    );
    raise exception 'presencas_origem_fonte_check accepted matricula_id for avulsa';
  exception
    when check_violation then null;
  end;
end;
$$;

do $$
declare
  previous_aula_updated_at timestamptz;
  current_aula_updated_at timestamptz;
  previous_presenca_updated_at timestamptz;
  current_presenca_updated_at timestamptz;
begin
  if exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name in ('aulas', 'presencas')
       and column_name in ('created_at', 'updated_at')
       and is_nullable <> 'NO'
  ) or (
    select count(*)
      from information_schema.columns
     where table_schema = 'public'
       and table_name in ('aulas', 'presencas')
       and column_name in ('created_at', 'updated_at')
       and is_nullable = 'NO'
  ) <> 4 then
    raise exception 'attendance timestamps must all be non-null';
  end if;

  select updated_at
    into previous_aula_updated_at
    from public.aulas
   where id = '00000000-0000-0000-0000-000000000501';

  select updated_at
    into previous_presenca_updated_at
    from public.presencas
   where id = '00000000-0000-0000-0000-000000000601';

  perform pg_sleep(0.01);

  update public.aulas
     set turma_nome = turma_nome
   where id = '00000000-0000-0000-0000-000000000501'
  returning updated_at into current_aula_updated_at;

  update public.presencas
     set contato_nome = contato_nome
   where id = '00000000-0000-0000-0000-000000000601'
  returning updated_at into current_presenca_updated_at;

  if current_aula_updated_at <= previous_aula_updated_at then
    raise exception 'aulas updated_at did not advance';
  end if;

  if current_presenca_updated_at <= previous_presenca_updated_at then
    raise exception 'presencas updated_at did not advance';
  end if;
end;
$$;

delete from public.turmas
where id = '00000000-0000-0000-0000-000000000101';

do $$
begin
  if not exists (
    select 1
      from public.aulas
     where id = '00000000-0000-0000-0000-000000000501'
       and turma_id is null
       and turma_nome = 'Attendance schema turma snapshot'
  ) then
    raise exception 'deleting a turma did not preserve the aula snapshot';
  end if;
end;
$$;

delete from public.contatos
where id = '00000000-0000-0000-0000-000000000201';

do $$
begin
  if not exists (
    select 1
      from public.presencas
     where id = '00000000-0000-0000-0000-000000000601'
       and contato_id is null
       and contato_nome = 'Attendance schema contato snapshot'
       and matricula_id is null
       and avulsa_id is null
  ) then
    raise exception 'deleting a contato did not preserve the presenca snapshot';
  end if;

  if not exists (
    select 1
      from public.presencas
     where id = '00000000-0000-0000-0000-000000000601'
  ) then
    raise exception 'deleting a contato removed historical attendance';
  end if;
end;
$$;

do $$
declare
  table_under_test text;
  policy_count integer;
  policy_qual text;
  policy_check text;
begin
  foreach table_under_test in array array['aulas', 'presencas']
  loop
    if not exists (
      select 1
        from pg_class table_definition
        join pg_namespace table_schema
          on table_schema.oid = table_definition.relnamespace
       where table_schema.nspname = 'public'
         and table_definition.relname = table_under_test
         and table_definition.relrowsecurity
    ) then
      raise exception 'RLS is not enabled on public.%', table_under_test;
    end if;

    select count(*), min(qual), min(with_check)
      into policy_count, policy_qual, policy_check
      from pg_policies
     where schemaname = 'public'
       and tablename = table_under_test
       and policyname = 'membros full';

    if policy_count <> 1 then
      raise exception 'public.% must have exactly one membros full policy', table_under_test;
    end if;

    if policy_qual not like '%is_member()%' then
      raise exception 'public.% policy qual must call is_member()', table_under_test;
    end if;

    if policy_check not like '%is_member()%' then
      raise exception 'public.% policy with_check must call is_member()', table_under_test;
    end if;
  end loop;
end;
$$;

create role attendance_schema_nonmember nologin;
create role attendance_schema_member nologin;

grant usage on schema public to attendance_schema_nonmember, attendance_schema_member;
grant select, insert on public.aulas, public.presencas
  to attendance_schema_nonmember, attendance_schema_member;

insert into public.app_members (email, nome)
values ('attendance-schema-member@example.com', 'Attendance schema member');

set local role attendance_schema_nonmember;
select set_config(
  'request.jwt.claims',
  '{"email":"attendance-schema-nonmember@example.com"}',
  true
);

do $$
begin
  if (select count(*) from public.aulas) <> 0 then
    raise exception 'non-member can see aulas rows';
  end if;

  if (select count(*) from public.presencas) <> 0 then
    raise exception 'non-member can see presencas rows';
  end if;

  begin
    insert into public.aulas (id, data, turma_nome)
    values (
      '00000000-0000-0000-0000-000000000701',
      '2026-08-27',
      'Non-member aula'
    );
    raise exception 'non-member inserted an aula';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;

set local role attendance_schema_member;
select set_config(
  'request.jwt.claims',
  '{"email":"attendance-schema-member@example.com"}',
  true
);

insert into public.aulas (id, data, turma_nome)
values (
  '00000000-0000-0000-0000-000000000801',
  '2026-08-28',
  'Member aula'
);

insert into public.presencas (
  id,
  aula_id,
  contato_nome,
  status,
  origem
)
values (
  '00000000-0000-0000-0000-000000000901',
  '00000000-0000-0000-0000-000000000801',
  'Member contato snapshot',
  'faltou',
  'avulsa'
);

do $$
begin
  if not exists (
    select 1
      from public.aulas
     where id = '00000000-0000-0000-0000-000000000801'
  ) then
    raise exception 'member cannot select the inserted aula';
  end if;

  if not exists (
    select 1
      from public.presencas
     where id = '00000000-0000-0000-0000-000000000901'
  ) then
    raise exception 'member cannot select the inserted presenca';
  end if;
end;
$$;

reset role;

rollback;
