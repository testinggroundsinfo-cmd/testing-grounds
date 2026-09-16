create table if not exists public.project_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reason text not null check (reason in ('malware', 'phishing', 'copyright', 'inappropriate', 'spam')),
  details text not null check (char_length(details) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists project_reports_project_idx
  on public.project_reports(project_id, created_at desc);

alter table public.project_reports enable row level security;

drop policy if exists "Anyone can submit project reports" on public.project_reports;
create policy "Anyone can submit project reports"
  on public.project_reports for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
