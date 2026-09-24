-- Project showcase metadata for the portfolio.
-- Lets the admin panel store a real screenshot/cover image and the technologies used.

alter table public.projects
  add column if not exists image_url text,
  add column if not exists technologies text[] not null default '{}';

update public.projects
set technologies = array['JavaScript', 'React', 'HTML5', 'CSS3', 'Java', 'MySQL']
where title = 'Biblioteca';

update public.projects
set technologies = array['React', 'JavaScript', 'HTML5', 'CSS3', 'Java', 'MySQL', 'Spring Boot', 'Tailwind CSS']
where title = 'Projeto Guarda-vidas';

update public.projects
set technologies = array['React', 'TypeScript', 'KAPLAY', 'Vite', 'Supabase', 'GitHub']
where title = 'Portfólio RPG';
