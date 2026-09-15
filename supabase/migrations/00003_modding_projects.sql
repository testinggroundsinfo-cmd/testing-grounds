-- Modding projects extend the existing projects table without changing
-- project_category, so existing gaming/software rows remain compatible.
alter table public.projects
  add column if not exists project_type text not null default 'project'
    check (project_type in ('project', 'mod')),
  add column if not exists game_slug text,
  add column if not exists game_title text,
  add column if not exists mod_version text,
  add column if not exists compatibility text,
  add column if not exists game_cover_url text,
  add column if not exists mod_file_url text;

alter table public.projects
  add constraint projects_mod_metadata_check
  check (
    project_type = 'project'
    or (
      category = 'gaming'
      and game_slug is not null
      and game_title is not null
      and mod_version is not null
      and compatibility is not null
    )
  );

create index if not exists projects_mod_game_idx
  on public.projects (game_slug, is_published, created_at desc)
  where project_type = 'mod';
