-- Store Docker Compose/Dockerfile configuration and an optional safe .env example.
alter table public.projects
  add column if not exists docker_config text,
  add column if not exists docker_env_example text;

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
        'linux_server','nas','docker_desktop','raspberry_pi',
        'web_saas','desktop','browser_extension'
      ]::public.platform_kind[]
    )
  );
