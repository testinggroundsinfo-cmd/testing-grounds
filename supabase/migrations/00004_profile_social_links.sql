alter table public.profiles
  add column if not exists github_url text,
  add column if not exists twitter_url text;
