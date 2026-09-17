-- Allinea project_reviews ai punteggi inviati dal form recensioni software.
-- Senza queste colonne PostgREST risponde PGRST204 e il client ripiega
-- salvando i punteggi nel commento.

alter table public.project_reviews
  add column if not exists usability smallint,
  add column if not exists usefulness smallint,
  add column if not exists ui_quality smallint;

-- I punteggi restano opzionali: una recensione puo' contenere solo il commento.
alter table public.project_reviews
  alter column rating drop not null,
  alter column comment drop not null,
  alter column user_id drop not null;

alter table public.project_bugs
  alter column title drop not null,
  alter column steps drop not null,
  alter column user_id drop not null;

alter table public.project_applications
  alter column message drop not null,
  alter column user_id drop not null;

-- Invii pubblici (anche non autenticati) sulle tre tabelle di feedback.
do $$
declare
  target text;
begin
  foreach target in array array['project_reviews', 'project_bugs', 'project_applications']
  loop
    execute format('alter table public.%I enable row level security', target);
    execute format('drop policy if exists "%s_public_insert" on public.%I', target, target);
    execute format(
      'create policy "%s_public_insert" on public.%I for insert to anon, authenticated with check (true)',
      target,
      target
    );
  end loop;
end
$$;

drop policy if exists "project_reviews_public_read" on public.project_reviews;
create policy "project_reviews_public_read" on public.project_reviews
  for select to anon, authenticated using (true);

drop policy if exists "project_bugs_public_read" on public.project_bugs;
create policy "project_bugs_public_read" on public.project_bugs
  for select to anon, authenticated using (true);
