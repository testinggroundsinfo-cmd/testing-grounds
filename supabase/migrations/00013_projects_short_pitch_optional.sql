-- The frontend replaced short_pitch with short_description (see 00007) and no
-- longer submits short_pitch on project creation. The original NOT NULL
-- constraint from 00001_init.sql was never relaxed, so every insert from the
-- app fails with "null value in column short_pitch violates not-null
-- constraint" if the legacy column is still present. Make it optional and
-- drop its length check so it no longer blocks inserts; short_description is
-- now the source of truth. Safe to run even if short_pitch was already
-- dropped/relaxed manually.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'short_pitch'
  ) then
    alter table public.projects
      alter column short_pitch drop not null;

    alter table public.projects
      drop constraint if exists projects_short_pitch_check;
  end if;
end $$;
