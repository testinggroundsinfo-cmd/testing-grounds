alter table public.projects
  add column if not exists alternative_links jsonb not null default '[]'::jsonb;

alter table public.projects
  drop constraint if exists projects_alternative_links_array_check;

alter table public.projects
  add constraint projects_alternative_links_array_check
  check (jsonb_typeof(alternative_links) = 'array');
