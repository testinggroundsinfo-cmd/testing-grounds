-- Allow Docker projects to use the platform metadata relevant to containers.
alter table public.projects drop constraint if exists platforms_match_category;

alter table public.projects
  add constraint platforms_match_category check (
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
    or (
      category = 'docker'
      and platforms <@ array[
        'web_saas','desktop','browser_extension'
      ]::public.platform_kind[]
    )
  );

create index if not exists projects_docker_published_idx
  on public.projects (category, is_published, created_at desc)
  where category = 'docker';
