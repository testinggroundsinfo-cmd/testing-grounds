-- Testing-Grounds MVP schema
-- Apply in the Supabase SQL editor or via CLI: supabase db push

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.project_category as enum ('gaming', 'software');

create type public.development_status as enum (
  'pre_alpha',
  'alpha',
  'closed_beta',
  'mvp',
  'playtest'
);

-- Gaming: pc, mobile, webgl, console
-- Software: web_saas, mobile_ios, mobile_android, desktop, browser_extension
create type public.platform_kind as enum (
  'pc',
  'mobile',
  'webgl',
  'console',
  'web_saas',
  'mobile_ios',
  'mobile_android',
  'desktop',
  'browser_extension'
);

create type public.distribution_kind as enum (
  'iframe',
  'direct_link',
  'testflight',
  'play_beta',
  'steam_playtest',
  'drive',
  'mega',
  'itch',
  'zip'
);

create type public.bug_kind as enum (
  'crash',
  'gameplay',
  'graphics',
  'audio',
  'ui_ux',
  'performance',
  'network',
  'localization',
  'other'
);

create type public.bug_status as enum ('open', 'triaged', 'fixed', 'wont_fix');

create type public.collaborator_role as enum (
  'game_design',
  'qa_tester',
  'translations',
  'development',
  'community',
  'art',
  'other'
);

create type public.application_status as enum ('pending', 'accepted', 'rejected');

create type public.report_reason as enum (
  'malware',
  'phishing',
  'copyright',
  'inappropriate',
  'spam',
  'other'
);

create type public.moderation_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null
    check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null,
  avatar_url text,
  bio text,
  website_url text,
  discord_handle text,
  is_developer boolean not null default false,
  is_tester boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Projects (schede gioco / app)
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  category public.project_category not null,
  title text not null check (char_length(title) between 2 and 80),
  slug text unique not null check (slug ~ '^[a-z0-9-]{3,80}$'),
  short_pitch text not null check (char_length(short_pitch) between 10 and 180),
  description text not null,
  development_status public.development_status not null default 'alpha',
  platforms public.platform_kind[] not null default '{}',
  tags text[] not null default '{}',
  cover_image_url text,
  youtube_url text,
  iframe_url text,
  distribution_kind public.distribution_kind,
  distribution_url text,
  zip_storage_path text,
  is_published boolean not null default false,
  report_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platforms_match_category check (
    (
      category = 'gaming'
      and platforms <@ array['pc','mobile','webgl','console']::public.platform_kind[]
    )
    or (
      category = 'software'
      and platforms <@ array[
        'web_saas','mobile_ios','mobile_android','desktop','browser_extension'
      ]::public.platform_kind[]
    )
  )
);

create index projects_category_published_idx
  on public.projects (category, is_published, created_at desc);
create index projects_owner_idx on public.projects (owner_id);
create index projects_tags_gin on public.projects using gin (tags);

-- ---------------------------------------------------------------------------
-- Project media
-- ---------------------------------------------------------------------------
create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind text not null check (kind in ('screenshot', 'video')),
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index project_media_project_idx on public.project_media (project_id, sort_order);

-- ---------------------------------------------------------------------------
-- Bug reports
-- ---------------------------------------------------------------------------
create table public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 5 and 120),
  kind public.bug_kind not null default 'other',
  steps_to_reproduce text not null,
  expected_behavior text,
  actual_behavior text,
  -- Gaming-specific
  avg_fps integer check (avg_fps is null or avg_fps between 1 and 1000),
  os_name text,
  gpu_name text,
  ram_gb integer check (ram_gb is null or ram_gb between 1 and 512),
  -- Software-specific
  device_name text,
  browser_name text,
  status public.bug_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bug_reports_project_idx on public.bug_reports (project_id, created_at desc);
create index bug_reports_author_idx on public.bug_reports (author_id);

-- ---------------------------------------------------------------------------
-- Reviews (one per user per project)
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  -- Gaming scores (nullable for software)
  gameplay smallint check (gameplay is null or gameplay between 1 and 5),
  graphics smallint check (graphics is null or graphics between 1 and 5),
  balance smallint check (balance is null or balance between 1 and 5),
  fun smallint check (fun is null or fun between 1 and 5),
  -- Software scores (nullable for games)
  usability smallint check (usability is null or usability between 1 and 5),
  usefulness smallint check (usefulness is null or usefulness between 1 and 5),
  ui_quality smallint check (ui_quality is null or ui_quality between 1 and 5),
  comment text not null check (char_length(comment) between 20 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, author_id)
);

create index reviews_project_idx on public.reviews (project_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Collaborator applications
-- ---------------------------------------------------------------------------
create table public.collaborator_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  role public.collaborator_role not null,
  message text not null check (char_length(message) between 20 and 2000),
  portfolio_url text,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, applicant_id, role)
);

create index applications_project_idx
  on public.collaborator_applications (project_id, status, created_at desc);
create index applications_applicant_idx on public.collaborator_applications (applicant_id);

-- ---------------------------------------------------------------------------
-- Content / malware reports
-- ---------------------------------------------------------------------------
create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason public.report_reason not null,
  details text not null check (char_length(details) between 10 and 2000),
  status public.moderation_status not null default 'open',
  created_at timestamptz not null default now(),
  unique (project_id, reporter_id)
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger bug_reports_updated_at
  before update on public.bug_reports
  for each row execute function public.set_updated_at();

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

create trigger applications_updated_at
  before update on public.collaborator_applications
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_username text;
begin
  raw_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  raw_username := lower(regexp_replace(raw_username, '[^a-z0-9_]', '_', 'g'));
  if char_length(raw_username) < 3 then
    raw_username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  if exists (select 1 from public.profiles where username = raw_username) then
    raw_username := left(raw_username, 17) || '_' || substr(new.id::text, 1, 6);
  end if;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    raw_username,
    coalesce(new.raw_user_meta_data->>'full_name', raw_username)
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.bug_reports enable row level security;
alter table public.reviews enable row level security;
alter table public.collaborator_applications enable row level security;
alter table public.content_reports enable row level security;

-- Profiles
create policy "profiles_select_all"
  on public.profiles for select using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Projects
create policy "projects_select_published_or_own"
  on public.projects for select
  using (is_published = true or owner_id = auth.uid());

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = owner_id);

-- Media follows project visibility
create policy "media_select_visible_project"
  on public.project_media for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and (p.is_published or p.owner_id = auth.uid())
    )
  );

create policy "media_write_owner"
  on public.project_media for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

-- Bug reports: author + project owner can read; authenticated can insert on published projects
create policy "bugs_select_author_or_owner"
  on public.bug_reports for select
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

create policy "bugs_insert_authenticated"
  on public.bug_reports for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.is_published = true
    )
  );

create policy "bugs_update_author_or_owner"
  on public.bug_reports for update
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

-- Reviews: public read on published projects; one insert per user
create policy "reviews_select_published"
  on public.reviews for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.is_published or p.owner_id = auth.uid())
    )
  );

create policy "reviews_insert_authenticated"
  on public.reviews for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.is_published = true and p.owner_id <> auth.uid()
    )
  );

create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Applications: applicant + owner
create policy "applications_select_parties"
  on public.collaborator_applications for select
  using (
    applicant_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

create policy "applications_insert_authenticated"
  on public.collaborator_applications for insert
  with check (
    auth.uid() = applicant_id
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.is_published = true and p.owner_id <> auth.uid()
    )
  );

create policy "applications_update_owner_or_applicant"
  on public.collaborator_applications for update
  using (
    applicant_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

-- Content reports: reporter can insert; only reporter sees own (moderation later via service role)
create policy "reports_insert_authenticated"
  on public.content_reports for insert
  with check (auth.uid() = reporter_id);

create policy "reports_select_own"
  on public.content_reports for select
  using (reporter_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage buckets (run after enabling Storage)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'storage' and table_name = 'buckets'
  ) then
    insert into storage.buckets (id, name, public)
    values
      ('project-covers', 'project-covers', true),
      ('project-media', 'project-media', true),
      ('project-zips', 'project-zips', false)
    on conflict (id) do nothing;
  end if;
end $$;
