-- Update RLS policies to allow unauthenticated access for development

-- Projects Table
drop policy if exists "Authenticated users can insert projects." on public.projects;
create policy "Enable insert for all users" on public.projects for insert with check (true);

drop policy if exists "Authenticated users can view all projects." on public.projects;
create policy "Enable read for all users" on public.projects for select using (true);

-- Requirements Table (might as well do it now)
drop policy if exists "Authenticated users can insert requirements." on public.requirements;
create policy "Enable insert for all users" on public.requirements for insert with check (true);

drop policy if exists "Authenticated users can view all requirements." on public.requirements;
create policy "Enable read for all users" on public.requirements for select using (true);
