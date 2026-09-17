-- Script di pulizia dati di test.
--
-- ATTENZIONE: questo script elimina in modo IRREVERSIBILE tutte le righe
-- presenti in projects e nelle tabelle di feedback collegate. Da eseguire
-- SOLO manualmente e SOLO quando si vuole ripartire da un catalogo vuoto
-- (es. prima del lancio in produzione, dopo aver caricato solo dati di
-- test/demo). Non fa parte delle migrazioni automatiche.
--
-- Esecuzione consigliata: Supabase Studio > SQL Editor, oppure via psql
-- collegato al DB del progetto.

begin;

-- L'ordine rispetta le foreign key: prima i figli, poi projects.
truncate table
  public.project_reports,
  public.project_applications,
  public.project_bugs,
  public.project_reviews
restart identity cascade;

truncate table public.projects restart identity cascade;

commit;
