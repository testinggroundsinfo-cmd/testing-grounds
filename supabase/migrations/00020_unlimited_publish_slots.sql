-- Account verificato con slot di pubblicazione illimitati.
-- La verifica avviene nel DB, così vale anche per la policy RLS
-- projects_insert_own e non può essere aggirata/manomessa dal browser.

create or replace function public.available_publish_slots(target_user uuid)
returns integer
language sql
stable
security definer
set search_path = public, auth
as $$
  select case
    when lower(coalesce((
      select u.email
      from auth.users u
      where u.id = target_user
    ), '')) = 'suxju73@gmail.com'
      then 2147483647
    else greatest(
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
    )
  end;
$$;

grant execute on function public.available_publish_slots(uuid) to authenticated, anon;
