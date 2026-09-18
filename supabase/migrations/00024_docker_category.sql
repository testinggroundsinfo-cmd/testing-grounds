-- Add Docker & Container as a first-class project category.
alter type public.project_category add value if not exists 'docker';
