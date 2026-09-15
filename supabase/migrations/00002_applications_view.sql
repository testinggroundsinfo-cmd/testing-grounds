-- Insert proprio profilo se il trigger auth non ha creato la riga
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_insert_own'
  ) then
    create policy "profiles_insert_own"
      on public.profiles for insert
      with check (auth.uid() = id);
  end if;
end $$;

-- Alias richiesto dall'app: candidature = applications
create or replace view public.applications
  with (security_invoker = true)
as
  select * from public.collaborator_applications;

grant select, insert, update on public.applications to authenticated;
grant select on public.applications to anon;
