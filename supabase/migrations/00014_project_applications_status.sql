-- Aggiunge lo stato delle candidature (pending/accepted/rejected) e le policy
-- necessarie affinché il proprietario del progetto possa leggerle e aggiornarle
-- dalla propria dashboard, mantenendo l'inserimento pubblico già esistente.

alter table public.project_applications
  add column if not exists status text not null default 'pending';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'project_applications_status_check'
  ) then
    alter table public.project_applications
      add constraint project_applications_status_check
      check (status in ('pending', 'accepted', 'rejected'));
  end if;
end
$$;

alter table public.project_applications enable row level security;

drop policy if exists "project_applications_owner_select" on public.project_applications;
create policy "project_applications_owner_select"
  on public.project_applications for select
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_applications.project_id
        and p.owner_id = auth.uid()
    )
  );

drop policy if exists "project_applications_owner_update_status" on public.project_applications;
create policy "project_applications_owner_update_status"
  on public.project_applications for update
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_applications.project_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_applications.project_id
        and p.owner_id = auth.uid()
    )
  );
