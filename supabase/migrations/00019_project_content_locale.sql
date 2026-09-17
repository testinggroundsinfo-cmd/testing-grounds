-- Lingua sorgente dei contenuti creati dagli utenti. I contenuti esistenti
-- sono italiani, mentre i nuovi progetti ricevono la lingua UI corrente.
alter table public.projects
  add column if not exists content_locale text not null default 'it'
  check (content_locale in ('it', 'en', 'es', 'fr', 'de', 'pt', 'zh', 'ja'));
