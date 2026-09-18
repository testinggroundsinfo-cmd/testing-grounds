-- OAuth profile provisioning: extend public.handle_new_user() to cope with the
-- richer user_metadata shapes returned by Google / GitHub OAuth sign-ins
-- (avatar, display name and username under several possible keys), while
-- keeping the existing behaviour for classic email/password sign-ups intact.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_username text;
  raw_display_name text;
  raw_avatar_url text;
begin
  raw_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    nullif(new.raw_user_meta_data->>'user_name', ''),
    nullif(new.raw_user_meta_data->>'preferred_username', ''),
    split_part(new.email, '@', 1)
  );
  raw_username := lower(regexp_replace(raw_username, '[^a-z0-9_]', '_', 'g'));
  if char_length(raw_username) < 3 then
    raw_username := 'user_' || substr(new.id::text, 1, 8);
  end if;
  raw_username := left(raw_username, 24);

  if exists (select 1 from public.profiles where username = raw_username) then
    raw_username := left(raw_username, 17) || '_' || substr(new.id::text, 1, 6);
  end if;

  raw_display_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'display_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    raw_username
  );

  raw_avatar_url := coalesce(
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    nullif(new.raw_user_meta_data->>'picture', '')
  );

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    raw_username,
    raw_display_name,
    raw_avatar_url
  );

  return new;
end;
$$;
