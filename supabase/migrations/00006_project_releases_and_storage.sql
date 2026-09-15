create table if not exists public.project_releases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version text not null check (char_length(version) between 1 and 40),
  changelog text,
  download_url text,
  created_at timestamptz not null default now()
);

create index if not exists project_releases_project_created_idx
  on public.project_releases(project_id, created_at desc);

alter table public.project_releases enable row level security;

drop policy if exists "Public can view releases for published projects" on public.project_releases;
create policy "Public can view releases for published projects"
  on public.project_releases for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_releases.project_id
        and (projects.is_published or projects.owner_id = auth.uid())
    )
  );

drop policy if exists "Owners can create releases" on public.project_releases;
create policy "Owners can create releases"
  on public.project_releases for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_releases.project_id
        and projects.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can update releases" on public.project_releases;
create policy "Owners can update releases"
  on public.project_releases for update
  using (exists (
    select 1 from public.projects
    where projects.id = project_releases.project_id
      and projects.owner_id = auth.uid()
  ));

drop policy if exists "Owners can delete releases" on public.project_releases;
create policy "Owners can delete releases"
  on public.project_releases for delete
  using (exists (
    select 1 from public.projects
    where projects.id = project_releases.project_id
      and projects.owner_id = auth.uid()
  ));

drop policy if exists "Project owners can upload media" on storage.objects;
create policy "Project owners can upload media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Project owners can update media" on storage.objects;
create policy "Project owners can update media"
  on storage.objects for update to authenticated
  using (bucket_id = 'project-media' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'project-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Project owners can delete media" on storage.objects;
create policy "Project owners can delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-media' and (storage.foldername(name))[1] = auth.uid()::text);
