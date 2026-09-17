-- Aggiunge il toggle "ricevi notifiche email per nuovi bug" ai progetti.
-- Abilitato di default: chi pubblica un progetto riceve subito le notifiche,
-- puo' disattivarle dalla dashboard di modifica.

alter table public.projects
  add column if not exists notify_new_bugs boolean not null default true;
