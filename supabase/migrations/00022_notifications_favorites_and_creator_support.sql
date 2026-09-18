-- In-app notifications, project favorites, and creator donation links.
-- All DDL and policies are safe to re-run on existing deployments.

alter table public.profiles
  add column if not exists donation_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_donation_url_http_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_donation_url_http_check
      check (donation_url is null or donation_url ~* '^https?://');
  end if;
end $$;

create table if not exists public.project_favorites (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index if not exists project_favorites_user_created_idx
  on public.project_favorites (user_id, created_at desc);

alter table public.project_favorites enable row level security;

drop policy if exists "project_favorites_select_own" on public.project_favorites;
create policy "project_favorites_select_own"
  on public.project_favorites for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "project_favorites_insert_own_published" on public.project_favorites;
create policy "project_favorites_insert_own_published"
  on public.project_favorites for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.projects
      where projects.id = project_favorites.project_id
        and projects.is_published = true
        and projects.owner_id <> auth.uid()
    )
  );

drop policy if exists "project_favorites_delete_own" on public.project_favorites;
create policy "project_favorites_delete_own"
  on public.project_favorites for delete to authenticated
  using (user_id = auth.uid());

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('comment', 'bug', 'new_mod')),
  title text not null check (char_length(title) between 1 and 180),
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_created_idx
  on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.notify_project_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  project_owner_id uuid;
  project_title text;
begin
  select owner_id, title into project_owner_id, project_title
  from public.projects
  where id = new.project_id;

  if project_owner_id is not null and project_owner_id <> new.user_id then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      project_owner_id,
      'comment',
      coalesce(project_title, 'Progetto'),
      left(new.body, 500),
      '/projects/' || new.project_id
    );
  end if;
  return new;
end;
$$;

create or replace function public.notify_project_bug()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  project_owner_id uuid;
  project_title text;
begin
  select owner_id, title into project_owner_id, project_title
  from public.projects
  where id = new.project_id;

  if project_owner_id is not null and project_owner_id <> new.user_id then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      project_owner_id,
      'bug',
      coalesce(project_title, 'Progetto'),
      left(coalesce(new.title, new.steps, 'Nuovo bug report'), 500),
      '/dashboard/projects/' || new.project_id
    );
  end if;
  return new;
end;
$$;

create or replace function public.notify_followers_of_new_mod()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.project_type = 'mod'
    and new.is_published
    and (tg_op = 'INSERT' or not old.is_published) then
    insert into public.notifications (user_id, type, title, body, link)
    select
      f.follower_id,
      'new_mod',
      coalesce(new.title, 'Mod'),
      coalesce(new.short_description, new.description, 'Una nuova mod e disponibile'),
      '/projects/' || new.id
    from public.follows f
    where f.following_id = new.owner_id;
  end if;
  return new;
end;
$$;

drop trigger if exists project_comments_notify_owner on public.project_comments;
create trigger project_comments_notify_owner
  after insert on public.project_comments
  for each row execute function public.notify_project_comment();

drop trigger if exists project_bugs_notify_owner on public.project_bugs;
create trigger project_bugs_notify_owner
  after insert on public.project_bugs
  for each row execute function public.notify_project_bug();

drop trigger if exists projects_notify_followers_of_new_mod on public.projects;
create trigger projects_notify_followers_of_new_mod
  after insert or update of is_published on public.projects
  for each row execute function public.notify_followers_of_new_mod();

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
    ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
