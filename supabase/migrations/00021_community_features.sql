-- Community features: discussions, upvotes, follows, safety badge signal,
-- view/download analytics, and Vimeo embeds.
--
-- Follows the same conventions as previous migrations: IF NOT EXISTS guards
-- so this is safe to re-run, RLS enabled on every new table, and helper
-- triggers reused from 00001_init.sql (public.set_updated_at).

-- ---------------------------------------------------------------------------
-- Projects: new columns (Vimeo embed, upvote counter, safety signal)
-- ---------------------------------------------------------------------------
alter table public.projects
  add column if not exists vimeo_url text,
  add column if not exists upvote_count integer not null default 0,
  add column if not exists safety_reports_count integer not null default 0;

-- Defined (idempotently) here because some deployments of this project were
-- bootstrapped outside of 00001_init.sql and may not already have it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Project comments / discussions (separate from bug reports and reviews)
-- ---------------------------------------------------------------------------
create table if not exists public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_comments_project_idx
  on public.project_comments (project_id, created_at desc);

drop trigger if exists project_comments_updated_at on public.project_comments;
create trigger project_comments_updated_at
  before update on public.project_comments
  for each row execute function public.set_updated_at();

alter table public.project_comments enable row level security;

drop policy if exists "project_comments_select_visible_project" on public.project_comments;
create policy "project_comments_select_visible_project"
  on public.project_comments for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_comments.project_id
        and (p.is_published or p.owner_id = auth.uid())
    )
  );

drop policy if exists "project_comments_authenticated_insert" on public.project_comments;
create policy "project_comments_authenticated_insert"
  on public.project_comments for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.projects p
      where p.id = project_comments.project_id and p.is_published = true
    )
  );

drop policy if exists "project_comments_author_update" on public.project_comments;
create policy "project_comments_author_update"
  on public.project_comments for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "project_comments_author_or_owner_delete" on public.project_comments;
create policy "project_comments_author_or_owner_delete"
  on public.project_comments for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_comments.project_id and p.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Project upvotes (one per user per project) with a cached counter on
-- projects.upvote_count kept in sync via trigger, so listing/sorting pages
-- never need to aggregate the raw table.
-- ---------------------------------------------------------------------------
create table if not exists public.project_upvotes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists project_upvotes_project_idx on public.project_upvotes (project_id);

create or replace function public.recalc_project_upvote_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project uuid;
begin
  target_project := coalesce(new.project_id, old.project_id);
  update public.projects
    set upvote_count = (
      select count(*) from public.project_upvotes where project_id = target_project
    )
    where id = target_project;
  return coalesce(new, old);
end;
$$;

drop trigger if exists project_upvotes_after_insert on public.project_upvotes;
create trigger project_upvotes_after_insert
  after insert on public.project_upvotes
  for each row execute function public.recalc_project_upvote_count();

drop trigger if exists project_upvotes_after_delete on public.project_upvotes;
create trigger project_upvotes_after_delete
  after delete on public.project_upvotes
  for each row execute function public.recalc_project_upvote_count();

alter table public.project_upvotes enable row level security;

drop policy if exists "project_upvotes_select_all" on public.project_upvotes;
create policy "project_upvotes_select_all"
  on public.project_upvotes for select
  to anon, authenticated
  using (true);

drop policy if exists "project_upvotes_authenticated_insert" on public.project_upvotes;
create policy "project_upvotes_authenticated_insert"
  on public.project_upvotes for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.projects p
      where p.id = project_upvotes.project_id
        and p.is_published = true
        and p.owner_id <> auth.uid()
    )
  );

drop policy if exists "project_upvotes_own_delete" on public.project_upvotes;
create policy "project_upvotes_own_delete"
  on public.project_upvotes for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Creator follows (public profile follow/unfollow)
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

create index if not exists follows_following_idx on public.follows (following_id);
create index if not exists follows_follower_idx on public.follows (follower_id);

alter table public.follows enable row level security;

drop policy if exists "follows_select_all" on public.follows;
create policy "follows_select_all"
  on public.follows for select
  to anon, authenticated
  using (true);

drop policy if exists "follows_authenticated_insert" on public.follows;
create policy "follows_authenticated_insert"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

drop policy if exists "follows_own_delete" on public.follows;
create policy "follows_own_delete"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- Safety badge signal: keep projects.safety_reports_count in sync with
-- public.project_reports so the public project page can show a
-- "no reports" / "reports flagged" badge near the download button without
-- exposing report details (content_reports/project_reports stay private).
-- ---------------------------------------------------------------------------
create or replace function public.recalc_project_safety_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project uuid;
begin
  target_project := coalesce(new.project_id, old.project_id);
  update public.projects
    set safety_reports_count = (
      select count(*) from public.project_reports where project_id = target_project
    )
    where id = target_project;
  return coalesce(new, old);
end;
$$;

drop trigger if exists project_reports_after_insert on public.project_reports;
create trigger project_reports_after_insert
  after insert on public.project_reports
  for each row execute function public.recalc_project_safety_count();

drop trigger if exists project_reports_after_delete on public.project_reports;
create trigger project_reports_after_delete
  after delete on public.project_reports
  for each row execute function public.recalc_project_safety_count();

-- ---------------------------------------------------------------------------
-- Basic analytics: project page views and download-link clicks. Inserts are
-- open (anonymous testers browse without logging in) but rows are only
-- readable by the project owner, from their dashboard.
-- ---------------------------------------------------------------------------
create table if not exists public.project_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  event_type text not null check (event_type in ('view', 'download_click')),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists project_events_project_type_idx
  on public.project_events (project_id, event_type, created_at desc);

alter table public.project_events enable row level security;

drop policy if exists "project_events_public_insert" on public.project_events;
create policy "project_events_public_insert"
  on public.project_events for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_events.project_id and p.is_published = true
    )
  );

drop policy if exists "project_events_owner_select" on public.project_events;
create policy "project_events_owner_select"
  on public.project_events for select
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_events.project_id and p.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime: broadcast changes for upvotes and discussions so the client can
-- update counters/lists live via Supabase Realtime (postgres_changes).
-- Guarded because supabase_realtime may already include these tables, or the
-- publication may not exist yet on a fresh local Postgres instance.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = 'project_upvotes'
    ) then
      alter publication supabase_realtime add table public.project_upvotes;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = 'project_comments'
    ) then
      alter publication supabase_realtime add table public.project_comments;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = 'projects'
    ) then
      alter publication supabase_realtime add table public.projects;
    end if;
  end if;
end $$;

