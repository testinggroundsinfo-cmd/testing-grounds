-- Ensure project feedback tables remove their rows when a project is deleted.
-- Existing migrations already define this behavior for the legacy table names;
-- this also covers deployments using the newer project_* names.
do $$
declare
  table_name text;
  constraint_record record;
  table_names text[] := array[
    'project_reviews',
    'project_bugs',
    'project_applications',
    'project_reports'
  ];
begin
  foreach table_name in array table_names loop
    if to_regclass(format('public.%I', table_name)) is null
       or not exists (
         select 1
         from information_schema.columns columns
         where columns.table_schema = 'public'
           and columns.table_name = table_name
           and columns.column_name = 'project_id'
       ) then
      continue;
    end if;

    if exists (
      select 1
      from pg_constraint
      where conrelid = format('public.%I', table_name)::regclass
        and conname = table_name || '_project_id_fkey_cascade'
    ) then
      continue;
    end if;

    for constraint_record in
      select con.conname
      from pg_constraint con
      join pg_attribute att
        on att.attrelid = con.conrelid
       and att.attnum = any(con.conkey)
      where con.conrelid = format('public.%I', table_name)::regclass
        and con.contype = 'f'
        and con.confrelid = 'public.projects'::regclass
        and att.attname = 'project_id'
    loop
      execute format('alter table public.%I drop constraint %I', table_name, constraint_record.conname);
    end loop;

    execute format(
      'alter table public.%I add constraint %I foreign key (project_id) references public.projects(id) on delete cascade',
      table_name,
      table_name || '_project_id_fkey_cascade'
    );
  end loop;
end $$;
