-- Docker-specific platform values. Kept in a separate migration because
-- PostgreSQL enum values become usable after the ALTER TYPE transaction commits.
alter type public.platform_kind add value if not exists 'linux_server';
alter type public.platform_kind add value if not exists 'nas';
alter type public.platform_kind add value if not exists 'docker_desktop';
alter type public.platform_kind add value if not exists 'raspberry_pi';
