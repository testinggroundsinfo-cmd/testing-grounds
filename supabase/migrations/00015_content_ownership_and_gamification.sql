-- Allinea permessi e introduce il sistema di sblocco slot di pubblicazione.
--
-- 1) Autenticazione obbligatoria: rimuove gli insert anonimi su
--    project_reviews, project_bugs, project_applications, project_reports.
-- 2) Modifica/eliminazione contenuti: solo l'autore puo' modificare o
--    eliminare la propria recensione/bug/candidatura; il proprietario del
--    progetto puo' solo cambiarne lo stato (approvato/rifiutato), mai il
--    contenuto, grazie al trigger guard_feedback_status_change.
-- 3) Gamification: un utente puo' pubblicare gratis un solo progetto; ogni
--    3 recensioni/bug approvati su progetti altrui sbloccano +1 slot.

-- ---------------------------------------------------------------------------
-- Stato di moderazione per recensioni e bug (le candidature lo hanno gia'
-- dalla migrazione 00014).
-- ---------------------------------------------------------------------------
alter table public.project_reviews
  add column if not exists status text not null default 'pending';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'project_reviews_status_check'
  ) then
    alter table public.project_reviews
      add constraint project_reviews_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end
$$;

alter table public.project_bugs
  add column if not exists status text not null default 'pending';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'project_bugs_status_check'
  ) then
    alter table public.project_bugs
      add constraint project_bugs_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Trigger generico: solo il proprietario del progetto puo' cambiare lo
-- status; se chi esegue l'update non e' il proprietario, lo status resta
-- invariato (impedisce l'auto-approvazione da parte dell'autore).
-- ---------------------------------------------------------------------------
create or replace function public.guard_feedback_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if not exists (
      select 1 from public.projects p
      where p.id = new.project_id and p.owner_id = auth.uid()
    ) then
      new.status := old.status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists project_reviews_guard_status on public.project_reviews;
create trigger project_reviews_guard_status
  before update on public.project_reviews
  for each row execute function public.guard_feedback_status_change();

drop trigger if exists project_bugs_guard_status on public.project_bugs;
create trigger project_bugs_guard_status
  before update on public.project_bugs
  for each row execute function public.guard_feedback_status_change();

drop trigger if exists project_applications_guard_status on public.project_applications;
create trigger project_applications_guard_status
  before update on public.project_applications
  for each row execute function public.guard_feedback_status_change();

-- ---------------------------------------------------------------------------
-- Insert: solo utenti autenticati, obbligatoriamente come se stessi.
-- ---------------------------------------------------------------------------
drop policy if exists "project_reviews_public_insert" on public.project_reviews;
create policy "project_reviews_authenticated_insert"
  on public.project_reviews for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.projects p
      where p.id = project_reviews.project_id and p.is_published = true
    )
  );

drop policy if exists "project_bugs_public_insert" on public.project_bugs;
create policy "project_bugs_authenticated_insert"
  on public.project_bugs for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.projects p
      where p.id = project_bugs.project_id and p.is_published = true
    )
  );

drop policy if exists "project_applications_public_insert" on public.project_applications;
create policy "project_applications_authenticated_insert"
  on public.project_applications for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.projects p
      where p.id = project_applications.project_id
        and p.is_published = true
        and p.owner_id <> auth.uid()
    )
  );

drop policy if exists "Anyone can submit project reports" on public.project_reports;
create policy "project_reports_authenticated_insert"
  on public.project_reports for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Update/Delete: autore o proprietario del progetto (lo status resta
-- comunque protetto dal trigger sopra).
-- ---------------------------------------------------------------------------
drop policy if exists "project_reviews_author_or_owner_update" on public.project_reviews;
create policy "project_reviews_author_or_owner_update"
  on public.project_reviews for update
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_reviews.project_id and p.owner_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_reviews.project_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "project_reviews_author_delete" on public.project_reviews;
create policy "project_reviews_author_delete"
  on public.project_reviews for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "project_bugs_author_or_owner_update" on public.project_bugs;
create policy "project_bugs_author_or_owner_update"
  on public.project_bugs for update
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_bugs.project_id and p.owner_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_bugs.project_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "project_bugs_author_delete" on public.project_bugs;
create policy "project_bugs_author_delete"
  on public.project_bugs for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "project_applications_author_update" on public.project_applications;
create policy "project_applications_author_update"
  on public.project_applications for update
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_applications.project_id and p.owner_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_applications.project_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "project_applications_author_delete" on public.project_applications;
create policy "project_applications_author_delete"
  on public.project_applications for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Gamification: slot di pubblicazione.
-- 1 slot gratuito + 1 slot ogni 3 recensioni/bug approvati su progetti
-- altrui, meno i progetti gia' creati dall'utente.
-- ---------------------------------------------------------------------------
create or replace function public.available_publish_slots(target_user uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select greatest(
    0,
    (
      1 + (
        (
          coalesce((
            select count(*) from public.project_reviews r
            join public.projects p on p.id = r.project_id
            where r.user_id = target_user
              and r.status = 'approved'
              and p.owner_id <> target_user
          ), 0)
          +
          coalesce((
            select count(*) from public.project_bugs b
            join public.projects p on p.id = b.project_id
            where b.user_id = target_user
              and b.status = 'approved'
              and p.owner_id <> target_user
          ), 0)
        ) / 3
      )
    )
    - coalesce((select count(*) from public.projects where owner_id = target_user), 0)
  );
$$;

grant execute on function public.available_publish_slots(uuid) to authenticated, anon;

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
  on public.projects for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    and public.available_publish_slots(auth.uid()) > 0
  );
