-- Metadati dedicati alle mod: tipo e dipendenze richieste.
alter table public.projects
  add column if not exists mod_type text,
  add column if not exists mod_dependencies text;
