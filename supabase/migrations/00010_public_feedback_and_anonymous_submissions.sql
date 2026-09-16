alter table public.bug_reports
  alter column author_id drop not null,
  alter column title drop not null,
  alter column steps_to_reproduce drop not null;

alter table public.reviews
  alter column author_id drop not null,
  alter column comment drop not null;

alter table public.collaborator_applications
  alter column applicant_id drop not null,
  alter column message drop not null;

alter table public.bug_reports
  drop constraint if exists bug_reports_title_check,
  drop constraint if exists bug_reports_steps_to_reproduce_check;

alter table public.reviews
  drop constraint if exists reviews_comment_check;

alter table public.collaborator_applications
  drop constraint if exists collaborator_applications_message_check;

drop policy if exists "bugs_public_select_published" on public.bug_reports;
create policy "bugs_public_select_published"
  on public.bug_reports for select
  using (exists (
    select 1 from public.projects p
    where p.id = bug_reports.project_id and p.is_published = true
  ));

drop policy if exists "bugs_insert_public_published" on public.bug_reports;
create policy "bugs_insert_public_published"
  on public.bug_reports for insert
  to anon, authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = bug_reports.project_id and p.is_published = true
  ));

drop policy if exists "reviews_insert_public_published" on public.reviews;
create policy "reviews_insert_public_published"
  on public.reviews for insert
  to anon, authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = reviews.project_id and p.is_published = true
  ));

drop policy if exists "applications_insert_public_published" on public.collaborator_applications;
create policy "applications_insert_public_published"
  on public.collaborator_applications for insert
  to anon, authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = collaborator_applications.project_id and p.is_published = true
  ));
