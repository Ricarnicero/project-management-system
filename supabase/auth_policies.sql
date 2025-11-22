-- Strict RLS Policies for Production/Auth

-- 1. Profiles
-- Users can view all profiles (to see team members)
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Profiles are viewable by authenticated users" on public.profiles for select using (auth.role() = 'authenticated');

-- Users can only update their own profile
drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. Projects
-- Remove development policies
drop policy if exists "Enable insert for all users" on public.projects;
drop policy if exists "Enable read for all users" on public.projects;

-- Authenticated users can view all projects
create policy "Authenticated users can view projects" on public.projects for select using (auth.role() = 'authenticated');

-- Authenticated users can create projects
create policy "Authenticated users can create projects" on public.projects for insert with check (auth.role() = 'authenticated');

-- Authenticated users can update projects
create policy "Authenticated users can update projects" on public.projects for update using (auth.role() = 'authenticated');

-- Authenticated users can delete projects
create policy "Authenticated users can delete projects" on public.projects for delete using (auth.role() = 'authenticated');

-- 3. Requirements
-- Remove development policies
drop policy if exists "Enable insert for all users" on public.requirements;
drop policy if exists "Enable read for all users" on public.requirements;

-- Standard authenticated policies
create policy "Authenticated users can view requirements" on public.requirements for select using (auth.role() = 'authenticated');
create policy "Authenticated users can create requirements" on public.requirements for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update requirements" on public.requirements for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete requirements" on public.requirements for delete using (auth.role() = 'authenticated');

-- 4. Documentation
create policy "Authenticated users can view documentation" on public.documentation for select using (auth.role() = 'authenticated');
create policy "Authenticated users can create documentation" on public.documentation for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update documentation" on public.documentation for update using (auth.role() = 'authenticated');

-- 5. Alerts
create policy "Authenticated users can view alerts" on public.alerts for select using (auth.role() = 'authenticated');
create policy "Authenticated users can create alerts" on public.alerts for insert with check (auth.role() = 'authenticated');
