-- Colonne utilizzate dal form di creazione progetto e dalle pagine progetto.
-- IF NOT EXISTS rende la migration sicura anche su database gia aggiornati.
alter table public.projects
  add column if not exists owner_id uuid,
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists project_type text,
  add column if not exists development_status text,
  add column if not exists platforms text[],
  add column if not exists tags text[],
  add column if not exists cover_url text,
  add column if not exists youtube_url text,
  add column if not exists iframe_url text,
  add column if not exists distribution_kind text,
  add column if not exists distribution_url text,
  add column if not exists game_slug text,
  add column if not exists game_title text,
  add column if not exists game_cover_url text,
  add column if not exists mod_version text,
  add column if not exists compatibility text,
  add column if not exists mod_file_url text,
  add column if not exists is_published boolean default false;
